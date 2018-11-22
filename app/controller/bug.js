
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");


const Bug = class extends Controller {
	get modelName() {
		return "bugs";
	}
}

module.exports = Bug;
