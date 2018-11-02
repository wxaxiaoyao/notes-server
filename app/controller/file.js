
const _ = require("lodash");
const Controller = require("../core/controller.js");

const File = class extends Controller {
	get modelName() {
		return "files";
	}

	async rawurl() {
		let {key} = this.validate({key:"string"});
		key = decodeURIComponent(key);

		const url = this.storage.getDownloadUrl(key);

		return url;
	}

	async token() {
		const {username} = this.authenticated();
		let {key} = this.validate({key:"string"});
		key = decodeURIComponent(key);

		if (!_.startsWith(key, username+"/")) return this.throw(400, "无权限");

		return this.storage.getUploadToken(key);
	}

	async upsertFolder(userId, key) {
		const getFolderByKey = (key) => key.substring(0, key.lastIndexOf("/", key.length-2) + 1);
		let folder = getFolderByKey(key);
		while(folder) {
			await this.model.files.upsert({
				userId,
				key,
				folder,
				type: "folders",
			});
			key = folder;
			folder = getFolderByKey(key);
		}

		return;
	}

	async upsert() {
		const getFolderByKey = (key) => key.substring(0, key.lastIndexOf("/", key.length-2) + 1);
		const params = this.validate({key:"string"});
		const {userId} = this.authenticated();
		const {key} = params;

		params.userId = userId;
		params.folder = getFolderByKey(key);
		params.type = this.util.getFileType(key);
		params.filename = key.substring(key.lastIndexOf("/") + 1);
		
		await this.model.files.upsert(params);
		const data = await this.model.files.findOne({where:{key}});
		
		return data;
	}

	async destroy() {
		const {userId} = this.authenticated();
		const {id} = this.validate({id:'int'});

		const file = await this.model.files.getById(id, userId);

		if (!file) return this.throw(404);

		const ok = await this.storage.delete(file.key);
		if (!ok) return this.throw(500, "存贮服务删除文件失败");

		data = await model.files.destroy({where:{id:file.id}});

		return data;
	}

	async batchDelete() {
		const {userId} = this.authenticated();
		const {keys = []} = this.validate();
		const where = {userId, key:{[this.app.Sequelize.Op.in]: keys}};
		
		const list = await this.model.files.findAll({where});
		_.each(list, (val, index) => list[index] = val.get ? val.get({plain:true}): val);

		const ok = await this.storage.batchDelete(list);
		console.log("batch delete:", ok);

		await this.model.files.destroy({where});
		
		return this.success("OK");
	}

	async rename() {
		const {userId} = this.authenticated();
		const {id, filename} = this.validate({id:"int", filename:"string"});

		const file = await this.model.files.getById(id, userId);
		if (!file) return this.throw(404);

		const {key} = file;
		file.key = key.substring(0, key.lastIndexOf("/") + 1) + filename;
		file.filename = filename;

		const exist = await this.model.files.findOne({where:{key:file.key}});
		if (exist) return this.throw(409, "文件已存在");

		const ok = await this.storage.move(key, file.key);
		if (!ok) return this.throw(500, "存储服务更名失败");

		await this.model.files.update(file, {fields:["key", "filename"], where:{id: file.id}});

		return this.success(file);
	}

	async statistics() {
		const {userId} = this.authenticated();

		const data = await this.model.files.statistics(userId);

		return this.success(data);
	}
}

module.exports = File;
