
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const Suggestion = class extends Controller {
	get modelName() {
		return "suggestions";
	}

	async index() {
		const query = this.validate();

		this.formatQuery(query);

		const list = await this.model.suggestions.findAll({...this.queryOptions, where:query});

		return this.success(list);

	}
}

module.exports = Suggestion;
