const _ = require("lodash");
const octokit = require('@octokit/rest')();

module.exports = (app) => {
	const config = app.config.self;
	octokit.authenticate({
		type: 'token',
		token: config.github.token,
	});

	const models = {
		users:"users", 
		documents: "documents",
		pages:"pages",
		dailies:"dailies",
		notes: "notes",
		links: "links",
		bugs: "bugs",
		apis: "apis",
	};
	
	const map = {};
	const timers = {};
	const sequelize = app.model;

	async function writeGithubFile(path, text) {
		const data = {
			owner: config.github.owner,
			repo: config.github.repo,
			path,
		}
		const file = await octokit.repos.getContents(data).then(res => res.data).catch(e => console.log(e));
		
		data.content = app.util.base64(text || "");
		data.message = "system commit";
		if (file) {
			await octokit.repos.updateFile({...data, sha:file.sha}).then(res => console.log(res));
		} else {
			await octokit.repos.createFile(data).then(res => console.log(res));
		}
	}

	function writeFile(url, text) {
		timers[url] && clearTimeout(timers[url]);
		timers[url] = setTimeout(async() => {
			console.log("备份数据到七牛: " + url);
			await app.storage.upload(url, text);
			await writeGithubFile(url, text);
		}, 3000);
	}

	async function multi(tableName, model, inst) {
		const {userId, id} = inst;
		const no = await model.count({where:{userId, id: {[app.model.Op.lte]:id}}});
		const size = 1000;
		const page = Math.floor(no / size);
		const offset = page * size;
		const list = await model.findAll({where:{userId}, limit:size, offset});
		const text = JSON.stringify(list, undefined, 4);

		const url = `__data__/${tableName}/${userId}/${page}.json`;

		writeFile(url, text);
	}

	async function single(tableName, model, inst) {
		const {userId=0, id}  = inst; 
		const url = `__data__/${tableName}/${userId}/${id}.json`;
		const text = JSON.stringify(inst, undefined, 4);

		writeFile(url, text);
	}

	function hook(tableName, data, model,  oper) {
		if (model && model.__hook__) {
			return model.__hook__(data, oper);
		}
 
		if (tableName == "users" || tableName == "pages" || tableName == "documents") {
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
		const model = app.model[modelName];

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

	async function beforeBulkDestroy(options) {
		const tableName = options.model.getTableName();
		const modelName = models[tableName];
		const key = JSON.stringify({tableName, where:options.where});

		if (!modelName) return;
		const model = app.model[modelName];
		const list = await model.findAll({where:options.where});
		_.each(list, (val, i) => list[i] = val.get({plain:true}));

		map[key] = _.concat(map[key] || [], list);
	}

	async function afterBulkDestroy(options) {
		const tableName = options.model.getTableName();
		const modelName = models[tableName];
		const key = JSON.stringify({tableName, where:options.where});
		const apiName = tableName + "Destroy";

		if (!modelName) return;
		const model = app.model[modelName];
	
		const list = map[key] || [];
		map[key] = [];

		for (let i = 0; i < list.length; i++) {
			const data = list[i];

			hook(tableName, data, model, "destroy");
		}
	}

	sequelize.afterCreate((inst) => afterCreate(inst));

	sequelize.afterBulkUpdate((options) => afterBulkUpdate(options));

	sequelize.beforeBulkDestroy(options => beforeBulkDestroy(options));

	app.model.afterBulkDestroy(options => afterBulkDestroy(options));

	sequelize.beforeUpsert(async (value, options) => beforeUpsert);
}
