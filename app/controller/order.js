
const joi = require("joi");
const _ = require("lodash");
const moment = require("moment");
const qrcode = require("qrcode");
const uuidv1 = require('uuid/v1');
const axios = require("axios");

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

	TRADE_TYPE_CHARGE,
	TRADE_TYPE_EXCHANGE,
	TRADE_TYPE_PACKAGE_BUY,
	TRADE_TYPE_LESSON_STUDY,
} = require("../core/consts.js");

const generateQR = async text => {
	try {
		return await qrcode.toDataURL(text);
	} catch(e) {
		return ;
	}
}

// 订单设计仅为解决充值功能 

const Order = class extends Controller {
	get modelName() {
		return "orders"
	}

	async index() {
		return this.success("OK");
	}
	async destroy() {
		return this.success("OK");
	}
	async update() {
		return this.success("OK");
	}

	async create() {
		const {userId} = this.authenticated();
		const params = this.validate({
			subject: "string",
			body: "string",
			amount: "int",
			channel: "string",  // wx_pub_qr   alipay_qr
			goodsId: "int_optional",
			count: "int_optional", // 购买量
		});

		const count = params.count || 1;
 
		let order = await this.model.orders.create({userId, count}).then(o => o && o.toJSON());
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
			count,
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

	// pingpp充值回调接口  只处理充值逻辑
	async charge() {
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
		await this.model.accounts.increment({rmb: order.amount}, {where:{userId: order.userId}});
		// 增加充值交易明细
		await this.model.trades.create({
			userId:order.userId, 
			type: TRADE_TYPE_CHARGE,
			subject: order.channel == "wx_pub_qr" ? "微信充值" : "支付宝充值",
			rmb: order.amount, 
		});

		order.state = state;
		order.description = description;

		// 
		if (params.type == "charge.succeeded") {
			//await this.chargeCallback(order);
		//} else if (params.type == "refund.succeeded") {
			//await this.refundCallback(order);
		} else {
		}
		
		return this.success("OK");
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

		const goods = await this.model.goods.findOne({where:{id: order.goodsId}}).then(o => o && o.toJSON());

		if (!goods.callback) return;
		const data = {extra: goods.callbackData || {}, amount: order.amount, goods};

		const account = await this.model.accounts.getByUserId(order.userId);
		const rmb = goods.rmb * order.count;
		const coin = goods.coin * order.count;
		const bean = goods.bean * order.count;
		if (!account || account.rmb < rmb || account.coin < coin || account.bean < bean) {
			await this.model.logs.create({text:"余额不足"});
			return;
		}

		// 加密数据
		try {
			await axios.post(goods.callback, data);
		} catch(e) {
			await this.model.logs.create({text:"物品兑换失败"});
			return ;
		}

		// 交易成功 减去用户余额
		await this.model.accounts.decrement({rmb, coin, bean}, {where:{userId: order.userId}});

		// 写交易记录
		await this.model.trades.create({
			userId:order.userId, 
			type: TRADE_TYPE_EXCHANGE,
			subject: goods.subject,
			body: goods.body,
			rmb: rmb, 
			coin: coin,
			bean: bean,
		});
		
	}

	async refundCallback() {
	}

}

module.exports = Order;
