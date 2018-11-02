
const _ = require("lodash");
const Controller = require("../core/controller.js");

const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
	ENTITY_TYPE_GROUP,
	ENTITY_TYPE_ISSUE,
	ENTITY_TYPE_PROJECT,
} = require("../core/consts.js");

const ENTITYS = [
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
	ENTITY_TYPE_GROUP,
	ENTITY_TYPE_ISSUE,
	ENTITY_TYPE_PROJECT,
];

const Member = class extends Controller {
	get modelName() {
		return "members";
	}

	async index() {
		const params = this.validate({
			objectId: 'int',
			objectType: joi.number().valid(ENTITY_TYPE_SITE, ENTITY_TYPE_GROUP).required(),
		});

		const list = await this.model.members.getObjectMembers(params.objectId, params.objectType);

		return this.success(list);
	}

	async create() {
		const {userId} = this.authenticated();
		const models = {
			ENTITY_TYPE_SITE: this.model.sites,
			ENTITY_TYPE_GROUP: this.model.groups,
		};
		const params = this.validate({
			objectId: 'int',
			objectType: joi.number().valid(ENTITY_TYPE_SITE, ENTITY_TYPE_GROUP).required(),
			memberId: 'int',
			level: 'int',
		});
		params.userId = userId;

		let data = await models[params.objectType].getById(params.objectId, userId);
		if (!data) return this.throw(400);

		data = await this.model.members.create(params);

		return this.success(data);
	}

}

module.exports = Member;
