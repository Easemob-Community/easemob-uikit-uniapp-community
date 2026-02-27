import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
import { ChatUIKit } from './ChatUIKit'
export function createApp() {
	const app = createSSRApp(App)
	// 使用 ChatUIKit 创建的 pinia 实例，确保全局一致性
	const pinia = ChatUIKit.getPinia()
	app.use(pinia)
	return {
		app
	}
}
// #endif