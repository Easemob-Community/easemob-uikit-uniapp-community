/**
 * 联系人管理 Store
 * 原 MobX 类：ContactStore
 * 
 * 重构优化：
 * 1. 使用数组+对象混合存储，便于查找
 * 2. 递归获取用户信息逻辑优化
 */

import { defineStore } from 'pinia'
import type { ContactNotice, ContactNoticeInfo, Chat } from '../types/index'
import { useConnStore } from './conn'
import { useAppUserStore } from './appUser'
import { logger } from '../log'

interface ContactState {
  /** 联系人列表 */
  contacts: Chat.ContactItem[]
  /** 好友申请通知信息 */
  contactsNoticeInfo: ContactNoticeInfo
  /** 当前查看的用户信息 */
  viewedUserInfo: Chat.ContactItem | null
}

export const useContactStore = defineStore('contact', {
  state: (): ContactState => ({
    contacts: [],
    contactsNoticeInfo: {
      list: [],
      unReadCount: 0
    },
    viewedUserInfo: null
  }),

  getters: {
    /**
     * 获取联系人列表
     */
    getContactList: (state) => state.contacts,

    /**
     * 获取联系人数量
     */
    getContactCount: (state) => state.contacts.length,

    /**
     * 获取好友申请列表
     */
    getContactsNoticeList: (state) => state.contactsNoticeInfo.list,

    /**
     * 获取好友申请未读数（基于实际的 invited 类型通知数量）
     */
    getContactsNoticeUnreadCount: (state) => {
      // 计算实际未处理的申请数量
      const actualUnreadCount = state.contactsNoticeInfo.list.filter(
        item => item.ext === 'invited'
      ).length
      // 如果缓存的未读数与实际不符，以实际为准
      return actualUnreadCount
    },

    /**
     * 根据ID查找联系人
     */
    getContactById: (state) => (userId: string) => {
      return state.contacts.find(contact => contact.userId === userId)
    },

    /**
     * 检查是否已是好友
     */
    isContact: (state) => (userId: string) => {
      return state.contacts.some(contact => contact.userId === userId)
    }
  },

  actions: {
    /**
     * 递归获取用户信息（分页）
     * 优化：使用 async/await 替代递归调用
     */
    async deepGetUserInfo(userIdList: string[], pageNum: number = 1) {
      const pageSize = 100
      const start = (pageNum - 1) * pageSize
      const end = pageNum * pageSize
      
      logger.info('[ContactStore] Getting user info recursively for page:', pageNum)
      
      const appUserStore = useAppUserStore()
      const currentBatch = userIdList.slice(start, end)
      
      if (currentBatch.length === 0) {
        return
      }

      try {
        await appUserStore.getUsersInfoFromServer({ userIdList: currentBatch })
        
        // 继续获取下一页
        if (userIdList.length > end) {
          await this.deepGetUserInfo(userIdList, pageNum + 1)
        }
      } catch (error) {
        logger.error('[ContactStore] Failed to get user info:', error)
      }
    },

    /**
     * 获取全部联系人
     */
    async getContacts() {
      logger.info('[ContactStore] Getting all contacts')
      
      try {
        const connStore = useConnStore()
        const res = await connStore.getChatConn.getAllContacts()
        
        if (res.data) {
          this.contacts = res.data
          // 异步获取用户信息（不阻塞）
          const userIds = res.data.map(item => item.userId)
          this.deepGetUserInfo(userIds)
          
          logger.info('[ContactStore] Successfully got contacts:', res.data.length)
        }
      } catch (error) {
        logger.error('[ContactStore] Failed to get contacts:', error)
      }
    },

    /**
     * 添加好友
     */
    async addContact(userId: string) {
      logger.info('[ContactStore] Adding contact:', userId)
      
      try {
        const connStore = useConnStore()
        const res = await connStore.getChatConn.addContact(userId, 'apply join contact')
        logger.info('[ContactStore] Successfully added contact:', userId)
        return res
      } catch (error) {
        logger.error('[ContactStore] Failed to add contact:', error)
        throw error
      }
    },

    /**
     * 删除好友
     */
    async deleteContact(userId: string) {
      logger.info('[ContactStore] Deleting contact:', userId)
      
      try {
        const connStore = useConnStore()
        const res = await connStore.getChatConn.deleteContact(userId)
        this.deleteStoreContact(userId)
        logger.info('[ContactStore] Successfully deleted contact:', userId)
        return res
      } catch (error) {
        logger.error('[ContactStore] Failed to delete contact:', error)
        throw error
      }
    },

    /**
     * 从本地删除联系人
     */
    deleteStoreContact(userId: string) {
      const index = this.contacts.findIndex(contact => contact.userId === userId)
      if (index > -1) {
        this.contacts.splice(index, 1)
      }
    },

    /**
     * 接受好友申请
     */
    async acceptContactInvite(userId: string) {
      logger.info('[ContactStore] Accepting contact:', userId)
      
      try {
        const connStore = useConnStore()
        const res = await connStore.getChatConn.acceptContactInvite(userId)
        // 移除通知
        this.removeContactNotice(userId)
        // 刷新联系人列表
        this.getContacts()
        logger.info('[ContactStore] Successfully accepted contact:', userId)
        return res
      } catch (error) {
        logger.error('[ContactStore] Failed to accept contact:', error)
        throw error
      }
    },

    /**
     * 拒绝好友申请
     */
    async declineContactInvite(userId: string) {
      logger.info('[ContactStore] Declining contact:', userId)
      
      try {
        const connStore = useConnStore()
        const res = await connStore.getChatConn.declineContactInvite(userId)
        this.removeContactNotice(userId)
        logger.info('[ContactStore] Successfully declined contact:', userId)
        return res
      } catch (error) {
        logger.error('[ContactStore] Failed to decline contact:', error)
        throw error
      }
    },

    /**
     * 添加好友申请通知
     */
    addContactNotice(notice: ContactNotice) {
      // 检查是否已存在相同 from 的通知
      const exists = this.contactsNoticeInfo.list.some(
        item => item.from === notice.from
      )
      if (exists) {
        // 如果已存在，先移除旧的
        this.contactsNoticeInfo.list = this.contactsNoticeInfo.list.filter(
          item => item.from !== notice.from
        )
      }
      
      this.contactsNoticeInfo.list.unshift(notice)
      
      // 只有 invited 类型的通知才增加未读数（新的申请）
      if (notice.ext === 'invited') {
        this.contactsNoticeInfo.unReadCount++
      }
    },

    /**
     * 移除好友申请通知
     */
    removeContactNotice(userId: string) {
      const index = this.contactsNoticeInfo.list.findIndex(
        item => item.from === userId
      )
      if (index > -1) {
        // 使用 filter 创建新数组确保响应式更新
        this.contactsNoticeInfo.list = this.contactsNoticeInfo.list.filter(
          item => item.from !== userId
        )
        this.contactsNoticeInfo.unReadCount = Math.max(
          0, 
          this.contactsNoticeInfo.unReadCount - 1
        )
      }
    },

    /**
     * 清空好友申请未读数
     */
    clearContactNoticeUnread() {
      this.contactsNoticeInfo.unReadCount = 0
    },

    /**
     * 设置当前查看的用户信息
     */
    setViewedUserInfo(userInfo: Chat.ContactItem) {
      this.viewedUserInfo = userInfo
    },

    /**
     * 清空数据
     */
    clear() {
      this.contacts = []
      this.contactsNoticeInfo = { list: [], unReadCount: 0 }
      this.viewedUserInfo = null
    }
  }
})
