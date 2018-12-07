
const _ = require("lodash");
const Controller = require("../core/controller.js");

const Goods = class extends Controller {
	get modelName() {
		return "goods";
	}

	async index() {
		const query = this.validate();
		
		this.formatQuery(query);

		const list = await this.model.goods.findAll({...this.queryOptions, where:query});

		return this.success(list);
	}

	async create() {

	}

	async update() {

	}

	async destroy() {

	}

	detail() {

	}
}

module.exports = Goods;
