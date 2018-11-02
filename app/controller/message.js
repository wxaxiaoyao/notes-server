
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const Message = class extends Controller {
	get modelName() {
		return "messages";
	}

	async create() {
	}

	// 禁止更新
	async update() {
	}
}

module.exports = Message;
