
const { app, mock, assert  } = require('egg-mock/bootstrap');
const {
	// 实体类型
	ENTITY_TYPE_USER,        // 用户类型
	ENTITY_TYPE_SITE,        // 站点类型
	ENTITY_TYPE_PAGE,        // 页面类型
	ENTITY_TYPE_GROUP,       // 组
	ENTITY_TYPE_ISSUE,       // 问题
	ENTITY_TYPE_PROJECT,     // 项目
} = require("../app/core/consts.js");

describe("/applies", () => {
	before(async (done) => {
		await app.model.users.sync({force:true});
		await app.model.members.sync({force:true});
		await app.model.projects.sync({force:true});
		await app.model.applies.sync({force:true});

		let data = await app.httpRequest().post("/users/register").send({
			username:"xiaoyao",
			password:"wuxiangan",
		}).expect(200).then(res => res.body);
		assert.ok(data.token);
		assert.equal(data.id, 1);

		data = await app.httpRequest().post("/users/register").send({
			username:"wxaxiaoyao",
			password:"wuxiangan",
		}).expect(200).then(res => res.body);
		assert.ok(data.token);

		data = await app.httpRequest().post("/users/register").send({
			username:"wxatest",
			password:"wuxiangan",
		}).expect(200).then(res => res.body);
		assert.ok(data.token);

		data = await app.httpRequest().post("/projects").send({
			name:"projectname",
		}).expect(200).then(res => res.body);
		assert.equal(data.id,1);

		done();
	});

	it("POST|PUT|DELETE|GET /applies", async(done)=> {
		let data = await app.httpRequest().post("/applies").send({
			objectType: ENTITY_TYPE_PROJECT,
			objectId: 1,
			applyType: 0,
			applyId: 2,
			legend:"申请加入项目",
		}).expect(200).then(res => res.body);
		assert.ok(data.id, 1);
		
		data = await app.httpRequest().post("/applies").send({
			objectType: ENTITY_TYPE_PROJECT,
			objectId: 1,
			applyType: 0,
			applyId: 3,
			legend:"申请加入项目",
		}).expect(200).then(res => res.body);
		assert.ok(data.id, 2);

		data = await app.httpRequest().get("/applies?objectType=5&objectId=1&applyType=0").expect(200).then(res => res.body);
		assert(data.length, 2);

		data = await app.httpRequest().put("/applies/1").send({state:1}).expect(200);
		data = await app.httpRequest().put("/applies/2").send({state:2}).expect(200);

		data = await app.httpRequest().get("/members?objectType=5&objectId=1").expect(200).then(res => res.body);
		assert.equal(data[0].username, "wxaxiaoyao");
		assert.equal(data.length, 1);
		//console.log(data);
		
		data = await app.httpRequest().get("/applies/2").expect(200).then(res => res.body);
		assert.equal(data.state, 2);

		done();
	});
});
