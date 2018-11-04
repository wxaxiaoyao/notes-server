
import {app, assert} from  "@/mock.js";

describe("/sites", () => {
	before(async (done) => {
		await app.model.users.sync({force:true});
		await app.model.sites.sync({force:true});
		await app.model.groups.sync({force:true});
		await app.model.members.sync({force:true});
		await app.model.siteGroups.sync({force:true});

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


		done();
	});

	it("POST|PUT|DELTE|GET /sites", async(done)=> {
		let data = await app.httpRequest().post("/sites").send({
			sitename:"site1",
			description:"test",
		}).expect(200).then(res => res.body);
		assert.equal(data.id,1);

		data = await app.httpRequest().post("/sites").send({
			sitename:"site2",
			description:"test",
		}).expect(200).then(res => res.body);
		assert.equal(data.id,2);

		data = await app.httpRequest().get("/sites").expect(200).then(res => res.body);
		assert.equal(data.length, 2);
		
		await app.httpRequest().put("/sites/1").send({description:"description"}).expect(200);

		data = await app.httpRequest().get("/sites/1").expect(200).then(res => res.body);
		assert.equal(data.description, "description");

		await app.httpRequest().delete("/sites/2").expect(200).then(res => res.body);
		 
		data = await app.httpRequest().get("/sites").expect(200).then(res => res.body);
		assert.equal(data.length, 1);

		done();
	});

	it("POST|PUT|DELETE|GET /site/:id/groups", async(done)=>{
		const url = "/sites/1/groups";
		let data = await app.httpRequest().post(url).send({
			groupId:1,
			level: 32,
		}).expect(200).then(res => res.body);
		assert.equal(data.id, 1);
		
		data = await app.httpRequest().post(url).send({
			groupId:2,
			level: 64,
		}).expect(200).then(res => res.body);
		assert.equal(data.id, 2);

		data = await app.httpRequest().get(url).expect(200).then(res => res.body);
		assert.equal(data.length, 2);
		
		await app.httpRequest().put(url).send({groupId:1, level:64}).expect(200);

		data = await app.httpRequest().get(url).expect(200).then(res => res.body);
		assert.equal(data[0].level, 64);

		await app.httpRequest().delete(url + "?groupId=2").expect(200).then(res => res.body);
		 
		data = await app.httpRequest().get(url).expect(200).then(res => res.body);
		assert.equal(data.length, 1);

		done();
	});

	it("GET /sites 获取参与站点", async()=> {
		const userId = 2;
		const site = await app.model.sites.create({
			userId,
			sitename:"site2",
		});
		
		const group = await app.model.groups.create({userId, groupname:"group2"});
		const groupMembers = await app.model.members.create({userId, objectType:3, objectId:group.id, memberId:1});
		const siteGroup = await app.model.siteGroups.create({userId, siteId:site.id, groupId:group.id, level:64});

		const sites = await app.httpRequest().get("/sites?owned=false&membership=true").expect(200).then(res => res.body);
		//console.log(sites);
		assert.equal(sites.length, 1);
		assert.equal(sites[0].sitename, "site2");

		const level = await app.httpRequest().get("/sites/" + site.id + "/privilege").expect(200).then(res => res.body);
		assert.equal(level, 64);
	});
});
