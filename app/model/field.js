
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

	const model = app.model.define("fields", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		name: {                       // 字段名
			type: STRING,
			allowNull: false,
			unique: true,
		},

		type: {                       // 字段类型
			type: STRING(16),
			defaultValue:"string",
		},

		description: {                 // 字段解释
			type: STRING,
			defaultValue:"",
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
	
	app.model.apis = model;
	return model;
};
