
module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("oauthUsers", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {  // 文件所属者
			type: BIGINT,
		},

		externalId: {
			type: STRING(48),
		},

		externalUsername: {
			type: STRING(48),
		},

		type: {
			type: INTEGER,
		},

		token: {
			type: STRING(64),
		}

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
		indexes: [
		{
			unique: true,
			fields: ["externalId", "type"],
		},
		],
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});

	app.model.oauthUsers = model;
	return model;
};


































