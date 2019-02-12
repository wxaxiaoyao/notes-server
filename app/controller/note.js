
const _ = require("lodash");
const Controller = require("../core/controller.js");
const {
	CLASSIFY_TAG_NOTE,      // 便条tag
} = require("../core/consts.js");

const Note = class extends Controller {
	get modelName() {
		return "notes";
	}

	async show() {
		const {userId} = this.authenticated();
		const {id} = this.validate();

		const note = await this.model.notes.findOne({
			include: [
			{
				include: {
					as: "tags",
					model: this.model.tags,
					where: {
						classify: CLASSIFY_TAG_NOTE,
					},
				},
				as:"objectTags",
				model:this.model.objectTags,
			},
			],
			where:{userId, id},
		}).then(o => {
			o = o.toJSON();
			o.tags = o.objectTags.map(o => o.tags);
			return o;
		});

		return this.success(note);
	}

	async search() {
		const {tagId, value=""} = this.validate({
			tagId:"int_optional",
		});
		const list = await this.model.notes.findAll({
			include: [
			{
				as:"objectTags",
				model:this.model.objectTags,
				where: {
					tagId: tagId,
					classify: CLASSIFY_TAG_NOTE,
				}
			}
			],
			where: {
				text: {
					[this.model.Op.like]:`%${value}%`,
				}
			}
		});
		
		return this.success(list);
	}

	async index() {
		const {userId} = this.authenticated();
		const query = this.validate();
		query.userId = userId;

		const list = await this.model.notes.findAll({
			include: [
			{
				include: {
					as: "tags",
					model: this.model.tags,
					where: {
						classify: CLASSIFY_TAG_NOTE,
					},
				},
				as:"objectTags",
				model:this.model.objectTags,
			},
			],
			where:query,
		}).then(list => {
			return _.map(list, o => {
				o = o.toJSON();
				o.tags = o.objectTags.map(o => o.tags);
				return o;
			});
		});

		return this.success(list);
	}

	async create() {
		const {userId} = this.authenticated();
		const params = this.validate();
		params.userId = userId;

		const note = await this.model.notes.create(params).then(o => o && o.toJSON());
		if (!note) return this.throw(400);

		if (params.tags) {
			const list = _.map(params.tags, o => ({userId, objectId: note.id, classify: CLASSIFY_TAG_NOTE, tagId:o.id}));
			await this.model.objectTags.bulkCreate(list);
		}

		return this.success(note);
	}
	
	async update() {
		const {userId} = this.authenticated();
		const params = this.validate();
		params.userId = userId;
		const id = params.id;

		await this.model.notes.update(params, {where:{id, userId}});

		if (params.tags) {
			await this.model.objectTags.destroy({where:{userId, objectId: id, classify: CLASSIFY_TAG_NOTE}});
			const list = _.map(params.tags, o => ({userId, objectId: id, classify: CLASSIFY_TAG_NOTE, tagId:o.id}));
			await this.model.objectTags.bulkCreate(list);
		}

		return this.success();
	}

	async destroy() {
		const {userId} = this.authenticated();
		const {id} = this.validate();
		
		await this.model.notes.destroy({where:{id, userId}});
		await this.model.objectTags.destroy({where:{userId, objectId: id, classify: CLASSIFY_TAG_NOTE}});

		return this.success();
	}
}

module.exports = Note;
