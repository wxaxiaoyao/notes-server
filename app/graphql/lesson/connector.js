
'use strict';

const DataLoader = require('dataloader');

class LessonConnector {
	constructor(ctx) {
		this.ctx = ctx;
		this.model = ctx.app.model;
		this.lessonModel = ctx.app.lessonModel;
	}

	async fetchUserByUserId(userId) {
		return await this.lessonModel.users.findOne({where:{id:userId}}).then(o => o && o.toJSON());
	}
}

module.exports = LessonConnector;

