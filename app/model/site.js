const _ = require("lodash");

const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
	ENTITY_TYPE_GROUP,
	ENTITY_TYPE_PROJECT,

	ENTITY_VISIBILITY_PUBLIC,
	ENTITY_VISIBILITY_PRIVATE,

	USER_ACCESS_LEVEL_NONE,
	USER_ACCESS_LEVEL_READ,
	USER_ACCESS_LEVEL_WRITE,
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

	const model = app.model.define("sites", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {
			type: BIGINT,
			allowNull: false,
		},

		sitename: {
			type: STRING(48),
			allowNull: false,
		},

		visibility: {
			type: INTEGER, // public private
			defaultValue: 0,
		},

		description: {
			type: STRING(128),
		},

	}, {
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
		indexes: [
		{
			unique: true,
			fields: ["userId", "sitename"],
		},
		],
	});

	model.get = async function(userId) {
		const list = await app.model.sites.findAll({order:[["id", "asc"]], where:{userId}});

		return list;
	}

	model.getById = async function(id, userId) {
		const where = {id};

		if (userId) where.userId = userId;

		const data = await app.model.sites.findOne({where: where});

		return data && data.get({plain:true});
	}

	model.getByName = async function(username, sitename) {
		const sql = `select sites.*, users.username
			from users, sites
			where users.id = sites.userId 
			and users.username = :username and sites.sitename = :sitename`;

		const list = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements: {
				username,
				sitename,
			},
		});

		if (list.length == 1) {
			return list[0];
		}

		return;
	}

	model.isEditableByMemberId = async function(siteId, memberId) {
		const level = await this.getMemberLevel(siteId, memberId);

		if (level >= USER_ACCESS_LEVEL_WRITE && level < USER_ACCESS_LEVEL_NONE) return true;

		return false;
	}

	model.isReadableByMemberId = async function(siteId, memberId) {
		const level = await this.getMemberLevel(siteId, memberId);

		if (level >= USER_ACCESS_LEVEL_READ && level < USER_ACCESS_LEVEL_NONE) return true;

		return false;
	}

	model.getMemberLevel = async function(siteId, memberId) {
		let site = await app.model.sites.findOne({where:{id:siteId}});
		if (!site) return USER_ACCESS_LEVEL_NONE;
		site = site.get({plain: true});

		if (!memberId) return site.visibility == ENTITY_VISIBILITY_PRIVATE ? USER_ACCESS_LEVEL_NONE : USER_ACCESS_LEVEL_READ;

		if (site.userId == memberId) return USER_ACCESS_LEVEL_WRITE;

		let level = 0;

		let sql = `select level 
			from members
			where objectId = :objectId and objectType = :objectType and memberId = :memberId`;
		let list = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements: {
				objectId:siteId,
				objectType: ENTITY_TYPE_SITE,
				memberId,
			}
		});
		
		_.each(list, val => level = level < val.level ? val.level : level);

		sql = `select siteGroups.level 
			from siteGroups, members 
			where siteGroups.groupId = members.objectId  and members.objectType = :objectType 
			and siteGroups.siteId = :siteId and members.memberId = :memberId`;

		list = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements: {
				objectType: ENTITY_TYPE_GROUP,
				siteId: siteId,
				memberId: memberId,
			}
		});

		_.each(list, val => level = level < val.level ? val.level : level);

		level = level ? level : (site.visibility == ENTITY_VISIBILITY_PRIVATE ? USER_ACCESS_LEVEL_NONE : USER_ACCESS_LEVEL_READ);

		return level;
	}

	model.getJoinSites = async function(userId, level) {
		level = level || USER_ACCESS_LEVEL_WRITE;

		const sql = `select sites.*, users.username
			from sites, siteGroups, members, users 
			where sites.id = siteGroups.siteId and siteGroups.groupId = members.objectId and members.objectType = :objectType and sites.userId = users.id
			and members.memberId = :memberId and siteGroups.level >= :level`;

		const list = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements: {
				objectType: ENTITY_TYPE_GROUP,
				memberId: userId,
				level: level,
			}
		});

		const refuseSiteId = [];
		_.each(list, site => {if (site.level == USER_ACCESS_LEVEL_NONE) refuseSiteId.push(site.id)});
		_.remove(list, o => refuseSiteId.indexOf(o.id) >= 0);

		return _.uniqBy(list, "id");
	}

	model.getSiteGroups = async function(userId, siteId) {
		const sql = `select siteGroups.id, siteGroups.siteId, siteGroups.groupId, siteGroups.level, groups.groupname 
			from siteGroups, groups
		   	where siteGroups.groupId = groups.id 
			and siteGroups.userId = :userId and siteGroups.siteId = :siteId`;

		const list = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements:{
				userId,
				siteId,
			}
		});

		return list;
	}

	model.getCountByUserId = async function(userId) {
		return await app.model.sites.count({where:{userId}});
	}

	app.model.sites = model;
	return model;
};


































