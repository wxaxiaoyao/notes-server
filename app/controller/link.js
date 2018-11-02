
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const Link = class extends Controller {
	get modelName() {
		return "links";
	}
}

module.exports = Link;
