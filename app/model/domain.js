module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("domains", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		domain: {
			type: STRING(32),
			unique: true,
			allowNull: false,
		},

		userId: {
			type: BIGINT,
			allowNull: false,
		},

		siteId: {
			type: BIGINT,
			allowNull: false,
		},

	}, {
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	model.getById = async function(id) {
		const sql = `select domains.*, users.username, sites.sitename 
			from domains, users, sites
			where domains.userId = users.id and domains.siteId = sites.id 
			and domains.id = :id`;

		const list = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements:{id},
		});

		if (list.length == 1) return list[0];

		return ;
	}

	model.getByDomain = async function(domain) {
		const sql = `select domains.*, users.username, sites.sitename 
			from domains, users, sites
			where domains.userId = users.id and domains.siteId = sites.id 
			and domains.domain = :domain`;

		const list = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements:{domain},
		});

		if (list.length == 1) return list[0];

		return ;
	}

	app.model.domains = model;
	return model;
};


































