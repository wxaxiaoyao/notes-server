
module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("orders", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                    // 用户ID
			type: BIGINT,
			allowNull:  false,
		},
		
		orderNo: {
			type: STRING(64), // 交易号
			unique: true,
		},

		amount: {
			type: INTEGER,
		},

		goodsId: {
			type: BIGINT,  // 物品ID
			defaultValue: 0,
		},

		state: {
			type: BIGINT, // 交易状态
		},

		channel: {                   // 支付渠道
			type: STRING(16),
		},

		chargeId: {
			type: STRING(64), // pingppId
		},

		refundId: {
			type: STRING(64), // pingppId
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

	//model.sync({force:true});
	
	app.model.orders = model;
	
	return model;
};

