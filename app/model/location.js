
const _ = require("lodash");

module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		FLOAT,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("locations", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                      // 用户
			type: BIGINT,
			allowNull: false,
			unique: true,
		},

		longitude: {                   // 经度
			type: FLOAT(10, 6),
		},

		latitude: {                    // 纬度
			type: FLOAT(10, 6),
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
	
	model.getNearBy = async function({longitude, latitude, distance = 5000, userId = 0, offset = 0, limit = 200}) {
		const sql = `select userId, distance, username, nickname, portrait, sex 
			from (select userId, f_lng_lat_distance(:longitude, :latitude, longitude, latitude) as distance from locations where userId != :userId) as dist, users 
			where users.id = dist.userId and dist.distance < :distance limit :limit offset :offset`;
		
		const list = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements: {
				userId,
				distance,
				longitude,
				latitude,
				offset, 
				limit,
			}
		});

		return list;
	}

	app.model.locations = model;

	return model;
};
