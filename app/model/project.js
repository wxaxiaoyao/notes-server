
module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("projects", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                    // 拥有者
			type: BIGINT,
			allowNull: false,
		},

		name: {                      // 项目名称
			type: STRING(255),
			allowNull: false,
		},

		siteId: {                    // 站点Id
			type: BIGINT,
		},

		privilege: {                 // 权限
			type: INTEGER,
			defaultValue: 0,
		},

		type: {                      // 评论对象类型  0 -- paracrfat  1 -- 网站 
			type: INTEGER,
			allowNull: false,
			defaultValue: 1,
		},

		visit: {                     // 访问量
			type: INTEGER,
			defaultValue:0,
		},

		star: {                      // 点赞数量
			type: INTEGER,
			defaultValue: 0,
		},

		description: {               // 项目描述
			type: STRING(255),
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
	
	model.getById = async function(id, userId) {
		const where = {id};

		if (userId) where.userId = userId;

		const data = await app.model.projects.findOne({where: where});

		return data && data.get({plain:true});
	}

	app.model.projects = model;
	return model;
};




