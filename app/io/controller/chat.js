
const _ = require("lodash");
const Controller = require("../../core/controller.js");

class Chat extends Controller {

	async sessions() {
		const {ctx, app} = this;
		const {socket, helper} = ctx;
		const {userId} = socket.handshake.query;
		const params = ctx.args[0];
		const ack = ctx.args[1];	

		let list = await this.model.sessions.findAll({where:{memberId:userId}});
		_.each(list, session => {
			session = session.get({plain:true});
			//const chatroom = "chatroom" + session.id;
			const chatroom = _.toString(session.id);
			socket.join(chatroom);
		});

		ack && ack(list);
	}

	async messages() {
		const {ctx, app} = this;
		const {socket, helper} = ctx;
		const {userId} = socket.handshake.query;
		const params = ctx.args[0];
		const {action, sessionId, limit:200, message} = params;
		const room = _.toString(sessionId);
		const ack = ctx.args[1] || (() => {});	

		const session = await this.model.sessions.findOne({where:{sessionId, memberId: userId}});
		if (!session) return ack("invalid request");


		if (action == "pull") {
			const messages = await this.model.messages.findAll({limit, order:[["createdAt", "desc"]], where: {sessionId}});
			await this.model.sessions.update({unreadMsgCount:0}, {where:{sessionId, memberId:userId}});
			await this.model.messages.update({state:1}, {where:{sessionId, userId:{[this.model.Op.ne]:userId}}});

			ack(messages);

			socket.to(room).emit("messages", {action, sessionId, limit});
		} else if(action == "push") {
			message.userId = userId;
			message.sessionId = sessionId;
			const memberIds = (message.tos || "").split("|").filter(o => o);
			if (memberIds.length) await this.model.sessions.increment({unreadMsgCount:1}, {where:{sessionId, memberId:{[this.model.Op.in]:memberIds}}});

			await this.model.messages.create(message);
			socket.to(room).emit("messages", params);
		} else {
			ack("params error");
		}
	}
}

module.exports = Chat;
