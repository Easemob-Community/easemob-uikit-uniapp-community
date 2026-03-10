// 配置中心 Store - 管理主题、功能开关等全局配置

// 默认配置
const defaultConfig = {
  // 语言配置
  language: 'zh-CN',
  
  // 主题配置
  theme: {
    primaryColor: '#009DFF', // 主题色
    secondaryColor: '#F2F2F2', // 次要色
    backgroundColor: '#FFFFFF', // 背景色
    textColor: '#333333', // 主文字颜色
    secondaryTextColor: '#999999', // 次要文字颜色
    borderColor: '#E5E5E5', // 边框颜色
    errorColor: '#FF4D4F', // 错误色
    successColor: '#52C41A', // 成功色
    warningColor: '#FAAD14' // 警告色
  },
  
  // 功能开关
  features: {
    // 消息功能
    message: {
      enableImageMessage: true, // 启用图片消息
      enableAudioMessage: true, // 启用语音消息
      enableVideoMessage: true, // 启用视频消息
      enableFileMessage: true, // 启用文件消息
      enableLocationMessage: false, // 启用位置消息
      enableCustomMessage: true, // 启用自定义消息
      enableCombineMessage: true, // 启用合并转发消息
      enableMessageReaction: false, // 启用消息表情回复
      enableMessageTranslation: false, // 启用消息翻译
      enableMessageEdit: false, // 启用消息编辑
      enableMessageReply: true, // 启用消息引用回复
      enableMessageRecall: true, // 启用消息撤回
      enableTypingIndicator: true, // 启用正在输入提示
      enableReadReceipt: true // 启用已读回执
    },
    
    // 群组功能
    group: {
      enableCreateGroup: true, // 允许创建群组
      enableGroupInvite: true, // 允许邀请入群
      enableGroupKick: true, // 允许踢人
      enableGroupMute: true, // 允许禁言
      enableGroupAdmin: true, // 启用群管理员
      enableGroupAnnouncement: true, // 启用群公告
      enableGroupFile: false, // 启用群文件
      enableGroupAlbum: false // 启用群相册
    },
    
    // 联系人功能
    contact: {
      enableAddContact: true, // 允许添加好友
      enableDeleteContact: true, // 允许删除好友
      enableBlockContact: true, // 允许拉黑好友
      enableContactRemark: true // 允许设置备注
    },
    
    // 通话功能
    call: {
      enableAudioCall: false, // 启用音频通话
      enableVideoCall: false // 启用视频通话
    }
  },
  
  // 聊天设置
  chat: {
    enableSound: true, // 启用消息提示音
    enableVibration: true, // 启用震动
    fontSize: 'medium', // 字体大小: small, medium, large
    messagePageSize: 20, // 每页加载消息数
    enableAutoDownload: true, // 自动下载缩略图
    maxFileSize: 100 * 1024 * 1024, // 最大文件大小 100MB
    imageCompression: true, // 图片压缩
    videoCompression: true // 视频压缩
  },
  
  // 会话列表设置
  conversation: {
    showOnlineStatus: true, // 显示在线状态
    showUnreadCount: true, // 显示未读数
    enableSwipeDelete: true, // 启用侧滑删除
    enablePinConversation: true, // 允许置顶会话
    enableDoNotDisturb: true // 允许消息免打扰
  },
  
  // 隐私设置
  privacy: {
    allowStrangerMessage: false, // 允许陌生人消息
    allowSearchByPhone: true, // 允许通过手机号搜索
    allowSearchById: true, // 允许通过ID搜索
    showLastSeen: true, // 显示最后在线时间
    showReadReceipt: true // 显示已读回执
  }
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

// 合并配置
function mergeConfig(defaults, custom) {
  if (!custom) return defaults
  const result = JSON.parse(JSON.stringify(defaults))
  
  function deepMerge(target, source) {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key] || typeof target[key] !== 'object') {
            target[key] = {}
          }
          deepMerge(target[key], source[key])
        } else {
          target[key] = source[key]
        }
      }
    }
  }
  
  deepMerge(result, custom)
  return result
}

// Config Store
const config = {
  namespaced: true,
  
  state: {
    config: {},
    initialized: false
  },
  
  getters: {
    // 获取完整配置
    getConfig: (state) => state.config,
    
    // 获取当前语言
    getLanguage: (state) => state.config.language || 'zh-CN',
    
    // 获取支持的语言列表
    getSupportedLanguages: (state) => state.config.supportedLanguages || defaultConfig.supportedLanguages,
    
    // 获取主题配置
    getTheme: (state) => state.config.theme || defaultConfig.theme,
    
    // 获取主题色
    getPrimaryColor: (state) => {
      return (state.config.theme && state.config.theme.primaryColor) || defaultConfig.theme.primaryColor
    },
    
    // 获取功能开关
    getFeatures: (state) => state.config.features || defaultConfig.features,
    
    // 检查功能是否启用
    isFeatureEnabled: (state) => (path) => {
      const keys = path.split('.')
      let value = state.config.features
      for (const key of keys) {
        if (value == null) return false
        value = value[key]
      }
      return value === true
    },
    
    // 获取聊天设置
    getChatConfig: (state) => state.config.chat || defaultConfig.chat,
    
    // 获取会话设置
    getConversationConfig: (state) => state.config.conversation || defaultConfig.conversation,
    
    // 获取隐私设置
    getPrivacyConfig: (state) => state.config.privacy || defaultConfig.privacy,
    
    // 是否初始化完成
    isInitialized: (state) => state.initialized
  },
  
  mutations: {
    // 初始化配置
    INIT_CONFIG(state, config) {
      state.config = config
      state.initialized = true
    },
    
    // 更新主题
    UPDATE_THEME(state, theme) {
      state.config.theme = { ...state.config.theme, ...theme }
      saveConfigToStorage(state.config)
    },
    
    // 更新主题色
    UPDATE_PRIMARY_COLOR(state, color) {
      if (!state.config.theme) {
        state.config.theme = {}
      }
      state.config.theme.primaryColor = color
      saveConfigToStorage(state.config)
    },
    
    // 更新功能开关
    UPDATE_FEATURE(state, { path, enabled }) {
      const keys = path.split('.')
      let target = state.config.features
      for (let i = 0; i < keys.length - 1; i++) {
        if (!target[keys[i]]) {
          target[keys[i]] = {}
        }
        target = target[keys[i]]
      }
      target[keys[keys.length - 1]] = enabled
      saveConfigToStorage(state.config)
    },
    
    // 更新聊天设置
    UPDATE_CHAT_CONFIG(state, chatConfig) {
      state.config.chat = { ...state.config.chat, ...chatConfig }
      saveConfigToStorage(state.config)
    },
    
    // 更新会话设置
    UPDATE_CONVERSATION_CONFIG(state, convConfig) {
      state.config.conversation = { ...state.config.conversation, ...convConfig }
      saveConfigToStorage(state.config)
    },
    
    // 更新隐私设置
    UPDATE_PRIVACY_CONFIG(state, privacyConfig) {
      state.config.privacy = { ...state.config.privacy, ...privacyConfig }
      saveConfigToStorage(state.config)
    },
    
    // 更新语言
    UPDATE_LANGUAGE(state, language) {
      state.config.language = language
      saveConfigToStorage(state.config)
    },
    
    // 更新完整配置
    UPDATE_CONFIG(state, config) {
      state.config = mergeConfig(state.config, config)
      saveConfigToStorage(state.config)
    },
    
    // 重置为默认配置
    RESET_CONFIG(state) {
      state.config = JSON.parse(JSON.stringify(defaultConfig))
      saveConfigToStorage(state.config)
    }
  },
  
  actions: {
    // 初始化配置
    initConfig({ commit }) {
      const storedConfig = loadConfigFromStorage()
      const mergedConfig = mergeConfig(defaultConfig, storedConfig)
      commit('INIT_CONFIG', mergedConfig)
    },
    
    // 设置主题
    setTheme({ commit }, theme) {
      commit('UPDATE_THEME', theme)
    },
    
    // 设置主题色
    setPrimaryColor({ commit }, color) {
      commit('UPDATE_PRIMARY_COLOR', color)
    },
    
    // 设置功能开关
    setFeature({ commit }, { path, enabled }) {
      commit('UPDATE_FEATURE', { path, enabled })
    },
    
    // 批量设置功能开关
    setFeatures({ commit }, features) {
      commit('UPDATE_CONFIG', { features })
    },
    
    // 设置聊天配置
    setChatConfig({ commit }, chatConfig) {
      commit('UPDATE_CHAT_CONFIG', chatConfig)
    },
    
    // 设置会话配置
    setConversationConfig({ commit }, convConfig) {
      commit('UPDATE_CONVERSATION_CONFIG', convConfig)
    },
    
    // 设置隐私配置
    setPrivacyConfig({ commit }, privacyConfig) {
      commit('UPDATE_PRIVACY_CONFIG', privacyConfig)
    },
    
    // 更新配置
    updateConfig({ commit }, config) {
      commit('UPDATE_CONFIG', config)
    },
    
    // 重置配置
    resetConfig({ commit }) {
      commit('RESET_CONFIG')
    },
    
    // 设置语言
    setLanguage({ commit }, language) {
      commit('UPDATE_LANGUAGE', language)
      // 同时更新 i18n
      const { i18n } = require('../locales/index.js')
      if (i18n) {
        i18n.setLocale(language)
      }
    }
  }
}

export default config
