
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
		},

		password: {
			type: STRING(48),
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
			defaultValue:"",
		},

		portrait: {
			type: STRING(128),
			defaultValue:"",
		},

		sex: {
			type: STRING(4),
			defaultValue:"男",
		},

		description: {
			type: STRING(128),
			defaultValue:"",
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
		if (userIds.length == 0) return {};

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

	model.contacts = async function(userId) {
		const list = await app.model.projects.findAll({where: {
			$or: [
			{userId},
			{members:{$like:`|${userId}|`}}
			]
		}});

		let userIds = [];
		_.each(list, project => {
			userIds.push(project.userId);
			let members = _.map(project.members.split("|").filter(o => o), _.toNumber);
			userIds = userIds.concat(members);
		});
		userIds = _.uniq(userIds);

		let users = await this.getUsers(userIds);

		return _.values(users);
	}

	app.model.users = model;
	return model;
};


































