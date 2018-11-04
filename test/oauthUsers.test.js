
import {app, assert} from  "@/mock.js";

describe("oauth user", () => {
	before(async (done)=>{
		await app.model.oauthUsers.truncate();

		done();
	});

	it("github oauth", async (done)=> {
		let data = await app.httpRequest().post("/oauth_users/github").send({
			clientId:"xx",
			redirectUri:"xx",
			code:"xx",
			state:"bind",
		}).expect(200).then(res => res.body);

		assert.ok(data.token);
		assert.ok(data.id == undefined);

		data = await app.httpRequest().post("/oauth_users/github").send({
			clientId:"xx",
			redirectUri:"xx",
			code:"xx",
			state:"login",
		}).expect(200).then(res => res.body);

		assert.ok(data.token);
		assert.ok(data.id);

		done();
	});
});
