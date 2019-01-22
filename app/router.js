
module.exports = app => {
	const {router, controller, io} = app;
	const config = app.config.self;

	const prefix = config.apiUrlPrefix;

	const index = controller.index;
	router.resources(`${prefix}indexs`, index);

	const code = controller.code;
	router.all(`${prefix}codes`, code.all);

	const user = controller.user;
	router.get(`${prefix}users/:id/detail`, user.detail);
	router.post(`${prefix}users/:id/contributions`, user.addContributions);
	router.get(`${prefix}users/:id/contributions`, user.contributions);
	router.post(`${prefix}users/captcha`, user.captcha);
	router.post(`${prefix}users/search`, user.search);
	router.post(`${prefix}users/register`, user.register);
	router.post(`${prefix}users/login`, user.login);
	router.post(`${prefix}users/cellphone_login`, user.cellphoneLogin);
	router.post(`${prefix}users/logout`, user.logout);
	router.get(`${prefix}users/profile`, user.profile);
	router.post(`${prefix}users/changepwd`, user.changepwd);
	router.post(`${prefix}users/confirmpwd`, user.confirmpwd);
	router.get(`${prefix}users/email_captcha`, user.emailVerifyOne);
	router.post(`${prefix}users/email_captcha`, user.emailVerifyTwo);
	router.post(`${prefix}users/cellphone_bind`, user.cellphoneBind);
	router.get(`${prefix}users/contacts`, user.contacts);
	router.get(`${prefix}users/qr`, user.qr);
	router.resources(`${prefix}users`, user);

	const document = controller.document;
	router.resources(`${prefix}documents`, document);
	
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
	router.post(`${prefix}files/sessionUpload`, file.sessionUpload);
	router.post(`${prefix}files/upload`, file.upload);
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

	const discount = controller.discount;
	router.resources(`${prefix}/discounts`, discount);

	const goods = controller.goods;
	router.get(`${prefix}/goods`, goods.index);
	router.get(`${prefix}/goods/:id/detail`, goods.detail);
	//router.resources(`${prefix}/goods`, goods);

	const order = controller.order;
	router.post(`${prefix}orders/charge`, order.charge);
	router.resources(`${prefix}orders`, order);

	const trade = controller.trade;
	router.resources(`${prefix}trades`, trade);

	const member = controller.member;
	router.post(`${prefix}members/bulk`, member.bulkCreate);
	router.get(`${prefix}members/exist`, member.exist);
	router.resources(`${prefix}members`, member);

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
	router.post(`${prefix}dailies/upsert`, daily.upsert);
	router.post(`${prefix}dailies/import`, daily.importDailies);
	router.resources(`${prefix}dailies`, daily);

	const suggestion = controller.suggestion;
	router.resources(`${prefix}suggestions`, suggestion);

	const link = controller.link;
	router.post(`${prefix}links/upsert`, link.upsert);
	router.resources(`${prefix}links`, link);

	const demand = controller.demand;
	router.resources(`${prefix}demands`, demand);

	const api = controller.api;
	router.post(`${prefix}apis/filter`, api.filter);
	//router.post(`${prefix}apis/search`, api.search);
	router.post(`${prefix}apis/configs`, api.setConfig);
	router.get(`${prefix}apis/configs`, api.getConfig);
	router.resources(`${prefix}apis`, api);

	const question = controller.question;
	router.resources(`${prefix}questions`, question);

	const todo = controller.todo;
	router.resources(`${prefix}todos`, todo);

	const tag = controller.tag;
	router.post(`${prefix}tags/upsert`, tag.upsert);
	router.resources(`${prefix}tags`, tag);
	
	const project = controller.project;
	router.post(`${prefix}projects/search`, project.search);
	router.resources(`${prefix}projects`, project);

	const bug = controller.bug;
	router.resources(`${prefix}bugs`, bug);

	const experience = controller.experience;
	router.resources(`${prefix}experiences`, experience);
	
	const qiniu = controller.qiniu;
	router.get(`${prefix}qinius/token`, qiniu.token);
	router.resources(`${prefix}qinius`, qiniu.token);

	const admin = controller.admin;
	router.post(`${prefix}admins/query`, admin.query);
	router.post(`${prefix}admins/login`, admin.login);
	router.post(`${prefix}admins/:resources/search`, admin.search);
	router.resources(`${prefix}admins/:resources`, admin);

	// app版本
	const version = controller.version;
	router.resources(`${prefix}versions`, version);

	// 联系人
	const contact = controller.contact;
	router.resources(`${prefix}contacts`, contact);

	// 申请列表
	const apply = controller.apply;
	router.put(`${prefix}applies/:id/state`, apply.state);
	router.resources(`${prefix}applies`, apply);

	// 分类tag
	const classifyTag = controller.classifyTag;
	router.post(`${prefix}classifyTags/:id/set_objects`, classifyTag.setObjects);
	router.post(`${prefix}classifyTags/set_tags`, classifyTag.setTags);
	router.resources(`${prefix}classifyTags`, classifyTag);

	// 位置信息
	const locations = controller.location;
	router.get(`${prefix}locations/nearby`, locations.getNearBy);
	router.post(`${prefix}locations/upsert`, locations.upsert);
	router.resources(`${prefix}locations`, locations);

	// 知识
	const knowledge = controller.knowledge;
	router.resources(`${prefix}knowledges`, knowledge);

	// 知识包
	const knowledgePackage = controller.knowledgePackage;
	router.resources(`${prefix}knowledgePackages`, knowledgePackage);

	// 知识域
	const knowledgeArea = controller.knowledgeArea;
	router.resources(`${prefix}knowledgeAreas`, knowledgeArea);

	// 便条 随手记
	const note = controller.note;
	router.post(`${prefix}notes/:id/tags`, note.setTags);
	router.resources(`${prefix}notes`, note);

	// 便条包
	const notePackage = controller.notePackage;
	router.resources(`${prefix}notePackages`, notePackage);

	// socket io router
	io.of("/").route("pull_sessions", io.controller.chat.pullSessions);
	io.of("/").route("push_sessions", io.controller.chat.pushSessions);
	io.of("/").route("push_messages", io.controller.chat.pushMessages);
	io.of("/").route("pull_messages", io.controller.chat.pullMessages);
}
