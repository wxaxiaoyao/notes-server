
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

	const model = app.model.define("bugs", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                      // 创建者 
			type: BIGINT,
			allowNull: false,
		},

		projectId: {                   // 项目id
			type: BIGINT,
			allowNull: false,
			defaultValue: 0,
		},

		title: {                       // 标题
			type: STRING,
			defaultValue:"",
		},

		description: {                 // api 描述
			type: TEXT,
			defaultValue:"",
		},

		state: {                       // 0 - 初始态 开发中或未开发   1 - 测试中  2 - 测试通过  3 - 测试不通过 
			type: INTEGER,             
			defaultValue: 0,
		},

		assigns: {                     // 指派人
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
	
	app.model.bugs = model;

	return model;
};
