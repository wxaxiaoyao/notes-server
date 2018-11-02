const axios = require("axios");
const Base64 = require( "js-base64").Base64;
const md5 = require("blueimp-md5");
const _ = require("lodash");

//sendSms("18702759796", ["2461", "3分钟"]);
module.exports = app => {
	const config = app.config.self;
	const smsConfig = config.sms;
	// 主帐号,对应开官网发者主账号下的 ACCOUNT SID
	const accountSid = smsConfig.accountSid;
	// 主帐号令牌,对应官网开发者主账号下的 AUTH TOKEN
	const accountToken = smsConfig.accountToken;
	// 应用Id，在官网应用列表中点击应用，对应应用详情中的APP ID
	// 在开发调试的时候，可以使用官网自动为您分配的测试Demo的APP ID
	const appId = smsConfig.appId; 
	// 请求地址
	// 沙盒环境（用于应用开发调试）：sandboxapp.cloopen.com
	// 生产环境（用户应用上线使用）：app.cloopen.com
	const serverIP = smsConfig.serverIP;
	//请求端口，生产环境和沙盒环境一致
	const serverPort = smsConfig.serverPort;
	//REST版本号，在官网文档REST介绍中获得。
	const softVersion = smsConfig.softVersion;

	function getBatch(){
		const date = new Date();
		const year = _.padStart(date.getFullYear(), 4, "0");
		const month =  _.padStart(date.getMonth() + 1, 2, "0");
		const day = _.padStart(date.getDate(), 2, "0");
		const hour = _.padStart(date.getHours(), 2, "0");
		const minute = _.padStart(date.getMinutes(), 2, "0");
		const second = _.padStart(date.getSeconds(), 2, "0");

		return year + month + day + hour + minute + second;
	}

	const sendSms = async function(to, datas, templateId = "194013") {
		const batch = getBatch();
		const sig = md5(accountSid + accountToken + batch).toUpperCase();
		const url = "https://" + serverIP + ":" + serverPort + "/" + softVersion + "/Accounts/" + accountSid + "/SMS/TemplateSMS?sig=" + sig;
		const params = {
			appId,
			to,
			datas,
			templateId,
		}

		const headers = {
			"Accept": "application/json",
			"Content-Type": "application/json;charset=utf-8",
			"Authorization": Base64.encode(accountSid + ":" + batch),
		};

		const data = await axios.post(url, params, {headers}).then(res => res.data);

		if (data.statusCode == "000000") return true;

		return false;
	}

	app.sendSms = sendSms;
};
