const _ = require("lodash");
const Controller = require("../core/controller.js");

const Version = class extends Controller {
	get modelName() {
		return "versions";
	}

	async index() {
		const query = this.validate();
		this.formatQuery(query);

		const list = await this.model.versions.findAll({...this.queryOptions, where:query});

		return this.success(list);
	}
}

module.exports = Version;
