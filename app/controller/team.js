
const _ = require("lodash");
const Controller = require("../core/controller.js");

const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
	ENTITY_TYPE_GROUP,
	ENTITY_TYPE_ISSUE,
	ENTITY_TYPE_PROJECT,
	ENTITY_TYPE_TEAM,
} = require("../core/consts.js");

const ENTITYS = [
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
	ENTITY_TYPE_GROUP,
	ENTITY_TYPE_ISSUE,
	ENTITY_TYPE_PROJECT,
	ENTITY_TYPE_TEAM,
];

const Team = class extends Controller {
	get modelName() {
		return "teams";
	}
	
	async show() {
		const {id} = this.validate();
		const team = await this.model.teams.getById(id);

		if (!team) return this.throw(404);

		return this.success(team);
	}

	async all() {
		const {userId} = this.authenticated();

		const list = await this.model.teams.getAll(userId);

		return this.success(list);
	}

	async create() {
		const {userId} = this.authenticated();
		const params = this.validate({name:"string"});
		params.userId = userId;

		const team = await this.model.team.upsert(params);
		await this.model.members.create({
			objectId:team.id,
			objectType:ENTITY_TYPE_TEAM,
			memberId:userId,
		});

		return this.success(team);
	}

	async destroy() {
		const {ctx, model, config, util} = this;
		const userId = this.authenticated().userId;
		const params = this.validate({"id":"int"});

		await model.teams.deleteById(params.id, userId);

		return;
	}

	async exit() {
		const {userId} = this.authenticated();
		const {id} = this.validate({id:"int"});

		const data = await this.model.members.destroy({objectId:id, objectType:ENTITY_TYPE_TEAM, memberId:userId});

		return this.success(data);
	}

	// 添加成员
	async postMembers() {
		const userId = this.authenticated().userId;
		const params = this.validate({
			id: "int",
			memberId: "int_optional",
			memberName: "string_optional",
		});
		if (!params.memberId && !params.memberName) return this.throw(400, "参数错误");
		const user = await this.model.users.get(params.memberId || params.memberName);
		if (!user) this.throw(400, "成员不存在");
		const memberId = user.id;

		const data = await this.model.members.upsert({
			userId,
			objectId: params.id,
			objectType: ENTITY_TYPE_TEAM,
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
			objectType: ENTITY_TYPE_TEAM,
			memberId,
		}});

		return this.success(data);
	}

	// 获取组成员
	async getMembers() {
		const userId = this.authenticated().userId;
		const {id} = this.validate({id: "int"});
		
		const list = await this.model.members.getObjectMembers(id, ENTITY_TYPE_TEAM);

		return this.success(list);
	}

	// 获取团队日报
	async getDailies() {
		const {id} = this.validate({id: "int"});
		const list = await this.model.teams.getDailiesByTeamId(id);

		return this.success(list);
	}
}

module.exports = Team;
