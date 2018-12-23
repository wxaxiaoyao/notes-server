
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");
const {
	OBJECT_TYPE_USER,
	OBJECT_TYPE_SITE,
	OBJECT_TYPE_PAGE,
	OBJECT_TYPE_GROUP,
	OBJECT_TYPE_PROJECT,

	APPLY_STATE_DEFAULT,
	APPLY_STATE_AGREE,
	APPLY_STATE_REFUSE,

	APPLY_TYPE_MEMBER,
} = require("../core/consts.js");

const Apply = class extends Controller {
	get modelName() {
		return "applies";
	}

	async index() {
		const {objectType, objectId, applyType} = this.validate({
			objectType: joi.number().valid([OBJECT_TYPE_USER]),
			objectId: "int",
			applyType: joi.number().valid([APPLY_TYPE_MEMBER]),
		});
		const models = {
			[APPLY_TYPE_MEMBER]: {
				as:"apply",
				attributes: ["id", "username", "nickname", "portrait"],
				model: this.model.users,
			},
		};

		const list = await this.model.applies.findAll({
			where: {objectType, objectId, applyType},
			include: [models[applyType]],
		});

		return this.success(list);
	}

	async create() {
		const {userId} = this.authenticated();
		const params = this.validate({
			objectType: joi.number().valid([OBJECT_TYPE_USER]),
			objectId: "int",
			applyType: joi.number().valid([APPLY_TYPE_MEMBER]),
			applyId: 'int',
		});
		params.state = APPLY_STATE_DEFAULT;

		await this.model.applies.upsert(params);
		return this.success("OK");
	}

	async state() {
		const {userId} = this.authenticated();
		const {id, state} = this.validate({
			id:"int", 
			state:joi.number().valid([APPLY_STATE_REFUSE, APPLY_STATE_AGREE]),
		});
		const apply = await this.model.applies.findOne({where:{id}}).then(o => o && o.toJSON());
		if (!apply) return this.throw(400);

		// 安全性验证
		if (apply.objectType == OBJECT_TYPE_USER) {
			if (apply.objectId != userId) return this.throw(401);
		}

		// 更新状态
		await this.model.applies.update({state}, {where:{id}});
		// 拒绝直接返回
		if (state == APPLY_STATE_REFUSE) return this.success();

		// 同意
		if (apply.objectType == OBJECT_TYPE_USER) {
			if (apply.applyType == APPLY_TYPE_MEMBER) {
				await this.model.contacts.upsert({
					userId: apply.objectId,
					contactId: apply.applyId,
				});
				await this.model.contacts.upsert({
					userId: apply.applyId,
					contactId: apply.objectId,
				});
			}
		}

		return this.success();
	}
}

module.exports = Apply;
