
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");


const Location = class extends Controller {
	get modelName() {
		return "locations";
	}

	async getNearBy() {
		const {userId} = this.authenticated();
		const {longitude, latitude} = this.validate();

		const list = await this.model.locations.getNearBy({longitude, latitude, userId});

		return this.success(list);
	}
}

module.exports = Location;
