
const _ = require("lodash");
const Controller = require("../core/controller.js");

const Knowledge = class extends Controller {
	get modelName() {
		return "knowledges";
	}
}

module.exports = Knowledge;
