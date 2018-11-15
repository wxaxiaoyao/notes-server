
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
		NOW,
	} = app.Sequelize;

	const model = app.model.define("dailies", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                    // 所属者 记录创建者
			type: BIGINT,
			allowNull: false,
		},

		date: {                      // 日期
			type: STRING(32),
			allowNull: false,
		},

		tags: {                      // 标签
			type: STRING(512),
			defaultValue:"|",
		},

		content: {                   // 日报 内容
			type: TEXT,
		},

		todo: {                      // 将要做什么
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
			fields: ["userId", "date"],
		},
		],
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	//model.hooktimer = {};
	//model.__hook__ = function(data, oper) {
		//const year = data.date.substring(0, data.date.indexOf("-"));
		//const url = "system/dailies/" + data.userId + "/" + year + ".json";  
		//this.hooktimer[url] && clearTimeout(this.hooktimer[url]);
		//this.hooktimer[url] = setTimeout(async () => {
			//const list = await app.model.dailies.findAll({
				//where: {
					//date: {
						//[app.model.Op.like]: year + "%",
					//}
				//}
			//});
			
			//_.each(list, (o, i) => list[i] = o.get({plain:true}));

			//const text = global.JSON.stringify(list);

			//console.log("备份数据到七牛: " + url);
			//app.storage.upload(url, text);
			
		//},3000);
	//}
	
	model.getUniqueWhere = function({id, userId, date}) {
		if (id) return {id};

		if (date && userId) return {date, userId};

		return undefined;
	}

	app.model.dailies = model;
	return model;
};
