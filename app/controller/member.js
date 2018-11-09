
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

	getModel(objectType) {
		const models = {
			[ENTITY_TYPE_PROJECT]: this.model.projects,
			[ENTITY_TYPE_SITE]: this.model.sites,
			[ENTITY_TYPE_GROUP]: this.model.groups,
		};

		return models[objectType];
	}

	async index() {
		const params = this.validate({
			objectId: 'int',
			objectType: joi.number().valid(ENTITY_TYPE_SITE, ENTITY_TYPE_GROUP).required(),
		});

		const list = await this.model.members.getObjectMembers(params.objectId, params.objectType);

		return this.success(list);
	}

	// 块创建
	async bulkCreate() {
		const {userId} = this.authenticated();
		const {objectId, objectType, memberIds=[]} = this.validate({
			objectId: 'int',
			objectType: joi.number().valid(ENTITYS).required(),
		});
		if (memberIds.length == 0) return this.success("OK");
		const list = [];

		const model = this.getModel(objectType);
		const data = await model.getById(objectId, userId);
		if (!data) return this.throw(400);

		for (let i = 0; i < memberIds.length; i++) {
			list.push({userId, objectId, objectType, memberId: memberIds[i]});
		}

		const result = await this.model.members.bulkCreate(list);

		return this.success(result);
	}

	async create() {
		const {userId} = this.authenticated();
		const params = this.validate({
			objectId: 'int',
			objectType: joi.number().valid(ENTITYS).required(),
			memberId: 'int',
		});
		params.userId = userId;

		const model = this.getModel(params.objectType);
		let data = await model.getById(params.objectId, userId);
		if (!data) return this.throw(400);

		data = await this.model.members.create(params);

		return this.success(data);
	}

	async destroy() {
		const {userId} = this.authenticated();
		const {id} = this.validate({id:"int"});

		const member = await this.model.members.findOne({where:{id, userId}});
		if (!member) return this.throw(404);

		await this.model.members.destroy({where:{id, userId}});

		await this.model.applies.destroy({where:{objectId:member.objectId, objectType:member.objectType, userId: member.memberId}});

		return this.success("OK");
	}

	async exist() {
		const {userId} = this.authenticated();
		const {objectId, objectType, memberId=userId} = this.validate({
			memberId:"int_optional",
			objectId:'int',
			objectType: joi.number().valid(ENTITYS).required(),
		});
		
		const data = await this.model.members.findOne({where: {
			objectId,objectType, memberId,
		}});

		if (!data) return this.success(false);

		return this.success(true);
	}

}

module.exports = Member;
