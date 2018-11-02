module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("trades", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                    // 用户ID
			type: BIGINT,
			allowNull:  false,
		},
		
		type: {
			type: INTEGER, // 0 - charge充值  1 - expense 消费 
		},
		
		amount: {
			type: INTEGER,
		},

		tradeNo: {
			type: STRING(64), // 交易号
			unique: true,
		},

		chargeId: {
			type: STRING(64), // pingppId
		},

		refundId: {
			type: STRING(64), // pingppId
		},

		goodsId: {
			type: BIGINT,  // 物品ID
			allowNull: false,
			defaultValue: 0,
		},

		state: {
			type: BIGINT, // 交易状态
		},

		callback: {                  // 交易成功回调通知 通过缓存解决
			type: STRING(128),
		},

		channel: {                   // 支付渠道
			type: STRING(16),
		},

		subject: {                   // 商品标题
			type: STRING(64),
		},

		body: {                      // 商品描述信息
			type: STRING(256),
		},

		extra: {                     // 交易额外参数
			type: JSON,
		},

		description: {
			type: STRING(256), // 交易附加信息
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
	
	app.model.trades = model;
	return model;
};

