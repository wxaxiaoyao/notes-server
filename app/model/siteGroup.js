
module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("siteGroups", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		userId: {
			type: BIGINT,
			allowNull: false,
		},

		siteId: {
			type: BIGINT,
			allowNull: false,
		},

		groupId: {
			type: BIGINT,
			allowNull: false,
		},

		level: {
			type: INTEGER,
			defaultValue: 0,
		},

	}, {
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
		indexes: [
		{
			unique: true,
			fields: ["siteId", "groupId"],
		},
		],
	});

	model.getById = async function(id, userId) {
		const where = {id};

		if (userId) where.userId = userId;

		const data = await app.model.siteGroups.findOne({where: where});

		return data && data.get({plain:true});
	}

	model.getByUserId = async function(userId) {
		const sql = "select siteGroups.id, siteGroups.siteId, siteGroups.groupId, siteGroups.level, groups.groupname from siteGroups, groups where siteGroups.groupId = groups.id and siteGroups.userId = :userId";

		const list = await app.model.query(sql, {
			replacements:{
				userId:userId,
			}
		});

		return list;
	}

	app.model.siteGroups = model;
	return model;
};
