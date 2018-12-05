
const joi = require("joi");
const _ = require("lodash");
const moment = require("moment");
const qrcode = require("qrcode");
const uuidv1 = require('uuid/v1');

const Controller = require("../core/controller.js");
const {
	ORDER_STATE_START,
	ORDER_STATE_PAYING,
	ORDER_STATE_SUCCESS,
	ORDER_STATE_FAILED,
	ORDER_STATE_FINISH,
	ORDER_STATE_REFUNDING,
	ORDER_STATE_REFUND_SUCCESS,
	ORDER_STATE_REFUND_FAILED,
	ORDER_STATE_CHARGING,
	ORDER_STATE_CHARGE_SUCCESS,
	ORDER_STATE_CHARGE_FAILED,
} = require("../core/consts.js");

const generateQR = async text => {
	try {
		return await qrcode.toDataURL(text);
	} catch(e) {
		return ;
	}
}

const Trade = class extends Controller {
	get modelName() {
	}

	async create() {
		const {userId} = this.authenticated();
		const params = this.validate({
			subject: "string",
			body: "string",
			amount: "int",
			channel: "string",  // wx_pub_qr   alipay_qr
			goodsId: "int_optional",
		});
 
		let order = await this.model.orders.create({userId}).then(o => o && o.toJSON());
		if (!order) return this.throw(500, "创建订单记录失败");

		const channel = params.channel;
		const config = this.app.config.self;
		const datetime = moment().format("YYYYMMDDHHmmss");
		const order_no = datetime + "trade" + order.id;
		const chargeData = {
			order_no,
			app: {id: config.pingpp.appId},
			channel: params.channel,
			amount: params.amount,			
			client_ip: this.ctx.request.headers["x-real-ip"] || this.ctx.request.ip,
			currency: "cny",
			subject: params.subject,
			body: params.body,
		}

		if (channel == "wx_pub_qr") {
			chargeData.extra = {product_id: "goodsId" + (params.goodsId || 0)};
		} else if(channel == "alipay_qr") {
		} else {
			return this.throw(400, "参数错误");
		}

		const charge = await this.ctx.service.pay.chrage(chargeData).catch(e => console.log(e));
		if (!charge) return this.throw(500, "提交pingpp充值请求失败");
		const payQRUrl = charge.credential[params.channel];
		if (!payQRUrl) return this.throw(500, "提交pingpp充值请求, 获取二维码失败");

		const QRUrl = "http://qr.topscan.com/api.php?m=0&text=" + payQRUrl;
		const QR = await generateQR(payQRUrl);

		order = {
			...order,
			userId,
			orderNo: order_no,
			amount: params.amount,
			goodsId: params.goodsId || 0,
			pingppId: charge.id,
			state: ORDER_STATE_PAYING,
			channel: params.channel,
			extra: {
				subject: params.subject,
				body: params.body,
			}
		}
		
		await this.model.orders.update(order, {where:{id: order.id}});

		return this.success({...order, payQRUrl, QRUrl, QR});
	}

	//async refund(trade) {
		//const refund = await this.ctx.service.pay.refund(trade).catch(e => console.log(e));
		//if (refund) {
			//trade.refundId = refund.id;
			//trade.state = TRADE_STATE_REFUNDING;
			//trade.description = "退款进行中";
		//} else {
			//trade.state = TRADE_STATE_REFUND_FAILED;
			//trade.description = "提交pingpp退款请求失败";
		//}
		//await this.model.trades.update(trade, {where:{id:trade.id}});
		//return;
	//}

	async chargeCallback(order) {
		// 没有回调 用户单纯充值	
		if (!order.goodsId) return;

		const good = await this.model.goods.findOne({where:{id: order.goodsId}}).then(o => o && o.toJSON());

		if (!good.callback) return;
	}

	async refundCallback() {
	}

	async pingpp() {
		const params = this.validate();
		const signature = this.ctx.headers["x-pingplusplus-signature"];
		const body = JSON.stringify(params);

		console.log("-----------------pingpp callback-----------------");
		if (!this.ctx.service.pay.verifySignature(body, signature)) {
			await this.model.logs.create({text:"签名验证失败"});
			return this.throw(400, "签名验证失败");
		}

		const orderNo = params.type == "charge.succeeded" ? params.data.object.order_no : params.data.object.charge_order_no;

		let order = await this.model.orders.findOne({where:{orderNo}}).then(o => o && o.toJSON());
		if (!order) {
			await this.model.logs.create({text:"交易记录不存在"});
			return this.throw(400,"交易记录不存在");
		}
		
		let state = ORDER_STATE_CHARGE_FAILED, description = "充值失败";
		if (params.type == "charge.succeeded") {
			state = ORDER_STATE_CHARGE_SUCCESS;
			description = "充值成功";
		//} else if (params.type == "refund.succeeded") {
			//state = ORDER_STATE_REFUND_SUCCESS;
			//description = "退款成功";
		} else {
			await this.model.logs.create({text:"参数错误"});
			await this.model.orders.update({state, description}, {where:{id:order.id}});
			return this.throw(400, "参数错误");
		}

		// 更新订单状态
		await this.model.orders.update({state, description}, {where:{id:order.id}});
		// 增加用户余额
		await this.model.account.increment({rmb: order.amount}, {where:{userId: order.userId}});
		// 增加充值交易明细
		await this.model.trades.create({
			userId:order.userId, 
			description: order.channel == "wx_pub_qr" ? "微信充值" : "支付宝充值",
			amount: "+" + order.amount + "元", 
		});

		order.state = state;
		order.description = description;

		if (params.type == "charge.succeeded") {
			await this.chargeCallback(order);
		//} else if (params.type == "refund.succeeded") {
			//await this.refundCallback(order);
		} else {
		}
		
		return this.success("OK");
	}

}

module.exports = Trade;
