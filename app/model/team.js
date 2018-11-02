
const _ = require("lodash");

const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
	ENTITY_TYPE_GROUP,
	ENTITY_TYPE_TEAM,
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

	const model = app.model.define("teams", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		userId: {
			type: BIGINT,
			allowNull: false,
		},

		name: {
			type: STRING(48),
			allowNull: false,
			unique: true,
		},

		description: {
			type: STRING(128),
		},

	}, {
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	model.getById = async function(id, userId) {
		const where = {};

		if (_.toNumber(id)) where.id = _.toNumber(id);
		else where.name = id;

		if (userId) where.userId = userId;

		const data = await app.model.teams.findOne({where: where});

		return data && data.get({plain:true});
	}

	model.deleteById = async function(id, userId) {
		const group = await this.getById(id, userId);
		if (!group) return;

		await app.model.teams.destroy({where:{id}});
		await app.model.members.destroy({where:{objectId: id, objectType: ENTITY_TYPE_TEAM}});

		return;
	}

	model.getDailiesByTeamId = async function(teamId, date) {
		const {year, month, day} = app.util.getDate((new Date()).getTime() - 1000 * 3600 * 24); // 获取前一天日期
		const sql = `select dailies.*, users.username, users.portrait, users.nickname 
			from members, dailies, users 
			where members.memberId = dailies.userId and dailies.userId = users.id and 
			members.objectType = :objectType and members.objectId = :objectId and dailies.date = :date`;

		date = date || `${year}-${month}-${day}`;
		const list = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements: {
				objectId: teamId,
				objectType: ENTITY_TYPE_TEAM,
				date: date,
			}
		});

		return list;
	}

	model.getAll = async function(userId) {
		const {year, month, day} = app.util.getDate((new Date()).getTime() - 1000 * 3600 * 24); // 获取前一天日期
		const sql = `select teams.*, users.username, users.portrait, users.nickname 
			from members, teams, users where members.objectId = teams.id and teams.userId = users.id and 
			members.objectType = :objectType and members.memberId = :memberId`;

		const list = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements: {
				objectType: ENTITY_TYPE_TEAM,
				memberId: userId,
			}
		});
	
		return list;
	}

	app.model.teams = model;
	return model;
};


































