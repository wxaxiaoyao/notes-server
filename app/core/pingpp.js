
const crypto = require("crypto");
const pingpp = require("pingpp");

class Pay {
	constructor(key, privateKey, publicKey) {
		this.key = key;
		this.privateKey = privateKey;
		this.publicKey = publicKey;
		
		this.pingpp = pingpp(key);
		this.pingpp.setPrivateKey(privateKey);
	}

	verifySignature(rawData = "", signature = "") {
		const verifier = crypto.createVerify('RSA-SHA256').update(rawData, "utf8");
		return verifier.verify(this.publicKey, signature, 'base64');
	}

	async chrage(data) {
		return await new Promise((resolve, reject) => {
			this.pingpp.charges.create(data, function(err, charge) {
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


module.exports = app => {
	const config = app.config.self;
	app.pay = new Pay(config.pingpp.key, config.pingpp.privateKey, config.pingpp.publicKey);
}
