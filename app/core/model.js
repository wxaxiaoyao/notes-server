const _ = require("lodash");

module.exports = app => {

	const models = {
		users:"users", 
		sites:"sites", 
		pages:"pages",
		dailies:"dailies",
	};
	
	const timers = {};
	const sequelize = app.model;

	function hook(tableName, data, model,  oper) {
		if (model && model.__hook__) {
			return model.__hook__(data, oper);
		}

		const url = "system/" + tableName + "/" + data.id;
		const text = JSON.stringify(data);

		this.writeFile(url, text);
	}

	function writeFile(url, text) {
		timers[url] && clearTimeout(timers[url]);
		timers[url] = setTimeout(async() => {
			console.log("备份数据到七牛: " + url);
			await app.storage.upload(url, text);
		}, 3000);
	}

	sequelize.afterCreate(async (inst) => {
		const cls = inst.constructor;
		const tableName = cls.getTableName();
		const modelName = models[tableName];
		if (!modelName) return;

		const data = inst.get({plain:true});
		const model = models[tableName];

		hook(tableName, data, model, "create");
	});

	sequelize.afterBulkUpdate(async (options) => {
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
	});

	sequelize.beforeBulkDestroy(async (options) => {
	});

	sequelize.beforeUpsert(async (value, options) => {
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
	});
}
