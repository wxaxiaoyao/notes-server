
const _ = require("lodash");
const Controller = require("../core/controller.js");

const classifyTag = class extends Controller {
	get modelName() {
		return "classifyTags";
	}
}

module.exports = classifyTag;
