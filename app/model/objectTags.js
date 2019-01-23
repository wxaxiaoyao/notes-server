
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

	const model = app.model.define("objectTags", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                    // 所属者
			type: BIGINT,
			allowNull: false,
		},
		
		objectId: {                  // 对象id
			type: BIGINT,
			defaultValue:0,
		},

		classify: {                  // 分类
			type: INTEGER,
			defaultValue: 0,
		},

		tagId: {                     // 分类标签id
			type: BIGINT,
			defaultValue: 0,
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
		indexes: [
		{
			unique: true,
			fields: ["objectId", "classify", "tagId"],
		},
		],
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	app.model.objectTags = model;
	return model;
};
