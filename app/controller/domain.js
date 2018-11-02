const _ = require("lodash");
const Controller = require("../core/controller.js");

const Domain = class extends Controller {
	get modelName() {
		return "domains";
	}

	async show() {
		const params = this.validate();
		const id = _.toNumber(params.id) || decodeURIComponent(params.id);
		let data = undefined;

		if (_.isNumber(id)) data = await this.model.domains.getById(id);
		else data = await this.model.domains.getByDomain(id);

		return this.success(data);
	}

	async exist() {
		const domain = decodeURIComponent(this.validate({domain: "string"}).domain);

		const data = await this.model.domains.findOne({where:{domain}});

		return this.success(data ? true : false);
	}
}

module.exports = Domain;
