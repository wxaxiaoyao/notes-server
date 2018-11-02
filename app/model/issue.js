
const _ = require("lodash");
const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
	ENTITY_TYPE_ISSUE,
	ENTITY_TYPE_GROUP,
	ENTITY_TYPE_PROJECT, // 项目
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

	const model = app.model.define("issues", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                    // 所属者者
			type: BIGINT,
			allowNull: false,
		},

		objectType: {                // 所属对象类型  0 -- 用户  1 -- 站点  2 -- 页面 3 -- 组 4 -- 项目
			type: INTEGER,
			allowNull: false,
		},

		objectId: {                  // 所属对象id
			type: BIGINT,
			allowNull: false,
		},

		title: {                    // 内容
			type: STRING(256),
			defaultValue:"",
		},

		content: {                   // 内容
			type: STRING(512),
			defaultValue:"",
		},

		state: {
			type: INTEGER,
			defaultValue:0,
		},

		tags: {
			type: STRING(256),
			defaultValue: "|",
		},

		assigns: {
			type: STRING(256),
			defaultValue: "|",
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
	
	model.getById = async function(id, userId) {
		const where = {id};

		if (userId) where.userId = userId;

		const data = await app.model.issues.findOne({where: where});

		return data && data.get({plain:true});
	}

	model.getObjectStatistics = async function(objectId, objectType) {
		const sql = `select state, count(*) count from issues where objectId = :objectId and objectType = :objectType group by state`;
		const list = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements: {
				objectId,
				objectType,
			}
		});

		return list;
	}

	model.getObjectIssues = async function(query, options = {}) {
		const result = await app.model.issues.findAndCount({...options, where: query});
		const issues = result.rows;
		const total = result.count;

		const userIds = [];

		_.each(issues, (val, index) => {
			val = val.get ? val.get({plain:true}) : val;
			issues[index] = val;

			if (_.indexOf(userIds, val.userId) < 0) userIds.push(val.userId);

			const ids = val.assigns.split("|");
			val.assigns = [];
			_.each(ids, id => {
				id = id ? _.toNumber(id) : NaN;
				if (_.isNaN(id)) return;
				val.assigns.push(id);
				console.log(val.assigns);
				if (_.indexOf(userIds, id) < 0) userIds.push(id);
			});
		});

		const attributes = [["id", "userId"], "username", "nickname", "portrait", "description"];
		const users = await app.model.users.findAll({
			attributes,
			where: {id:{[app.Sequelize.Op.in]:userIds}},
		});

		const usermap = {};
		_.each(users, user => {
			user = user.get ? user.get({plain:true}) : user;
			usermap[user.userId] = user;
		});

		_.each(issues, val => {
			val.user = usermap[val.userId];
			const assigns = val.assigns;
			val.assigns = [];
			_.each(assigns, id => val.assigns.push(usermap[id]));
		});

		return issues;
	}

	model.getIssueAssigns = async function(assigns) {
		const ids = assigns.split("|").filter(o => o);
		const userIds = [];
		_.each(ids, id => {
			id = id ? _.toNumber(id) : NaN;
			if (_.isNaN(id)) return;
			if (_.indexOf(userIds, id) < 0) userIds.push(id);
		});
		
		const attributes = [["id", "userId"], "username", "nickname", "portrait", "description"];
		const users = await app.model.users.findAll({
			attributes,
			where: {id:{[app.Sequelize.Op.in]:userIds}},
		});

		_.each(users, (val, index) => users[index] = val.get ? val.get({plain:true}) : val);
		return users;
	}

	app.model.issues = model;
	return model;
};
