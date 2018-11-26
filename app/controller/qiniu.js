
const _ = require("lodash");
const qiniu = require("qiniu");
const uuidv1 = require('uuid/v1');

const Controller = require("../core/controller.js");

const Qiniu = class extends Controller {
	async token() {
		const {userId, username} = this.authenticated();
		const {filename} = this.validate();
		const config = this.config.self.qiniuPublic;
		const key = username + "/" + (filename || uuidv1());
		const url = config.bucketDomain + "/" + key;
		const options = {
			scope: config.bucketName + ":" + key,
			expires: 3600 * 24, // 一天
			returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)"}',
		}
		const mac = new qiniu.auth.digest.Mac(config.accessKey, config.secretKey);
		const putPolicy = new qiniu.rs.PutPolicy(options);
		const token = putPolicy.uploadToken(mac);

		return this.success({token, url, key});
	}
}

module.exports = Qiniu;
