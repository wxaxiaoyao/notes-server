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

const Group = class extends Controller {
	get modelName() {
		return "groups";
	}

	async index() {
		const {userId} = this.authenticated();

		const groups = await this.model.groups.findAll({where:{userId}});
		_.each(groups, (o, i) => groups[i] = o.get({plain:true}));

		for (let i = 0; i < groups.length; i++) {
			const group = groups[i];
			group.members = await this.model.members.getObjectMembers(group.id, ENTITY_TYPE_GROUP);
		}

		return this.success(groups);
	}

	// 创建组
	async create() {
		const {userId} = this.authenticated();
		const params = this.validate({groupname:"string"});
		const members = params.members || [];

		params.userId = userId;
		delete params.members;

		const group = await this.model.groups.create(params);

		if (members.length) await this.model.members.setObjectMembers(group.id, ENTITY_TYPE_GROUP, members, userId);
		
		return this.success(group);
	}

	// update 
	async update() {
		const {userId} = this.authenticated();
		const params = this.validate({id: "int"});
		const members = params.members || [];
		const {id} = params;

		params.userId = userId;
		delete params.members;

		const result = await this.model.groups.update(params, {where:{id, userId}});

		if (result[0] && members.length) await this.model.members.setObjectMembers(id, ENTITY_TYPE_GROUP, members, userId);
		
		return this.success("ok");

	}

	async destroy() {
		const {ctx, model, config, util} = this;
		const userId = this.authenticated().userId;
		const params = this.validate({"id":"int"});

		await model.groups.deleteById(params.id, userId);

		return;
	}

	// 添加成员
	async postMembers() {
		const userId = this.authenticated().userId;
		const params = this.validate({
			id: "int",
			memberName: "string",
		});

		const user = await this.model.users.getByName(params.memberName);
		if (!user) this.throw(400, "成员不存在");
		const memberId = user.id;

		const data = await this.model.members.create({
			userId,
			objectId: params.id,
			objectType: ENTITY_TYPE_GROUP,
			memberId,
		});

		return this.success(data);
	}

	// 删除成员
	async deleteMembers() {
		const userId = this.authenticated().userId;
		const params = this.validate({
			id: "int",
			memberName: "string",
		});

		const user = await this.model.users.getByName(params.memberName);
		if (!user) this.throw(400, "成员不存在");
		const memberId = user.id;

		const data = await this.model.members.destroy({where:{
			userId,
			objectId: params.id,
			objectType: ENTITY_TYPE_GROUP,
			memberId,
		}});

		return this.success(data);
	}

	// 获取组成员
	async getMembers() {
		const userId = this.authenticated().userId;
		const {id, memberName} = this.validate({id: "int"});
		
		const list = await this.model.groups.getGroupMembers(userId, id, memberName);

		return this.success(list);
	}
}

module.exports = Group;
