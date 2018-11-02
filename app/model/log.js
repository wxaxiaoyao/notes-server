
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

		module: {
			type: STRING(32),
		},

		// uid 日志归类
		logId: {  
			type: STRING(64),
		},

		url: {
			type: STRING(128),
		},

		// 类型
		type: {
			type: INTEGER,
		},

		// 日志级别
		level: {
			type: INTEGER,
		},

		// 日志信息
		message: {
			type: TEXT,
		},

		// 日志内容
		text: {
			type: TEXT,
		},

		// data 
		data: {
			type: JSON,
		},
	}, {
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true});

	app.model.logs = model;
	return model;
};

