

module.exports = app => {
	return async (ctx, next) => {
		const {app, socket, logger, helper} = ctx;
		const config = app.config.self;
		const id = socket.id;
		const query = socket.handshake.query;
		const {token, userId} = query;

		const user = app.util.jwt_decode(token || "", config.secret, true) || {};

		if (user.userId == undefined || user.userId != userId) {
			// 未认证
			console.log("未认证, 关闭套接字");
			socket.disconnect(true);
		}

		await next();

	}
}
