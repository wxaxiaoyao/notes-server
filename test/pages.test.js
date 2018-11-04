
import {app, assert} from  "@/mock.js";

describe("/pages", () => {
	before(async (done) => {
		await app.model.users.truncate();
		await app.model.sites.truncate();
		await app.model.pages.sync({force:true});
		await app.model.groups.truncate();
		await app.model.groupMembers.truncate();
		await app.model.siteGroups.truncate();
		await app.model.visitors.sync({force:true});

		let data = await app.httpRequest().post("/users/register").send({
			username:"xiaoyao",
			password:"wuxiangan",
		}).expect(200).then(res => res.body);
		assert.ok(data.token);
		assert.equal(data.id, 1);

		data = await app.httpRequest().post("/users/register").send({
			username:"wxatest",
			password:"wuxiangan",
		}).expect(200).then(res => res.body);
		assert.ok(data.token);
		assert.equal(data.id, 2);

		data = await app.httpRequest().post("/users/register").send({
			username:"wxaxiaoyao",
			password:"wuxiangan",
		}).expect(200).then(res => res.body);
		assert.ok(data.token);
		assert.equal(data.id, 3);

		data = await app.httpRequest().post("/groups").send({
			groupname:"group1",
			description:"test",
		}).expect(200).then(res => res.body);
		assert.equal(data.id,1);
		
		data = await app.httpRequest().post("/groups").send({
			groupname:"group2",
			description:"test",
		}).expect(200).then(res => res.body);
		assert.equal(data.id,2);

		data = await app.httpRequest().post("/sites").send({
			sitename:"site1",
			description:"test",
		}).expect(200).then(res => res.body);
		assert.equal(data.id,1);

		const userId = 2; // wxatest
		const site = await app.model.sites.create({
			userId,
			sitename:"site2",
		});
		const group = await app.model.groups.create({userId, groupname:"group2"});
		const groupMembers = await app.model.groupMembers.create({userId, groupId:group.id, memberId:1});
		const siteGroup = await app.model.siteGroups.create({userId, siteId:site.id, groupId:group.id, level:64});

		done();
	});

	it("POST|PUT|DELTE|GET /pages", async(done)=> {
		let data = await app.httpRequest().post("/pages").send({
			url:"xiaoyao/site1/page1",
			content:"hello world",
		}).expect(200).then(res => res.body);
		assert.equal(data.id,1);

		data = await app.httpRequest().post("/pages").send({
			url:"xiaoyao/site1/page2",
			content:"hello world",
		}).expect(200).then(res => res.body);
		assert.equal(data.id, 2);
		
		data = await app.httpRequest().get("/pages").expect(200).then(res => res.body);
		assert.equal(data.length, 2);
		
		data = await app.httpRequest().get("/pages?folder=" + encodeURIComponent("xiaoyao/site1/")).expect(200).then(res => res.body);
		assert.equal(data.length, 2);

		await app.httpRequest().put("/pages/1").send({description:"description", url:"xiaoyao/site1/page1"}).expect(200);
		data = await app.httpRequest().get("/pages/1").expect(200).then(res => res.body);
		assert.equal(data.description, "description");

		await app.httpRequest().delete("/pages/2").expect(200).then(res => res.body);
		 
		data = await app.httpRequest().get("/pages").expect(200).then(res => res.body);
		assert.equal(data.length, 1);

		console.log("---------写参与网站页面-------------");
		data = await app.httpRequest().post("/pages").send({
			url:"wxatest/site2/page1",
			content:"hello world",
		}).expect(200).then(res => res.body);
		assert.equal(data.id,3);

		data = await app.httpRequest().get("/pages/" + data.id).expect(200).then(res => res.body);
		assert.equal(data.url, "wxatest/site2/page1");

		await app.httpRequest().delete("/pages/" + data.id).expect(200).then(res => res.body);
		data = await app.httpRequest().get("/pages?folder=wxatest/site2").expect(200).then(res => res.body);
		assert.equal(data.length, 0);

		await app.httpRequest().get("/pages/visit?url=xiaoyao/site1/page1").expect(200);

		const count = await app.model.visitors.count();
		assert.equal(count,1);

		done();
	});
});
