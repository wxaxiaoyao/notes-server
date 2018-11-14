
const moment = require("moment");
const Transport = require("egg-logger").Transport;
const Logger = require('egg-logger').Logger;

class DBTransport extends Transport {
	log(level, args, meta) {
		const msg = super.log(level, args, meta);

		this.output(level, msg.trim("\n"));
	}

	output(level, message) {
		const date = moment().format("YYYY-MM-DD HH:mm:ss");
		const msg = `${date} ${level} ${message}`;

		console.log(msg);

		this.msgs = this.msgs || [];
		this.size = this.size || 0;

		this.msgs.push({text:message, date, level});
		this.size += message.length;

		const _output = () => {
			clearTimeout(this.timer);
			this.options.app.model.logs.bulkCreate(this.msgs);
			this.msgs = [];
			this.size = 0;
		}

		if (this.msgs.length > 300 || this.size > 1024 * 104) {
			_output();
		} else {
			this.timer = setTimeout(() => {_output();}, 1000);
		}
	}
}

const logger = new Logger();

module.exports = app => {
	logger.set("DBLog", new DBTransport({level:"DEBUG", app}));

	//logger.debug("hello world", {key:1});

	app.log = logger;
}
