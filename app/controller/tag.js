
const _ = require("lodash");
const Controller = require("../core/controller.js");

const Tag = class extends Controller {
	get modelName() {
		return "tags";
	}
	
	async index() {
		const {classify} = this.validate({classify:"int"});
		const sql = `select tags.*, count(objectTags.id) as count from objectTags right join tags on objectTags.tagId = tags.id where tags.classify = :classify group by tags.id`;
		const list = await this.model.query(sql, {
			type: this.model.QueryTypes.SELECT,
			replacements: {
				classify,
			}
		});

		return this.success(list);
	}
}

module.exports = Tag;
