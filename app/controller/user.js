const _ = require("lodash");
const Controller = require("../core/controller.js");

const User = class extends Controller {
	get modelName() {
		return "users";
	}

	async index() {
		const query = this.validate();
		const attributes = [["id", "userId"], "username", "nickname", "portrait", "description"];

		this.formatQuery(query);

		const list = await this.model.users.findAll({...this.queryOptions, where:query, attributes});

		return this.success(list);
	}

	async search() {
		const query = this.validate();
		const attributes = [["id", "userId"], "username", "nickname", "portrait", "description"];

		this.formatQuery(query);

		const result = await this.model.users.findAndCount({...this.queryOptions, where:query, attributes});

		this.success(result);
	}

	async show() {
		const {ctx, model} = this;
		const {id} = this.validate();

		const userId = _.toNumber(id);
		const user = userId ?  await model.users.getById(userId) :	await model.users.getByName(id);

		return this.success(user);
	}

	async update() {
		const {ctx, model, config, util} = this;
		const userId = this.authenticated().userId;
		const params = this.validate();

		delete params.id;
		delete params.password;
		delete params.username;

		const ok = await model.users.update(params, {where:{id:userId}});

		return this.success(ok);
	}

	async confirmpwd() {
		const {username} = this.authenticated();
		const {password} = this.validate({password:"string"});

		const data = await this.model.users.findOne({where:{username, password}});
		if (!data) return this.success(false);

		return this.success(true);
	}

	async login() {
		const {ctx, model, util} = this;
		const config = this.config.self;
		const {username, password} = this.validate({
			"username":"string",
			"password":"string",
		});

		let user = await model.users.findOne({
			where: {
				[this.model.Op.or]: [{username: username}, {cellphone:username}, {email: username}],
				password: password,
			},
		});
		
		if (!user) ctx.throw(400, "用户名或密码错误");
		user = user.get({plain:true});

		//const roleId = rolesModel.getRoleIdByUserId(user.id);
		//if (rolesModel.isExceptionUser(roleId)) {
			//return ERR.ERR_USER_EXCEPTION();
		//}

		const token = util.jwt_encode({
			userId: user.id, 
			username: user.username
		}, config.secret, config.tokenExpire);

		user.token = token;
		//user.roleId = roleId;
		ctx.cookies.set("token", token, {
			httpOnly: false,
			maxAge: config.tokenExpire * 1000,
			overwrite: true,
			domain: "." + config.domain,
		});

		return this.success(user);
	}

	async register() {
		const {ctx, model, util} = this;
		const config = this.config.self;
		const reserveUsernames = ["system", "note", "www"];
		const usernameReg = /^[\w\d]+$/;
		const params = this.validate({
			"username":"string",
			"password":"string",
		});

		if (_.indexOf(reserveUsernames, params.username) >= 0) this.throw(400, "用户名已注册");

		if (!usernameReg.test(params.username)) ctx.throw(400);

		let user = await model.users.getByName(params.username);
		if (user) return ctx.throw(400, "用户已存在");

		user = await model.users.create({
			username: params.username,
			password: params.password,
		});

		if (!user) return ctx.throw(500);

		user = user.get({plain:true});

		//const roleId = rolesModel.getRoleIdByUserId(user.id);
		const token = util.jwt_encode({
			userId: user.id, 
			username: user.username,
			//roleId: roleId,
		}, config.secret, config.tokenExpire);

		user.token = token;
		//user.roleId = roleId;
		ctx.cookies.set("token", token, {
			httpOnly: false,
			maxAge: config.tokenExpire * 1000,
			overwrite: true,
			domain: "." + config.domain,
		});

		return this.success(user);
	}

	logout() {
		this.ctx.cookies.set("token", "", {
			maxAge: 0,
			overwrite: true,
			domain: "." + this.config.self.domain,
		});

		return this.success();
	}

	async changepwd() {
		const {ctx, model} = this;
		const userId = this.authenticated().userId;
		const params = this.validate({
			password:"string",
			oldpassword:"string",
		});

		const result = await model.users.update({
			password: params.password,
		}, {
			where: {
				id: userId,
				password: params.oldpassword,
			}
		});

		return this.success(result && result[0] == 1);
	}

	// 手机验证第一步
	async cellphoneVerifyOne() {
		const {ctx, app} = this;
		const {model} = this.app;
		const params = this.validate({
			cellphone:"string",
		});
		const cellphone = params.cellphone;
		const captcha = _.times(4, () =>  _.random(0,9,false)).join("");

		const ok = await app.sendSms(cellphone, [captcha, "3分钟"]);
		//console.log(captcha);
		
		app.cache.put(cellphone, {captcha}, 1000 * 60 * 3); // 10分钟有效期

		return this.success();
	}
	
	// 手机验证第二步  ==> 手机绑定
	async cellphoneVerifyTwo() {
		const {ctx, app} = this;
		const {model} = this.app;

		const userId = this.authenticated().userId;
		const params = this.validate({
			cellphone:"string",
			captcha:"string",
		});
		const captcha = params.captcha;
		let cellphone = params.cellphone;
		
		const cache = app.cache.get(cellphone);
		//console.log(cache, cellphone, captcha, userId);
		if (!cache || cache.captcha != captcha) {
			console.log(captcha, params, userId);
			ctx.throw(400, "验证码过期");
		}
		
		if (!params.isBind) cellphone = "";

		const result = await model.users.update({cellphone}, {where:{id:userId}});

		return this.success(result && result[0] == 1);
	}

	// 邮箱验证第一步
	async emailVerifyOne() {
		const {ctx, app} = this;
		const {model} = this.app;
		const params = this.validate({
			email:"string",
		});
		const email = params.email;
		const captcha = _.times(4, () =>  _.random(0,9,false)).join("");

		const body = `<h3>尊敬的Note用户:</h3><p>您好: 您的邮箱验证码为${captcha}, 请在10分钟内完成邮箱验证。谢谢</p>`;
		const ok = await app.sendEmail(email, "Note 邮箱绑定验证", body);
		//console.log(captcha);
		app.cache.put(email, {captcha}, 1000 * 60 * 10); // 10分钟有效期

		return this.success();
	}
	
	// 邮箱验证第二步  ==> 手机绑定
	async emailVerifyTwo() {
		const {ctx, app} = this;
		const {model} = this.app;
		const userId = this.authenticated().userId;
		const params = this.validate({
			email:"string",
			captcha:"string",
		});
		const captcha = params.captcha;
		let email = params.email;
		
		const cache = app.cache.get(email);
		//console.log(cache, email, captcha, userId);
		if (!cache || cache.captcha != captcha) {
			ctx.throw(400, "验证码过期");
		}
		
		if (!params.isBind) email = "";

		const result = await model.users.update({email}, {where:{id:userId}});

		return this.success(result && result[0] == 1);
	}

	async profile() {
		const {userId} = this.authenticated();

		const user = await this.model.users.getById(userId);
		
		return this.success(user);
	}

	async detail() {
		const {id} = this.validate();
		let userId = _.toNumber(id);

		const user = userId ?  await this.model.users.getById(userId) :	await this.model.users.getByName(id);
		if (!user) this.throw(400);
		
		userId = user.id;
		user.siteCount = await this.model.sites.getCountByUserId(userId);
		user.followsCount = await this.model.favorites.getFollowCount(userId);
		user.followingCount = await this.model.favorites.getFollowingCount(userId);
		user.contribution = await this.model.contributions.getByUserId(userId);

		return this.success(user);
	}

	// 增加用户活跃度
	async addContributions() {
		const {userId} = this.authenticated();
		const {id, count=1} = this.validate({id:"int", count:"int_optional"});
		
		await this.model.contributions.addContributions(userId, count);

		return this.success("OK");
	}

	// 获取用户的活跃度
	async contributions() {
		const {id} = this.validate({id:'int'});
		const data = await this.model.contributions.getByUserId(id);

		return this.success(data);
	}

	// 用户联系人
	async contacts() {
		const {userId} = this.authenticated();
		const users = await this.model.users.contacts(userId);

		return this.success(users);
	}
}

module.exports = User;
