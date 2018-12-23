
const _ = require("lodash");
const Controller = require("../../core/ioController.js");

class Chat extends Controller {
	async pullSessions() {
		const socket = this.ctx.socket;
		const {userId} = this.authenticated();

		let sessions = await this.model.sessions.findAll({where:{memberId:userId}});
		sessions = await this.model.sessions.loadSessionMembers(sessions);

		const rooms = [];
		_.each(sessions, session => rooms.push(session.sessionId));

		socket.join(rooms, this.success(sessions));
	}

	async pushSessions() {
		const nsp = this.app.io.of("/");
		const {userId} = this.authenticated();
		const session = this.validate();

		const sessions = await this.model.sessions.createSession({...session, userId});
		const memberIds = _.sortedUniq(session.memberIds || []);

		if (sessions.length == 0) return this.success();

		const sessionId = sessions[0].sessionId;
		const ps = [];
		_.each(sessions, session => {
			const memberId = session.memberId;
			ps.push(new Promise((resolve, reject) => {
				_.each(nsp.to(memberId).sockets, sock => sock.join(sessionId, () => resolve()));
			}));
		});

		await Promise.all(ps);

		_.each(sessions, session => nsp.to(session.memberId).emit("push_sessions", session));

		return this.success();
	}

	async pushMessages() {
		const nsp = this.app.io.of("/");
		const {userId} = this.authenticated();
		const message = this.validate({sessionId:"string"});
		const sessionId = message.sessionId;
		console.log(message);

		message.userId = userId;
		message.state = 0;

		// 不记录系统会话消息
		if (sessionId == "systemsession") return this.socket.emit("push_messages", message);

		let session = await this.model.sessions.findOne({where:{sessionId, memberId:userId}}).then(o => o && o.toJSON());
		if (!session) return this.throw(400, "会话不存在");

		await this.model.sessions.increment({unreadMsgCount:1}, {where:{sessionId, memberId:{[this.model.Op.ne]:userId}}});
		let msg = await this.model.messages.create(message);
		msg = msg.get({plain:true});

		console.log(session);
		//nsp.to(sessionId).emit("push_messages", msg);
		_.each(session.members.split("|").filter(o => o), memberId => {
			if (memberId == userId) return;
			nsp.to(memberId).emit("push_messages", msg);
		});

		return this.success(msg);
	}

	async pullMessages() {
		const nsp = this.app.io.of("/");
		const {userId} = this.authenticated();
		const {sessionId} = this.validate({sessionId:"string"});

		let session = await this.model.sessions.findOne({where:{sessionId, memberId:userId}}).then(o => o && o.toJSON());
		if (!session) return this.throw(400, "会话不存在");

		await this.model.sessions.update({unreadMsgCount:0}, {where:{sessionId, memberId:userId}});
		await this.model.messages.update({state:1}, {where:{sessionId, userId:{[this.model.Op.ne]:userId}}});

		const messages = await this.model.messages.findAll({...this.queryOptions, where: {sessionId}});
		
		nsp.in(`${sessionId}`).emit("pull_messages", {sessionId, userId});

		return this.success(messages);
	}
}

module.exports = Chat;
