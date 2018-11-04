
const _ = require("lodash");

const Controller = require("../core/controller.js");
const {
	SOCKET_CMD_MSG,
	SOCKET_CMD_ECHO,
	SOCKET_CMD_SESSION,
} = require("../core/consts.js");

const Session = class extends Controller {
	get modelName() {
		return "sessions";
	}

	async index() {
		const userId = this.authenticated().userId;
		const params = this.validate();
		params.memberId = userId;

		this.formatQuery(params);

		const list = await this.model.sessions.findAll({...this.queryOptions, where:params});

		return this.success(list);
	}

	// 创建会话
	async create() {
		const {userId} = this.authenticated();
		const params = this.validate();

		const session = await this.model.sessions.createSession({...params, userId});


		return this.success(session);
	}

	// 禁止更新
	async update() {
	}

	// 成员加入
	async join() {
		const {userId} = this.authenticated();
		const {id, memberIds=[]} = this.validate({id:"int"});
		const sessionId = id;

		let session = await this.model.sessions.findOne({where:{sessionId, memberId:userId}});
		if (!session) return this.throw(400, "会话不存在");
		session = session.get({plain:true});

		const datas = [];
		_.each(memberIds, memberId => {
			datas.push({
				userId:session.userId,
				title: session.title,
				description: session.description,
				memberId: memberId,
				sessionId: sessionId,
			});
		});


		const data = await this.model.sessions.bulkCreate(datas);

		return this.success(data);
	}

	// 移除成员
	async exit() {
		const {userId} = this.authenticated();
		const {id, memberIds=[]} = this.validate({id:'int'});

		const data = await this.model.sessions.destroy({where: {
			userId,
			memberId:{
				[this.model.Op.in]:memberIds,
			}
		}});

		return this.success(data);
	}

	// 会话成员列表
	async members() {
		const {id} = this.validate({id:"int"});

		const users = await this.model.sessions.members(id);

		return this.success(users);
	}

	async sendMsg(sessionId, msg) {
		let list = await this.model.sessions.findAll({where:{sessionId}});

		for (let i = 0; i < list.length; i++) {
			const memberId = list[i].memberId;
			this.app.Socket.send(memberId, msg);
		}
	}
	async getMsgs() {
		const {userId, username} = this.authenticated();
		const {id} = this.validate({id: "int"});
		const sessionId = id;

		const session = await this.model.sessions.findOne({where:{sessionId, memberId: userId}});
		if (!session) return this.throw(400, "用户不在会话内");

		const list = await this.model.messages.findAll({order:[["createdAt", "desc"]], where: {sessionId}});

		await this.model.sessions.update({unreadMsgCount:0}, {where:{sessionId, memberId:userId}});
		await this.model.messages.update({state:1}, {where:{sessionId, userId:{[this.model.Op.ne]:userId}}});

		await this.sendMsg(sessionId, {sessionId, userId, cmd:SOCKET_CMD_SESSION}); // 收到会话消息表明 会话内消息已读
		return this.success(list);
	}

	async postMsg() {
		const {userId, username} = this.authenticated();
		const {id, text, type, extra, tos} = this.validate({id: "int", text:"string", type: "int"});
		const sessionId = id;
		let msg = {text, type, sessionId, extra, userId, username, tos}

		if (tos) {
			const memberIds = tos.split("|").filter(o => o);
			await this.model.sessions.increment({unreadMsgCount:1}, {where:{sessionId, memberId:{[this.model.Op.in]:memberIds}}});
		}

		msg = await this.model.messages.create(msg);
		if (!msg) return this.throw(500);
		msg = msg.get({plain:true});

		await this.model.sessions.update({lastMsg:msg}, {where:{sessionId}});

		msg.cmd = SOCKET_CMD_MSG;
		await this.sendMsg(sessionId, msg);
	}

	async deleteMsg() {

	}

	// 用户设置自己的当前会话
	async current() {
		const {userId, username} = this.authenticated();
		const {id} = this.validate({id: "int"});
		const sessionId = id;
		
		await this.model.sessions.update({unreadMsgCount:0}, {where:{sessionId, memberId:userId}});
		await this.model.messages.update({state:1}, {where:{sessionId, userId:{[this.model.Op.ne]:userId}}});

		await this.sendMsg(sessionId, {sessionId, userId, cmd:SOCKET_CMD_SESSION});
	}
}

module.exports = Session;
