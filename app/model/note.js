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

	const model = app.model.define("notes", {
		id: {                                     // 记录id
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                                 // 用户
			type: BIGINT,
			allowNull: false,
		},

		notePackageId: {                          // 所属知识包Id
			type: BIGINT,
			defaultValue: 0,
		},

		title: {                                  // 标题
			type: STRING,
			defaultValue:"",
		},

		text: {                                   // 体验
			type: TEXT,
			defaultValue: "",
		},

		star: {                                   // 重要度
			type: INTEGER,
			defaultValue: 0,
		},

		extra: {                                  // 附加信息
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
	
	app.model.notes = model;

	return model;
};
