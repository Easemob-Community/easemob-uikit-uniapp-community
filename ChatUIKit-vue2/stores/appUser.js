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
      console.log('[AppUserStore] getSelfUserInfo called, userId:', userId)
      if (!userId) {
        console.warn('[AppUserStore] No userId, returning default')
        return { name: '', nickname: '', avatar: '', sign: '', presenceExt: '', isOnline: false }
      }
      const userInfo = state.userMap[userId]
      const presenceInfo = state.userPresenceMap[userId]
      console.log('[AppUserStore] userInfo:', userInfo)
      console.log('[AppUserStore] presenceInfo from userPresenceMap:', presenceInfo)
      console.log('[AppUserStore] userPresenceMap keys:', Object.keys(state.userPresenceMap))
      // 合并 userMap 中的用户信息和 userPresenceMap 中的 presence 状态
      const result = {
        name: userInfo?.nickname || userId,
        nickname: userInfo?.nickname || '',
        avatar: userInfo?.avatarurl || userInfo?.avatar || '',
        sign: userInfo?.sign || '',
        presenceExt: presenceInfo?.presenceExt || '',
        isOnline: presenceInfo?.isOnline || false
      }
      console.log('[AppUserStore] getSelfUserInfo returning:', result)
      return result
    }
  },

  mutations: {
    SET_USER_INFO(state, { userId, info }) {
      Vue.set(state.userMap, userId, info)
    },
    
    SET_USER_PRESENCE(state, { userId, presence }) {
      console.log('[AppUserStore] SET_USER_PRESENCE mutation:', { userId, presence })
      console.log('[AppUserStore] Before - userPresenceMap:', JSON.stringify(state.userPresenceMap))
      Vue.set(state.userPresenceMap, userId, presence)
      console.log('[AppUserStore] After - userPresenceMap:', JSON.stringify(state.userPresenceMap))
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
    
    // 获取当前用户的在线状态
    async getSelfPresenceFromServer({ commit, rootState }) {
      const chatConn = rootState.conn.chatConn
      console.log('[AppUserStore] getSelfPresenceFromServer called, chatConn:', chatConn?.user)
      if (!chatConn || !chatConn.user) {
        console.warn('[AppUserStore] chatConn or user is null, skipping')
        return
      }
      
      try {
        console.log('[AppUserStore] Calling getPresenceStatus for:', [chatConn.user])
        const res = await chatConn.getPresenceStatus({
          usernames: [chatConn.user]
        })
        
        console.log('[AppUserStore] getPresenceStatus response:', JSON.stringify(res))
        
        if (res.data && res.data.result && res.data.result.length > 0) {
          const presenceData = res.data.result[0]
          console.log('[AppUserStore] presenceData:', JSON.stringify(presenceData))
          console.log('[AppUserStore] presenceData.uid:', presenceData.uid)
          console.log('[AppUserStore] presenceData.ext:', presenceData.ext)
          console.log('[AppUserStore] presenceData.status:', presenceData.status)
          
          let isOnline = false
          // 检查状态是否包含在线标记
          if (
            presenceData.status &&
            typeof presenceData.status === 'object' &&
            !Array.isArray(presenceData.status)
          ) {
            const statusValues = Object.values(presenceData.status)
            console.log('[AppUserStore] statusValues:', statusValues)
            console.log('[AppUserStore] statusValues.indexOf("1"):', statusValues.indexOf('1'))
            if (statusValues.indexOf('1') > -1) {
              isOnline = true
            }
          }
          
          console.log('[AppUserStore] Calculated isOnline:', isOnline)
          
          // 使用 SET_USER_PRESENCE 存储到 userPresenceMap
          commit('SET_USER_PRESENCE', {
            userId: chatConn.user,
            presence: {
              presenceExt: presenceData.ext || '',
              isOnline: isOnline
            }
          })
          console.log('[AppUserStore] Self presence loaded:', { userId: chatConn.user, presenceExt: presenceData.ext, isOnline })
        } else {
          console.warn('[AppUserStore] No presence data in response')
        }
      } catch (error) {
        console.error('[AppUserStore] 获取在线状态失败:', error)
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
