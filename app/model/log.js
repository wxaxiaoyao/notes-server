
module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("logs", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		level: {
			type: STRING(12),
			defaultValue: "DEBUG",
		},

		text: {
			type: TEXT,
			defaultValue: "",
		},

	}, {
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true});

	app.model.logs = model;
	return model;
};

