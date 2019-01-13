use note;



use `note`;

create table admins like users;
insert into admins select * from users where username="xiaoyao";
select * from admins;
select * from apiConfigs;
select * from apis;
select * from pages;
select * from users;
select * from groups;
select * from groupMembers;
select * from siteGroups;
select * from files;
select * from sites;
select * from versions;
select * from applies;
select * from contacts;
select * from sessions;
select * from messages;
select * from classifyTags;
select * from objectTags;
select * from notes;
select * from locations;
select count(*) from pages;

delete from objectTags where id > 0;
delete from `classifyTags` where id > 0;

update applies set state = 0 where id = 1;
select md5("wuxiangan");
create view user_apply(username, nickname, portrait, objectId, applyId, createdAt, updatedAt) as 
select username, nickname, portrait, objectId, applyId, applies.createdAt, applies.updatedAt from users, applies where applies.objectType = 0 and applies.objectId = users.id;
select * from user_apply;
update user_apply set nickname = "逍遥1" where objectId = 1;
update users set nickname = "逍遥" where id = 1; 
update users set portrait = 'http://statics.qiniu.wxaxiaoyao.cn/_/portraits/w4.png' where id = 4;
insert into contacts(userId, contactId, createdAt, updatedAt) values(1,4, current_time(), current_time());
insert into applies(objectId, objectType, applyId, applyType, createdAt, updatedAt) values(1, 0, 4, 0, current_time(), current_time());
update applies set applyId = 4 where id = 1;
insert into versions(type, versionNo, versionName, downloadUrl, createdAt, updatedAt) values(0, 8, "0.0.8", "https://service.dcloud.net.cn/build/download/9c0f6b80-091c-11e9-903d-770f51b8d582", current_time(), current_time());
update versions set versionNo = 8, downloadUrl="https://service.dcloud.net.cn/build/download/6e020300-0922-11e9-ad54-aff2ae480014" where id = 6;

update apis set projectId = 1 where id > 0;
update apiConfigs set classify='[]' where id = 1;
update `pages` set userId=5 where url like 'keep0917/%';
update siteGroups set level=64 where id > 0;
update users set portrait="http://statics.qiniu.wxaxiaoyao.cn/_/portraits/w1.png" where username = "xiaoyao";


delete from pages where id in (4,5,6);


desc apis;
alter table apis add column request JSON ;
alter table apiConfigs add column classify JSON ;
alter table apis add column projectId bigint(20) default 0;


select * from userTags;
insert into userTags(userId, tagname, createdAt, updatedAt) values(1, "tag", current_time(), current_time());
delete from userTags where id = 1;
drop table userTags;

alter table contacts drop column tags;
desc contacts;
