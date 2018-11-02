
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const Question = class extends Controller {
	get modelName() {
		return "questions";
	}
}

module.exports = Question;
