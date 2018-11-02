module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("files", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {
			type: BIGINT,
			allowNull: false,
		},

		filename: {
			type: STRING(64),
			defaultValue:"",
		},

		key: {  // 存储服务的文件名  推荐使用全路径  可以使用UUID 唯一即可
			type: STRING(256),
			unique: true,
		},

		folder: {
			type: STRING(256),
			defaultValue: "",
		},

		visibility: {   // 是否公开
			type: INTEGER,
			defaultValue:0,
		},

		type: {     // 文件类型  0 - 文件  1 - 目录
			type: STRING(12),
			defaultValue: "files",
		},

		size: {
			type: BIGINT,
			defaultValue: 0,
		},

		hash: {     // 七牛哈希  文件存于谁就用谁的hash   如 git sha
			type: STRING(64),
			defaultValue: "",
		},

	}, {
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});

	model.getById = async function(id, userId) {
		const where = {id};

		if (userId) where.userId = userId;

		const data = await app.model.files.findOne({where: where});

		return data && data.get({plain:true});
	}

	model.statistics = async function(userId) {
		const sql = `SELECT SUM(size) as used, COUNT(*) as count from files where userId = :userId and size > 0`;

		const list = await app.model.query(sql, {
			type: app.Sequelize.QueryTypes.SELECT,
			replacements: {userId},
		});
		
		if (list.length == 0) return {used: 0, count:0};

		return list[0];
	}

	app.model.files = model;
	return model;
};


































