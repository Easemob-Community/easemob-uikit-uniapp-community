/**
 * 环信 SDK 初始化文件
 * 
 * 使用本地 js_sdk 目录下的 SDK 文件
 * 已复制自 node_modules/easemob-websdk/uniApp/Easemob-chat.js
 */

import websdk from '../js_sdk/Easemob-chat'
// import websdk from '../js_sdk/Easemob-chat (1).js'
import {
	logger
} from 'easemob-uniapp-logger-plugin'
// SDK 配置
const SDK_CONFIG = {
	// 请替换为您的 AppKey，格式：appkey@im-appkey
	appKey: 'easemob-demo#support',
	// 是否开启调试模式
	debug: true,
	// 是否使用 https
	https: true,
	// 是否开启多端登录
	isMultiLogin: true
}

// 创建 SDK 实例
const EMClient = new websdk.connection({
	appKey: SDK_CONFIG.appKey,
	url:'wss://im-api-wechat.easemob.com/websocket',
	apiUrl:'https://a1.easemob.com'
})
console.log('>>>>>SDK version',EMClient.version)
logger.init({
	conn: EMClient
});

websdk.logger.onLog = (data) => {
	console.log('>>>>>SDK输出的日志', data)
	logger.handleSDKLog(data);
}
// 导出 SDK 实例和 SDK 本身
export {
	EMClient,
	websdk as EMSDK
}

// 默认导出
export default EMClient