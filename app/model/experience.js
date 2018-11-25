
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

	const model = app.model.define("experiences", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                                 // 用户
			type: BIGINT,
			allowNull: false,
		},

		title: {                                  // 标题
			type: STRING,
			defaultValue:"",
		},

		text: {                                   // 体验
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
	
	app.model.experiences = model;
	return model;
};
