// 小程序环境 polyfill（必须在最开始）
// #ifdef MP
if (typeof global === 'undefined') {
  var global = getApp() || {}
}
if (!global.console) {
  global.console = console
}
// #endif

import App from './App'

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
