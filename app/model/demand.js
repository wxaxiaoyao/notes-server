
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

	const model = app.model.define("demands", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                    // 所属者 记录创建者
			type: BIGINT,
			allowNull: false,
		},

		title: {                     // 需求标题
			type: STRING,
			allowNull: false,
		},

		description: {               // 简述
			type: TEXT,
		},

		story: {                     // 需求故事描述
			type: TEXT,
		},

		scene: {                    //  使用场景
			type: TEXT,
		},

		customer: {                  // 目标用户 按角色细分
			type: TEXT,
		},

		worth: {                     // 价值 产出
			type: TEXT,
		},

		type: {
			type: INTEGER,           // 需求类型
			defaultValue: 0,
		},

		tags: {                      // 标签
			type: STRING,
			defaultValue:"|",
		},

		feature: {                   // 功能点
			type: TEXT,
		},

		state: {                     // 0 -- 构思中  1 -- 评估中  2 -- 已定稿  3 -- 已完成  4 --  已废弃
			type: INTEGER,
		},

		link: {                     // 相关资源链接
			type: TEXT,  
		},

		implement: {                 // 实现思路
			type: TEXT,
		},

		stars: {
			type: JSON,
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
	

	app.model.demands = model;
	return model;
}
