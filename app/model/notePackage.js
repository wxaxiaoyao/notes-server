
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

	const model = app.model.define("notePackages", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                                 // 用户
			type: BIGINT,
			allowNull: false,
		},

		parentNotePackageId: {                    // 父便条包id
			type: BIGINT,
			defaultValue:0,
		},

		title: {                                  // 标题
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
	
	app.model.notePackages = model;
	return model;
};
