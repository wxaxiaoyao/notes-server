
const _ = require("lodash");

module.exports = app => {
	return async (ctx, next) => {
		const query = ctx.socket.handshake.query;
		const {token, userId} = query;

		ctx.state.token = token;
		ctx.state.user = {userId:_.toNumber(userId)};
	
		await next();
	}
}
