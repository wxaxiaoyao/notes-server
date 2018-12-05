
const crypto = require("crypto");
const pingpp = require("pingpp");
const _ = require('lodash');
const Service = require('egg').Service;

class Pay extends Service {
	get pingppConfig() {
		return this.app.config.self.pingpp;
	}

	get pingpp() {
		if (this._pingpp) return this._pingpp;

		this._pingpp = pingpp(this.pingppConfig.key);
		this._pingpp.setPrivateKey(this.pingppConfig.privateKey);

		return this._pingpp;
	}

	verifySignature(rawData = "", signature = "") {
		const verifier = crypto.createVerify('RSA-SHA256').update(rawData, "utf8");
		return verifier.verify(this.pingppConfig.publicKey, signature, 'base64');
	}

	async chrage(data) {
		return await new Promise((resolve, reject) => {
			this.pingpp.charges.create(data, function(err, charge) {
				//console.log(err, charge);
				if (err) return reject(err);
				return resolve(charge);
			});
		});
	}

	// data = {chargeId, description}
	async refund({chargeId, description}) {
		return await new Promise((resolve, reject) => {
			this.pingpp.charges.createRefund(chargeId, {description}, function(err, refund) {
				if (err) return reject(err);
				return resolve(refund);
			});
		});
	}
	

}

module.exports = Pay;
