const _ = require("lodash");
const Controller = require("../core/controller.js");

const {
	ENTITY_VISIBILITY_PUBLIC,
	ENTITY_VISIBILITY_PRIVATE,

	USER_ACCESS_LEVEL_NONE,
	USER_ACCESS_LEVEL_READ,
	USER_ACCESS_LEVEL_WRITE,
} = require("../core/consts.js");

const Site = class extends Controller {
	get modelName() {
		return "sites";
	}

	async search() {
		const params = this.validate();

		params.visibility = 0;
		this.formatQuery(params);

		const result = await this.model.sites.findAndCount({...this.queryOptions, where:params});
		
		this.queryOptions.total = result.count;
		return this.success(result.rows);
	}

	async detail() {
		const {id} = this.validate({id:"int"});
		const {userId} = this.getUser();

		let site = await this.model.sites.findOne({where: {id:id}});
		if (!site) return this.throw(400, "参数错误");
		site = site.get({plain:true});
		
		const level = await this.model.sites.getMemberLevel(site.id, userId);
		if (level < USER_ACCESS_LEVEL_READ) return this.throw(401, "没有权限");

		const user = await this.model.users.getById(site.userId);

		return this.success({user, site});
	}

	async getByName() {
		let {username, sitename} = this.validate({username:"string", sitename:'string'});
		username = decodeURIComponent(username);
		sitename = decodeURIComponent(sitename);
		const user = await this.model.users.getByName(username);
		if (!user) return this.throw(404);

		let site = await this.model.sites.findOne({where:{userId:user.id, sitename}});
		if (!site) return this.throw(404);
		site = site.get({plain: true});

		return this.success({user, site});
	}

	async index() {
		const userId = this.authenticated().userId;
		const params = this.validate({
			owned: "boolean_optional", 
			membership: "boolean_optional",
		});

		let list = [];
		params.owned = params.owned == undefined ? true : false;
		if (params.owned) list = list.concat(await this.model.sites.get(userId));
		if (params.membership) list = list.concat(await this.model.sites.getJoinSites(userId, USER_ACCESS_LEVEL_WRITE));

		return this.success(list);
	}

	async create() {
		const {ctx, model, config, util} = this;
		const {userId, username} = this.authenticated();
		const params = this.validate({
			"sitename":"string",
		});

		params.userId = userId;
		let data = await model.sites.findOne({
			where: {
				userId:userId,
				sitename: params.sitename,	
			}
		});
		
		if (data) return ctx.throw(400, "站点已存在");

		let site = await model.sites.create(params);	
		if (!site) return ctx.throw(500);
		site = site.get({plain:true});

		const url = username + "/" + site.sitename + "/";
		let page = {url, folder: username + "/", type: 1,	userId,	siteId: site.id};
		await this.model.pages.upsert(page);
		page = {url: url + "index", folder: url, type: 0, userId, siteId: site.id, content: ""};
		await this.model.pages.upsert(page);
		//this.addNotification(userId, data.id, "create");

		return site;
	}

	async postGroups() {
		const userId = this.authenticated().userId;
		const params = this.validate({
			id: "int",
			groupId: "int",
			level: joi.number().valid(USER_ACCESS_LEVEL_NONE, USER_ACCESS_LEVEL_READ, USER_ACCESS_LEVEL_WRITE),
		});
		
		const site = await this.model.sites.getById(params.id, userId);
		if (!site) this.throw(400, "用户站点不存在");
		const group = await this.model.groups.getById(params.groupId, userId);
		if (!group) this.throw(400, "用户组不存在");

		let data = await this.model.siteGroups.create({
			userId,
			siteId: params.id,
			groupId: params.groupId,
			level: params.level,
		});
		if (!data) this.throw(500, "DB Error");
		
		return this.success(data.get({plain:true}));
	}

	async putGroups() {
		const userId = this.authenticated().userId;
		const params = this.validate({
			id: "int",
			groupId: "int",
			level: joi.number().valid(USER_ACCESS_LEVEL_NONE, USER_ACCESS_LEVEL_READ, USER_ACCESS_LEVEL_WRITE),
		});

		const where = {
			userId,
			siteId: params.id,
			groupId: params.groupId,
		}
		let data = await this.model.siteGroups.update({level: params.level}, {where});

		return this.success(data);
	}

	async deleteGroups() {
		const userId = this.authenticated().userId;
		const params = this.validate({
			id: "int",
			groupId: "int",
		});

		let data = await this.model.siteGroups.destroy({where:{
			userId,
			siteId: params.id,
			groupId: params.groupId,
		}});

		return this.success(data);
	}

	async getGroups() {
		const userId = this.authenticated().userId;
		const siteId = this.validate({id: "int"}).id;

		const list = await this.model.sites.getSiteGroups(userId, siteId);

		return this.success(list);
	}

	async privilege() {
		const userId = this.getUser().userId;
		const siteId = this.validate({id: "int"}).id;

		const level = await this.model.sites.getMemberLevel(siteId, userId);

		return this.success(level);
	}
}

module.exports = Site;
