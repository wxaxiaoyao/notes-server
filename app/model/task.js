
const _ = require("lodash");

module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
		DATE,
		NOW,
	} = app.Sequelize;

	const model = app.model.define("tasks", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                    // 所属者 记录创建者
			type: BIGINT,
			allowNull: false,
		},

		type: {                      // 任务类型
			type: BIGINT,
			allowNull: false,
			defaultValue: 0,
		},

		state: {
			type: INTEGER,           // 状态 0 --  未处理态  1 -- 进行中  2 -- 完成  3  废弃
			defaultValue:0, 
		},

		title: {
			type: STRING(255),       // 标题
			defaultValue:"",
		},

		content: {               // 任务描述
			type: TEXT,
		},

		description: {               // 任务描述
			type: TEXT,
		},

		assigns: {                   // 指派人
			type: TEXT,
		},

		items: {                     // 细化任务项
			type: JSON, 
			defaultValue: [],
		},

		startDate: {                 // 开始日期
			type: DATE,
			defaultValue: NOW,
		},

		endDate: {                   // 结束日期
			type: DATE,
			defaultValue: NOW,
		},

		todo: {
			type: TEXT,
			
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
	

	app.model.tasks = model;
	return model;
};
