const joi = require("joi");
const _ = require("lodash");
const moment = require("moment");
const uuidv1 = require('uuid/v1');
const axios = require("axios");

const Controller = require("../core/controller.js");
const {
	TRADE_TYPE_CHARGE,
	TRADE_TYPE_EXCHANGE,
	TRADE_TYPE_PACKAGE_BUY,
	TRADE_TYPE_LESSON_STUDY,

	DISCOUNT_STATE_UNUSE,
	DISCOUNT_STATE_USED,
	DISCOUNT_STATE_EXPIRED,
} = require("../core/consts.js");

const Trade = class extends Controller {
	get modelName() {
		return "trades";
	}

	async create() {
		const {userId} = this.authenticated();
		const {type, goodsId, count, discountId=0} = this.validate({
			type: "int",                      // 交易类型  课程包购买  哈奇物品兑换
			goodsId: "int",                   // 物品id
			count: "int",                     // 购买量
			discountId: "int_optional",       // 优惠券id
		});

		if (count < 0) return this.throw(400);

		const goods = await this.model.goods.findOne({where:{id: goodsId}}).then(o => o && o.toJSON());
		if (!goods || !goods.callback) return this.throw(400);

		const account = await this.model.accounts.findOne({where:{userId}}).then(o => o && o.toJSON());
		if (!account) return this.throw(500);
		
		const discount = await this.model.discounts.findOne({where:{id: discountId, userId, state:DISCOUNT_STATE_UNUSE}}).then(o => o && o.toJSON());
		if (discountId && !discount) return this.throw(400, "优惠券不存在");

		let rmb = goods.rmb * count;
		let coin = goods.coin * count;
		let bean = goods.bean * count;
		if (discount) {
			if (rmb < discount.rmb || coin < discount.coin || bean < discount.bean) return this.throw(400, "优惠券不满足使用条件");
			const curtime = new Date().getTime();
			const starttitme = new Date(discount.startDate).getTime();
			const endtime = new Date(discount.endDate).getTime();
			if (curtime < starttitme || curtime >= endtime) return this.throw(400, "优惠券已过期");

			rmb -= discount.rewardRmb;
			coin -= discount.rewardCoin;
			bean -= discount.rewardBean;
		}

		if (account.rmb < rmb || account.coin < coin || account.bean < bean) return this.throw(400, "余额不足");
		
		const data = {extra: goods.callbackData || {}, goods, count, rmb, coin, bean};
		try {
			// 签名内容
			const sigcontent = uuidv1().replace(/-/g, "");
			axios.post(goods.callback, data, {
				headers: {
					"Authorization": "Bearer " + this.ctx.state.token,  // 内部可直接使用token解析  外需只用rsa验证
					"x-keepwork-signature": this.util.rsaEncrypt(this.config.self.rsa.privateKey, sigcontent),
					"x-keepwork-sigcontent": sigcontent,
				}
			});
		} catch(e) {
			return this.throw(500, "交易失败");
		}

		// 更新用户余额
		await this.model.accounts.decrement({rmb, coin, bean}, {where: {userId}});
		
		// 设置已使用优惠券
		if (discount) await this.model.discounts.update({state:DISCOUNT_STATE_USED}, {where:{id: discount.id}});
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
