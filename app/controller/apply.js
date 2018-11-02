
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");
const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
	ENTITY_TYPE_GROUP,
	ENTITY_TYPE_PROJECT,

	APPLY_STATE_AGREE,
	APPLY_STATE_REFUSE,
	APPLY_TYPE_MEMBER,
} = require("../core/consts.js");

const Apply = class extends Controller {
	get modelName() {
		return "applies";
	}

	async index() {
		const params = this.validate({
			objectType: joi.number().valid(ENTITY_TYPE_PROJECT),
			objectId: "int",
			applyType:"int",
		});

		const list = await this.model.applies.getObjectApplies(params.objectId, params.objectType, params.applyType);

		return this.success(list);
	}

	async create() {
		const {userId} = this.authenticated();
		const params = this.validate({
			objectType: joi.number().valid(ENTITY_TYPE_PROJECT),
			objectId: "int",
			applyType: joi.number().valid(APPLY_TYPE_MEMBER),
			applyId: 'int',
		});
		params.userId = userId;
		delete params.state;

		const data = await this.model.applies.create(params);
		if (!data) this.throw(400);

		return this.success(data);
	}

	async update() {
		const {userId} = this.authenticated();
		const {id, state} = this.validate({id:"int", state:"int"});
		let ok = 0;

		if (state == APPLY_STATE_AGREE) {
			ok = await this.model.applies.agree(id, userId);
		} else if(state == APPLY_STATE_REFUSE) {
			ok = await this.model.applies.refuse(id, userId);
		}

		if (ok != 0) this.throw(400);

		return this.success("OK");
	}
}

module.exports = Apply;
