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

	const model = app.model.define("contributions", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                    // 评论者
			type: BIGINT,
			allowNull: false,
		},

		year: {
			type: INTEGER,
			defaultValue:0,
		},

		data: {
			type: JSON,
			defaultValue:{},
		}
	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',

		indexes: [
		{
			unique: true,
			fields: ["userId", "year"],
		},
		],
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	model.addContributions = async function(userId, count = 1) {
		const date = new Date();
		const year = date.getFullYear();
		const key = date.getFullYear() + '-' + _.padStart(date.getMonth() + 1, 2, "0") + '-' + _.padStart(date.getDate(), 2, "0");

		let data = await app.model.contributions.findOne({where:{userId, year}});
		if (data) data = data.get({plain:true});
		else data = {userId, year, data:{}};

		data.data[key] = (data.data[key] || 0) + count;

		await app.model.contributions.upsert(data);

		return;
	}

	model.getByUserId = async function(userId) {
		const date = new Date();
		const year = date.getFullYear();
		const datas = await app.model.contributions.findAll({where:{
			userId,
			year: {
				[app.Sequelize.Op.in]: [year, year-1],
			},
		}});
		
		const data = {};
		_.each(datas, o => _.merge(data, o.data));

		return data;
	}

	app.model.contributions = model;
	return model;
};

