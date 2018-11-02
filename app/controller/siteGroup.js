
const _ = require("lodash");
const Controller = require("../core/controller.js");

const SiteGroup = class extends Controller {
	get modelName() {
		return  "siteGroups";
	}

	async index() {
		const userId = this.authenticated().userId;

		const list = await this.model.siteGroups.getByUserId(userId);

		return list;
	}
}

module.exports = SiteGroup;
