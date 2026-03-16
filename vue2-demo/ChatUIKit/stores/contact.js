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
    REMOVE_CONTACT_NOTICE(state, userId) {
      const index = state.contactsNoticeInfo.list.findIndex(
        item => item.from === userId
      )
      if (index > -1) {
        state.contactsNoticeInfo.list = state.contactsNoticeInfo.list.filter(
          item => item.from !== userId
        )
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
    
    // 设置当前查看的用户信息
    SET_VIEWED_USER_INFO(state, userInfo) {
      state.viewedUserInfo = userInfo
    },
    
    // 清空数据
    CLEAR_CONTACTS(state) {
      state.contacts = []
      state.contactsNoticeInfo = { list: [], unReadCount: 0 }
      state.viewedUserInfo = null
    }
  },

  actions: {
    // 从服务器获取联系人列表
    async getContactsFromServer({ commit, rootGetters }) {
      const chatConn = rootGetters['conn/getChatConn']
      if (!chatConn) return

      try {
        const res = await chatConn.getContacts()
        const contacts = (res.data || []).map(userId => ({
          userId,
          name: userId
        }))
        commit('SET_CONTACTS', contacts)
        return contacts
      } catch (error) {
        console.error('获取联系人列表失败:', error)
        throw error
      }
    },
    
    // 添加联系人
    async addContact({ commit, rootGetters }, userId) {
      const chatConn = rootGetters['conn/getChatConn']
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
    async deleteContact({ commit, rootGetters }, userId) {
      const chatConn = rootGetters['conn/getChatConn']
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
    async acceptContactInvite({ commit, rootGetters, dispatch }, userId) {
      const chatConn = rootGetters['conn/getChatConn']
      if (!chatConn) return

      try {
        await chatConn.acceptContactInvite(userId)
        commit('REMOVE_CONTACT_NOTICE', userId)
        // 刷新联系人列表
        dispatch('getContactsFromServer')
        return { data: true }
      } catch (error) {
        console.error('接受好友申请失败:', error)
        throw error
      }
    },
    
    // 拒绝好友申请
    async declineContactInvite({ commit, rootGetters }, userId) {
      const chatConn = rootGetters['conn/getChatConn']
      if (!chatConn) return

      try {
        await chatConn.declineContactInvite(userId)
        commit('REMOVE_CONTACT_NOTICE', userId)
        return { data: true }
      } catch (error) {
        console.error('拒绝好友申请失败:', error)
        throw error
      }
    },
    
    // 添加好友申请通知
    addContactNotice({ commit }, notice) {
      commit('ADD_CONTACT_NOTICE', notice)
    },
    
    // 移除好友申请通知
    removeContactNotice({ commit }, userId) {
      commit('REMOVE_CONTACT_NOTICE', userId)
    },
    
    // 清空好友申请未读数
    clearContactNoticeUnread({ commit }) {
      commit('CLEAR_CONTACT_NOTICE_UNREAD')
    },
    
    // 设置当前查看的用户信息
    setViewedUserInfo({ commit }, userInfo) {
      commit('SET_VIEWED_USER_INFO', userInfo)
    },
    
    // 清空数据
    clear({ commit }) {
      commit('CLEAR_CONTACTS')
    }
  }
}
