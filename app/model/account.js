
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

	const model = app.model.define("accounts", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {
			type: BIGINT,
			unique: true,
			allowNull: false,
		},

		rmb: {                       // 人民币
			type: INTEGER,
			defaultValue: 0,
		},

		coin: {                      // 知识币
			type: INTEGER,
			defaultValue: 0,
		},

		bean: {                      // 知识豆
			type: INTEGER,
			defaultValue: 0,
		},

		lockCoin: {                  // 待解锁的知识币
			type: INTEGER,
			defaultValue: 0,
		},

	}, {
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});

	app.model.accounts = model;
	return model;
};






