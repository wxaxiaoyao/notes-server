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
