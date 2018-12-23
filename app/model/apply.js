
const _ = require("lodash");

const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
	ENTITY_TYPE_GROUP,
	ENTITY_TYPE_PROJECT,

	APPLY_STATE_DEFAULT,
	APPLY_STATE_AGREE,
	APPLY_STATE_REFUSE,
	APPLY_TYPE_MEMBER,
} = require("../core/consts.js");

module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("applies", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		objectType: {                // 所属对象类型  0 -- 用户  1 -- 站点  2 -- 页面
			type: INTEGER,
			allowNull: false,
		},

		objectId: {                  // 所属对象id
			type: BIGINT,
			allowNull: false,
		},

		applyId: {                   // 申请Id
			type: BIGINT,
			allowNull: false,
		},

		applyType: {                 // 申请类型
			type: INTEGER,
			defaultValue:0,
		},

		state: {
			type: INTEGER,           // 状态 0 --  未处理态  1 -- 同意  2 -- 拒绝
			defaultValue:0, 
		},

		legend: {                    // 备注
			type: STRING(255),
			defaultValue:"",
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
			fields: ["objectId", "objectType", "applyType", "applyId"],
		},
		],
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	model.getById = async function(id, userId) {
		const where = {id};

		if (userId) where.userId = userId;

		const data = await app.model.applies.findOne({where: where});

		return data && data.get({plain:true});
	}

	model.getObject = async function(objectId, objectType, userId) {
		const modelName = {
			[ENTITY_TYPE_USER]: "users",
			[ENTITY_TYPE_SITE]: "sites",
			[ENTITY_TYPE_PAGE]: "pages",
			[ENTITY_TYPE_GROUP]: "groups",
			[ENTITY_TYPE_PROJECT]: "projects",
		};

		//console.log(objectType, modelName[objectType], modelName);
		const data = await app.model[modelName[objectType]].getById(objectId, userId);
		
		return data;
	}

	model.getObjectApplies = async function(objectId, objectType, applyType) {
		const list = await app.model.applies.findAll({where: {
			objectId, objectType, state: APPLY_STATE_DEFAULT, applyType,
		}});
		if (list.length == 0) return [];

		const ids = [];
		for (let i = 0; i < list.length; i++) {
			const item = list[i].get ? list[i].get({plain:true}) : list[i];
			ids.push(item.applyId);
			list[i] = item;
		}
		
		if (applyType == APPLY_TYPE_MEMBER) {
			const users = await app.model.users.findAll({
				attributes:[["id", "userId"], "username", "nickname", "portrait"],
				where: {
					id: {
						[app.Sequelize.Op.in]:ids,
					}
				}
			});

			_.each(users, (val, i) => users[i] = val.get({plain:true}));
			for (let i = 0; i < list.length; i++) {
				const item = list[i].get ? list[i].get({plain:true}) : list[i];
				const index = _.findIndex(users, o => o.userId == item.applyId);
				item.object = users[index];
			}
		}

		return list;
	}

	model.agree = async function(id, userId) {
		let data = await app.model.applies.getById(id);
		if (!data) {console.log("申请对象不存在"); return -1;};

		let object = await app.model.applies.getObject(data.objectId, data.objectType, userId);
		if (!object) {console.log("所属对象不存在"); return -1;};
		
		await app.model.applies.update({
			state:APPLY_STATE_AGREE,
		}, {where:{id, userId: data.userId}});

		if (data.applyType == APPLY_TYPE_MEMBER) {
			await app.model.members.upsert({
				userId,
				objectId: data.objectId,
				objectType: data.objectType,
				memberId: data.applyId,
			});
		}
	
		return 0;
	}

	model.refuse = async function(id, userId) {
		let data = await app.model.applies.getById(id);
		if (!data) {console.log("申请对象不存在"); return -1;};

		let object = await app.model.applies.getObject(data.objectId, data.objectType, userId);
		if (!object) {console.log("所属对象不存在"); return -1;};
	
		await app.model.applies.update({
			state:APPLY_STATE_REFUSE,
		}, {where:{id, userId:data.userId}});

		return 0;
	}

	app.model.applies = model;
	return model;
};
