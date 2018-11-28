
const _ = require("lodash");
const axios = require("axios");
const pinyin = require("pinyin");
const Controller = require("../core/controller.js");

const Index = class extends Controller {
	async index() {
		const str = "abcdefghijklmnopqrstuvwxyz";
		for (let i = 0; i < 26; i++) {
			for (let j = 1; j <= 4; j++) {
				const url = `https://static.bearychat.com/images/${str[i]}${j}.png`;
				const key = `_/portraits/${str[i]}${j}.png`;
				const data = await axios.get(url, {
					responseType: "arraybuffer",
				}).then(res => res.data);
				console.log(key);
				await this.storage.upload(key, data);
			}
		}

		console.log(pinyin("xiao吴", {style:pinyin.STYLE_NORMAL}));
		return this.success("hello world");
	}

	create() {
		const params = this.validate();

		return this.success(params);
	}
}

module.exports = Index;
