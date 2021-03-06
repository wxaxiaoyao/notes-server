const _ = require("lodash");
const joi = require("joi");
const Controller = require("../core/controller.js");
const {
	CAPTCHA_TYPE_CELLPHONE,
	CAPTCHA_TYPE_EMAIL,
} = require("../core/consts.js");

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
		//delete params.username;

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

	async userLoginSuccess(user) {
		const extra = user.extra || {};
		extra.lastLoginTime = new Date();
		await this.model.users.update({extra}, {where:{id: user.id}});
		return;
	}

	async cellphoneLogin() {
		const {cellphone, captcha} = this.validate({cellphone:"string", captcha:"string"});
		const cache = await this.model.caches.get(cellphone);
		if (!cache || !captcha || cache.captcha != captcha) return this.fail(5);

		const portrait = 'http://statics.qiniu.wxaxiaoyao.cn/_/portraits/default_portrait.png';
		let user = await this.model.users.findOne({where:{cellphone}}).then(o => o && o.toJSON());
		// 用户不存在则注册
		user = user || await this.model.users.create({cellphone, portrait}).then(o => o && o.toJSON());
		if (!user) this.throw(500);

		const config = this.app.config.self;
		const token = this.app.util.jwt_encode({
			userId: user.id, 
			username: user.username
		}, config.secret, config.tokenExpire);

		user.token = token;

		await this.userLoginSuccess(user);
		return this.success(user);
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

		await this.userLoginSuccess(user);
		return this.success(user);
	}

	async register() {
		const {ctx, model, util} = this;
		const config = this.config.self;
		const reserveUsernames = ["system", "note", "www"];
		const usernameReg = /^\w[\w\d]+$/;
		let {username, password, nickname} = this.validate({
			"username":"string",
			"password":"string",
		});

		username = username.toLowerCase();

		if (_.indexOf(reserveUsernames, username) >= 0) this.fail(3);
		if (!usernameReg.test(username) || username.length < 4 || username.length > 32) this.fail(2);

		let user = await model.users.getByName(username);
		if (user) return this.fail(3);

		user = await model.users.create({
			portrait: "http://statics.qiniu.wxaxiaoyao.cn/_/portraits/" + username[0] + _.random(1,4) + ".png",
			username: username,
			password: password,
			nickname: nickname || username,
		}).then(o => o && o.toJSON());
		if (!user) return this.fail(0);

		// 创建用户账号记录
		await this.model.accounts.upsert({userId: user.id});

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

	async captchaVerify(key, captcha) {
		const cache = await this.model.caches.get(key);
		if (!captcha || !cache || cache.captcha != captcha) return false;

		return true;
	}

	async resetPassword() {
		const {key, password, captcha} = this.validate({key:"string", password:"string", captcha:"string"});
		const ok = await this.captchaVerify(key, captcha);
		if (!ok) return this.fail(5);
		const result = await this.model.users.update({
			password: this.app.util.md5(password),
		}, {
			where:{$or: [{email:key}, {cellphone:key}]}
		});
		if (result[0] == 1) return this.success("OK");

		return this.fail(10);	
	}

	// 验证验证码
	async captchaVerify(key, captcha) {
		const cache = await this.model.caches.get(key);
		if (!captcha || !cache || cache.captcha != captcha) return false;
		return true;
	}

	// 验证码
	async captcha() {
		const {key, type} = this.validate({
			key:'string', 
			type:joi.number().valid(CAPTCHA_TYPE_CELLPHONE, CAPTCHA_TYPE_EMAIL),
		});

		const captcha = _.times(4, () =>  _.random(0,9,false)).join("");

		await this.app.model.caches.put(key, {captcha}, 1000 * 60 * 3); // 10分钟有效期

		if (type == CAPTCHA_TYPE_CELLPHONE) {
			const ok = await this.app.sendSms(key, [captcha, "3分钟"]);
			if (!ok) return this.throw(500, "请求次数过多");
		} else if (type == CAPTCHA_TYPE_EMAIL) {
			const body = `<h3>尊敬的Note用户:</h3><p>您好: 您的邮箱验证码为${captcha}, 请在10分钟内完成邮箱验证。谢谢</p>`;
			const ok = await this.app.sendEmail(email, "Note 邮箱绑定验证", body);
			if (!ok) return this.throw(500, "请求次数过多");
		}

		return this.success("OK");
	}

	// 手机验证第二步  ==> 手机绑定
	async cellphoneBind() {
		const userId = this.authenticated().userId;
		const {cellphone, captcha, bind} = this.validate({
			cellphone:"string",
			captcha:"string",
			bind: "boolean",
		});
		
		const ok = await this.captchaVerify(cellphone, captcha);
		if (!ok) return this.fail(5);
		const user = await this.model.users.findOne({where:{cellphone}}).then(o => o && o.toJSON());
		if (bind) {
			if (user) return this.fail(11);
			const res = await this.model.users.update({cellphone}, {where:{id: userId}});
			return this.success(res);
		} else {
			if (user.id != userId) return this.faild(12);
			const res = await this.model.users.update({cellphone:null}, {where:{id: userId}});
			return this.success(res);
		}
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
		await app.model.caches.put(email, {captcha}, 1000 * 60 * 10); // 10分钟有效期

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
		
		const ok = await this.captchaVerify(cellphone, captcha);
		if (!ok) return this.fail(5);
		
		if (!params.isBind) email = null;

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

	// 用户二维码名片
	async qr() {
		const {userId} = this.authenticated();
		const info = {userId, type: 0};  // 0 -- 添加用户类型
		const qr = await this.app.util.qrcode(JSON.stringify(info));

		if (!qr) return this.throw(500, "生成二维码失败");

		return this.success(qr);
	}
}

module.exports = User;
