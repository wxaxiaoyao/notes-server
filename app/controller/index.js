
const _ = require("lodash");
const Controller = require("../core/controller.js");

const Index = class extends Controller {
	index() {
		return this.success("hello world");
	}

	create() {
		const params = this.validate();

		return this.success(params);
	}
}

module.exports = Index;
