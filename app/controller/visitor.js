const _ = require("lodash");
const Controller = require("../core/controller.js");

const Visitor = class extends Controller {
	get modelName() {
		return "visitors";
	}

	async create() {
		const {userId} = this.getUser();
		const {url} = this.validate({url:"string"});

		const data = await this.model.visitors.addVisitor(url, userId);

		return this.success(data);
	}

	// 禁止更新
	async update() {
	}
}

module.exports = Visitor;
