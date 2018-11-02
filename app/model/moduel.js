
module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
		DATE,
	} = app.Sequelize;

	const model = app.model.define("modules", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {      // 所属者
			type: BIGINT,
			allowNull: false,
		},

		modulename: {     // 组件名
			type: STRING(64),
			allowNull: false,
		},

		aliasname: {    // 别名
			type: STRING(64),
		},

		tag: {       // 已保存的内容
			type: JSON,
		},

		draftTag: {  // 当前编辑未保存内容
			type: JSON,
		},

		extra: {
			type: JSON,
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
		indexes: [
		{
			unique: true,
			fields: ["userId", "modulename"],
		},
		],
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});

	app.model.modules = model;
	return model;
};




