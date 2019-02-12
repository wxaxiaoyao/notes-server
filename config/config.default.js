
exports.keys = "notes";

exports.middleware = ['authenticated', 'pagination', 'graphql'];

exports.security = {
	xframe: {
		enable: false,
	},
	csrf: {
		enable: false,
	},
}

exports.onerror = {
	all: (e, ctx) => {
		const message = e.stack || e.message || e.toString();

		ctx.status = e.status || 500;
		ctx.body = message;
		if (e.name == "SequelizeUniqueConstraintError") {
			ctx.status = 409;
		}
	}
}

exports.io = {
	namespace: {
		'/': {
			connectionMiddleware:["authenticated"],
			packetMiddleware:["packet"],
		},
	}
}

exports.multipart = {
	mode:"stream",
	whitelist: filename => true,
}

exports.graphql = {
	router: '/api/graphql',
	app: true,
	agent: false,
	graphiql: true,

	onPreGraphQL: async (ctx) => {

	},
	onPreGraphiQL: async (ctx) => {
		
	},
}
