
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const Demand = class extends Controller {
	get modelName() {
		return "demands";
	}

	//async index() {
		//const query = this.validate();

		//this.formatQuery(query);

		//const list = await this.model.suggestions.findAll({...this.queryOptions, where:query});

		//return this.success(list);
	//}
}

module.exports = Demand;
