const joi = require("joi");
const _ = require("lodash");
const Controller = require("egg").Controller;

const rules = {
	"int": joi.number().required(),
	"int_optional": joi.number(),
	"number": joi.number().required(),
	"number_optional": joi.number(),
	"string": joi.string().required(),
	"string_optional": joi.string(),
	"boolean": joi.boolean().required(),
	"boolean_optional": joi.boolean(),
}

class IoController extends Controller {
	get cache() {
		return this.app.cache;
	}

	get model() {
		return this.app.model;
	}

	get axios() {
		return this.app.axios;
	}

	get util() {
		return this.app.util;
	}

	get consts() {
		return this.app.consts;
	}

	get storage() {
		return this.app.storage;
	}

	get queryOptions() {
		const params = this.ctx.args[0] || {};
		const perPage = params["x-per-page"] || 50;
		const order = params["x-order"] || "id-asc";
		const page = params["x-page"] || 1;
		const orders = [];
		const arrs = order.split("-");
		for (let i = 0; i < arrs.length; i+=2) {
			orders.push([arrs[i], arrs[i+1]]);
		}

		return {
			offset: (page-1) * perPage,
			limit: perPage,
			order: orders,
		};
	}

	getParams() {
		return _.merge({}, this.ctx.args[0]);
	}

	get log() {
		return this.app.log;
	}

	get socket() {
		return this.ctx.socket;
	}

	success(body = "OK") {
		const ack = this.ctx.args[1] || (() => {});	
		ack(body);
	}

	throw(...args) {
		return this.ctx.throw(...args);
	}

	validate(schema = {}, options = {allowUnknown:true}) {
		const params = this.getParams();

		delete params["x-per-page"];
		delete params["x-page"];
		delete params["x-order"];

		_.each(schema, (val, key) => {
			schema[key] = rules[val] || val;
		});

		const result = joi.validate(params, schema, options);

		if (result.error) {
			const errmsg = result.error.details[0].message.replace(/"/g, '');
			this.ctx.throw(400, "invalid params:" + errmsg);
		}

		_.assignIn(params, result.value);

		return params;
	}

	getUser() {
		return this.ctx.state.user || {};
	}

	authenticated() {
		const user = this.getUser();
		if (!user || !user.userId) this.ctx.throw(401);

		return user;
	}

	formatQuery(query) {
		const Op = this.app.Sequelize.Op;
		for (let key in query) {
			const arr = key.split("-");
			if (arr.length != 2) continue;

			const val = query[key];
			delete query[key];
			
			const newkey = arr[0];
			const op = arr[1];
			const oldval = query[newkey];

			if (!_.isPlainObject(oldval)) {
				query[newkey] = {};
				if (oldval) {
					query[newkey][Op["eq"]] = oldval;
				}
			}
			console.log(op, Op[op]);
			query[newkey][Op[op]] = val;
		}

		const replaceOp = function(data) {
			if (!_.isObject(data)) return ;
			_.each(data, (val, key) => {
				if (_.isString(key)) {
					const op = key.substring(1);
					if (_.startsWith(key, "$") && Op[op]) {
						data[Op[op]] = val;
						delete data[key];
					}
				}
				replaceOp(val);
			});
		}

		replaceOp(query);
	}
}

module.exports = IoController;
