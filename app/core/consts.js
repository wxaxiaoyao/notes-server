
module.exports = {
	STATUS_CODE_SUCCESS:200,
	STATUS_CODE_ERROR_REQUEST:400, 
	STATUS_CODE_UNAUTHORIZED:401,
	STATUS_CODE_FORBID:403,
	STATUS_CODE_NOT_FOUND:404,
	STATUS_CODE_CONFLICT:409,

	                            // LOG_TYPE
	LOG_TYPE_REQUEST_ELAPSED:1, // 请求耗时统计日志
	LOG_TYPE_SYSTEM:2,          // 系统错误日志
	LOG_TYPE_FRAME:3,           // 框架错误日志
	LOG_TYPE_APPLICATION:4,     // 应用错误日志
	LOG_TYPE_DEFAULT:100,       // 默认类型

	// 用户访问权限
	USER_ACCESS_LEVEL_READ:32, // 读权限
	USER_ACCESS_LEVEL_WRITE:64,// 写权限
	USER_ACCESS_LEVEL_NONE:128,  // 无权限

	// 实体类型
	ENTITY_TYPE_USER:0,        // 用户类型
	ENTITY_TYPE_SITE:1,        // 站点类型
	ENTITY_TYPE_PAGE:2,        // 页面类型
	ENTITY_TYPE_GROUP:3,       // 组
	ENTITY_TYPE_ISSUE:4,       // 问题
	ENTITY_TYPE_PROJECT:5,     // 项目
	
	// 对象类型
	OBJECT_TYPE_USER:0,        // 用户类型
	OBJECT_TYPE_SITE:1,        // 站点类型
	OBJECT_TYPE_PAGE:2,        // 页面类型
	OBJECT_TYPE_GROUP:3,       // 组
	OBJECT_TYPE_ISSUE:4,       // 问题
	OBJECT_TYPE_PROJECT:5,     // 项目

	// 对象可见性
	ENTITY_VISIBILITY_PUBLIC:0,   // 公开
	ENTITY_VISIBILITY_PRIVATE:1,  // 私有
	ENTITY_VISIBILITY_ONLY_OWN:2, // 仅拥有者

	// 服务类型
	OAUTH_SERVICE_TYPE_QQ:0,      // QQ
	OAUTH_SERVICE_TYPE_WEIXIN:1,  // 微信
	OAUTH_SERVICE_TYPE_GITHUB:2,  // GITHUB
	OAUTH_SERVICE_TYPE_XINLANG:3, // 新浪

	// 角色
	USER_ROLE_NORMAL:0,     // 普通
	USER_ROLE_EXCEPTION:1,  // 异常
	USER_ROLE_VIP:4,        // vip
	USER_ROLE_MANAGER:64,   // 管理者
	USER_ROLE_ADMIN:128,    // 超管

	// 通知状态
	NOTIFICATION_STATE_UNREAD:0, // 未读
	NOTIFICATION_STATE_READ:1,   // 已读
	
	// 通知类型
	NOTIFICATION_TYPE_USER:0,  // 用户级别通知
	NOTIFICATION_TYPE_SITE:1,  // 站点级别通知
	NOTIFICATION_TYPE_PAGE:2,  // 页面级别通知

	// 审核状态
	QINIU_AUDIT_STATE_NO_AUDIT:0,  // 未审核
	QINIU_AUDIT_STATE_PASS:1,      // 审核通过
	QINIU_AUDIT_STATE_NOPASS:2,    // 审核未通过
	QINIU_AUDIT_STATE_FAILED:3,    // 审核失败

	// 申请状态
	APPLY_STATE_DEFAULT:0,   // 待处理状态
	APPLY_STATE_AGREE:1,     // 同意
	APPLY_STATE_REFUSE:2,    // 拒绝

	// 申请类型
	APPLY_TYPE_MEMBER:0,     // 成员申请

	DISCOUNT_STATE_UNUSE: 0,    // 未使用 0 
	DISCOUNT_STATE_USED: 1,     // 已使用 1
	DISCOUNT_STATE_EXPIRED: 2,  // 已过期 2

	                       // 订单状态
	ORDER_STATE_START:0,   // 订单开始
	ORDER_STATE_PAYING:1,  // 订单进行中
	ORDER_STATE_SUCCESS:2, // 订单成功
	ORDER_STATE_FAILED:4,  // 订单失败
	ORDER_STATE_FINISH:8,  // 订单完成
	ORDER_STATE_REFUNDING:16, // 订单退款中
	ORDER_STATE_REFUND_SUCCESS:32, // 订单退款完成
	ORDER_STATE_REFUND_FAILED:64, // 退款失败
	ORDER_STATE_CHARGING:128, // 订单充值中
	ORDER_STATE_CHARGE_SUCCESS:256, // 订单充值完成
	ORDER_STATE_CHARGE_FAILED:512, // 订单充值失败

	// 交易类型
	TRADE_TYPE_CHARGE:0,      // 充值
	TRADE_TYPE_EXCHANGE:1,    // 兑换
	TRADE_TYPE_PACKAGE_BUY:2,   // 购买课程包
	TRADE_TYPE_LESSON_STUDY: 3, // 课程学习

	TAG_TYPE_COMPONENT:0, // 组件tag
	TAG_TYPE_PAGE:1,      // 页面tag

	ISSUE_STATE_OPEN:0,   // 打开状态
	ISSUE_STATE_CLOSED:1, // 关闭状态

	SOCKET_CMD_ECHO:0,    // echo 
	SOCKET_CMD_MSG:1,     // 消息
	SOCKET_CMD_SESSION:2, // 会话


	BUG_STATE_INIT:0,     // 初始态 当前状态抉择是否合理
	BUG_STATE_OPEN:1,     // 待测试 
	BUG_STATE_TEST:2,     // 测试中
	BUG_STATE_PASS:3,     // 测试通过
	BUG_STATE_NOPASS:4,   // 测试不通过
	BUG_STATE_CLOSE:5,    // 关闭结束

	VERSION_TYPE_ANDROID: 0,  // android类型
	VERSION_TYPE_IOS: 1,      // iOS类型

	CLASSIFY_TAG_DEFAULT:0,   // 默认 未分类
	CLASSIFY_TAG_CONTACT:1,   // 联系人tag
	CLASSIFY_TAG_KNOWLEDGE:2, // 知识tag
	CLASSIFY_TAG_NOTE:3,      // 便条tag
}



