
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const Todo = class extends Controller {
	get modelName() {
		return "todos";
	}
}

module.exports = Todo;
