import Vue from 'vue'
import Vuex from 'vuex'
import conn from './conn'
import conversation from './conversation'
import group from './group'
import appUser from './appUser'
import message from './message'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    conn,
    conversation,
    group,
    appUser,
    message
  }
})

// 导出模块方便单独引用
export { conn, conversation, group, appUser, message }
