
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const Notification = class extends Controller {
	get modelName() {
		return "notifications";
	}

	//async index() {
		//const {userId} = this.authenticated();

		//const list = await this.model.notifications.findAll({where: {userId}});

		//return this.success(list);
	//}
}

module.exports = Notification;
