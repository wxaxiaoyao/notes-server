
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const Document = class extends Controller {
	get modelName() {
		return "documents";
	}
}

module.exports = Document;
