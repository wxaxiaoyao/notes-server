'use strict';

module.exports = {
	User: {
		rank(root, {userId}, ctx) {
			return ctx.connector.user.fetchRankByUserId(root.id);
		},
		contributions(root, {years}, ctx) {
			years = (years || "").split(",");
			return ctx.connector.user.fetchContributionsByUserId(root.id, years);
		},
	},
};


	//fans(page: Int = 1, perPage: Int = 100): [Favorite]
	//favorites(page: Int = 1, perPage: Int = 100): [Favorite]
//type FansUser {
	//id ID!
//}
