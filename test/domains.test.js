
import {app, assert} from  "@/mock.js";

describe("/domains", () => {
	before(async (done) => {
		await app.model.users.truncate();
		await app.model.sites.truncate();
		await app.model.domains.truncate();

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

		data = await app.httpRequest().post("/sites").send({
			sitename:"site1",
			description:"test",
		}).expect(200).then(res => res.body);
		assert.equal(data.id,1);

		data = await app.httpRequest().post("/sites").send({
			sitename:"site2",
			description:"test",
		}).expect(200).then(res => res.body);
		assert.equal(data.id,2);

		done();
	});

	it("POST|PUT|DELTE|GET /domains", async(done)=> {
		let data = await app.httpRequest().post("/domains").send({
			domain: "test.keepwork.com",
			userId:1,
			siteId:1,
		}).expect(200).then(res => res.body);
		assert.equal(data.id,1);

		data = await app.httpRequest().post("/domains").send({
			domain: "xiaoyao.keepwork.com",
			userId:1,
			siteId:2,
		}).expect(200).then(res => res.body);
		assert.equal(data.id,2);

		data = await app.httpRequest().get("/domains").expect(200).then(res => res.body);
		assert.equal(data.length, 2);

		await app.httpRequest().delete("/domains/2").expect(200).then(res => res.body);
		data = await app.httpRequest().get("/domains").expect(200).then(res => res.body);
		assert.equal(data.length, 1);

		data = await app.httpRequest().get("/domains/1").expect(200).then(res => res.body);
		assert.equal(data.sitename, "site1");

		const domain = encodeURIComponent("test.keepwork.com");
		data = await app.httpRequest().get("/domains/" + domain).expect(200).then(res => res.body);
		assert.equal(data.sitename, "site1");

		data = await app.httpRequest().get("/domains/exist?domain=" + domain).expect(200).then(res => res.body);
		assert.ok(data);

		done();
	});
});
