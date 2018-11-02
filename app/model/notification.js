
const _ = require("lodash");
const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,

	NOTIFICATION_STATE_UNREAD,
	NOTIFICATION_STATE_READ,
} = require("../core/consts.js");

module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("notifications", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {             // 通知所属者
			type: BIGINT,
			allowNull:  false,
		},

		type: {               // 通知类型
			type: INTEGER,
			defaultValue: 0,
		},

		state: {              // 是否已读  0 -- 未读  1 -- 已读
			type: INTEGER,
			defaultValue: 0,
		},

		description: {        // 通知内容
			type: TEXT,
			defaultValue: "",
		},

		extra: {
			type: JSON,
			defaultValue: {},
		},
	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	model.addNotification = async function(userId, description) {
		if (!userId) return;

		const data = await app.model.notifications.create({
			userId,
			description,
			state: NOTIFICATION_STATE_UNREAD,
		});

		return data && data.get({plain:true});
	}

	model.getUnreadByUserId = async function(userId) {
		let data = await this.model.findAndCount({
			where: {
				userId,
				state: NOTIFICATION_STATE_UNREAD,
			}
		});

		return data;
	}
	
	model.favoriteNotification = async function(userId, objectId, objectType, oper = "favorite") {
		if (objectType == ENTITY_TYPE_USER) await this.favoriteUser(userId, objectId, oper);
		else if (objectType == ENTITY_TYPE_SITE) await this.favoriteSite(userId, objectId, oper);
		else if (objectType == ENTITY_TYPE_PAGE) await this.favoritePage(userId, pageId, oper);

		return;
	}

	model.favoriteUser = async function(userId, followingId, oper="favorite") {
		const usersModel = app.model["users"];

		let user = await usersModel.getById(userId);
		let followingUser = await usersModel.getById(followingId);

		if (oper == "favorite") oper = "关注";
		if (oper == "unfavorite") oper = "取消关注";
		let description = `${user.nickname || user.username} ${oper} ${followingUser.nickname || followingUser.username}`;

		await this.addNotification(userId, description);
		await this.addNotification(followingId, description);
	}

	model.favoriteSite = async function(userId, siteId, oper="favorite") {
		const usersModel = app.model["users"];
		const sitesModel = app.model["sites"];

		let user = await usersModel.getById(userId);
		let site = await sitesModel.getById(siteId);

		if (oper == "favorite") oper = "收藏";
		if (oper == "unfavorite") oper = "取消收藏";

		let description = `${user.nickname || user.username} ${oper} ${site.sitename}站点`;

		await this.addNotification(userId, description);
		await this.addNotification(site.userId, description);
	}

	model.favoritePage = async function(userId, pageId, oper="favorite") {
		const usersModel = app.model["users"];
		const pagesModel = app.model["pages"];

		let user = await usersModel.getById(userId);
		let page = await pagesModel.getById(pageId);

		if (oper == "favorite") oper = "收藏";
		if (oper == "unfavorite") oper = "取消收藏";

		let description = `${user.nickname || user.username} ${oper} ${page.url}页面`;

		await this.addNotification(userId, description);
		await this.addNotification(page.userId, description);
	}

	app.model.notifications = model;
	return model;
};
