// 用户状态管理
import Vue from 'vue'
import { USER_AVATAR_URL } from '../const'

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
    },
    // 正在获取中的用户ID列表（防止重复请求）
    fetchingUserIds: new Set()
  },

  getters: {
    // 获取用户信息（兼容 TS 版本格式）
    getUserInfo: state => userId => {
      const userInfo = state.userMap[userId]
      return {
        name: userInfo?.nickname || userId,
        nickname: userInfo?.nickname || '',
        avatar: userInfo?.avatarurl || userInfo?.avatar || '',
        sign: userInfo?.sign || ''
      }
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
    },
    
    ADD_FETCHING_USER(state, userId) {
      state.fetchingUserIds.add(userId)
    },
    
    REMOVE_FETCHING_USER(state, userId) {
      state.fetchingUserIds.delete(userId)
    }
  },

  actions: {
    // 从服务器获取用户信息
    async getUsersInfoFromServer({ commit, state, rootState }, { userIdList }) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn || !userIdList || userIdList.length === 0) return
      
      // 过滤掉正在获取中的用户
      const fetchUserIds = userIdList.filter(userId => {
        if (state.fetchingUserIds.has(userId)) return false
        if (state.userMap[userId]) return false // 已缓存的不再获取
        return true
      })
      
      if (fetchUserIds.length === 0) return
      
      // 标记为正在获取
      fetchUserIds.forEach(userId => commit('ADD_FETCHING_USER', userId))
      
      try {
        const res = await chatConn.fetchUserInfoById(fetchUserIds)
        
        if (res.data) {
          Object.entries(res.data).forEach(([userId, userInfo]) => {
            commit('SET_USER_INFO', { 
              userId, 
              info: userInfo 
            })
          })
        }
      } catch (error) {
        console.error('[AppUserStore] 获取用户信息失败:', error)
      } finally {
        // 移除正在获取标记
        fetchUserIds.forEach(userId => commit('REMOVE_FETCHING_USER', userId))
      }
    },
    
    // 发布在线状态
    async publishPresence({ commit, rootState }, { presenceExt }) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn) {
        throw new Error('SDK not initialized')
      }
      
      try {
        await chatConn.publishPresence({
          description: presenceExt
        })
        // 更新本地状态
        commit('SET_SELF_USER_INFO', { presenceExt })
        return { success: true }
      } catch (error) {
        console.error('发布在线状态失败:', error)
        throw error
      }
    },
    
    // 更新用户信息
    async updateUserInfo({ commit, rootState }, { nickname, avatar }) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn) {
        throw new Error('SDK not initialized')
      }
      
      try {
        const params = {}
        if (nickname !== undefined) {
          params.nickname = nickname
        }
        if (avatar !== undefined) {
          params.avatarurl = avatar
        }
        
        await chatConn.updateUserInfo(params)
        // 更新本地状态
        commit('SET_SELF_USER_INFO', { 
          nickname,
          avatar
        })
        return { success: true }
      } catch (error) {
        console.error('更新用户信息失败:', error)
        throw error
      }
    }
  }
}
