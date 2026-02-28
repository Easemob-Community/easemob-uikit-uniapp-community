/**
 * 环信 SDK 初始化文件
 * 使用 easemob-websdk/uniApp/Easemob-chat 适配 uni-app
 */

// 引入环信 SDK（uni-app 版本）
// 注意：uni-app Vue2 需要使用 /@/node_modules/ 前缀
import websdk from '/@/node_modules/easemob-websdk/uniApp/Easemob-chat'

// SDK 配置
const SDK_CONFIG = {
  // 请替换为您的 AppKey，格式：appkey@im-appkey
  appKey: 'your-app-key@im-appkey',
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
  debug: SDK_CONFIG.debug,
  https: SDK_CONFIG.https,
  isMultiLogin: SDK_CONFIG.isMultiLogin
})

// 导出 SDK 实例和 SDK 本身
export { EMClient, websdk as EMSDK }

// 默认导出
export default EMClient
