// i18n 国际化管理

import zhCN from './zh-CN.js'
import enUS from './en-US.js'

// 支持的语言列表
const messages = {
  'zh-CN': zhCN,
  'zh': zhCN,
  'en-US': enUS,
  'en': enUS
}

// 默认语言
const DEFAULT_LOCALE = 'zh-CN'

// 存储键名
const STORAGE_KEY = 'ChatUIKit_Locale'

// 简单模板替换函数
function template(str, params = {}) {
  return str.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? params[key] : match
  })
}

// i18n 类
class I18n {
  constructor() {
    this.locale = DEFAULT_LOCALE
    this.fallbackLocale = DEFAULT_LOCALE
    this.messages = messages
  }

  /**
   * 初始化 i18n
   */
  init() {
    const stored = this.getStoredLocale()
    if (stored && this.messages[stored]) {
      this.locale = stored
    } else {
      // 尝试获取系统语言
      this.setLocaleBySystem()
    }
    console.log('[i18n] Initialized with locale:', this.locale)
  }

  /**
   * 从存储中获取语言设置
   */
  getStoredLocale() {
    try {
      return uni.getStorageSync(STORAGE_KEY)
    } catch (e) {
      return null
    }
  }

  /**
   * 保存语言设置到存储
   */
  setStoredLocale(locale) {
    try {
      uni.setStorageSync(STORAGE_KEY, locale)
    } catch (e) {
      console.error('[i18n] Failed to save locale:', e)
    }
  }

  /**
   * 根据系统语言设置
   */
  setLocaleBySystem() {
    try {
      const systemInfo = uni.getSystemInfoSync()
      const systemLang = systemInfo.language || 'zh-CN'
      
      // 匹配语言
      if (this.messages[systemLang]) {
        this.locale = systemLang
      } else if (systemLang.startsWith('zh')) {
        this.locale = 'zh-CN'
      } else if (systemLang.startsWith('en')) {
        this.locale = 'en-US'
      } else {
        this.locale = DEFAULT_LOCALE
      }
    } catch (e) {
      this.locale = DEFAULT_LOCALE
    }
  }

  /**
   * 设置当前语言
   */
  setLocale(locale) {
    if (this.messages[locale]) {
      this.locale = locale
      this.setStoredLocale(locale)
      console.log('[i18n] Locale changed to:', locale)
      return true
    }
    console.warn('[i18n] Unsupported locale:', locale)
    return false
  }

  /**
   * 获取当前语言
   */
  getLocale() {
    return this.locale
  }

  /**
   * 获取支持的语言列表
   */
  getSupportedLocales() {
    return [
      { code: 'zh-CN', name: '简体中文' },
      { code: 'en-US', name: 'English' }
    ]
  }

  /**
   * 获取翻译文本
   * @param {string} key - 键名，支持点号路径，如 'common.confirm'
   * @param {object} params - 模板参数
   * @returns {string}
   */
  t(key, params = {}) {
    const keys = key.split('.')
    let value = this.messages[this.locale]
    
    // 遍历键路径
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        value = undefined
        break
      }
    }
    
    // 如果找不到，尝试使用回退语言
    if (value === undefined && this.locale !== this.fallbackLocale) {
      value = this.messages[this.fallbackLocale]
      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = value[k]
        } else {
          value = undefined
          break
        }
      }
    }
    
    // 如果还是找不到，返回键名
    if (value === undefined) {
      console.warn(`[i18n] Translation missing for key: ${key}`)
      return key
    }
    
    // 模板替换
    if (typeof value === 'string') {
      return template(value, params)
    }
    
    return value
  }

  /**
   * 批量翻译（用于获取整个对象）
   * @param {string} prefix - 前缀路径
   * @returns {object}
   */
  tm(prefix) {
    const keys = prefix.split('.')
    let value = this.messages[this.locale]
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        value = undefined
        break
      }
    }
    
    // 尝试回退语言
    if (value === undefined && this.locale !== this.fallbackLocale) {
      value = this.messages[this.fallbackLocale]
      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = value[k]
        } else {
          value = undefined
          break
        }
      }
    }
    
    return value || {}
  }
}

// 创建单例
const i18n = new I18n()

// 导出便捷方法
export const t = (key, params) => i18n.t(key, params)
export const tm = (prefix) => i18n.tm(prefix)
export const setLocale = (locale) => i18n.setLocale(locale)
export const getLocale = () => i18n.getLocale()
export const getSupportedLocales = () => i18n.getSupportedLocales()

export { i18n }
export default i18n
