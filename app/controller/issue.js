const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");
const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
	ENTITY_TYPE_ISSUE,
	ENTITY_TYPE_GROUP,
	ENTITY_TYPE_PROJECT, // 项目
} = require("../core/consts.js");

const ENTITYS = [ENTITY_TYPE_USER, ENTITY_TYPE_SITE, ENTITY_TYPE_PAGE, ENTITY_TYPE_GROUP, ENTITY_TYPE_PROJECT];

const Issue = class extends Controller {
	get modelName() {
		return "issues";
	}

	async index() {
		const query = this.validate({
			objectId: 'int',
			objectType: joi.number().valid(ENTITYS).required(),
			state: "int_optional",
			title: "string_optional",
		});

		this.formatQuery(query);

		const list = await this.model.issues.getObjectIssues(query, this.queryOptions);

		return this.success(list);
	}

	async create() {
		const {userId} = this.authenticated();
		const params = this.validate({
			objectType: joi.number().valid(ENTITYS),
			objectId: "int",
			title: "string",
			content: "string",
		});
		params.userId = userId;

		let data = await this.model.issues.create(params);
		if (!data) return this.throw(500);
		data = data.get({plain:true});

		return this.success(data);
	}

	async update() {
		const {userId} = this.authenticated();
		const params = this.validate({id:"int"});
		const id = params.id;

		const ok = await this.model.issues.update(params, {where:{id:params.id, userId}});
		
		return this.success("OK");
	}

	async destroy() {
		const {userId} = this.authenticated();
		const {id} = this.validate({id:"int"});
	
		const ok = await this.model.issues.destroy({where:{id:id, userId}});

		return this.success();
	}

	async show() {
		const {userId} = this.authenticated();
		const {id} = this.validate({id:"int"});
		
		const issue = await this.model.issues.getById(id, userId);
		if (!issue) this.throw(400);
		issue.assigns = await this.model.issues.getIssueAssigns(issue.assigns);

		return this.success(issue);
	}

	async statistics() {
		const {objectId, objectType} = this.validate({
			objectId: 'int',
			objectType: joi.number().valid(ENTITYS).required(),
		});

		const list = await this.model.issues.getObjectStatistics(objectId, objectType);

		return this.success(list);
	}
}

module.exports = Issue;
