
const _ = require("lodash");

module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("visitors", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		url: {                      // url
			type:STRING,
			allowNull: false,
		},

		date: {                     // 统计日期
			type: STRING(24),
			allowNull: false,
			defaultValue:"",
		},

		count: {
			type: INTEGER,
			defaultValue:0,
		},

		visitors: {                 // 访客的用户id列表  使用字符串而不用数组原因是字符串可模糊查找  数组则不可查询
			type: TEXT,
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
			fields: ["url", "date"],
		},
		],
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	model.addVisitor = async function(url, userId) {
		const {year, month, day} = app.util.getDate();
		const date = year + month + day;
		let visitor = await app.model.visitors.findOne({where:{url, date}});
		visitor = visitor ? visitor.get({plain:true}) : {url, count:0, visitors:"|", extra:{}, date};

		visitor.count++;
		if (userId) visitor.visitors = "|" + userId + visitor.visitors.replace("|" + userId + "|", "|");

		await app.model.visitors.upsert(visitor);
		return;
	} 

	app.model.visitors = model;
	return model;
};
