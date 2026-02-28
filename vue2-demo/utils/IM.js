/**
 * 环信 SDK 初始化文件
 * 
 * 方案1：使用相对路径引入 node_modules（推荐，需先执行 npm install）
 * 方案2：使用本地 js_sdk 目录（备用，已复制 SDK 文件到 js_sdk/）
 */

// 方案1：从 node_modules 引入（需要 npm install）
import websdk from '../../node_modules/easemob-websdk/uniApp/Easemob-chat'

// 方案2：如果方案1报错，取消下面这行的注释，注释掉方案1
// import websdk from '../js_sdk/Easemob-chat'

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
