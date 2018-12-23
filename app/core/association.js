
module.exports = app => {
	const users = app.model.users;
	const contacts = app.model.contacts;
	const applies = app.model.applies;
	const sessions = app.model.sessions;

	 //一个用户有多个联系人
	users.hasMany(contacts, {
		foreignKey: "contactId",
		sourceKey: "id",
	});

	// 一个联系只属于一个用户
	contacts.belongsTo(users, {
		foreignKey:"contactId",
		targetKey:"id",
	});

	users.hasMany(applies, {
		//as: "apply",
		foreignKey:"applyId",
		sourceKey:"id",
	});

	applies.belongsTo(users, {
		as: "apply",
		foreignKey:"applyId",
		targetKey:"id",
	});

	users.hasMany(applies, {
		foreignKey:"objectId",
		sourceKey:"id",
	});

	applies.belongsTo(users, {
		as: "user",
		foreignKey:"objectId",
		targetKey:"id",
	});

	users.hasMany(sessions, {
		foreignKey:"memberId",
		sourceKey:"id",
	});

	sessions.belongsTo(users, {
		foreignKey: "memberId",
		targetKey:"id",
	});

	//users.hasOne(accounts, {
		////as: "Account",
		//foreignKey: "userId",
	//});

	//accounts.belongsTo(users, {
		////as: "User",
		//foreignKey: "userId",
		//targetKey: "id",
	//});

	//users.hasMany(roles, {
		//foreignKey: "userId",
		//sourceKey: "id",
	//});

	//roles.belongsTo(users, {
		//foreignKey: "userId",
		//targetKey: "id",
	//});

	//users.hasOne(illegals, {
		//foreignKey: "objectId"
	//});

	//illegals.belongsTo(users, {
		//foreignKey: "objectId",
		//targetKey: "id",
	//});
}
