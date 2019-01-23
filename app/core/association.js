
module.exports = app => {
	const users = app.model.users;
	const contacts = app.model.contacts;
	const applies = app.model.applies;
	const sessions = app.model.sessions;
	const classifyTags = app.model.classifyTags;
	const objectTags = app.model.objectTags;

	 //一个用户有多个联系人
	users.hasMany(contacts, {
		foreignKey: "contactId",
		sourceKey: "id",
		constraints: false,
	});

	// 一个联系只属于一个用户
	contacts.belongsTo(users, {
		foreignKey:"contactId",
		targetKey:"id",
		constraints: false,
	});

	users.hasMany(applies, {
		//as: "apply",
		foreignKey:"applyId",
		sourceKey:"id",
		constraints: false,
	});

	applies.belongsTo(users, {
		as: "apply",
		foreignKey:"applyId",
		targetKey:"id",
		constraints: false,
	});

	users.hasMany(applies, {
		foreignKey:"objectId",
		sourceKey:"id",
		constraints: false,
	});

	applies.belongsTo(users, {
		as: "user",
		foreignKey:"objectId",
		targetKey:"id",
		constraints: false,
	});

	users.hasMany(sessions, {
		foreignKey:"memberId",
		sourceKey:"id",
		constraints: false,
	});

	sessions.belongsTo(users, {
		foreignKey: "memberId",
		targetKey:"id",
		constraints: false,
	});

	app.model.tags.hasMany(objectTags, {
		as: "objectTags",
		foreignKey: "tagId",
		sourceKey: "id",
		constraints: false,
	});
	
	objectTags.belongsTo(app.model.tags, {
		as: "tags",
		foreignKey: "tagId",
		targetKey: "id",
		constraints: false,
	});

	app.model.notes.hasMany(app.model.objectTags, {
		as: 'objectTags',
		foreignKey: "objectId",
		sourceKey:"id",
		constraints: false,
	});

	app.model.objectTags.belongsTo(app.model.notes, {
		as: "notes",
		foreignKey: "objectId",
		sourceKey: "id",
		constraints: false,
	});

	app.model.documents.hasMany(app.model.objectTags, {
		as: 'objectTags',
		foreignKey: "objectId",
		sourceKey:"id",
		constraints: false,
	});

	app.model.objectTags.belongsTo(app.model.documents, {
		as: "documents",
		foreignKey: "objectId",
		sourceKey: "id",
		constraints: false,
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
