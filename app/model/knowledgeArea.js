
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

	const model = app.model.define("knowledgeAreas", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                                 // 用户
			type: BIGINT,
			allowNull: false,
		},

		title: {                                  // 知识域
			type: STRING,
			defaultValue:"",
		},

		description: {                            // 描述
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
	
	app.model.knowledgeAreas = model;
	return model;
};
