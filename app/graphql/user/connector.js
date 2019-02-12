'use strict';

const DataLoader = require('dataloader');
const consts = require("../../core/consts.js");

class UserConnector {
	constructor(ctx) {
		this.ctx = ctx;
		this.model = ctx.app.model;
		this.loader = new DataLoader(this.fetch.bind(this));
	}

	fetch(ids) {
		const users = this.ctx.app.model.User.findAll({
		where: {
			id: {
				$in: ids,
			},
		},
		}).then(us => us.map(u => u.toJSON()));
		return users;
	}

	fetchByIds(ids) {
		return this.loader.loadMany(ids);
	}

	fetchById(id) {
		return this.loader.load(id);
	}

	async fetchRankByUserId(userId) {
		return await this.model.userRanks.findOne({where: {userId}}).then(ts => ts && ts.toJSON());
	}

	async fetchContributionsByUserId(userId, years) {
		return {data:await this.model.contributions.getByUserId(userId, years)};
	}

	async fetchFansByUserId(userId, page, perPage) {
		return this.model.favorites.getFollows(userId);
	}

	async fetchStatisticsByUserId(userId) {
		return {userId};
	}

	async fetchDocumentCountByUserId(userId) {
		return await this.model.documents.count({where:{userId}});
	}
	async fetchNoteCountByUserId(userId) {
		return await this.model.notes.count({where:{userId}});
	}
	async fetchDailyCountByUserId(userId) {
		return await this.model.dailies.count({where:{userId}});
	}
	async fetchFansByUserId(userId) {
		return await this.model.dailies.count({where:{objectId:userId, objectType: consts.OBJECT_TYPE_USER}});
	}
	async fetchFollowByUserId(userId) {
		return await this.model.dailies.count({where:{userId, objectType: consts.OBJECT_TYPE_USER}});
	}
}

module.exports = UserConnector;

