
const _ = require("lodash");
const Controller = require("../core/controller.js");

const Api = class extends Controller {
	get modelName() {
		return "apis";
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
