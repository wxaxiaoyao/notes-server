
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
			unique: true,
		},

		privilege: {                 // 权限
			type: INTEGER,
			defaultValue: 0,
		},

		visibility: {
			type: INTEGER,           // 项目可见性  0 - 公开  1 - 私有 
			defaultValue: 0,
		},

		description: {               // 项目描述
			type: TEXT,
			defaultValue:"",
		},

		members: {                   // 项目成员
			type: TEXT,
			defaultValue: "|",
		},

		tags: {                      // 项目标签
			type: TEXT,
			defaultValue: "|",
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




