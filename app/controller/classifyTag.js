
const _ = require("lodash");
const Controller = require("../core/controller.js");

const classifyTag = class extends Controller {
	get modelName() {
		return "classifyTags";
	}

	async index() {
		const userId = this.authenticated().userId;
		const params = this.validate();

		const list = await this.model.classifyTags.findAll({
			...this.queryOptions, 
			where: {...params, userId},
			include: [
			{
				as: "objectTags",
				model: this.model.objectTags,
			}
			],
		});

		return this.success(list);
	}

	async setObjects() {
		const {userId} = this.authenticated();
		const {id, objectIds=[]} = this.validate({
			id: "int",
		});

		await this.model.objectTags.destroy({where:{classifyTagId:id, userId}});
		const objectTags = [];
		for (let i = 0; i < objectIds.length; i++) {
			objectTags.push({
				userId,
				classifyTagId:id,
				objectId: objectIds[i],
			});
		}
		await this.model.objectTags.bulkCreate(objectTags);

		return this.success();
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
