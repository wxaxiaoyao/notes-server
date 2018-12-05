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

		description: {               // 交易内容
			type: STRING,       
			defaultValue:"",
		},

		amount: {                    // 金额 +300元  +10 知识币 -10 知识豆
			type: STRING,
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

	//model.sync({force:true});
	
	app.model.trades = model;
	return model;
};

