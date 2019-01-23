
const _ = require("lodash");
const Controller = require("../core/controller.js");

const ObjectTag = class extends Controller {
	get modelName() {
		return "objectTags";
	}

	async index() {
		const userId = this.authenticated().userId;
		const {objectId, classify} = this.validate({
			objectId:"int",
			classify:"int",
		});

		const list = await this.model.objectTags.findAll({
			...this.queryOptions, 
			where: {objectId, userId},
			include: [
			{
				as: "tags",
				model: this.model.tags,
				where: {classify},
			}
			],
		}).then(list => list.map(o => o.toJSON().tags));

		return this.success(list);
	}

	async setTags() {
		const {userId} = this.authenticated();
		const {objectId, classify, tags = []} = this.validate({objectId:"int", classify:"int"});

		_.each(tags, o => {
			o.userId = userId;
			o.classify = classify;
		});

		await this.model.objectTags.destroy({where:{userId, objectId, classify}});
		await this.model.objectTags.bulkCreate(tags);

		return this.success("OK");
	}
}

module.exports = ObjectTag;
