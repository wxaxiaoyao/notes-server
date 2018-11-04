
import {app, assert} from  "@/mock.js";

describe("/comments", () => {
	before(async (done) => {
		await app.model.users.truncate();
		await app.model.comments.truncate();
		//await app.model.comments.sync({force: true});

		let data = await app.httpRequest().post("/users/register").send({
			username:"xiaoyao",
			password:"wuxiangan",
		}).expect(200).then(res => res.body);
		assert.ok(data.token);
		assert.equal(data.id, 1);

		done();
	});

	it("POST|PUT|DELTE|GET /comments", async(done)=> {
		let data = await app.httpRequest().post("/comments").send({
			objectType:2,
			objectId:1,
			content: "hello comment 1"
		}).expect(200).then(res => res.body);
		assert.equal(data.id,1);

		data = await app.httpRequest().post("/comments").send({
			objectType:2,
			objectId:1,
			content: "hello comment 2"
		}).expect(200).then(res => res.body);
		assert.equal(data.id,2);

		data = await app.httpRequest().get("/comments").expect(200).then(res => res.body);
		assert.equal(data.length, 2);

		await app.httpRequest().delete("/comments/2").expect(200).then(res => res.body);
		data = await app.httpRequest().get("/comments").expect(200).then(res => res.body);
		assert.equal(data.length, 1);

		data = await app.httpRequest().put("/comments/1").send({content:"test"}).expect(200).then(res => res.body);

		data = await app.httpRequest().get("/comments/1").expect(200).then(res => res.body);
		assert.equal(data.content, "test");

		done();
	});
});
