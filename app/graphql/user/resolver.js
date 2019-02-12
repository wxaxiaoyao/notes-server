'use strict';

module.exports = {
	User: {
		statistics(root, _, ctx) {
			return ctx.connector.user.fetchStatisticsByUserId(root.id);
		},
	},

	Statistics: {
		documentCount({userId}, _, ctx) {
			return ctx.connector.user.fetchDocumentCountByUserId(userId);
		},

		noteCount({userId}, _, ctx) {
			return ctx.connector.user.fetchNoteCountByUserId(userId);
		},

		dailyCount({userId}, _, ctx) {
			return ctx.connector.user.fetchDailyCountByUserId(userId);
		},

		fansCount({userId}, _, ctx) {
			return ctx.connector.user.fetchFansCountByUserId(userId);
		},

		followCount({userId}, _, ctx) {
			return ctx.connector.user.fetchFollowCountByUserId(userId);
		},
	},
};


