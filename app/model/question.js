
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

	const model = app.model.define("questions", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {
			type: BIGINT,
			allowNull: false,
		},

		title: {                       // 问题标题
			type: STRING,
			defaultValue:"",
		},

		description: {                 // 问题描述
			type: TEXT,
		},

		type: {                        // 问题类型 默认为问答题
			type: INTEGER,
			defaultValue:0,
		},

		tags: {                        // 标签
			type: STRING,
			defaultValue:"|",
		},
		
		text: {                        // 问题作答
			type: TEXT,
		},

		result: {                      // 问题结果
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
	
	app.model.questions = model;
	return model;
};
