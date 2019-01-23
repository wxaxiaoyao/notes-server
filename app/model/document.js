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

	const model = app.model.define("documents", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                    // 所属者 记录创建者
			type: BIGINT,
			allowNull: false,
		},

		folderId: {                  // 文件夹ID
			type: BIGINT,
			allowNull: false,
			defaultValue: 0,
		},

		filename: {                  //  文件名
			type: STRING,
			defaultValue: "",
		},

		text: {                      // 文档内容
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
		indexes: [
		{
			unique: true,
			fields: ["userId", "folderId", "filename"],
		},
		],
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	app.model.documents = model;
	return model;
};
