
const _ = require("lodash");
const Controller = require("../core/controller.js");

const Api = class extends Controller {
	get modelName() {
		return "apis";
	}

	async index() {
		const {userId} = this.authenticated();
		let  query = this.validate();
		this.formatQuery(query);
		query.userId = userId;
		if (!query.projectId) {
			const ids = [];
			const projects = await this.model.projects.findAll({where:{$or:[{userId}, {members:{$like:`%|${userId}|%`}}]}});
			_.each(projects, o => ids.push(o.id));
			if (ids.length) {
				query.projectId = {$in: ids};
				query = {$or:[{projectId:{$in:ids}}, query]};
			}
		}

		const result = await this.model.apis.findAll({...this.queryOptions, where:query});

		this.success(result);
	}

	async show() {
		const {id} = this.validate({id:"int"});

		const data = await this.model.apis.findOne({where:{id}});
		if (!data) return this.throw(404);

		return this.success(data);
	}

	async getConfig() {
		const {userId} = this.authenticated();

		const data = await this.model.apiConfigs.findOne({where:{userId}});
		if (!data) return this.throw(404);

		return this.success(data.get({plain:true}));
	}

	async setConfig() {
		const {userId} = this.authenticated();
		const data = this.validate();
		data.userId = userId;	

		const result = await this.model.apiConfigs.upsert(data);

		return this.success(result);
	}
}

module.exports = Api;
