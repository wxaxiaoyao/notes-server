
const _ = require("lodash");
const Controller = require("../core/controller.js");

const classifyTag = class extends Controller {
	get modelName() {
		return "classifyTags";
	}

	async setTags() {
		const {userId} = this.authenticated();
		const {tags=[], classify} = this.validate({
			classify: "int",
		});

		for (let i = 0; i < tags.length; i++) {
			await this.model.classifyTags.upsert({
				userId,
				classify,
				tagname: tags[i],
			});
		}

		return this.success();
	}
}

module.exports = classifyTag;
