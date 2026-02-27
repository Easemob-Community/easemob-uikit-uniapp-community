/**
 * Pinia Store 入口
 * 重构说明：将 MobX 迁移至 Pinia，获得更好的 Vue 生态支持和响应式体验
 */

import { createPinia } from 'pinia'

// 导出所有 store
export { useAppUserStore } from './appUser'
export { useConfigStore } from './config'
export { useConnStore } from './conn'
export { useContactStore } from './contact'
export { useConversationStore, useConversationStore as useConvStore } from './conversation'
export { useGroupStore } from './group'
export { useMessageStore } from './message'
export { useChatStore } from './chat'

// 创建 pinia 实例（在应用入口注册）
export function createStores() {
  return createPinia()
}

// 兼容旧版 ChatUIKit 单例的辅助函数
// 用于在迁移期间支持混合使用
export function initPiniaStores() {
  // 返回一个兼容旧版 ChatUIKit 接口的对象
  return {
    // 在组件中使用 useXxxStore() 替代
  }
}
