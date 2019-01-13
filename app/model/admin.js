
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

	const model = app.model.define("admins", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		username: {
			type: STRING(48),
			unique: true,
			allowNull: false,
		},

		password: {
			type: STRING(48),
			allowNull: false,
		},

		roleId: {
			type: INTEGER,
			defaultValue: 0,
		},

		email: {
			type: STRING(24),
			unique: true,
		},

		cellphone: {
			type: STRING(24),
			unique: true,
		},

		nickname: {
			type: STRING(48),
			defaultValue:"",
		},

		portrait: {
			type: STRING(128),
			defaultValue:"",
		},

		sex: {
			type: STRING(4),
			defaultValue:"男",
		},

		description: {
			type: STRING(128),
			defaultValue:"",
		},

	}, {
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	app.model.admins = model;
	return model;
};


































