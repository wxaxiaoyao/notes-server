
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

	const model = app.model.define("apiConfigs", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {
			type: BIGINT,
			unique: true,
		},

		fields: {                      // 字段
			type:JSON,
			defaultValue:[],
		},

		baseUrls: {                    // base url
			type: JSON,
			defaultValue:[],
		},

		headers: {                     // 头部
			type: JSON,
			defaultValue:[],
		},

		classify: {                    // 分类
			type: JSON,
			defaultValue:[],
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
	
	app.model.apiConfigs = model;
	return model;
};
