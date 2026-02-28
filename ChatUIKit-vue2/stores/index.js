import Vue from 'vue'
import Vuex from 'vuex'
import conn from './conn'
import conversation from './conversation'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    conn,
    conversation
  }
})

// 导出模块方便单独引用
export { conn, conversation }
