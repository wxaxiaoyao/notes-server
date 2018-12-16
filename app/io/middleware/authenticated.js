
const _ = require("lodash");

module.exports = app => {
	return async (ctx, next) => {
		const token = ctx.socket.handshake.query.token;
		const user = app.util.jwt_decode(token || "", app.config.self.secret, true) || {};

		if (user.userId == undefined) {
			// 未认证
			console.log("未认证, 关闭套接字");
			socket.disconnect(true);
			await next();
			return;
		}

		ctx.socket.join(_.toString(user.userId));
	
		await next();
	}
}
