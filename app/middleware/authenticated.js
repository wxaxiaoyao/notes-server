
const axios = require("axios");
const memoryCache = require('memory-cache');

function getCookieToken(ctx) {
	return ctx.cookies.get("token");
}

function getAuthorizationHeaderToken(ctx) {
	const authorization = ctx.header.authorization || "";
	const parts = authorization.split(' ');

	if (parts.length == 2) {
		if (/^Bearer$/i.test(parts[0])) return parts[1];
	}

	return;
}

module.exports = (options, app) => {
	const config = app.config.self;
	return async function(ctx, next) {
		if (config.debug) {
			ctx.state.user = {userId:147, username:"xiaoyao", roleId:10};
			ctx.state.token = app.util.jwt_encode(ctx.state.user, config.secret);
			await next();
			return ;
		}

		const token = getCookieToken(ctx) || getAuthorizationHeaderToken(ctx);
		ctx.state.token = token;
		ctx.state.user = token ? app.util.jwt_decode(token, config.secret, true) : {};

		await next();
	}
}
