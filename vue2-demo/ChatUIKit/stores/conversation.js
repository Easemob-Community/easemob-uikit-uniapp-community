import Vue from 'vue'

// 会话列表管理
export default {
  namespaced: true,

  state: {
    // 会话列表
    conversationList: [],
    // 当前选中的会话
    currentConversation: null,
    // 是否正在加载
    loading: false,
    // 未读消息总数
    totalUnreadCount: 0
  },

  getters: {
    // 获取排序后的会话列表（按最后消息时间倒序）
    sortedConversationList: state => {
      return [...state.conversationList].sort((a, b) => {
        const timeA = a.lastMessage?.time || 0
        const timeB = b.lastMessage?.time || 0
        return timeB - timeA
      })
    },
    
    // 获取指定会话
    getConversationById: state => id => {
      return state.conversationList.find(item => item.conversationId === id)
    }
  },

  mutations: {
    SET_CONVERSATION_LIST(state, list) {
      state.conversationList = list
    },
    
    ADD_CONVERSATION(state, conversation) {
      const index = state.conversationList.findIndex(
        item => item.conversationId === conversation.conversationId
      )
      if (index > -1) {
        Vue.set(state.conversationList, index, { ...state.conversationList[index], ...conversation })
      } else {
        state.conversationList.push(conversation)
      }
    },
    
    REMOVE_CONVERSATION(state, conversationId) {
      const index = state.conversationList.findIndex(
        item => item.conversationId === conversationId
      )
      if (index > -1) {
        state.conversationList.splice(index, 1)
      }
    },
    
    UPDATE_CONVERSATION(state, { conversationId, updates }) {
      const index = state.conversationList.findIndex(
        item => item.conversationId === conversationId
      )
      if (index > -1) {
        Vue.set(state.conversationList, index, { ...state.conversationList[index], ...updates })
      }
    },
    
    SET_CURRENT_CONVERSATION(state, conversation) {
      state.currentConversation = conversation
    },
    
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    
    SET_TOTAL_UNREAD_COUNT(state, count) {
      state.totalUnreadCount = count
    }
  },

  actions: {
    // 获取会话列表
    async getConversationList({ commit, rootState }) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn) return

      commit('SET_LOADING', true)
      
      try {
        const res = await chatConn.getConversationlist()
        const list = res.data?.channels || []
        
        // 处理会话数据
        const formattedList = list.map(item => ({
          conversationId: item.channel_id,
          conversationType: item.channel_type === 'chat' ? 'singleChat' : 'groupChat',
          name: item.name || item.channel_id,
          avatar: item.avatar || '',
          lastMessage: item.lastMessage ? {
            id: item.lastMessage.id,
            type: item.lastMessage.type,
            msg: item.lastMessage.msg || item.lastMessage.body?.msg || '',
            time: item.lastMessage.time,
            from: item.lastMessage.from
          } : null,
          unReadCount: item.unread_num || 0
        }))

        commit('SET_CONVERSATION_LIST', formattedList)
        
        // 计算总未读数
        const totalUnread = formattedList.reduce((sum, item) => sum + (item.unReadCount || 0), 0)
        commit('SET_TOTAL_UNREAD_COUNT', totalUnread)
        
      } catch (error) {
        console.error('获取会话列表失败:', error)
        uni.showToast({ title: '获取会话列表失败', icon: 'none' })
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // 删除会话
    async deleteConversation({ commit, rootState }, conversation) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn) return

      try {
        await chatConn.deleteConversation({
          channel: conversation.conversationId,
          chatType: conversation.conversationType,
          deleteRoam: true
        })
        
        commit('REMOVE_CONVERSATION', conversation.conversationId)
        uni.showToast({ title: '删除成功', icon: 'success' })
      } catch (error) {
        console.error('删除会话失败:', error)
        uni.showToast({ title: '删除失败', icon: 'none' })
      }
    },

    // 标记会话已读
    async markConversationAsRead({ commit, rootState }, conversation) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn) return

      try {
        await chatConn.sendChannelAck({
          to: conversation.conversationId,
          chatType: conversation.conversationType
        })
        
        commit('UPDATE_CONVERSATION', {
          conversationId: conversation.conversationId,
          updates: { unReadCount: 0 }
        })
      } catch (error) {
        console.error('标记已读失败:', error)
      }
    },

    // 选择当前会话
    selectConversation({ commit, dispatch }, conversation) {
      commit('SET_CURRENT_CONVERSATION', conversation)
      // 标记已读
      if (conversation.unReadCount > 0) {
        dispatch('markConversationAsRead', conversation)
      }
    }
  }
}
