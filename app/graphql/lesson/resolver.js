
'use strict';

module.exports = {
	User: {
		lesson(root, _, ctx) {
			return {userId: root.id};
		}
	},

	Lesson: {
		user(root, _, ctx) {
			return ctx.connector.lesson.fetchUserByUserId(root.userId);
		}
	}
};
