
const _ = require("lodash");
const Controller = require("../core/controller.js");

const Admin = class extends Controller {
	parseParams() {
		const params = this.validate();
		const resourceName = params["resources"] || "";
		delete params.resources;

		this.resource = this.model[resourceName];

		if (!this.resource) this.ctx.throw(400, "args error");

		//this.adminAuthenticated();

		return params;
	}
	
	async query() {
		this.adminAuthenticated();

		const {sql, data} = this.validate({sql:"string"});
		const _sql = sql.toLowerCase();
		if (_sql.indexOf("select ") != 0 || 
				_sql.indexOf(";") >= 0 ||
				_sql.indexOf("upsert ") >= 0 ||
				_sql.indexOf("drop ") >= 0 ||
				_sql.indexOf("update ") >= 0 || 
				_sql.indexOf("delete ") >= 0 ||
				_sql.indexOf("create ") >= 0 ||
				_sql.indexOf("show ") >= 0 ||
				_sql.indexOf("alter ") >= 0) {
			return this.throw(404, "sql 不合法");
		}

		const list = await this.model.query(sql, {
			type: this.model.QueryTypes.SELECT,
			replacements: data,
		});

		return this.success(list);
	}

	async search() {
		const query = this.parseParams();

		this.formatQuery(query);

		const list = await this.resource.findAll({...this.queryOptions, where:query});

		this.success(list);
	}

	async index() {
		const query = this.parseParams();
		
		this.formatQuery(query);

		console.log(query);

		const result = await this.resource.findAndCount({...this.queryOptions, where:query});

		this.queryOptions.total = result.count;
		this.success(result.rows);
	}

	async show() {
		const {id} = this.parseParams();

		const data = await this.resource.findOne({where:{id}});

		return this.success(data);
	}

	async upsert() {
		const params = this.parseParams();

		const data = await this.resource.upsert(params);

		return this.success(data);
	}

	async create() {
		const params = this.parseParams();

		const data = await this.resource.create(params);

		return this.success(data);
	}

	async update() {
		const params = this.parseParams();

		const data = await this.resource.update(params, {where:{id:params.id}});

		return this.success(data);
	}

	async destroy() {
		const {id} = this.parseParams();

		const data = await this.resource.destroy({where:{id}});

		return this.success(data);
	}
}

module.exports = Admin;
