const _ = require("lodash");

module.exports = app => {
	const models = {
		users:"users", 
		pages:"pages",
		dailies:"dailies",
		links: "links",
	};
	
	const timers = {};
	const sequelize = app.model;

	function writeFile(url, text) {
		timers[url] && clearTimeout(timers[url]);
		timers[url] = setTimeout(async() => {
			console.log("备份数据到七牛: " + url);
			await app.storage.upload(url, text);
		}, 3000);
	}

	async function multi(tableName, model, inst) {
		const {userId, id} = inst;
		const no = await model.count({where:{userId, id: {[app.model.Op.lte]:id}}});
		const size = 3000;
		const page = Math.floor(no / size);
		const offset = page * size;
		const list = await model.findAll({where:{userId}, limit:size, offset});
		const text = JSON.stringify(list);

		const url = `__data__/${tableName}/${userId}/${page}.json`;

		writeFile(url, text);
	}

	async function single(tableName, model, inst) {
		const {userId=0, id}  = inst; 
		const url = `__data__/${tableName}/${userId}/${id}.json`;
		const text = JSON.stringify(inst);

		writeFile(url, text);
	}

	function hook(tableName, data, model,  oper) {
		if (model && model.__hook__) {
			return model.__hook__(data, oper);
		}
 
		if (tableName == "users" || tableName == "pages") {
			single(tableName, model, data);
		} else {
			multi(tableName, model, data);
		}
	}

	async function afterCreate(inst) {
		const cls = inst.constructor;
		const tableName = cls.getTableName();
		const modelName = models[tableName];
		if (!modelName) return;

		const data = inst.get({plain:true});
		const model = models[tableName];

		hook(tableName, data, model, "create");
	}

	async function afterBulkUpdate(options) {
		const tableName = options.model.getTableName();
		const modelName = models[tableName];
		if (!modelName) return Promise.resolve([]);

		const model = app.model[modelName];
		
		const list = await model.findAll({where:options.where});
		_.each(list, (data, i) => {
			data = data.get({plain:true});
			hook(tableName, data, model, "update");
		});

		return list;
	}

	async function beforeUpsert(value, options) {
		const tableName = options.model.getTableName();
		const modelName = models[tableName];
		if (!modelName) return Promise.resolve();
		const model = app.model[modelName];
		const where = model.getUniqueWhere && model.getUniqueWhere(value);
		if (!where) return;
		let data = await model.findOne({where});
		if (!data) data = await model.create(value);
		data = data.get({plain:true});
		_.merge(data, value);

		await hook(tableName, data, model, "upsert");
	}

	sequelize.afterCreate((inst) => afterCreate(inst));

	sequelize.afterBulkUpdate((options) => afterBulkUpdate(options));

	sequelize.beforeBulkDestroy(async (options) => {});

	sequelize.beforeUpsert(async (value, options) => beforeUpsert);
}
