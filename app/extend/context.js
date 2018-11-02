
module.exports = {
	authenticated() {
		const user = this.state.user;
		if (!user || user.userId == undefined) return this.throw(401);

		return user;
	}
}
