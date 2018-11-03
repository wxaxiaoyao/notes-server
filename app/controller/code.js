const _ = require("lodash");
const shell = require("shelljs");

const Controller = require("../core/controller.js");

const Code = class extends Controller {
	all() {
		const cmd_str = "git reset --hard HEAD; git pull origin master; npm install; pm2 restart note-server";
		shell.exec(cmd_str);
	}
}

module.exports = Code;
