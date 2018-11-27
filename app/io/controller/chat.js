
const _ = require("lodash");
const Controller = require("../../core/ioController.js");

class Chat extends Controller {
	async sessions() {
		const socket = this.ctx.socket;
		const {userId} = this.authenticated();

		let list = await this.model.sessions.findAll({where:{memberId:userId}});
		const rooms = [];
		_.each(list, session => {
			session = session.get({plain:true});
			rooms.push(_.toString(session.sessionId));
		});

		socket.join(rooms);

		this.success(list);
	}

	async pushMessages() {
		const nsp = this.app.io.of("/");
		const {userId} = this.authenticated();
		const message = this.validate({sessionId:"int"});
		const sessionId = message.sessionId;

		message.userId = userId;
		message.state = 0;

		// 不记录系统会话消息
		if (sessionId == 0) return this.socket.emit("push_messages", message);

		let session = this.model.sessions.findOne({where:{sessionId, memberId:userId}});
		if (!session) return this.throw(400, "会话不存在");

		const memberIds = (message.tos || "").split("|").filter(o => o);
		if (memberIds.length) await this.model.sessions.increment({unreadMsgCount:1}, {where:{sessionId, memberId:{[this.model.Op.in]:memberIds}}});
		let msg = await this.model.messages.create(message);
		msg = msg.get({plain:true});

		nsp.to(`${sessionId}`).emit("push_messages", msg);

		return this.success(msg);
	}

	async pullMessages() {
		const nsp = this.app.io.of("/");
		const {userId} = this.authenticated();
		const {sessionId} = this.validate({sessionId:"int"});

		let session = this.model.sessions.findOne({where:{sessionId, memberId:userId}});
		if (!session) return this.throw(400, "会话不存在");

		await this.model.sessions.update({unreadMsgCount:0}, {where:{sessionId, memberId:userId}});
		await this.model.messages.update({state:1}, {where:{sessionId, userId:{[this.model.Op.ne]:userId}}});

		const messages = await this.model.messages.findAll({...this.queryOptions, where: {sessionId}});
		
		nsp.in(`${sessionId}`).emit("pull_messages", {sessionId, userId});

		return this.success(messages);
	}
}

module.exports = Chat;
