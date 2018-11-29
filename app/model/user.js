
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

	const model = app.model.define("users", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		username: {
			type: STRING(48),
			unique: true,
			allowNull: false,
		},

		password: {
			type: STRING(48),
			allowNull: false,
		},

		roleId: {
			type: INTEGER,
			defaultValue: 0,
		},

		email: {
			type: STRING(24),
			unique: true,
		},

		cellphone: {
			type: STRING(24),
			unique: true,
		},

		nickname: {
			type: STRING(48),
		},

		portrait: {
			type: STRING(128),
		},

		sex: {
			type: STRING(4),
		},

		description: {
			type: STRING(128),
		},

	}, {
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	model.get = async function(id) {
		if (_.toNumber(id)) {
			return await this.getById(_.toNumber(id));
		}
		
		return await this.getByName(id);
	}

	model.getByName = async function(username) {
		const data = await app.model.users.findOne({
			where: {username},
			exclude: ["password"],
		});

		return data && data.get({plain:true});
	}

	model.getById = async function(userId) {
		const data = await app.model.users.findOne({
			where: {id:userId},
			exclude: ["password"],
		});

		return data && data.get({plain:true});
	}

	model.getUsers = async function(userIds = []) {
		const attributes = [["id", "userId"], "username", "nickname", "portrait", "description"];
		const list = await app.model.users.findAll({
			attributes,
			where: {id: {[app.Sequelize.Op.in]: userIds}}
		});

		const users = {};
		_.each(list, o => {
			o = o.get ? o.get({plain:true}) : o;
			users[o.userId] = o;
		});

		return users;
	}

	model.loadUsers = async function(list = [], userIdKey = "userId", userKey = "user") {
		const userIds = [];

		_.each(list, (obj, index) => {
			obj = obj.get ? obj.get({plain:true}) : obj;

			userIds.push(obj[userIdKey]);

			list[index] = obj;
		});

		const users = await this.getUsers(userIds);

		_.each(list, o => o[userKey] = users[o[userIdKey]]);

		return;
	}

	app.model.users = model;
	return model;
};


































