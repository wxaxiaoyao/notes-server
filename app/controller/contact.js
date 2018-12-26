
const _ = require("lodash");
const Controller = require("../core/controller.js");

const Contact = class extends Controller {
	get modelName() {
		return "contacts";
	}

	async index() {
		const  {userId} = this.authenticated();
		const query = this.validate();

		const list = await this.model.contacts.findAll({
			where: {userId},
			include: [
			{
				attributes: ["id", "username", "nickname", "portrait"],
				model: this.model.users,
			}
			]
		}).then(list => _.map(list, o => o.toJSON()));

		return this.success(list);
	}
}

module.exports = Contact;
