
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const Task = class extends Controller {
	get modelName() {
		return "tasks";
	}
}


module.exports = Task;
