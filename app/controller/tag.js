
const _ = require("lodash");
const Controller = require("../core/controller.js");

const Tag = class extends Controller {
	get modelName() {
		return "tags";
	}

	async destroy() {
		const {id} = this.validate();

		if (_.toNumber(id)) await this.model.tags.destroy({where:{id:_.toNumber(id)}});
		else await this.model.tags.destroy({where:{name:id}});

		return this.success("OK");
   	}
}

module.exports = Tag;
