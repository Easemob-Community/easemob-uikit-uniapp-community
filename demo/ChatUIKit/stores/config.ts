/**
 * 配置管理 Store
 * 原 MobX 类：ConfigStore
 * 
 * 重构优化：
 * 1. 使用 Pinia state 替代 makeAutoObservable
 * 2. 主题和功能配置统一管理
 */

import { defineStore } from 'pinia'
import type { FeatureConfig, ThemeConfig } from '../configType'
import { ASSETS_URL } from '../const/index'

interface ConfigState {
  themeConfig: ThemeConfig
  featureConfig: FeatureConfig
}

// 默认主题配置
const defaultThemeConfig: ThemeConfig = {
  avatarShape: 'circle' // circle | square
}

// 默认功能配置（全部开启）
const defaultFeatureConfig: FeatureConfig = {
  // 输入区域功能
  inputVoice: true,
  inputEmoji: true,
  inputMention: true,
  inputQuote: true,
  inputEdit: true,
  inputImage: true,
  inputAudio: true,
  inputVideo: true,
  inputFile: true,
  
  // 消息功能
  useUserInfo: true,
  usePresence: true,
  messageStatus: true,
  
  // 消息操作功能
  copyMessage: true,
  deleteMessage: true,
  recallMessage: true,
  editMessage: true,
  replyMessage: true,
  
  // 会话功能
  pinConversation: true,
  muteConversation: true,
  deleteConversation: true,
  
  // 其他功能
  userCard: true,
  isDebug: false
}

export const useConfigStore = defineStore('config', {
  state: (): ConfigState => ({
    themeConfig: { ...defaultThemeConfig },
    featureConfig: { ...defaultFeatureConfig }
  }),

  getters: {
    /**
     * 获取主题配置
     */
    getThemeConfig: (state) => state.themeConfig,

    /**
     * 获取功能配置
     */
    getFeatureConfig: (state) => state.featureConfig,

    /**
     * 获取资源URL
     */
    getAssetsUrl: () => ASSETS_URL
  },

  actions: {
    /**
     * 设置主题配置
     */
    setThemeConfig(config: Partial<ThemeConfig>) {
      this.themeConfig = { ...this.themeConfig, ...config }
    },

    /**
     * 设置功能配置
     */
    setFeatureConfig(config: Partial<FeatureConfig>) {
      this.featureConfig = { ...this.featureConfig, ...config }
    },

    /**
     * 隐藏指定功能
     */
    hideFeature(features: Array<keyof FeatureConfig>) {
      features.forEach(feature => {
        (this.featureConfig as Record<string, boolean>)[feature] = false
      })
    },

    /**
     * 显示指定功能
     */
    showFeature(features: Array<keyof FeatureConfig>) {
      features.forEach(feature => {
        (this.featureConfig as Record<string, boolean>)[feature] = true
      })
    },

    /**
     * 重置为默认配置
     */
    reset() {
      this.themeConfig = { ...defaultThemeConfig }
      this.featureConfig = { ...defaultFeatureConfig }
    }
  }
})
