import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false

// 引入 ChatUIKit
import ChatUIKit, { store } from './ChatUIKit'

// 将 ChatUIKit 挂载到 Vue 原型
Vue.prototype.$ChatUIKit = ChatUIKit

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
