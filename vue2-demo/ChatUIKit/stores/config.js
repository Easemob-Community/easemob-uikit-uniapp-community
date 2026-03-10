/**
 * 配置管理 Store
 * 管理主题、功能开关等全局配置
 */

import Vue from 'vue'

// 默认主题配置
const defaultThemeConfig = {
  avatarShape: 'circle' // circle | square
}

// 默认功能配置（全部开启）
const defaultFeatureConfig = {
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

// 从本地存储加载配置
function loadConfigFromStorage() {
  try {
    const stored = uni.getStorageSync('ChatUIKit_Config')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('加载配置失败:', e)
  }
  return null
}

// 保存配置到本地存储
function saveConfigToStorage(config) {
  try {
    uni.setStorageSync('ChatUIKit_Config', JSON.stringify(config))
  } catch (e) {
    console.error('保存配置失败:', e)
  }
}

export default {
  namespaced: true,
  
  state: {
    themeConfig: { ...defaultThemeConfig },
    featureConfig: { ...defaultFeatureConfig }
  },
  
  getters: {
    // 获取主题配置
    getThemeConfig: (state) => state.themeConfig,
    
    // 获取功能配置
    getFeatureConfig: (state) => state.featureConfig,
    
    // 获取头像形状
    getAvatarShape: (state) => state.themeConfig.avatarShape || 'circle'
  },
  
  mutations: {
    // 初始化配置
    INIT_CONFIG(state, config) {
      if (config.themeConfig) {
        state.themeConfig = { ...defaultThemeConfig, ...config.themeConfig }
      }
      if (config.featureConfig) {
        state.featureConfig = { ...defaultFeatureConfig, ...config.featureConfig }
      }
    },
    
    // 设置主题配置
    SET_THEME_CONFIG(state, config) {
      state.themeConfig = { ...state.themeConfig, ...config }
      saveConfigToStorage({
        themeConfig: state.themeConfig,
        featureConfig: state.featureConfig
      })
    },
    
    // 设置功能配置
    SET_FEATURE_CONFIG(state, config) {
      state.featureConfig = { ...state.featureConfig, ...config }
      saveConfigToStorage({
        themeConfig: state.themeConfig,
        featureConfig: state.featureConfig
      })
    },
    
    // 显示/隐藏指定功能
    SET_FEATURE(state, { feature, enabled }) {
      Vue.set(state.featureConfig, feature, enabled)
      saveConfigToStorage({
        themeConfig: state.themeConfig,
        featureConfig: state.featureConfig
      })
    },
    
    // 重置为默认配置
    RESET_CONFIG(state) {
      state.themeConfig = { ...defaultThemeConfig }
      state.featureConfig = { ...defaultFeatureConfig }
      saveConfigToStorage({
        themeConfig: state.themeConfig,
        featureConfig: state.featureConfig
      })
    }
  },
  
  actions: {
    // 初始化配置
    initConfig({ commit }) {
      const stored = loadConfigFromStorage()
      if (stored) {
        commit('INIT_CONFIG', stored)
      }
    },
    
    // 设置主题配置
    setThemeConfig({ commit }, config) {
      commit('SET_THEME_CONFIG', config)
    },
    
    // 设置功能配置
    setFeatureConfig({ commit }, config) {
      commit('SET_FEATURE_CONFIG', config)
    },
    
    // 设置单个功能开关
    setFeature({ commit }, { feature, enabled }) {
      commit('SET_FEATURE', { feature, enabled })
    },
    
    // 隐藏指定功能
    hideFeature({ commit, state }, features) {
      const updates = {}
      features.forEach(feature => {
        updates[feature] = false
      })
      commit('SET_FEATURE_CONFIG', updates)
    },
    
    // 显示指定功能
    showFeature({ commit, state }, features) {
      const updates = {}
      features.forEach(feature => {
        updates[feature] = true
      })
      commit('SET_FEATURE_CONFIG', updates)
    },
    
    // 重置配置
    resetConfig({ commit }) {
      commit('RESET_CONFIG')
    },
    
    // 批量更新配置（兼容初始化调用）
    updateConfig({ commit }, config) {
      if (config.themeConfig) {
        commit('SET_THEME_CONFIG', config.themeConfig)
      }
      if (config.featureConfig) {
        commit('SET_FEATURE_CONFIG', config.featureConfig)
      }
    }
  }
}
