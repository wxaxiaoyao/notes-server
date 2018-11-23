
const _ = require("lodash");
const Controller = require("../core/controller.js");

const Project = class extends Controller {
	get modelName() {
		return "projects";
	}

	async search() {
		const query = this.validate();

		this.formatQuery(query);

		const result = await this.model.projects.findAll({...this.queryOptions, where:query});

		return this.success(result);
	}
}

module.exports = Project;
