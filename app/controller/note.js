
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
					as: "classifyTags",
					model: this.model.classifyTags,
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
			o.classifyTags = [];
			_.each(o.objectTags, objTag => o.classifyTags.push(objTag.classifyTags));
			return o;
		});

		return this.success(note);
	}

	async index() {
		const {userId} = this.authenticated();
		const query = this.validate();
		query.userId = userId;

		const list = await this.model.notes.findAll({
			include: [
			{
				include: {
					as: "classifyTags",
					model: this.model.classifyTags,
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
				o.classifyTags = [];
				_.each(o.objectTags, objTag => o.classifyTags.push(objTag.classifyTags));
				return o;
			});
		});

		return this.success(list);
	}

	async setTags() {
		const {userId} = this.authenticated();
		const {id, tags} = this.validate();
		await this.model.query(`delete objectTags from objectTags, classifyTags where objectTags.classifyTagId = classifyTags.id and classifyTags.classify = ${CLASSIFY_TAG_NOTE} and objectTags.objectId = ${id}`);

		const list = _.map(tags, o => ({userId, objectId:id, classifyTagId: o.id}));
		const res = await this.model.objectTags.bulkCreate(list);

		return this.success(res);
	}

	async create() {
		const {userId} = this.authenticated();
		const params = this.validate();
		params.userId = userId;

		const note = await this.model.notes.create(params).then(o => o && o.toJSON());
		if (!note) return this.throw(400);

		if (params.classifyTags) {
			const objectId = note.id;
			const list = [];
			_.each(params.classifyTags, o => list.push({userId, objectId, classifyTagId: o.id}));
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

		if (params.classifyTags) {
			await this.model.query(`delete objectTags from objectTags, classifyTags where objectTags.classifyTagId = classifyTags.id and classifyTags.classify = ${CLASSIFY_TAG_NOTE} and objectTags.objectId = ${id}`);
			const list = [];
			_.each(params.classifyTags, o => list.push({userId, objectId:id, classifyTagId: o.id}));
			await this.model.objectTags.bulkCreate(list);
		}

		return this.success();
	}

	async destroy() {
		const {userId} = this.authenticated();
		const {id} = this.validate();
		
		await this.model.notes.destroy({where:{id, userId}});
		await this.model.query(`delete objectTags from objectTags, classifyTags where objectTags.classifyTagId = classifyTags.id and classifyTags.classify = ${CLASSIFY_TAG_NOTE} and objectTags.objectId = ${id}`);

		return this.success();
	}
}

module.exports = Note;
