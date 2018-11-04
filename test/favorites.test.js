
import {app, assert} from  "@/mock.js";

describe("/pages", () => {
	before(async (done) => {
		await app.model.users.truncate();
		await app.model.sites.truncate();
		await app.model.pages.sync({force:true});
		await app.model.favorites.sync({force:true});

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

		// 页面
		await app.model.pages.create({
			userId,
			siteId: site.id,
			url: "wxatest/site2/index",
			folder: "wxatest/site2/",
			content: "page",
		});
		await app.model.pages.create({
			userId,
			siteId: site.id,
			url: "wxatest/site2/index2",
			folder: "wxatest/site2/",
			content: "page",
		});

		done();
	});

	it("POST|PUT|DELTE|GET /favorites", async(done)=> {
		// 关注用户
		let data = await app.httpRequest().post("/favorites").send({
			objectType: 0,
			objectId:2,
		}).expect(200).then(res => res.body);
		assert.equal(data.id, 1);

		// 是否关注
		data = await app.httpRequest().get("/favorites/exist?objectId=2&objectType=0").expect(200).then(res => res.body);
		assert.ok(data);

		// 获取关注列表
		data = await app.httpRequest().get("/favorites?userId=1&objectType=0").expect(200).then(res => res.body);
		assert.equal(data.length, 1);
		assert.equal(data[0].id, 2);

		// 获取粉丝
		data = await app.httpRequest().get("/favorites/follows?objectId=2&objectType=0").expect(200).then(res => res.body);
		assert.equal(data.length,1);
		assert.equal(data[0].id, 1);

		// 取消关注
		data = await app.httpRequest().delete("/favorites/exist?objectId=2&objectType=0").expect(200).then(res => res.body);

		data = await app.httpRequest().get("/favorites?userId=1&objectType=0").expect(200).then(res => res.body);
		assert.equal(data.length, 0);
	
		// 关注站点
		data = await app.httpRequest().post("/favorites").send({
			objectType: 1,
			objectId:2,
		}).expect(200).then(res => res.body);
		assert.equal(data.id, 2);

		// 是否关注
		data = await app.httpRequest().get("/favorites/exist?objectId=2&objectType=1").expect(200).then(res => res.body);
		assert.ok(data);

		// 获取关注列表
		data = await app.httpRequest().get("/favorites?userId=1&objectType=1").expect(200).then(res => res.body);
		assert.equal(data.length, 1);
		assert.equal(data[0].id, 2);

		// 获取粉丝
		data = await app.httpRequest().get("/favorites/follows?objectId=2&objectType=1").expect(200).then(res => res.body);
		assert.equal(data.length,1);
		assert.equal(data[0].id, 1);

		// 取消关注
		data = await app.httpRequest().delete("/favorites/exist?objectId=2&objectType=1").expect(200).then(res => res.body);

		data = await app.httpRequest().get("/favorites?userId=1&objectType=1").expect(200).then(res => res.body);
		assert.equal(data.length, 0);

		// 关注页面
		data = await app.httpRequest().post("/favorites").send({
			objectType: 2,
			objectId:2,
		}).expect(200).then(res => res.body);
		assert.equal(data.id, 3);

		// 是否关注
		data = await app.httpRequest().get("/favorites/exist?objectId=2&objectType=2").expect(200).then(res => res.body);
		assert.ok(data);

		// 获取关注列表
		data = await app.httpRequest().get("/favorites?userId=1&objectType=2").expect(200).then(res => res.body);
		assert.equal(data.length, 1);
		assert.equal(data[0].id, 2);
	
		// 获取粉丝
		data = await app.httpRequest().get("/favorites/follows?objectId=2&objectType=2").expect(200).then(res => res.body);
		assert.equal(data.length,1);
		assert.equal(data[0].id, 1);

		// 取消关注
		data = await app.httpRequest().delete("/favorites/exist?objectId=2&objectType=2").expect(200).then(res => res.body);

		data = await app.httpRequest().get("/favorites?userId=1&objectType=2").expect(200).then(res => res.body);
		assert.equal(data.length, 0);

		done();
	});
});
