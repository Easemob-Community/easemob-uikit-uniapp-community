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
    totalUnreadCount: 0,
    // 静音会话映射
    muteConvsMap: {}
  },

  getters: {
    // 获取排序后的会话列表（按最后消息时间倒序）
    sortedConversationList: state => {
      return [...state.conversationList].sort((a, b) => {
        const timeA = (a.lastMessage && a.lastMessage.time) || 0
        const timeB = (b.lastMessage && b.lastMessage.time) || 0
        return timeB - timeA
      })
    },
    
    // 获取指定会话
    getConversationById: state => id => {
      return state.conversationList.find(item => item.conversationId === id)
    },
    
    // 获取会话静音状态
    getConversationMuteStatus: state => id => {
      return !!state.muteConvsMap[id]
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
    
    MOVE_CONVERSATION_TO_TOP(state, conversationId) {
      const index = state.conversationList.findIndex(
        item => item.conversationId === conversationId
      )
      if (index > -1) {
        const [conv] = state.conversationList.splice(index, 1)
        state.conversationList.unshift(conv)
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
    },
    
    SET_CONVERSATION_MUTE(state, { conversationId, isMute }) {
      if (isMute) {
        Vue.set(state.muteConvsMap, conversationId, true)
      } else {
        Vue.delete(state.muteConvsMap, conversationId)
      }
    }
  },

  actions: {
    // 从服务器获取会话列表
    async getServerConversations({ commit, rootState }) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn) return

      commit('SET_LOADING', true)
      
      try {
        const res = await chatConn.getServerConversations({
          pageSize: 50,
          cursor: '',
          includeEmptyConversations: true
        })
        console.log('[ConversationStore] getServerConversations res:', res)
        
        // SDK 返回标准格式：conversations 数组
        const conversations = (res.data && res.data.conversations) || []
        
        // 处理会话数据，适配 UI 格式
        const formattedList = conversations.map(item => ({
          conversationId: item.conversationId,
          conversationType: item.conversationType,
          name: item.conversationName || item.conversationId,
          avatar: item.conversationAvatar || '',
          isPinned: item.isPinned || false,
          pinnedTime: item.pinnedTime,
          atType: item.atType || 'NONE',
          lastMessage: item.lastMessage ? {
            id: item.lastMessage.id,
            type: item.lastMessage.type,
            msg: (item.lastMessage.body && item.lastMessage.body.msg) || item.lastMessage.msg || '',
            time: item.lastMessage.time,
            from: item.lastMessage.from
          } : null,
          unReadCount: item.unReadCount || 0
        }))
        console.log('[ConversationStore] formattedList:', formattedList)

        commit('SET_CONVERSATION_LIST', formattedList)
        
        // 计算总未读数
        const totalUnread = formattedList.reduce((sum, item) => sum + (item.unReadCount || 0), 0)
        commit('SET_TOTAL_UNREAD_COUNT', totalUnread)
        
      } catch (error) {
        console.error('获取会话列表失败:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // 删除会话
    async deleteConversation({ commit, rootState }, { conversationId, conversationType }) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn) return

      try {
        await chatConn.deleteConversation({
          channel: conversationId,
          chatType: conversationType,
          deleteRoam: true
        })
        
        commit('REMOVE_CONVERSATION', conversationId)
      } catch (error) {
        console.error('删除会话失败:', error)
        uni.showToast({ title: '删除失败', icon: 'none' })
      }
    },

    // 标记会话已读
    async markConversationAsRead({ commit, rootState }, conversation) {
      const chatConn = rootState.conn.chatConn
      const chatSDK = rootState.conn.chatSDK
      if (!chatConn || !chatSDK) return

      try {
        // 使用 channel 类型消息发送已读回执
        const option = {
          type: 'channel',
          chatType: conversation.conversationType, // singleChat 或 groupChat
          to: conversation.conversationId
        }
        const msg = chatSDK.message.create(option)
        await chatConn.send(msg)
        
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
    },
    
    // 设置会话静音状态
    async setSilentModeForConversation({ commit, rootState }, { conversationId, conversationType, isMute }) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn) return

      // 转换 conversationType 为 SDK 需要的格式
      const type = conversationType === 'singleChat' ? 'chat' : 'groupchat'

      try {
        if (isMute) {
          await chatConn.setSilentModeForConversation({
            conversationId,
            type,
            options: { paramType: 0, remindType: 'NONE' }
          })
        } else {
          await chatConn.clearRemindTypeForConversation({
            conversationId,
            type
          })
        }
        
        commit('SET_CONVERSATION_MUTE', { conversationId, isMute })
      } catch (error) {
        console.error('设置静音状态失败:', error)
      }
    },
    
    // 置顶/取消置顶会话
    async pinConversation({ commit, rootState }, { conversationId, conversationType, isPinned }) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn) return

      try {
        if (isPinned) {
          await chatConn.pinConversation({
            conversationId,
            conversationType,
            isPinned: true
          })
        } else {
          await chatConn.pinConversation({
            conversationId,
            conversationType,
            isPinned: false
          })
        }
        
        commit('UPDATE_CONVERSATION', {
          conversationId,
          updates: { isPinned, pinnedTime: isPinned ? Date.now() : undefined }
        })
      } catch (error) {
        console.error('设置置顶状态失败:', error)
      }
    }
  }
}
