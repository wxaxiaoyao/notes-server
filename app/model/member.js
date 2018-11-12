
module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("members", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                    // 所属者
			type: BIGINT,
			allowNull: false,
		},

		objectType: {                // 所属对象类型  0 -- 用户  1 -- 站点  2 -- 页面
			type: INTEGER,
			allowNull: false,
		},

		objectId: {                  // 所属对象id
			type: BIGINT,
			allowNull: false,
		},

		memberId: {                   // 成员Id
			type: BIGINT,
			allowNull: false,
		},

		level: {                      // 权限级别
			type: INTEGER,
			defaultValue:0,
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
			fields: ["objectId", "objectType", "memberId"],
		},
		],
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	model.getObjectMembers = async function(objectId, objectType) {
		const sql = `select users.id as userId, users.username, users.nickname, users.portrait 
			from members, users 
			where members.memberId = users.id and
			members.objectId = :objectId and members.objectType = :objectType`;

		const list = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements: {
				objectId, objectType,
			}
		});
		
		return list;
	}

	model.setObjectMembers = async function(objectId, objectType, members, userId) {
		await app.model.members.destroy({where:{objectId, objectType}});

		const datas = [];
		for (let i = 0; i < members.length; i++) {
			datas.push({objectId, objectType, userId, memberId: members[i]});
		}

		await app.model.members.bulkCreate(datas);
	}

	app.model.members = model;
	return model;
};
