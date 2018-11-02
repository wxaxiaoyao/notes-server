
module.exports = app => {
	const {router, controller} = app;
	const config = app.config.self;

	const prefix = config.apiUrlPrefix;

	const code = controller.code;
	router.all(`${prefix}codes`, code.all);

	const user = controller.user;
	router.get(`${prefix}users/:id/detail`, user.detail);
	router.get(`${prefix}users/:id/contribution`, user.contribution);
	router.post(`${prefix}users/register`, user.register);
	router.post(`${prefix}users/login`, user.login);
	router.post(`${prefix}users/logout`, user.logout);
	router.get(`${prefix}users/profile`, user.profile);
	router.post(`${prefix}users/changepwd`, user.changepwd);
	router.post(`${prefix}users/confirmpwd`, user.confirmpwd);
	router.get(`${prefix}users/email_captcha`, user.emailVerifyOne);
	router.post(`${prefix}users/email_captcha`, user.emailVerifyTwo);
	router.get(`${prefix}users/cellphone_captcha`, user.cellphoneVerifyOne);
	router.post(`${prefix}users/cellphone_captcha`, user.cellphoneVerifyTwo);
	router.resources(`${prefix}users`, user);

	const site = controller.site;
	router.post(`${prefix}sites/search`, site.search);
	router.get(`${prefix}sites/get_by_name`, site.getByName);
	router.get(`${prefix}sites/:id/detail`, site.detail);
	router.get(`${prefix}sites/:id/privilege`, site.privilege);
	router.post(`${prefix}sites/:id/groups`, site.postGroups);
	router.put(`${prefix}sites/:id/groups`, site.putGroups);
	router.delete(`${prefix}sites/:id/groups`, site.deleteGroups);
	router.get(`${prefix}sites/:id/groups`, site.getGroups);
	router.resources(`${prefix}sites`, site);

	const page = controller.page;
	router.get(`${prefix}pages/test`, page.test);
	router.get(`${prefix}pages/qiniuImport`, page.qiniuImport);
	router.get(`${prefix}pages/visit`, page.visit);
	router.get(`${prefix}pages/:id/setting`, page.getSetting);
	router.post(`${prefix}pages/:id/setting`, page.postSetting);
	router.resources(`${prefix}pages`, page);

	const group = controller.group;
	router.post(`${prefix}groups/:id/members`, group.postMembers);
	router.delete(`${prefix}groups/:id/members`, group.deleteMembers);
	router.get(`${prefix}groups/:id/members`, group.getMembers);
	router.resources(`${prefix}groups`, group);

	const siteGroup = controller.siteGroup;
	router.resources(`${prefix}site_groups`, siteGroup);

	const domain = controller.domain;
	router.get(`${prefix}domains/exist`, domain.exist);
	router.resources(`${prefix}domains`, domain);

	const file = controller.file;
	router.get(`${prefix}files/statistics`, file.statistics);
	router.get(`${prefix}files/rawurl`, file.rawurl);
	router.post(`${prefix}files/upsert`, file.upsert);
	router.get(`${prefix}files/token`, file.token);
	router.post(`${prefix}files/batchDelete`, file.batchDelete);
	router.post(`${prefix}files/:id/rename`, file.rename);
	router.resources(`${prefix}files`, file);

	const favorite = controller.favorite;
	router.get(`${prefix}favorites/follows`, favorite.follows);
	router.get(`${prefix}favorites/exist`, favorite.exist);
	router.delete(`${prefix}favorites`, favorite.destroy);
	router.resources(`${prefix}favorites`, favorite);

	const oauthUser = controller.oauthUser;
	router.post(`${prefix}oauth_users/qq`, oauthUser.qq);
	router.post(`${prefix}oauth_users/weixin`, oauthUser.weixin);
	router.post(`${prefix}oauth_users/github`, oauthUser.github);
	router.post(`${prefix}oauth_users/xinlang`, oauthUser.xinlang);
	router.resources(`${prefix}oauth_users`, oauthUser);

	const module = controller.module;
	router.resources(`${prefix}modules`, module);

	const comment = controller.comment;
	router.resources(`${prefix}comments`, comment);

	const issue = controller.issue;
	router.get(`${prefix}issues/statistics`, issue.statistics);
	router.resources(`${prefix}issues`, issue);

	const trade = controller.trade;
	router.post(`${prefix}trades/pingpp`, trade.pingpp);
	router.resources(`${prefix}trades`, trade);

	const apply = controller.apply;
	router.resources(`${prefix}applys`, apply);

	const notification = controller.notification;
	router.resources(`${prefix}notifications`, notification);

	const message = controller.message;
	router.resources(`${prefix}messages`, message);

	const session = controller.session;
	router.post(`${prefix}sessions/:id/current`, session.current);
	router.post(`${prefix}sessions/:id/members`, session.join);
	router.delete(`${prefix}sessions/:id/members`, session.exit);
	router.get(`${prefix}sessions/:id/members`, session.members);
	router.post(`${prefix}sessions/:id/msgs`, session.postMsg);
	router.get(`${prefix}sessions/:id/msgs`, session.getMsgs);
	router.resources(`${prefix}sessions`, session);

	const task = controller.task;
	router.resources(`${prefix}tasks`, task);

	const team = controller.team;
	router.get(`${prefix}teams/all`, team.all);
	router.get(`${prefix}teams/:id/dailies`, team.getDailies);
	router.post(`${prefix}teams/:id/members`, team.postMembers);
	router.delete(`${prefix}teams/:id/members`, team.deleteMembers);
	router.get(`${prefix}teams/:id/members`, team.getMembers);
	router.post(`${prefix}teams/:id/exit`, team.exit);
	router.resources(`${prefix}teams`, team);

	const daily = controller.daily;
	router.post(`${prefix}dailies/import`, daily.importDailies);
	router.resources(`${prefix}dailies`, daily);

	const suggestion = controller.suggestion;
	router.resources(`${prefix}suggestions`, suggestion);

	const link = controller.link;
	router.resources(`${prefix}links`, link);

	const demand = controller.demand;
	router.resources(`${prefix}demands`, demand);

	const field = controller.field;
	router.resources(`${prefix}fields`, field);

	const api = controller.api;
	router.post(`${prefix}apis/search`, api.search);
	router.post(`${prefix}apis/configs`, api.setConfig);
	router.get(`${prefix}apis/configs`, api.getConfig);
	router.resources(`${prefix}apis`, api);

	const question = controller.question;
	router.resources(`${prefix}questions`, question);

	const todo = controller.todo;
	router.resources(`${prefix}todos`, todo);

	const tag = controller.tag;
	router.resources(`${prefix}tags`, tag);
	
	const admin = controller.admin;
	router.resources(`${prefix}admins/:resources`, admin);
}