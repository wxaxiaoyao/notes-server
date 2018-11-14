
const moment = require("moment");

const Subscription = require('egg').Subscription;

class Log extends Subscription {
	static get schedule() {
		return {
			cron:"0 0 2 1/3 * *",
			type:"worker",
			//disable:true,
		}
	}

	async subscribe() {
		// 保留3天的日志量
		const date = (new Date()).getTime() - 3 * 24 * 3600 * 1000;
		const datestr = moment(date).format("YYYY-MM-DD HH:mm:ss");
		console.log("清除日志:", datestr);
		const model = this.app.model;
		await model.logs.destroy({
			where: {
				createdAt: {
					[model.Op.lt]: datestr
				}
			}
		});

		return Promise.resolve(true);
	}
}

module.exports = Log;
