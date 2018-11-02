
const _ = require("lodash");

const Controller = require("../core/controller.js");

const Field = class extends Controller {
	get modelName() {
		return "fields";
	}

	async index() {
		const query = this.validate();
		this.formatQuery(query);

		const list = await this.model.fields.findAll({...this.queryOptions, where:query});

		return this.success(list);
	}

	async show() {
		const {id} = this.validate();

		const field = await this.model.fields.findOne({where:{id}});

		return this.success(field);
	}
}

module.exports = Field;
