
const _ = require("lodash");

module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("versions", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		type: {                         // 类型
			type: INTEGER,
			defaultValue: 0,
		},

		versionNo: {                    // 版本号
			type: INTEGER,
			defaultValue:0,
		},

		versionName: {                  // 版本名
			type: STRING,
			defaultValue: "0.0.0",
		},
		
		description: {                  // 描述
			type: TEXT,
			defaultValue:"",
		},

		downloadUrl: {                  // 下载地址
			type: STRING,
			defaultValue:"",
		},

		extra: {
			type:JSON,
			defaultValue: {},
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true});

	app.model.versions = model;
	return model;
};




