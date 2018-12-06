const joi = require("joi");
const _ = require("lodash");
const moment = require("moment");
const axios = require("axios");

const Controller = require("../core/controller.js");
const {
	TRADE_TYPE_CHARGE,
	TRADE_TYPE_EXCHANGE,
	TRADE_TYPE_PACKAGE_BUY,
	TRADE_TYPE_LESSON_STUDY,
} = require("../core/consts.js");

const Trade = class extends Controller {
	get modelName() {
		return "trades";
	}

	async create() {
		const {userId} = this.authenticated();
		const {type, goodsId, count, discount=0} = this.validate({
			type: "int",                      // 交易类型  课程包购买  哈奇物品兑换
			goodsId: "int",                   // 物品id
			count: "int",                     // 购买量
			discount: "int_optional",         // 优惠券id
		});

		if (count < 0) return this.throw(400);

		const goods = await this.model.goods.findOne({where:{id: goodsId}}).then(o => o && o.toJSON());
		if (!goods || !goods.callback) return this.throw(400);

		const account = await this.model.accounts.findOne({where:{userId}}).then(o => o && o.toJSON());
		if (!account) return this.throw(500);
		
		const rmb = goods.rmb * count;
		const coin = goods.coin * count;
		const bean = goods.bean * count;

		if (account.rmb < rmb || account.coin < coin || account.bean < bean) return this.throw(400, "余额不足");
		
		const data = {extra: goods.callbackData || {}, goods, count, rmb, coin, bean};
		try {
			axios.post(goods.callback, data);
		} catch(e) {
			return this.throw(500, "交易失败");
		}

		// 更新用户余额
		await this.model.accounts.decrement({rmb, coin, bean}, {where: {userId}});
		// 创建交易记录
		await this.model.trades.create({
			type, goodsId, count, discount,
			rmb: 0 - rmb, coin: 0 - coin, bean: 0 - bean,
			subject: goods.subject,  body: goods.body,
		});

		return this.success("OK");
	}
}

module.exports = Trade;
