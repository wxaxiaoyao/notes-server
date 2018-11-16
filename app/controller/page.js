const _ = require("lodash");

const Controller = require("../core/controller.js");

const Page = class extends Controller {
	get modelName() {
		return "pages";
	}
	
	async test() {
		for (let i = 0; i < pages.length; i++) {
			const page = pages[i];
			await this.model.pages.upsert(page);
		}
	}

	getPathByUrl(url) {
		let paths = url.split("/");
		paths.splice(1,0, "pages");
		let path = paths.join("/");
		path = _.endsWith(path, "/") ? path : (path + ".md");

		return path;
	}

	getFolderByPath(path) {
		return path.substring(0, path.lastIndexOf("/", path.length-2) + 1);
	}

	parseUrl(url) {
		const obj = {};
		const paths = url.split("/");
		obj.username = paths[0];
		obj.sitename = paths[1];

		return obj;
	}

	async upload(url, content) {
		const RepositoryFiles = this.app.gitlab.RepositoryFiles;
		if (!content) return;
		const path = this.getPathByUrl(url);

		console.log(url, path);

		//this.storage.upload(path, content);

		const projectId = "4980659";
		const ok = await RepositoryFiles.edit(projectId,  path, "master",{
			content,
			commit_message: "note site update",
		}).catch(async (e) => {
			return await RepositoryFiles.create(projectId, path, "master", {
				content,
				commit_message: "note site create",
			});
		});
		console.log(ok);
	}

	async isEditable(userId, url, username) {
		const urlObj = this.parseUrl(url);
		if (!userId) return false;
		if (_.startsWith(url, username+"/")) return true;

		let site = await this.model.sites.getByName(urlObj.username, urlObj.sitename);
		if (!site) return false;

		if (site.userId == userId) return true;

		return await this.model.sites.isEditableByMemberId(site.id, userId);
	}

	async isReadable(userId, url, username) {
		const urlObj = this.parseUrl(url);

		if (_.startsWith(url, username+"/")) return true;

		let site = await this.model.sites.getByName(urlObj.username, urlObj.sitename);
		if (!site) return false;

		if (site.userId == userId) return true;

		return await this.model.sites.isReadableByMemberId(site.id, userId);
	}

	async show() {
		const {ctx, model, config, util} = this;
		const user = this.getUser();
		const pages = model.pages;
		const {id} = this.validate();
		const where = {};
		if (_.toNumber(id)) where.id = _.toNumber(id);
		else where.url = id;

		let page = await pages.findOne({where});
		if (!page) ctx.throw(404);
		page = page.get({plain:true});

		const isReadable = await this.isReadable(user.userId, page.url, user.username);
		if (!isReadable) ctx.throw(401);

		if (!page.content) {
			page.content = await this.storage.get(this.getPathByUrl(page.url));
		}

		return this.success(page);
	}

	async create() {
		const {ctx, model, config, util} = this;
		const pages = model.pages;
		const user = this.authenticated();
		const params = this.validate({"url":"string"});
		const urlObj = this.parseUrl(params.url);
		let site = await this.model.sites.getByName(urlObj.username, urlObj.sitename);
		if (!site) return this.throw(400);

		params.userId = site.userId;
		params.siteId = site.id;
		params.content = params.content || "";
		params.folder = this.getFolderByPath(params.url);
		params.hash = util.hash(params.content);
		params.type = _.endsWith(params.url, "/") ? 1 : 0;

		const isEditable = await this.isEditable(user.userId, params.url, user.username);
		if (!isEditable) ctx.throw(401);

		if (_.startsWith(params.url, user.username+"/")) {
			params.userId = user.userId;
		} else {
			const tmp = await model.users.getByName(params.url.split("/")[0]);
			params.userId = tmp.id;
		}

		let page = await pages.create(params);
		if (!page) ctx.throw(500);
		page = page.get({plain:true});

		this.upload(page.url,  page.content);
		return this.success(page);
	}

	async update() {
		const {ctx, model, config, util} = this;
		const pages = model.pages;
		const user = this.authenticated();
		const params = this.validate({
			"id":"int",
		});

		const page = await model.pages.getById(params.id);
		if (!page) {
			if (page.url && _.startsWith(page.url, user.username + "/")) {
				return this.success(pages.create(params));
			}
			this.throw(404);
		}
		const isEditable = await this.isEditable(user.userId, page.url, user.username);
		if (!isEditable) ctx.throw(401);
		
		delete params.userId;
		delete params.type;

		if (params.content) {
			params.hash = util.hash(params.content);
		}

		const ok = await pages.update(params, {where:{id:params.id}});
		this.upload(page.url,  params.content);

		await this.model.contributions.addContributions(user.userId);

		return this.success("OK");
	}

	async destroy() {
		const {ctx, model, config, util} = this;
		const pages = model.pages;
		const user = this.authenticated();
		const params = this.validate({"id":"int"});

		const page = await pages.getById(params.id);
		if (!page) ctx.throw(404);

		const isEditable = await this.isEditable(user.userId, page.url, user.username);
		if (!isEditable) ctx.throw(401);

		const ok = await pages.destroy({where:{id:params.id}});
		this.storage.delete(this.getPathByUrl(page.url));

		return this.success(ok);
	}

	async index() {
		const {ctx, model, config, util} = this;
		const pages = model.pages;
		const params = this.validate();
		const where = params || {};

		if (where.urlPrefix){
			where.url = {[this.app.Sequelize.Op.like]: where.urlPrefix + "%"};
			delete where.urlPrefix;
		} 
		if (where.visibility == undefined) where.visibility = 0;

		const list = await pages.findAll({...this.queryOptions,exclude:["content"], where});

		return this.success(list);	
	}

	async visit() {
		const {userId, username} = this.getUser();
		console.log(this.getUser());
		const {url} = this.validate({"url":"string"});

		let page = await this.model.pages.getByUrl(url);
		if (!page) this.throw(404);
		if (page.visibility && page.userId != userId) return this.throw(411);
		
		const isReadable = await this.isReadable(userId, page.url, username);
		if (!isReadable) this.throw(401);

		await this.model.pages.visitor(page.id, userId);

		return this.success({page});
	}

	async getSetting() {
		const {userId} = this.authenticated();
		const {id} = this.validate({id:"int"});

		const page = await this.model.pages.getById(id, userId);
		if (!page) this.throw(404);

		const tags = await this.model.tags.getObjectTags(id, ENTITY_TYPE_PAGE);
		page.tags = tags;

		return this.success(page);
	}

	async postSetting() {
		const {userId} = this.authenticated();
		const params = this.validate({id:"int"});

		const id = params.id;
		const tags = params.tags || [];
		delete params.id;
		delete params.content;
		delete params.tags;

		await this.model.pages.update(params, {where:{userId, id}});
		for (let i = 0; i <tags.length; i++) {
			await this.model.tags.upsert({
				userId,
				tagname: tags[i],
				objectId:id,
				objectType: ENTITY_TYPE_PAGE,
			});
		}
		
		return this.success("OK");
	}

	async qiniuImport() {
		const params = this.ctx.state.params || {};
		let marker = undefined;
		let keys = {};
		do {
			let data = await this.storage.list(params.prefix || "", 200, marker);
			let items = data.items;
			marker = data.marker;

			for (let i = 0; i < items.length; i++) {
				let item = items[i];
				let key = item.key;
				if (!_.endsWith(key, ".md")) continue;
				let url = key.replace("pages/", "").replace(".md", "");
				let folder = this.getFolderByPath(url);

				await this.model.pages.upsert({
					url: url,
					folder: folder,
				});

				do {
					key = folder;
					folder = this.getFolderByPath(key);
					
					if (keys[key]) continue;

					await this.model.pages.upsert({
						url:key,
						folder: folder,
					});

					keys[key] = true;
				} while(folder);
			}

		} while(marker);

		return "OK";
	}
}

module.exports = Page;

