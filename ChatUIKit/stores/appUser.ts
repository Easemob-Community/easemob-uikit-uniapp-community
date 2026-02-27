/**
 * 用户信息和在线状态管理 Store
 * 原 MobX 类：AppUserStore
 * 
 * 重构优化：
 * 1. Map → 对象（更好的 Vue 响应式支持）
 * 2. 移除 autorun，使用 computed 自动追踪
 * 3. 使用 getters 缓存用户信息
 */

import { defineStore } from 'pinia'
import type { Chat, PresenceInfo, UserInfoWithPresence } from '../types/index'
import { useConnStore } from './conn'
import { useConfigStore } from './config'
import { logger } from '../log'

interface AppUserState {
  /** 用户信息映射表 */
  userInfoMap: Record<string, Chat.UpdateOwnUserInfoParams>
  /** 用户在线状态映射表 */
  userPresenceMap: Record<string, PresenceInfo>
}

export const useAppUserStore = defineStore('appUser', {
  state: (): AppUserState => ({
    userInfoMap: {},
    userPresenceMap: {}
  }),

  getters: {
    /**
     * 获取用户信息（带默认值）
     * 优化：自动返回带默认 name 的对象
     */
    getUserInfo: (state) => (userId: string): UserInfoWithPresence => {
      const userInfo = state.userInfoMap[userId]
      const presenceInfo = state.userPresenceMap[userId]
      return {
        name: userInfo?.nickname || userId,
        nickname: userInfo?.nickname,
        avatar: userInfo?.avatarurl || '',
        sign: userInfo?.sign || '',
        presenceExt: presenceInfo?.presenceExt,
        isOnline: presenceInfo?.isOnline
      }
    },

    /**
     * 获取当前登录用户信息
     */
    getSelfUserInfo: (state) => (): UserInfoWithPresence => {
      const connStore = useConnStore()
      const userId = connStore.getChatConn().user
      const userInfo = state.userInfoMap[userId]
      const presenceInfo = state.userPresenceMap[userId]
      return {
        name: userInfo?.nickname || userId,
        nickname: userInfo?.nickname,
        avatar: userInfo?.avatarurl || '',
        sign: userInfo?.sign || '',
        presenceExt: presenceInfo?.presenceExt,
        isOnline: presenceInfo?.isOnline
      }
    },

    /**
     * 获取用户在线状态
     */
    getUserPresence: (state) => (userId: string): PresenceInfo | undefined => {
      return state.userPresenceMap[userId]
    },

    /**
     * 检查是否已缓存用户信息
     */
    hasUserInfo: (state) => (userId: string): boolean => {
      return !!state.userInfoMap[userId]
    }
  },

  actions: {
    /**
     * 从服务器获取用户属性信息
     * 优化：只获取未缓存的用户
     */
    async getUsersInfoFromServer(props: { userIdList: string[] }) {
      const { userIdList = [] } = props
      const configStore = useConfigStore()
      
      logger.info('[AppUserStore] Getting users info from server for:', userIdList)

      if (configStore.getFeatureConfig().useUserInfo === false) {
        logger.warn('[AppUserStore] User info feature is disabled')
        return {}
      }

      if (userIdList.length === 0) {
        logger.warn('[AppUserStore] Empty user list, resolving')
        return {}
      }

      // 过滤已缓存的用户ID
      const fetchUserIds = userIdList.filter(userId => !this.userInfoMap[userId])

      if (fetchUserIds.length === 0) {
        logger.info('[AppUserStore] All users info already in cache')
        return {}
      }

      try {
        const connStore = useConnStore()
        const res = await connStore.getChatConn().fetchUserInfoById(fetchUserIds)
        logger.info('[AppUserStore] Successfully fetched users info:', res)
        
        if (res.data) {
          Object.entries(res.data).forEach(([key, value]) => {
            this.setUserInfo(key, value as Chat.UpdateOwnUserInfoParams)
          })
        }
        return res
      } catch (e) {
        logger.error('[AppUserStore] Failed to fetch users info:', e)
        throw e
      }
    },

    /**
     * 从服务器获取用户在线状态
     */
    async getUsersPresenceFromServer(props: { userIdList: string[] }) {
      logger.info('[AppUserStore] Getting users presence from server for:', props.userIdList)
      
      try {
        const connStore = useConnStore()
        const res = await connStore.getChatConn().getPresenceStatus({ 
          usernames: props.userIdList 
        })
        
        logger.info('[AppUserStore] Successfully got presence status:', res)
        
        res?.data?.result.forEach((item: Chat.SubscribePresence) => {
          let isOnline = false
          if (
            item.status &&
            typeof item.status === 'object' &&
            !Array.isArray(item.status) &&
            Object.values(item.status).indexOf('1') > -1
          ) {
            isOnline = true
          }
          this.setUserPresence(item.uid, {
            presenceExt: item.ext,
            isOnline
          })
        })
      } catch (e) {
        logger.error('[AppUserStore] Failed to get presence status:', e)
      }
    },

    /**
     * 订阅指定用户的在线状态
     */
    async subscribePresence(props: { userIdList: string[] }) {
      logger.info('[AppUserStore] Subscribing to presence for users:', props.userIdList)
      const connStore = useConnStore()
      return connStore.getChatConn().subscribePresence({
        usernames: props.userIdList,
        expiry: 86400
      })
    },

    /**
     * 取消订阅指定用户的在线状态
     */
    async unsubscribePresence(props: { userIdList: string[] }) {
      logger.info('[AppUserStore] Unsubscribing from presence for users:', props.userIdList)
      const connStore = useConnStore()
      return connStore.getChatConn().unsubscribePresence({
        usernames: props.userIdList
      })
    },

    /**
     * 发布自定义在线状态
     */
    async publishPresence(props: { presenceExt: string }) {
      logger.info('[AppUserStore] Publishing presence with ext:', props.presenceExt)
      const connStore = useConnStore()
      return connStore.getChatConn().publishPresence({
        description: props.presenceExt
      })
    },

    /**
     * 设置用户属性信息
     */
    setUserInfo(userId: string, userInfo: Chat.UpdateOwnUserInfoParams) {
      logger.info('[AppUserStore] Setting user info for:', userId, userInfo)
      // Vue 响应式：直接赋值即可
      this.userInfoMap[userId] = userInfo
    },

    /**
     * 更新当前用户信息
     */
    async updateUserInfo(params: Chat.UpdateOwnUserInfoParams) {
      logger.info('[AppUserStore] Updating user info:', params)
      
      try {
        const connStore = useConnStore()
        const res = await connStore.getChatConn().updateUserInfo(params)
        logger.info('[AppUserStore] Successfully updated user info:', res)
        
        const userId = connStore.getChatConn().user
        this.setUserInfo(userId, res.data || {})
        return res
      } catch (e) {
        logger.error('[AppUserStore] Failed to update user info:', e)
        throw e
      }
    },

    /**
     * 设置用户在线状态
     */
    setUserPresence(userId: string, presence: PresenceInfo) {
      logger.info('[AppUserStore] Setting presence for user:', userId, presence)
      this.userPresenceMap[userId] = presence
    },

    /**
     * 清空所有用户数据
     */
    clear() {
      logger.info('[AppUserStore] Clearing all user info')
      this.userInfoMap = {}
      this.userPresenceMap = {}
    }
  }
})
