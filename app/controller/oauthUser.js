const axios = require("axios");
const _ = require("lodash");
const wurl = require("wurl");
const joi = require("joi");

const Controller = require("../core/controller.js");

const {
	OAUTH_SERVICE_TYPE_QQ,
	OAUTH_SERVICE_TYPE_WEIXIN,
	OAUTH_SERVICE_TYPE_GITHUB,
	OAUTH_SERVICE_TYPE_XINLANG,
} = require("../core/consts.js");

const OauthUsers = class extends Controller {

	get modelName() {
		return "oauthUsers";
	}

	getConfig() {
		return this.app.config;
	}

	getRedirectUrl(serverName) {
		return this.app.config.apiUrlPrefix + "oauth_users/" + serverName;
	}

	async qq() {
		const {ctx, model, app, axios} = this;
		const config = this.getConfig();
		const accessTokenApiUrl = 'https://graph.qq.com/oauth2.0/token';
		const openidApiUrl = "https://graph.qq.com/oauth2.0/me";
		const userApiUrl = 'https://graph.qq.com/user/get_user_info';
		const params = this.validate({
			clientId:"string",
			code:"string",
			redirectUri:"string",
			state:"string",
		});
		const userId = this.getUser().userId;
		params.grant_type = "authorization_code";
		params.client_id = params.clientId || config.oauths.qq.clientId;
		params.client_secret = config.oauths.qq.clientSecret;
		params.redirect_uri = params.redirectUri || this.getRedirectUrl("qq");
		//console.log(params);
		// 获取token
		const queryStr = await axios.get(accessTokenApiUrl, {params}).then(res => res.data);
		const data = wurl("?", "http://localhost/index?" + queryStr);
		const access_token = data.access_token;
		//console.log(data);
		// 获取openid
		let result = await axios.get(openidApiUrl, {params:{access_token}}).then(res => res.data);
		result = result.substring(result.indexOf("(") + 1, result.lastIndexOf(")"));
		result = JSON.parse(result);
		//console.log(result);
		// 获取用户信息
		const externalId = result.openid;
		result = await axios.get(userApiUrl, {params:{
			access_token,
		   	oauth_consumer_key:params.client_id, 
			openid:externalId}}).then(res => res.data);
		//console.log(result);
		// 更新DB
		const externalUsername = result.nickname;
		const type = OAUTH_SERVICE_TYPE_QQ;
		//console.log(externalUsername);
		const token = externalId + type + access_token;
		await model.oauthUsers.upsert({externalId, externalUsername, type, userId, token});
		let oauthUser = await model.oauthUsers.findOne({where: {externalId, type}});
		if (!oauthUser) return this.throw(500);
		oauthUser = oauthUser.get({plain:true});
		//console.log(oauthUser);

		return this.token(params.state, oauthUser);
	}

	async weixin() {
		const {ctx, model, app, axios} = this;
		const config = this.getConfig();
		const accessTokenApiUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token';
		const userApiUrl = 'https://api.weixin.qq.com/sns/userinfo';
		const params = this.validate({
			clientId:"string",
			code:"string",
			redirectUri:"string",
			state:"string",
		});
		const userId = this.getUser().userId;
		params.grant_type = "authorization_code";
		params.client_id = params.clientId || config.oauths.weixin.clientId;
		params.appid = params.appid || config.oauths.weixin.appid || config.oauths.weixin.clientId;
		params.secret = config.oauths.weixin.clientSecret;
		params.redirect_uri = params.redirectUri || this.getRedirectUrl("weixin");
		//console.log(params);
		// 获取token
		const data = await axios.get(accessTokenApiUrl, {params}).then(res => res.data);
		//console.log(data);
		const access_token = data.access_token;
		const externalId = data.openid;
		//// 获取用户信息
		let result = await axios.get(userApiUrl, {params:{access_token,	openid:externalId}}).then(res => res.data);
		//console.log(result);
		// 更新DB
		const externalUsername = result.nickname;
		const type = OAUTH_SERVICE_TYPE_WEIXIN;
		//console.log(externalUsername);
		const token = externalId + type + access_token;
		await model.oauthUsers.upsert({externalId, externalUsername, type, userId, token});
		let oauthUser = await model.oauthUsers.findOne({where: {externalId, type}});
		if (!oauthUser) return this.throw(500);
		oauthUser = oauthUser.get({plain:true});

		return this.token(params.state, oauthUser);
	}

	async github() {
		const {ctx, model, app, axios} = this;
		const config = this.getConfig();
		const accessTokenApiUrl = 'https://github.com/login/oauth/access_token';
		const userApiUrl = 'https://api.github.com/user';
		const params = this.validate({
			clientId:"string",
			code:"string",
			redirectUri:"string",
			state:"string",
		});
		const userId = this.getUser().userId;
		//console.log("==================userId=============", userId);
		params.client_id = params.clientId || config.oauths.github.clientId;
		params.client_secret = config.oauths.github.clientSecret;
		params.redirect_uri = params.redirectUri || this.getRedirectUrl("github");
		console.log(params);
		
		let queryStr = "access_token=aa035971e9864642500a7aaad8783c59c8111228&scope=user%3Aemail&token_type=bearer";
		if (!app.unittest) queryStr = await axios.get(accessTokenApiUrl, {params}).then(res => res.data);

		console.log(queryStr);
		const data = wurl("?", "http://localhost/index?" + queryStr);
		if (!data.access_token) return this.throw(500, "获取token失败");
		const access_token = data.access_token;
		console.log(data);

		let userinfo = {id: "11922085", login:"wxaxiaoyao"};
		if (!app.unittest) userinfo = await axios.get(userApiUrl, {params:{access_token}}).then(res => res.data);

		const externalId = userinfo.id;
		const externalUsername = userinfo.login;
		const type = OAUTH_SERVICE_TYPE_GITHUB;
		const token = externalId + type + access_token;
		await model.oauthUsers.upsert({externalId, externalUsername, type, userId, token});

		let oauthUser = await model.oauthUsers.findOne({where: {externalId, type}});
		if (!oauthUser) return this.throw(500);
		oauthUser = oauthUser.get({plain:true});

		return this.token(params.state, oauthUser);
	}

	async xinlang() {
		const {ctx, model, app, axios} = this;
		const config = this.getConfig();
		const accessTokenApiUrl = 'https://api.weibo.com/oauth2/access_token';
		const userApiUrl = 'https://api.weibo.com/2/users/show.json';
		const params = this.validate({
			clientId:"string",
			code:"string",
			redirectUri:"string",
			state:"string",
		});
		const userId = this.getUser().userId;
		//console.log(params);
		params.grant_type = "authorization_code";
		params.client_id = params.clientId || config.oauths.xinlang.clientId;
		params.client_secret = config.oauths.xinlang.clientSecret;
		params.redirect_uri = params.redirectUri || this.getRedirectUrl("xinlang");
		
		//const data = await axios.get(accessTokenApiUrl, {params}).then(res => res.data);
		const data = await axios.post(`${accessTokenApiUrl}?client_id=${params.client_id}&client_secret=${params.client_secret}&grant_type=authorization_code&code=${params.code}&redirect_uri=${params.redirect_uri}`, params).then(res => res.data);
		if (!data.access_token) return this.throw(500, "获取token失败");
		const access_token = data.access_token;
		const externalId = data.uid;
		//console.log(data);

		const userinfo = await axios.get(userApiUrl, {params:{access_token, uid:externalId}}).then(res => res.data);
		const externalUsername = userinfo.screen_name;
		const type = OAUTH_SERVICE_TYPE_XINLANG;
		//console.log(userinfo);
		const token = externalId + type + access_token;
		await model.oauthUsers.upsert({externalId, externalUsername, type, userId, token});
		let oauthUser = await model.oauthUsers.findOne({where: {externalId, type}});
		if (!oauthUser) return this.throw(500);
		oauthUser = oauthUser.get({plain:true});

		return this.token(params.state, oauthUser);
	}

	async note() {
		const {ctx, model, app, axios} = this;
		const config = this.getConfig();
		const memoryCache = app.cache;
		const params = this.getParams();
		const userId = this.getUser().userId;
		const accessTokenApiUrl = config.origin + config.baseUrl + "oauthApps/token";
		const userApiUrl = config.apiUrlPrefix + "users/" + userId;
		params.grant_type = "authorization_code";
		params.client_id = params.client_id || config.oauths.note.clientId;
		params.client_secret = params.client_secret || config.oauths.note.clientSecret;
		params.redirect_uri = params.redirect_uri || this.getRedirectUrl("note");
		console.log(params);
		// 获取token
		const data = await axios.post(accessTokenApiUrl, params).then(res => res.data);
		console.log(data);
		const access_token = data.access_token;
		const userinfo = await axios.get(userApiUrl).then(res => res.data);
		const externalId = userinfo.id;
		const externalUsername = userinfo.username;

		const key = params.code + params.client_id;
		memoryCache.put(key, {userId,externalId, externalUsername}, 1000 * 60 * 10); // 10 分钟
		
		return this.success("OK");
	}
	// 解绑删除记录即可
	
	async token(state, oauthUser) {
		// 绑定直接返回
		const config = this.getConfig();

		if (state != "login") return this.success({token: oauthUser.token});
		if (!oauthUser.userId) return this.success({token: oauthUser.token});
		let user = await this.model.users.findOne({where:{id:oauthUser.userId}});
		if (!user) return this.success({token: oauthUser.token});
		user = user.get({plain:true});

		//const rolesModel = model["roles"];
		//const roleId = await rolesModel.getRoleIdByUserId(user.id);
		//if (rolesModel.isExceptionUser(roleId)) {
			//return ERR.ERR_USER_EXCEPTION();
		//}
		
		const token = this.util.jwt_encode({
			//roleId: roleId,
			userId: user.id,
			username: user.username,
			oauthUserId: oauthUser.id,
		}, config.secret, config.tokenExpire);

		user.token = token;
		//user.roleId = roleId;
		this.ctx.cookies.set("token", user.token, {
			httpOnly: false,
			maxAge: config.tokenExpire * 1000,
			overwrite: true,
			domain: "." + config.domain,
		});

		return this.success(user);
	}
}

module.exports = OauthUsers;
