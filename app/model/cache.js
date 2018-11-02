
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
	} = app.Sequelize;

	const model = app.model.define("caches", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		key: {  // 文件所属者
			type: STRING,
			allowNull: false,
			unique: true,
		},

		value: {
			type:JSON,
		},

		expire: {
			type: BIGINT,
			defaultValue: 0,
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true});
	
	model.get = async function(key) {
		let data = await app.model.caches.findOne({where:{key}});
		if (!data) return ;

		data = data.get({plain:true});

		const curtime = (new Date()).getTime();

		if (data.expire && curtime > data.expire) return ;

		return data.value;
	}

	model.put = async function(key, value, expire) {
		if (expire) expire += (new Date()).getTime();

		await app.model.caches.upsert({key, value, expire});
	}
	
	app.model.caches = model;
	return model;
};



