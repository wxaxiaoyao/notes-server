
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
	} = app.Sequelize;

	const model = app.model.define("todos", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                              // 用户ID
			type: BIGINT,
			allowNull: false,
		},
		
		title: {                               // 要做的事
			type: STRING,
			allowNull: false,
		},

		description: {                         // 备注
			type: TEXT,
		},

		tags: {                                // tag
			type: STRING,
			defaultValue:"|",
		},

		state: {                               // 0 -- 初始状态 未开始   1  -- 进行中   2 -- 完成  3 -- 放弃
			type: INTEGER,
			defaultValue: 0,
		},

		rate: {                                // 评分 重要性
			type: INTEGER,
			defaultValue: 3,
		},

		extra: {
			type: JSON,
			defaultValue:{},
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true});
	
	app.model.todos = model;
	return model;
};



