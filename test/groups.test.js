
import {app, assert} from  "@/mock.js";

describe("/groups", () => {
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

		done();
	});

	it("POST|PUT|DELET|GET /groups", async (done)=> {
		let data = await app.httpRequest().post("/groups").send({
			groupname:"group1",
			description:"test",
		}).expect(200).then(res => res.body);
		assert.equal(data.id,1);
		
		data = await app.httpRequest().post("/groups").send({
			groupname:"group2",
			description:"test",
		}).expect(200).then(res => res.body);
		assert.equal(data.id,2);

		data = await app.httpRequest().get("/groups").expect(200).then(res => res.body);
		assert.equal(data.length, 2);

		await app.httpRequest().put("/groups/1").send({description:"description"}).expect(200);

		data = await app.httpRequest().get("/groups/1").expect(200).then(res => res.body);
		assert.equal(data.description, "description");

		await app.httpRequest().delete("/groups/2").expect(200).then(res => res.body);
		 
		data = await app.httpRequest().get("/groups").expect(200).then(res => res.body);
		assert.equal(data.length, 1);

		done();
	});

	it("POST|DELETE|GET /groups/1/members", async(done)=>{
		const url = "/groups/1/members";
		let data = await app.httpRequest().post(url).send({
			memberName:"wxatest",
		}).expect(200).then(res => res.body);
		assert.equal(data.id,1);
		
		data = await app.httpRequest().post(url).send({
			memberName:"wxaxiaoyao",
			description:"test",
		}).expect(200).then(res => res.body);
		assert.equal(data.id,2);

		data = await app.httpRequest().get(url).expect(200).then(res => res.body);
		assert.equal(data.length, 2);
		assert.equal(data[0].userId, 2);
		assert.equal(data[1].userId, 3);

		data = await app.httpRequest().delete(url+"?memberName=wxaxiaoyao").expect(200);

		data = await app.httpRequest().get(url).expect(200).then(res => res.body);
		//console.log(data);
		assert.equal(data.length, 1);
		assert.equal(data[0].userId, 2);

		done();
	});
});
