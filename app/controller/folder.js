
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const Folder = class extends Controller {
	get modelName() {
		return "folders";
	}
}

module.exports = Folder;
