
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

	const model = app.model.define("messages", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {
			type: BIGINT,
			allowNull: false, 
		},

		sessionId: {          // 会话id  0 -- 系统会话
			type: BIGINT,
			allowNull:  false,
		},

		type: {               // 消息类型
			type: INTEGER,
			defaultValue: 0,
		},

		tos: {                // 指定接受者 多个  |1|2|  0 表示所有人
			type: STRING,
			defaultValue: 0,
		},

		state: {              // 是否已读  0 -- 未读  1 -- 已读
			type: INTEGER,
			defaultValue: 0,
		},

		text: {               // 消息内容
			type: TEXT,
			defaultValue: "",
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
	
	app.model.messages = model;
	return model;
};
