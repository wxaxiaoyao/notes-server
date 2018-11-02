
const _ = require("lodash");
const Controller = require("../core/controller.js");

const Module = class extends Controller {
	get modelName() {
		return "modules";
	}

}

module.exports = Module;
