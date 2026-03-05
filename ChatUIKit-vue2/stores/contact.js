// 联系人状态管理
import Vue from 'vue'

export default {
  namespaced: true,

  state: {
    // 联系人列表
    contacts: []
  },

  getters: {
    // 获取联系人列表
    getContacts: state => state.contacts
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
    }
  },

  actions: {
    // 从服务器获取联系人列表
    async getContactsFromServer({ commit, rootState }) {
      const chatConn = rootState.conn.chatConn
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
    }
  }
}
