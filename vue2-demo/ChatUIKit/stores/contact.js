// 联系人状态管理
import Vue from 'vue'

export default {
  namespaced: true,

  state: {
    // 联系人列表
    contacts: [],
    // 好友申请通知信息
    contactsNoticeInfo: {
      list: [],
      unReadCount: 0
    },
    // 当前查看的用户信息
    viewedUserInfo: null
  },

  getters: {
    // 获取联系人列表
    getContacts: state => state.contacts,
    
    // 获取联系人数量
    getContactCount: state => state.contacts.length,
    
    // 获取好友申请列表
    getContactsNoticeList: state => state.contactsNoticeInfo.list,
    
    // 获取好友申请未读数
    getContactsNoticeUnreadCount: state => {
      const actualUnreadCount = state.contactsNoticeInfo.list.filter(
        item => item.ext === 'invited'
      ).length
      return actualUnreadCount
    },
    
    // 根据ID查找联系人
    getContactById: state => userId => {
      return state.contacts.find(contact => contact.userId === userId)
    },
    
    // 检查是否已是好友
    isContact: state => userId => {
      return state.contacts.some(contact => contact.userId === userId)
    }
  },

  mutations: {
    SET_CONTACTS(state, contacts) {
      state.contacts = contacts
    },
    
    ADD_CONTACT(state, contact) {
      const exists = state.contacts.find(c => c.userId === contact.userId)
      if (!exists) {
        state.contacts.push(contact)
      }
    },
    
    REMOVE_CONTACT(state, userId) {
      const index = state.contacts.findIndex(c => c.userId === userId)
      if (index > -1) {
        state.contacts.splice(index, 1)
      }
    },
    
    // 设置好友申请通知信息
    SET_CONTACTS_NOTICE_INFO(state, info) {
      state.contactsNoticeInfo = { ...state.contactsNoticeInfo, ...info }
    },
    
    // 添加好友申请通知
    ADD_CONTACT_NOTICE(state, notice) {
      const exists = state.contactsNoticeInfo.list.some(
        item => item.from === notice.from
      )
      if (exists) {
        state.contactsNoticeInfo.list = state.contactsNoticeInfo.list.filter(
          item => item.from !== notice.from
        )
      }
      state.contactsNoticeInfo.list.unshift(notice)
      if (notice.ext === 'invited') {
        state.contactsNoticeInfo.unReadCount++
      }
    },
    
    // 移除好友申请通知
    REMOVE_CONTACT_NOTICE(state, from) {
      const index = state.contactsNoticeInfo.list.findIndex(
        item => item.from === from
      )
      if (index > -1) {
        state.contactsNoticeInfo.list.splice(index, 1)
        state.contactsNoticeInfo.unReadCount = Math.max(
          0,
          state.contactsNoticeInfo.unReadCount - 1
        )
      }
    },
    
    // 清空好友申请未读数
    CLEAR_CONTACT_NOTICE_UNREAD(state) {
      state.contactsNoticeInfo.unReadCount = 0
    },
    
    // 重置好友申请通知
    RESET_CONTACT_NOTICE(state) {
      state.contactsNoticeInfo = { list: [], unReadCount: 0 }
    },
    
    // 设置当前查看的用户信息
    SET_VIEWED_USER_INFO(state, info) {
      state.viewedUserInfo = info
    }
  },

  actions: {
    // 从服务器获取联系人列表
    async getContactsFromServer({ commit, rootState }) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn) {
        console.warn('[ContactStore] chatConn is null, cannot get contacts')
        return
      }

      try {
        console.log('[ContactStore] Fetching contacts from server...')
        const res = await chatConn.getContacts()
        console.log('[ContactStore] getContacts response:', res)
        const contacts = (res.data || []).map(userId => ({
          userId,
          name: userId
        }))
        console.log('[ContactStore] Parsed contacts:', contacts)
        commit('SET_CONTACTS', contacts)
        return contacts
      } catch (error) {
        console.error('[ContactStore] 获取联系人列表失败:', error)
        throw error
      }
    },
    
    // 添加联系人
    async addContact({ commit, rootState }, userId) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn) return

      try {
        await chatConn.addContact(userId, '请求添加好友')
        commit('ADD_CONTACT', { userId, name: userId })
      } catch (error) {
        console.error('添加联系人失败:', error)
        throw error
      }
    },
    
    // 删除联系人
    async deleteContact({ commit, rootState }, userId) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn) return

      try {
        await chatConn.deleteContact(userId)
        commit('REMOVE_CONTACT', userId)
      } catch (error) {
        console.error('删除联系人失败:', error)
        throw error
      }
    },
    
    // 接受好友申请
    async acceptContactInvite({ commit, rootState }, userId) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn) return

      try {
        await chatConn.acceptContactInvite(userId)
        commit('REMOVE_CONTACT_NOTICE', userId)
        commit('ADD_CONTACT', { userId, name: userId })
      } catch (error) {
        console.error('接受好友申请失败:', error)
        throw error
      }
    },
    
    // 拒绝好友申请
    async declineContactInvite({ commit, rootState }, userId) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn) return

      try {
        await chatConn.declineContactInvite(userId)
        commit('REMOVE_CONTACT_NOTICE', userId)
      } catch (error) {
        console.error('拒绝好友申请失败:', error)
        throw error
      }
    }
  }
}
