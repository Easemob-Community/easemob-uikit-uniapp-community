/**
 * 环信 SDK 初始化文件
 * 
 * 引入方式：由于 uni-app Vue2 的 npm 引入有坑
 * 需要先在 manifest.json 中开启 nodeModules: true
 * 然后使用相对路径引入 node_modules 下的文件
 */

// 使用相对路径引入 SDK（从 utils/ 到 node_modules/）
import websdk from '../../node_modules/easemob-websdk/uniApp/Easemob-chat'

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
