
module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
		DATE,
	} = app.Sequelize;

	const model = app.model.define("comments", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                    // 评论者
			type: BIGINT,
			allowNull: false,
		},

		objectType: {                // 评论对象类型  0 -- 用户  1 -- 站点  2 -- 页面
			type: INTEGER,
			allowNull: false,
		},

		objectId: {                  // 评论对象id
			type: BIGINT,
			allowNull: false,
		},

		content: {                   // 评论内容
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
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	model.createComment = async function(userId, objectId, objectType, content) {
		const user = await app.model.users.getById(userId);
		if (!user) return ;

		let data = await app.model.comments.create({
			userId,
			objectType,
			objectId,
			content,
			extra: {
				username: user.username,
				nickname: user.nickname,
				portrait: user.portrait,
			},
		});
		
		return data && data.get({plain:true});
	} 

	model.getObjectComment = async function(objectId, objectType) {
		const sql = `select comments.*, users.username username, users.portrait portrait 
			from comments, users where comments.userId = users.id and 
			objectId = :objectId and objectType = :objectType`;
	
		const list = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements: {
				objectType,
				objectId,
			}
		});

		return list;
	}

	app.model.comments = model;
	return model;
};







