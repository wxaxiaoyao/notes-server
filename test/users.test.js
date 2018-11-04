
import {app, assert} from  "@/mock.js";

describe("/users", () => {
	beforeAll(async () => {
		await app.model.users.sync({force:true});
	});

	it("/users/register|login", async ()=> {
		let user = await app.httpRequest().post("/users/register").send({
			username:"xiaoyao",
			password:"wuxiangan",
		}).expect(200).then(res => res.body);

		assert.ok(user.token);
		assert.equal(user.id, 1);

		user = await app.httpRequest().post("/users/login").send({
			username:"xiaoyao",
			password:"wuxiangan",
		}).expect(200).then(res => res.body);

		assert.ok(user.token);
	});

	it("PUT|GET /users/1", async ()=> {
		const url = "/users/1";
		const ok = await app.httpRequest().put(url).send({
			sex:"M",
		}).expect(200);

		let user = await app.httpRequest().get(url).expect(200).then(res => res.body);

		assert.equal(user.sex, "M");
	});

	it ("/users/pwd", async ()=> {
		let data = await app.httpRequest().post("/users/pwd").send({
			oldpassword:"wuxiangan",
			password:"123456",
		}).expect(200);

		data = await app.httpRequest().post("/users/login").send({
			username:"xiaoyao",
			password:"123456",
		}).expect(200).then(res => res.body);

		assert.ok(data.token);
	});

	it ("cellphone verfiy", async () => {
		const cellphone="cellphone";
		let data = await app.httpRequest().get("/users/cellphone_captcha?cellphone=" + cellphone).expect(200);

		const cache = app.cache.get(cellphone) || {};
		assert.ok(cache.captcha);

		await app.httpRequest().post("/users/cellphone_captcha").send({cellphone, captcha:cache.captcha, isBind:true}).expect(200);

		data = await app.httpRequest().get("/users/1").expect(200).then(res => res.body);

		assert.equal(data.cellphone, cellphone);

		// 解绑
		await app.httpRequest().post("/users/cellphone_captcha").send({cellphone, captcha:cache.captcha, isBind:false}).expect(200);

		data = await app.httpRequest().get("/users/1").expect(200).then(res => res.body);

		assert.equal(data.cellphone, "");
	});

	it ("email verfiy", async () => {
		const email="email";
		let data = await app.httpRequest().get("/users/email_captcha?email=" + email).expect(200);

		const cache = app.cache.get(email) || {};
		assert.ok(cache.captcha);

		await app.httpRequest().post("/users/email_captcha").send({email, captcha:cache.captcha, isBind:true}).expect(200);

		data = await app.httpRequest().get("/users/1").expect(200).then(res => res.body);

		assert.equal(data.email, email);

		// 解绑
		await app.httpRequest().post("/users/email_captcha").send({email, captcha:cache.captcha, isBind:false}).expect(200);

		data = await app.httpRequest().get("/users/1").expect(200).then(res => res.body);

		assert.equal(data.email, "");
	});
});
