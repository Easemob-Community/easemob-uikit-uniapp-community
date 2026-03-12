import App from './App'

// #ifdef MP-WEIXIN
// Polyfill for util module used by Easemob-chat SDK
if (typeof global === 'undefined') {
  var global = Function('return this')() || (typeof window !== 'undefined' ? window : {})
}
if (!global.util) {
  global.util = {
    inherits: function(ctor, superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    },
    inspect: function(obj) {
      return JSON.stringify(obj)
    },
    isArray: function(obj) {
      return Array.isArray(obj)
    },
    isObject: function(obj) {
      return typeof obj === 'object' && obj !== null
    },
    toObject: function(obj) {
      if (obj === null || obj === undefined) {
        return {}
      }
      if (typeof obj === 'object') {
        return obj
      }
      try {
        return JSON.parse(obj)
      } catch (e) {
        return {}
      }
    }
  }
}
// #endif

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false

// 引入 ChatUIKit
import ChatUIKit, { store } from './ChatUIKit'
import { t, i18n } from './ChatUIKit/locales'

// 提前初始化 i18n（登录页等需要在 ChatUIKit 初始化前使用 $t）
i18n.init()

// 将 ChatUIKit 挂载到 Vue 原型
Vue.prototype.$ChatUIKit = ChatUIKit

// 挂载国际化方法
Vue.prototype.$t = t

App.mpType = 'app'
const app = new Vue({
  store,
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif
