
const _ = require("lodash");
const Controller = require("../core/controller.js");

const Experience = class extends Controller {
	get modelName() {
		return "experiences";
	}
}

module.exports = Experience;
