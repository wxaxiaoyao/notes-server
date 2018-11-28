
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
		],
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	model.createSession = async function(session) {
		const sessionId = session.userId + uuidv1().replace(/-/g, "");
		
		let memberIds = session.memberIds || [];
		memberIds.push(session.userId);
		memberIds = _.sortedUniq(memberIds);
		session.members = "|" + memberIds.join("|") + "|";
		session.sessionId = sessionId;
		
		const datas = [];
		_.each(memberIds, memberId => datas.push({...session, memberId}));

		await app.model.sessions.bulkCreate(datas);
		
		const sessions = await app.model.sessions.findAll({where:{sessionId}});
		
		return sessions;
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
