'use strict';

const DataLoader = require('dataloader');

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
}

module.exports = UserConnector;

