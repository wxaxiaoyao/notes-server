
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const Daily = class extends Controller {
	get modelName() {
		return "dailies";
	}

	async importDailies() {
		const {userId} = this.authenticated(); 
		const {dailies=[]} = this.validate();

		for (let i = 0; i < dailies.length; i++){
			const daily = dailies[i];
			daily.userId = userId;
			await this.model.dailies.upsert(daily);
		}

		return this.success();
	}
}

module.exports = Daily;
