
const uuidv1 = require('uuid/v1');
const _ = require("lodash");

module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("sessions", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
	
		userId: {             // 创建者
			type: BIGINT,
			allowNull: false,
		},

		sessionId: {          // 会话id
			type: STRING,
			allowNull: false,
			defaultValue: 0,
		},

		title: {              // 会话标题
			type: STRING(255),
			defaultValue:"",
		},

		description: {        // 会话描述 备注
			type: STRING(255),
			defaultValue: "",
		},
		
		members: {
			type: TEXT,
			defaultValue:"|",
		},

		memberId: {           // 成员id
			type: BIGINT,
			allowNull: false,
		},

		state: {
			type: INTEGER,    // 0 - 显示  1 - 隐藏  2 - 激活
			defaultValue: 0,
		},

		unreadMsgCount: {
			type: INTEGER,    // 未读消息数
			defaultValue: 0,
		},

		lastMsg: {            // 最后一条消息
			type: JSON,
		},

		extra: {
			type: JSON,
			defaultValue: {},
		},
	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
		indexes: [
		{
			unique: true,
			fields: ["sessionId", "memberId"],
		},
		{
			fields: ["members"],
		},
		],
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	model.createSession = async function(session) {
		const userId = session.userId;
		let sessionId = session.userId + uuidv1().replace(/-/g, "");
		
		let memberIds = session.memberIds || [];
		memberIds.push(session.userId);
		memberIds = _.sortBy(_.uniq(memberIds));
		session.members = "|" + memberIds.join("|") + "|";
		session.sessionId = sessionId;
		session.title = session.title || ("群聊(" + memberIds.length + ")");
		
		// 是否已存在会话
		let sess = await app.model.sessions.findOne({where:{members: session.members, memberId: userId}}).then(o => o && o.toJSON());

		if (sess) return sess;
		await app.model.sessions.bulkCreate(_.map(memberIds, memberId => {
			return {...session, memberId};
		}));
		
		return await app.model.sessions.findOne({where:{members: session.members, memberId: userId}}).then(o => o && o.toJSON());
	}

	model.loadSessionMembers = async function(sessions) {
		let userIds = [];
		_.each(sessions, (session, i) => {
			session = session.get ? session.get({plain:true}) : session;
			userIds.push(session.userId);
			session.members = session.members.split("|").filter(o => o);
			_.each(session.members, (id, i) => {
				id = _.toNumber(id);
				session.members[i] = id;
				userIds.push(id);
			});
			sessions[i] = session;
		});

		const users = await app.model.users.getUsers(userIds);
		_.each(sessions, session => {
			const members = [];
			_.each(session.members, memberId => members.push(users[memberId]));
			session.members = members;
			session.user = users[session.userId];
		});

		return sessions;
	}

	model.getSessionsBySessionId = async function(sessionId) {
		const sessions = await app.model.sessions.findAll({where:{sessionId}});
		
		return await this.loadSessionMembers(sessions);
	}

	model.members = async function(sessionId) {
		const list = await app.model.sessions.findAll({where:{sessionId}});

		const userIds = [];

		_.each(list, o => userIds.push(o.memberId));

		const users = await app.model.users.getUsers(userIds);

		return users;
	}

	app.model.sessions = model;
	return model;
};
