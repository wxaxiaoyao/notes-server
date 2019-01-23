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
		NOW,
	} = app.Sequelize;

	const model = app.model.define("folders", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                    // 所属者 记录创建者
			type: BIGINT,
			allowNull: false,
		},

		folderId: {                  // 父文件夹id
			type: BIGINT,
			allowNull: false,
			defaultValue: 0,
		},

		foldername: {                // 文件夹名
			type: STRING,
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
		indexes: [
		{
			unique: true,
			fields: ["userId", "folderId", "foldername"],
		},
		],
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	app.model.folders = model;
	return model;
};
