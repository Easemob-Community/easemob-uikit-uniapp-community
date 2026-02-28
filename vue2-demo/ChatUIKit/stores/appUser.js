// 用户状态管理
import Vue from 'vue'

export default {
  namespaced: true,

  state: {
    // 用户信息映射
    userMap: {},
    // 当前用户信息
    selfUserInfo: {
      avatar: '',
      nickname: '',
      presenceExt: '',
      isOnline: false
    }
  },

  getters: {
    // 获取用户信息
    getUserInfo: state => userId => {
      return state.userMap[userId] || { name: userId, avatar: '' }
    },
    
    // 获取当前用户信息
    getSelfUserInfo: state => {
      return state.selfUserInfo
    }
  },

  mutations: {
    SET_USER_INFO(state, { userId, info }) {
      Vue.set(state.userMap, userId, info)
    },
    
    SET_SELF_USER_INFO(state, info) {
      state.selfUserInfo = { ...state.selfUserInfo, ...info }
    }
  },

  actions: {
    // 从服务器获取用户信息
    async getUsersInfoFromServer({ commit }, { userIdList }) {
      // 简化实现，实际应该调用 SDK
      userIdList.forEach(userId => {
        commit('SET_USER_INFO', {
          userId,
          info: { name: userId, avatar: '' }
        })
      })
    }
  }
}
