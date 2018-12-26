
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

	const model = app.model.define("contacts", {
		id: {                           // id
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                        // 用户id
			type: BIGINT,
			allowNull: false,
		},

		contactId: {                     // 联系人用户id
			type: BIGINT,
			allowNull: false,
		},

		relation: {                      // 关系
			type: INTEGER,
			defaultValue: 0,
		},

		alias: {                         // 别名
			type: STRING,
			defaultValue:"",
		},

		expire: {                        // 过期 时间 多久没联系自动删除
			type: BIGINT,
			defaultValue: 1000 * 3600 * 24 * 30, 
		},

		lastContactTime: {               // 最后一次联系时间
			type: BIGINT,
			defaultValue:0,
		},

		tags: {
			type: JSON,
			defaultValue: [],
		},

		extra: {                         // 附加信息
			type:JSON,
			defaultValue: {},
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',

		indexes: [
		{
			unique: true,
			fields: ["userId", "contactId"],
		},
		],
	});

	//model.sync({force:true});

	app.model.contacts = model;
	return model;
};




