const _ = require('lodash');
const gitlab = require("gitlab").default;
const cache = require('memory-cache');
const consts = require('./app/core/consts.js');
const util = require('./app/core/util.js');
const sms = require('./app/core/sms.js');
const email = require('./app/core/email.js');
const axios = require('./app/core/axios.js');
const qiniu = require('./app/core/qiniu.js');
const pingpp = require('./app/core/pingpp.js');
const model = require('./app/core/model.js');
//const ahocorasick = require('./app/core/ahocorasick.js');
const log = require("./app/core/log.js");

module.exports = app => {
	const config = app.config.self;
    app.unittest = app.config.env == 'unittest';
    app.cache = cache;
    app.consts = consts;
    app.util = util;
  	app.gitlab = new gitlab({
  		token:config.gitlab.token,
  		url:config.gitlab.url,
  	});
  
    console.log(app.config.self);
  
    sms(app);
    email(app);
    axios(app);
    qiniu(app);
    model(app);
    //ahocorasick(app);
    log(app);
  
    //console.log(app.config.env);
    //
    //console.log("----------构建表-----------");
    //app.model.files.sync({force:true});
    //app.model.storages.sync({force:true});
    //app.model.siteFiles.sync({force:true});
  
    //app.model.applies.sync({force:true});
    //app.model.caches.sync({force:true});
    //app.model.comments.sync({force:true});
    //app.model.contributions.sync({force:true});
    //app.model.datas.sync({force:true});
    //app.model.domains.sync({force:true});
    //app.model.favorites.sync({force:true});
    //app.model.groups.sync({force:true});
    //app.model.issues.sync({force:true});
    //app.model.logs.sync({force:true});
    //app.model.members.sync({force:true});
    //app.model.notifications.sync({force:true});
    //app.model.oauthUsers.sync({force:true});
    //app.model.pages.sync({force:true});
    //app.model.projects.sync({force:true});
    //app.model.roles.sync({force:true});
    //app.model.sensitiveWords.sync({force:true});
    //app.model.sites.sync({force:true});
    //app.model.siteGroups.sync({force:true});
    //app.model.tags.sync({force:true});
    //app.model.trades.sync({force:true});
    //app.model.users.sync({force:true});
    //app.model.visitors.sync({force:true});
    //app.model.worlds.sync({force:true});
};
