import Vue from 'vue'

/**
 * 深克隆对象，移除 SDK 添加的特殊原型方法
 * 解决微信小程序中 JSON.stringify 无法序列化 SDK 自定义对象（如 Long 类型）的问题
 * @param {Object} obj - 原始对象
 * @returns {Object} - 纯数据对象
 */
function cloneObject(obj) {
  if (!obj || typeof obj !== 'object') return obj
  
  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map(item => cloneObject(item))
  }
  
  // 处理 SDK 特殊对象（Long 类型等）
  // 检测特征：有 isZero 方法，或者有 low/high 属性
  if (obj.isZero || obj.toNumber || (obj.low !== undefined && obj.high !== undefined)) {
    try {
      // 转换为字符串或数字
      if (obj.toNumber) return obj.toNumber()
      if (obj.toString) return obj.toString()
      return Number(obj)
    } catch (e) {
      return String(obj)
    }
  }
  
  // 普通对象，递归克隆
  const result = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key]
      
      // 跳过函数
      if (typeof value === 'function') continue
      
      // 递归克隆
      result[key] = cloneObject(value)
    }
  }
  return result
}

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
    muteConvsMap: {},
    // 上次获取会话列表的时间戳（用于防重）
    lastFetchTime: 0
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
        // 深克隆更新内容以移除 SDK 特殊对象，避免微信小程序 JSON.stringify 错误
        const clonedUpdates = cloneObject(updates)
        Vue.set(state.conversationList, index, { ...state.conversationList[index], ...clonedUpdates })
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
    },
    
    SET_LAST_FETCH_TIME(state, time) {
      state.lastFetchTime = time
    }
  },

  actions: {
    // 从服务器获取会话列表
    async getServerConversations({ commit, state, rootGetters, dispatch }) {
      const chatConn = rootGetters['conn/getChatConn']
      if (!chatConn) return

      // 防重机制：5秒内不允许重复获取
      const now = Date.now()
      const minInterval = 5000 // 5秒间隔
      if (now - state.lastFetchTime < minInterval) {
        console.log('[ConversationStore] Skip fetch, too frequent. Last fetch:', now - state.lastFetchTime, 'ms ago')
        return
      }
      
      commit('SET_LAST_FETCH_TIME', now)
      commit('SET_LOADING', true)
      
      try {
        const res = await chatConn.getServerConversations({
          pageSize: 50,
          cursor: '',
          // includeEmptyConversations: true //是否拉取空会话
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
        
        // 收集单聊会话的用户ID，批量获取用户信息
        const userIdList = formattedList
          .filter(item => item.conversationType !== 'groupChat')
          .map(item => item.conversationId)
          .filter((id, index, arr) => arr.indexOf(id) === index) // 去重
        
        if (userIdList.length > 0) {
          console.log('[ConversationStore] Fetching user info for:', userIdList)
          dispatch('appUser/getUsersInfoFromServer', { userIdList }, { root: true })
        }
        
      } catch (error) {
        console.error('获取会话列表失败:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // 删除会话
    async deleteConversation({ commit, rootGetters }, { conversationId, conversationType }) {
      const chatConn = rootGetters['conn/getChatConn']
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
    async markConversationAsRead({ commit, rootState, rootGetters }, conversation) {
      // 使用 getter 获取 SDK，避免访问被 Vue 观察的 state
      const chatConn = rootGetters['conn/getChatConn']
      const chatSDK = rootGetters['conn/getChatSDK']
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
    async setSilentModeForConversation({ commit, rootGetters }, { conversationId, conversationType, isMute }) {
      const chatConn = rootGetters['conn/getChatConn']
      if (!chatConn) return

      try {
        // SDK 参数格式：type 需要是 'chat' 或 'groupchat'
        const type = conversationType === 'singleChat' ? 'chat' : 'groupchat'
        
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
    async pinConversation({ commit, rootGetters }, { conversationId, conversationType, isPinned }) {
      const chatConn = rootGetters['conn/getChatConn']
      if (!chatConn) return

      try {
        // 调用 SDK 的 pinConversation 方法
        await chatConn.pinConversation({
          conversationId,
          conversationType,
          isPinned
        })
        
        commit('UPDATE_CONVERSATION', {
          conversationId,
          updates: { isPinned, pinnedTime: isPinned ? Date.now() : undefined }
        })
      } catch (error) {
        console.error('设置置顶状态失败:', error)
      }
    },
    
    // 重新计算总未读数
    recalculateTotalUnread({ state, commit }) {
      const totalUnread = state.conversationList.reduce((sum, item) => sum + (item.unReadCount || 0), 0)
      commit('SET_TOTAL_UNREAD_COUNT', totalUnread)
    }
  }
}
