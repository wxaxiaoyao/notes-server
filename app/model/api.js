
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

	const model = app.model.define("apis", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {
			type: BIGINT,
			allowNull: false,
		},

		projectId: {                  // 项目id
			type: BIGINT,
			defaultValue:0,
		},

		classify: {                    // api 类别
			type: STRING,
		},

		title: {                       // api 标题
			type: STRING,
			defaultValue:"",
		},

		description: {                 // api 描述
			type: STRING,
			defaultValue:"",
		},

		baseURL: {                     // base URL
			type:STRING,
			defaultValue:"",
		},

		url: {                         // api url
			type:STRING,
			allowNull: false,
		},

		method: {
			type: STRING(16),
			defaultValue:"get",
		},

		headers: {                     // 请求头
			type: JSON,
			defaultValue:[],
		},

		params: {                      // 参数
			type: JSON,
			defaultValue:[],
		},

		datas: {                       // 响应数据
			type: JSON,
			defaultValue:[],
		},

		state: {
			type: INTEGER,
			defaultValue: 0,	
		},

		request: {                   // 请求
			type: JSON,
			defaultValue: {},
		},

		response: {                   // 响应
			type: JSON,
			defaultValue: {},
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
	
	app.model.apis = model;
	return model;
};
