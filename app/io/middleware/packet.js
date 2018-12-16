
const _ = require("lodash");

module.exports = app => {
	return async (ctx, next) => {
		const token = ctx.socket.handshake.query.token;

		ctx.state.token = token;
		ctx.state.user = app.util.jwt_decode(token || "", app.config.self.secret, true) || {};
	
		await next();
	}
}
