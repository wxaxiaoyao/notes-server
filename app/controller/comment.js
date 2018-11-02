
const Controller = require("../core/controller.js");

const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
	ENTITY_TYPE_GROUP,
	ENTITY_TYPE_ISSUE,
	ENTITY_TYPE_PROJECT,
} = require("../core/consts.js");

const ENTITYS = [
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
	ENTITY_TYPE_GROUP,
	ENTITY_TYPE_ISSUE,
	ENTITY_TYPE_PROJECT,
];

const Comment = class extends Controller {
	get modelName() {
		return "comments";
	}

	async create() {
		const userId = this.authenticated().userId;
		const {objectType, objectId, content} = this.validate({
			objectType: joi.number().valid(ENTITYS),
			objectId: "int",
			content: "string",
		});

		const data = await this.model.comments.createComment(userId, objectId, objectType, content);
		if (!data) this.throw(400);

		return this.success(data);
	}

	async index() {
		const {objectType, objectId} = this.validate({
			objectType: joi.number().valid(ENTITYS),
			objectId: "int",
		});

		const list = await this.model.comments.getObjectComment(objectId, objectType);

		return this.success(list);
	}
}

module.exports = Comment;
