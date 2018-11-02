const _ = require("lodash");
const {
	USER_ROLE_EXCEPTION,
	USER_ROLE_NORMAL,
	USER_ROLE_VIP,
	USER_ROLE_MANAGER,
	USER_ROLE_ADMIN,
} = require("../core/consts.js");

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

	const model = app.model.define("roles", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {  // 文件所属者
			type: BIGINT,
			allowNull: false,
		},

		roleId: {
			type: INTEGER,
			allowNull: false,
		},

		description: {
			type: STRING(128),
		},

		startTime: {
			type: DATE,
		},

		endTime: {
			type: DATE,
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
		indexes: [
		{
			unique: true,
			fields: ["userId", "roleId"],
		},
		],
	});

	//model.sync({force:true});
	model.getByUserId = async function(userId) {
		const roles = await this.model.findAll({where: {userId}});

		return roles;
	}

	model.getRoleIdByUserId = async function(userId) {
		const roles = await this.model.findAll({where: {userId}});
		let roleId = USER_ROLE_NORMAL;
		_.each(roles, role => roleId = roleId | role.roleId);

		return roleId;
	}

	model.isExceptionRole = function(roleId = USER_ROLE_NORMAL) {
		return roleId & USER_ROLE_EXCEPTION;
	}

	model.isExceptionUser = async function(userId) {
		const roleId = await this.getRoleIdByUserId(userId);
		
		return this.isExceptionRole(roleId);
	}
	
	app.model.roles = model;
	return model;
};



