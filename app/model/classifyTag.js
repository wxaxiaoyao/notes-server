
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

	const model = app.model.define("classifyTags", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                    // 所属者
			type: BIGINT,
			allowNull: false,
		},
		
		classify: {                  // 分类  1 -- 联系人分类
			type: INTEGER,
			defaultValue: 0,
		},

		tagname: {                  // 标签名
			type: STRING,
			defaultValue:"",
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
		indexes: [
		{
			unique: true,
			fields: ["userId", "classify", "tagname"],
		},
		],
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	app.model.classifyTags = model;
	return model;
};
