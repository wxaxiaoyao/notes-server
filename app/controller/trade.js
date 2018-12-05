const joi = require("joi");
const _ = require("lodash");
const moment = require("moment");
const qrcode = require("qrcode");

const Controller = require("../core/controller.js");
const {
	TRADE_STATE_START,
	TRADE_STATE_PAYING,
	TRADE_STATE_SUCCESS,
	TRADE_STATE_FAILED,
	TRADE_STATE_FINISH,
	TRADE_STATE_REFUNDING,
	TRADE_STATE_REFUND_SUCCESS,
	TRADE_STATE_REFUND_FAILED,
	TRADE_STATE_CHARGING,
	TRADE_STATE_CHARGE_SUCCESS,
	TRADE_STATE_CHARGE_FAILED,
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
		return "trades";
	}

	async index() {

		const result = await this.model.query("select * from trades", {
			type: this.model.QueryTypes.SELECT,
		});

		return this.success(result);
	}

	async getPayQR(trade) {
		//channel = "wx_pub_qr" // 微信扫码支付
		//channel = "alipay_qr" // 支付宝扫码支付
		const channel = trade.channel;
		const config = this.app.config.self;
		const datetime = moment().format("YYYYMMDDHHmmss");
		const chargeData = {
			order_no: datetime + "trade" + trade.id,
			app: {id: config.pingpp.appId},
			channel: trade.channel,
			amount: trade.amount,			
			client_ip: this.ctx.request.headers["x-real-ip"] || this.ctx.request.ip,
			currency: "cny",
			subject: trade.subject,
			body: trade.body,
		}

		if (channel == "wx_pub_qr") {
			chargeData.extra = {
				product_id: "goodsId" + (trade.goodsId || 0),
			}
		} else if(channel == "alipay_qr") {

		} else {
			return this.throw(400, "参数错误");
		}

		const charge = await this.ctx.service.pay.chrage(chargeData).catch(e => console.log(e));
		if (!charge) {
			return this.throw(500, "提交pingpp充值请求失败");
		}

		await this.model.trades.update({
			amount: chargeData.amount,
			subject: chargeData.subject,
			body: chargeData.body,
			tradeNo: chargeData.order_no,
			chargeId: charge.id,
			state: TRADE_STATE_CHARGING,
		}, {
			where: {
				id: trade.id,
			},
		});

		return charge.credential[channel];
	}

	async create(ctx) {
		const userId = this.authenticated().userId;
		const params = this.validate({
			subject: "string",
			body: "string",
			amount: "int",
			//channel: "string",
		});

		params.state = TRADE_STATE_START;
		params.userId = userId;

		let trade = await this.model.trades.create(params);
		if (!trade) return this.throw(500);
		trade = trade.get({plain:true});

		if (trade.channel) {
			trade.payQRUrl = await this.getPayQR(trade);
			if (trade.payQRUrl) {
				trade.QRUrl = "http://qr.topscan.com/api.php?m=0&text=" + trade.payQRUrl;
				trade.QR = await generateQR(trade.payQRUrl);
			}
		}

		return this.success(trade);
	}
	
	async payQR() {
		const {id, channel} = this.validate({
			id:'int',
			channel: "string",
		});

		let trade = await this.model.trades.findOne({where: {id}});
		if (!trade) return this.throw(400, "Not Found");
		trade = trade.get({plain:true});

		if (trade.state != TRADE_STATE_START && trade.state != TRADE_STATE_CHARGING) {
			return this.throw(400, "交易已失效, state:" + trade.state);
		}

		trade.channel = channel;
		trade.payQRUrl = await this.getPayQR(trade);
		if (trade.payQRUrl) {
			trade.QRUrl = "http://qr.topscan.com/api.php?m=0&text=" + trade.payQRUrl;
			trade.QR = await generateQR(trade.payQRUrl);
		}

		return this.success(trade);
	}

	async refund(trade) {
		const refund = await this.ctx.service.pay.refund(trade).catch(e => console.log(e));
		if (refund) {
			trade.refundId = refund.id;
			trade.state = TRADE_STATE_REFUNDING;
			trade.description = "退款进行中";
		} else {
			trade.state = TRADE_STATE_REFUND_FAILED;
			trade.description = "提交pingpp退款请求失败";
		}
		await this.model.trades.update(trade, {where:{id:trade.id}});
		return;
	}

	async chargeCallback(trade) {
		//await walletsModel.updateBalanceByUserId(trade.userId, trade.amount);
		// 没有回调 用户单纯充值	
		if (!trade.callback) {
			await this.refund(trade);
			return ;
		}

		// 回调通知 增加认证 确保正确
		const data = {
			userId: trade.userId,
			amount: trade.amount,
			goodsId: trade.goodsId,
			extra: trade.extra,
		}

		try {
			trade.state = TRADE_STATE_PAYING;
			trade.description = "充值成功, 交换物品中";
			await this.model.trades.update(trade, {where:{id:trade.id}});
			// 返回2xx 表是成功
			await axios.post(trade.callback, {
				token: util.jwt_encode(data),
				data: data,
			});
		} catch(e) {
			trade.state = TRADE_STATE_FAILED;
			trade.description = "充值成功, 交换物品失败";
			await this.model.trades.update(trade, {where:{id:trade.id}});
			return;
		}
		trade.state = TRADE_STATE_SUCCESS;
		trade.description = "充值成功, 交换物品成功";
		await this.model.trades.update(trade, {where:{id:trade.id}});

		//const newTrade = _.cloneDeep(trade);
		//delete newTrade.id;
		//delete newTrade.tradeNo;
		//newTrade.amount = 0 - newTrade.amount;
		//newTrade.type = TRADE_TYPE_EXPENSE;
		//newTrade.state = TRADE_STATE_FINISH;
		//newTrade.description = "余额购买" + newTrade.subject;
		//await this.model.trades.upsert(newTrade);

		return this.success("OK");
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

		const tradeNo = params.type == "charge.succeeded" ? params.data.object.order_no : params.data.object.charge_order_no;

		let trade = await this.model.trades.findOne({where:{tradeNo}});
		if (!trade) {
			await this.model.logs.create({text:"交易记录不存在"});
			return this.throw(400,"交易记录不存在");
		}

		trade = trade.get({plain:true});
		
		if (params.type == "charge.succeeded") {
			trade.state = TRADE_STATE_CHARGE_SUCCESS;
			trade.description = "充值成功";
		} else if (params.type == "refund.succeeded") {
			trade.state = TRADE_STATE_REFUND_SUCCESS;
			trade.description = "退款成功";
		} else {
			return this.throw(400, "参数错误");
		}
		await this.model.trades.update(trade, {where:{id:trade.id}});

		if (params.type == "charge.succeeded") {
			await this.chargeCallback(trade);
		} else if (params.type == "refund.succeeded") {
			await this.refundCallback(trade);
		} else {
		}
		
		return this.success("OK");
	}

}

module.exports = Trade;
