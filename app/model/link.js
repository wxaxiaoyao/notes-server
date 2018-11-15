
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

	const model = app.model.define("links", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {
			type: BIGINT,
			allowNull: false,
		},

		title: {
			type: STRING,
			defaultValue:"",
		},

		href: {
			type: STRING,
			defaultValue:"",
		},

		tags: {
			type: STRING,
			defaultValue:"|",
		},

		description: {
			type: STRING,
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
	
	//model.hooktimer = {};
	//model.__hook__ = function(data, oper) {
		//const {userId} = data;
		//const url = "__data__/links/" + userId + ".json";  
		//this.hooktimer[url] && clearTimeout(this.hooktimer[url]);
		//this.hooktimer[url] = setTimeout(async () => {
			//const list = await app.model.dailies.findAll({limit:100000, where: {userId}});
			//_.each(list, (o, i) => list[i] = o.get({plain:true}));
			//const text = global.JSON.stringify(list);
			//console.log("备份数据到七牛: " + url);
			//app.storage.upload(url, text);
		//},3000);
	//}

	app.model.links = model;
	return model;
};
