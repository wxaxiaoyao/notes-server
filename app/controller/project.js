
const _ = require("lodash");
const Controller = require("../core/controller.js");

const Project = class extends Controller {
	get modelName() {
		return "projects";
	}
}

module.exports = Project;
