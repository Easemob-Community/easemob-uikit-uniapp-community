// 用户状态管理
import Vue from 'vue'
import { USER_AVATAR_URL } from '../const'

export default {
  namespaced: true,

  state: {
    // 用户信息映射
    userMap: {},
    // 用户在线状态映射（类似 TS 版本的 userPresenceMap）
    userPresenceMap: {},
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
    
    // 获取当前用户信息（从 userMap 中获取，兼容 TS 版本）
    getSelfUserInfo: (state, getters, rootState) => () => {
      const userId = rootState.conn.chatConn?.user
      if (!userId) {
        return { name: '', nickname: '', avatar: '', sign: '', presenceExt: '', isOnline: false }
      }
      const userInfo = state.userMap[userId]
      const presenceInfo = state.userPresenceMap[userId]
      // 合并 userMap 中的用户信息和 userPresenceMap 中的 presence 状态
      return {
        name: userInfo?.nickname || userId,
        nickname: userInfo?.nickname || '',
        avatar: userInfo?.avatarurl || userInfo?.avatar || '',
        sign: userInfo?.sign || '',
        presenceExt: presenceInfo?.presenceExt || '',
        isOnline: presenceInfo?.isOnline || false
      }
    }
  },

  mutations: {
    SET_USER_INFO(state, { userId, info }) {
      Vue.set(state.userMap, userId, info)
    },
    
    SET_USER_PRESENCE(state, { userId, presence }) {
      Vue.set(state.userPresenceMap, userId, presence)
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
    // 获取当前登录用户自己的信息
    async getSelfUserInfoFromServer({ commit, rootState }) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn || !chatConn.user) return
      
      try {
        // 使用 fetchUserInfoById 获取当前用户信息
        const res = await chatConn.fetchUserInfoById([chatConn.user])
        
        if (res.data && res.data[chatConn.user]) {
          const userInfo = res.data[chatConn.user]
          commit('SET_USER_INFO', { 
            userId: chatConn.user, 
            info: userInfo 
          })
          console.log('[AppUserStore] Self user info loaded:', userInfo)
        }
      } catch (error) {
        console.error('[AppUserStore] 获取当前用户信息失败:', error)
      }
    },
    
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
    
    // 获取当前用户的在线状态（备用，通常由 onPresenceStatusChange 事件更新）
    async getSelfPresenceFromServer({ commit, rootState }) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn || !chatConn.user) return
      
      try {
        const res = await chatConn.getPresenceStatus({
          usernames: [chatConn.user]
        })
        
        if (res.data && res.data.result && res.data.result.length > 0) {
          const presenceData = res.data.result[0]
          let isOnline = false
          if (
            presenceData.status &&
            typeof presenceData.status === 'object' &&
            !Array.isArray(presenceData.status) &&
            Object.values(presenceData.status).indexOf('1') > -1
          ) {
            isOnline = true
          }
          
          commit('SET_USER_PRESENCE', {
            userId: chatConn.user,
            presence: {
              presenceExt: presenceData.ext || '',
              isOnline: isOnline
            }
          })
        }
      } catch (error) {
        console.error('[AppUserStore] 获取在线状态失败:', error)
      }
    },
    
    // 发布在线状态（发布后会触发 onPresenceStatusChange 事件）
    async publishPresence({ commit, rootState }, { presenceExt }) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn) {
        throw new Error('SDK not initialized')
      }
      
      try {
        await chatConn.publishPresence({
          description: presenceExt
        })
        // 注：状态更新由 onPresenceStatusChange 事件回调处理，无需手动更新
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
        // 更新本地状态 - 同时更新 userMap 和 selfUserInfo
        const userId = chatConn.user
        if (userId) {
          commit('SET_USER_INFO', { 
            userId, 
            info: { nickname, avatarurl: avatar }
          })
        }
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
