// 消息管理 Store
import Vue from 'vue'

const PAGE_SIZE = 15
const MAX_MESSAGES_PER_CONVERSATION = 100

export default {
  namespaced: true,

  state: {
    // 消息内容映射表 key: messageId
    messageMap: {},
    // 会话消息ID列表映射 key: conversationId
    conversationMessagesMap: {},
    // 当前播放的语音消息ID
    playingAudioMsgId: '',
    // 当前引用的消息
    quoteMessage: null,
    // 当前编辑的消息
    editingMessage: null
  },

  getters: {
    // 获取指定消息
    getMessageById: state => msgId => {
      return state.messageMap[msgId]
    },

    // 获取会话消息列表
    getConversationMessages: state => convId => {
      const info = state.conversationMessagesMap[convId]
      if (!info) return []
      const msgs = info.messageIds
        .map(id => state.messageMap[id])
        .filter(Boolean)
      console.log('[MessageStore] getConversationMessages:', convId, 'count:', msgs.length)
      // 检查第一条消息的内容和 modifiedInfo
      if (msgs.length > 0) {
        console.log('[MessageStore] First msg:', msgs[0].id, 'msg:', msgs[0].msg?.substring(0, 20), 'modifiedInfo:', msgs[0].modifiedInfo)
      }
      return msgs
    },

    // 获取消息数量
    getConversationMessageCount: state => convId => {
      const info = state.conversationMessagesMap[convId]
      return info && info.messageIds.length || 0
    },

    // 检查是否还有更多历史消息
    hasMoreHistory: state => convId => {
      const info = state.conversationMessagesMap[convId]
      return info ? !info.isLast : true
    },

    // 是否正在播放指定语音消息
    isPlayingAudio: state => msgId => {
      return state.playingAudioMsgId === msgId
    },

    // 检查消息是否来自当前用户
    checkMessageFromIsSelf: (state, getters, rootState) => msg => {
      const currentUserId = rootState.conn.chatConn && rootState.conn.chatConn.user
      return msg.from === currentUserId
    }
  },

  mutations: {
    ADD_MESSAGE_TO_MAP(state, msg) {
      Vue.set(state.messageMap, msg.id, msg)
    },

    UPDATE_MESSAGE_IN_MAP(state, { msgId, updates }) {
      console.log('[MessageStore] UPDATE_MESSAGE_IN_MAP:', msgId, 'exists:', !!state.messageMap[msgId])
      if (state.messageMap[msgId]) {
        const oldMsg = state.messageMap[msgId]
        const newMsg = { ...oldMsg, ...updates }
        console.log('[MessageStore] Old msg:', oldMsg.msg)
        console.log('[MessageStore] New msg:', newMsg.msg)
        Vue.set(state.messageMap, msgId, newMsg)
        console.log('[MessageStore] After update, msg:', state.messageMap[msgId]?.msg)
      } else {
        console.warn('[MessageStore] Message not found in map:', msgId)
      }
    },

    REMOVE_MESSAGE_FROM_MAP(state, msgId) {
      Vue.delete(state.messageMap, msgId)
    },

    SET_CONVERSATION_MESSAGES_INFO(state, { convId, info }) {
      Vue.set(state.conversationMessagesMap, convId, info)
    },

    UPDATE_CONVERSATION_MESSAGES_INFO(state, { convId, updates }) {
      if (state.conversationMessagesMap[convId]) {
        Vue.set(state.conversationMessagesMap, convId, { 
          ...state.conversationMessagesMap[convId], 
          ...updates 
        })
      }
    },

    ADD_MESSAGE_ID_TO_CONVERSATION(state, { convId, msgId, prepend = false }) {
      const info = state.conversationMessagesMap[convId]
      if (info) {
        if (!info.messageIds.includes(msgId)) {
          if (prepend) {
            info.messageIds.unshift(msgId)
          } else {
            info.messageIds.push(msgId)
          }
        }
      } else {
        Vue.set(state.conversationMessagesMap, convId, {
          messageIds: [msgId],
          cursor: '',
          isLast: false,
          isGetHistoryMessage: false
        })
      }
    },

    PREPEND_MESSAGE_IDS(state, { convId, msgIds }) {
      const info = state.conversationMessagesMap[convId]
      if (info) {
        const existingIds = new Set(info.messageIds)
        const prependIds = msgIds.filter(id => !existingIds.has(id))
        info.messageIds = [...prependIds, ...info.messageIds]
      }
    },

    REMOVE_MESSAGE_ID_FROM_CONVERSATION(state, { convId, msgId }) {
      const info = state.conversationMessagesMap[convId]
      if (info) {
        const idx = info.messageIds.findIndex(id => id === msgId)
        if (idx > -1) {
          info.messageIds.splice(idx, 1)
        }
      }
    },

    SET_PLAYING_AUDIO_MSG_ID(state, msgId) {
      state.playingAudioMsgId = msgId
    },

    SET_QUOTE_MESSAGE(state, msg) {
      state.quoteMessage = msg
    },

    SET_EDITING_MESSAGE(state, msg) {
      state.editingMessage = msg
    },

    CLEAR_CONVERSATION_MESSAGES(state, convId) {
      const info = state.conversationMessagesMap[convId]
      if (info) {
        info.messageIds.forEach(msgId => {
          Vue.delete(state.messageMap, msgId)
        })
        Vue.delete(state.conversationMessagesMap, convId)
      }
    },

    CLEAR_ALL_MESSAGES(state) {
      state.messageMap = {}
      state.conversationMessagesMap = {}
      state.playingAudioMsgId = ''
      state.quoteMessage = null
      state.editingMessage = null
    }
  },

  actions: {
    // 添加消息到映射表
    addMessageToMap({ commit }, msg) {
      commit('ADD_MESSAGE_TO_MAP', msg)
    },

    // 获取历史消息
    async getHistoryMessages({ commit, state, rootState }, { conversation, cursor, onSuccess }) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn) return

      try {
        const res = await chatConn.getHistoryMessages({
          targetId: conversation.conversationId,
          chatType: conversation.conversationType,
          pageSize: PAGE_SIZE,
          cursor: cursor || ''
        })

        // 收集新消息ID
        const newMessageIds = []
        res.messages && res.messages.forEach(msg => {
          if (!state.messageMap[msg.id]) {
            // 确保 serverMsgId 被保存（历史消息中的 id 通常是服务器消息ID）
            const msgWithServerId = {
              ...msg,
              serverMsgId: msg.serverMsgId || msg.id
            }
            commit('ADD_MESSAGE_TO_MAP', msgWithServerId)
            newMessageIds.push(msg.id)
          }
        })

        if (onSuccess) onSuccess()

        // 更新会话消息列表
        const info = state.conversationMessagesMap[conversation.conversationId]
        if (info && info.isGetHistoryMessage) {
          // 已有历史消息，新消息添加到前面
          commit('PREPEND_MESSAGE_IDS', { 
            convId: conversation.conversationId, 
            msgIds: newMessageIds.reverse() 
          })
          commit('UPDATE_CONVERSATION_MESSAGES_INFO', {
            convId: conversation.conversationId,
            updates: { cursor: res.cursor || '', isLast: res.isLast }
          })
        } else {
          // 首次获取或合并现有消息
          let allMessageIds = [...newMessageIds].reverse()
          if (info) {
            const existingIds = new Set(allMessageIds)
            info.messageIds.forEach(id => {
              if (!existingIds.has(id)) {
                allMessageIds.push(id)
              }
            })
            commit('SET_CONVERSATION_MESSAGES_INFO', {
              convId: conversation.conversationId,
              info: {
                messageIds: allMessageIds,
                cursor: res.cursor || '',
                isLast: res.isLast,
                isGetHistoryMessage: true
              }
            })
          } else {
            commit('SET_CONVERSATION_MESSAGES_INFO', {
              convId: conversation.conversationId,
              info: {
                messageIds: allMessageIds,
                cursor: res.cursor || '',
                isLast: res.isLast,
                isGetHistoryMessage: true
              }
            })
          }
        }

        return res
      } catch (error) {
        const info = state.conversationMessagesMap[conversation.conversationId]
        if (info) {
          info.isLast = true
        }
        throw error
      }
    },

    // 插入新消息
    insertMessage({ commit, rootState }, msg) {
      const chatConn = rootState.conn.chatConn
      const currentUserId = chatConn && chatConn.user
      const convId = msg.chatType === 'groupChat' ? msg.to : 
        (msg.from === currentUserId ? msg.to : msg.from)
      
      commit('ADD_MESSAGE_ID_TO_CONVERSATION', { convId, msgId: msg.id })
    },

    // 发送消息
    async sendMessage({ commit, state, rootState, dispatch }, { msg, uploadFileFunc }) {
      if (msg.type === 'delivery' || msg.type === 'read' || msg.type === 'channel') {
        return
      }

      const chatConn = rootState.conn.chatConn
      const currentUserId = chatConn && chatConn.user

      try {
        // 准备本地消息
        let msgCopy = {
          ...msg,
          from: msg.from || currentUserId,
          status: 'sending'
        }

        // 同步附件消息格式
        if (msgCopy.type === 'audio') {
          msgCopy.length = msgCopy.body && msgCopy.body.length
          msgCopy.url = msgCopy.body && msgCopy.body.url
        }
        if (msgCopy.type === 'file') {
          msgCopy.file_length = msgCopy.body && msgCopy.body.file_length
          msgCopy.url = msgCopy.body && msgCopy.body.url
          msgCopy.filename = msgCopy.body && msgCopy.body.filename
        }
        if (msgCopy.type === 'video') {
          msgCopy.url = msgCopy.body && msgCopy.body.url
        }
        if (msgCopy.type === 'img') {
          msgCopy.thumb = msgCopy.url
        }

        // 添加到本地
        commit('ADD_MESSAGE_TO_MAP', msgCopy)
        dispatch('insertMessage', msgCopy)

        // 上传文件（如有）
        if (uploadFileFunc) {
          console.log('[MessageStore] Uploading file...')
          const res = await uploadFileFunc()
          const data = JSON.parse(res.data)
          const url = `${data.uri}/${data.entities[0].uuid}`
          
          if (msg.type === 'img') {
            msg.url = url
          } else if (['audio', 'file', 'video'].includes(msg.type)) {
            msg.body.url = url
          }
        }

        // 发送消息
        const res = await chatConn.send(msg)
        console.log('[MessageStore] Message sent, full response:', JSON.stringify(res, null, 2))

        // 更新本地消息状态
        const convId = msgCopy.chatType === 'groupChat' ? msgCopy.to : 
          (msgCopy.from === currentUserId ? msgCopy.to : msgCopy.from)

        // 获取服务器消息ID - SDK可能返回不同字段名
        const serverMsgId = res.serverMsgId || res.mid || (res.message && res.message.id)
        console.log('[MessageStore] Extracted serverMsgId:', serverMsgId, 'from fields:', Object.keys(res))

        const newLocalMsg = {
          ...msgCopy,
          ...res.message,
          status: 'sent',
          serverMsgId: serverMsgId,
          id: msgCopy.id
        }

        // 特殊处理视频和图片消息
        if (msg.type === 'video') {
          newLocalMsg.thumb = res.message && res.message.thumb
          newLocalMsg.url = msgCopy.url
        }
        if (msg.type === 'img') {
          newLocalMsg.thumb = msgCopy.thumb
          newLocalMsg.url = msgCopy.url
        }

        commit('UPDATE_MESSAGE_IN_MAP', { msgId: msgCopy.id, updates: newLocalMsg })
        
        // 同时存储服务器消息
        if (res.message) {
          commit('ADD_MESSAGE_TO_MAP', {
            ...res.message,
            status: 'sent',
            id: res.serverMsgId
          })
        }

        // 更新会话
        if (msg.chatType !== 'chatRoom') {
          const conv = rootState.conversation.conversationList.find(
            c => c.conversationId === convId
          )
          if (conv) {
            commit('conversation/UPDATE_CONVERSATION', {
              conversationId: convId,
              updates: {
                lastMessage: msg,
                unReadCount: conv.unReadCount
              }
            }, { root: true })
            // 移到顶部
            commit('conversation/MOVE_CONVERSATION_TO_TOP', convId, { root: true })
          } else {
            // 创建新会话
            const newConv = {
              conversationId: convId,
              conversationType: msg.chatType,
              lastMessage: msg,
              unReadCount: 0
            }
            commit('conversation/ADD_CONVERSATION', newConv, { root: true })
            commit('conversation/MOVE_CONVERSATION_TO_TOP', convId, { root: true })
          }
        }

        return res
      } catch (error) {
        console.error('[MessageStore] Failed to send message:', error)
        commit('UPDATE_MESSAGE_IN_MAP', { 
          msgId: msg.id, 
          updates: { status: 'failed' } 
        })
        throw error
      }
    },

    // 处理接收到的消息
    onMessage({ commit, state, rootState, dispatch }, msg) {
      // 确保 serverMsgId 被保存（接收到的消息 id 通常是服务器消息ID）
      const msgWithServerId = {
        ...msg,
        serverMsgId: msg.serverMsgId || msg.id
      }
      // 添加到消息映射
      if (!state.messageMap[msg.id]) {
        commit('ADD_MESSAGE_TO_MAP', msgWithServerId)
        dispatch('insertMessage', msgWithServerId)
      }

      // 获取会话ID
      const convId = msg.chatType === 'groupChat' ? msg.to : 
        (msg.from === rootState.conn.chatConn && chatConn.user ? msg.to : msg.from)

      if (msg.chatType === 'chatRoom') return

      const conv = rootState.conversation.conversationList.find(
        c => c.conversationId === convId
      )
      const isSelf = msg.from === rootState.conn.chatConn && chatConn.user

      if (conv) {
        commit('conversation/UPDATE_CONVERSATION', {
          conversationId: convId,
          updates: {
            lastMessage: msg,
            unReadCount: isSelf ? conv.unReadCount : conv.unReadCount + 1
          }
        }, { root: true })
        commit('conversation/MOVE_CONVERSATION_TO_TOP', convId, { root: true })

        // 如果当前正在查看该会话，标记已读
        if (rootState.conversation.currentConversation && rootState.conversation.currentConversation.conversationId === convId) {
          dispatch('conversation/markConversationAsRead', {
            conversationId: convId,
            conversationType: msg.chatType
          }, { root: true })
        }
      } else {
        // 创建新会话
        const newConv = {
          conversationId: convId,
          conversationType: msg.chatType,
          lastMessage: msg,
          unReadCount: isSelf ? 0 : 1
        }
        commit('conversation/ADD_CONVERSATION', newConv, { root: true })
        commit('conversation/MOVE_CONVERSATION_TO_TOP', convId, { root: true })
      }

      // 清理非当前会话的消息
      if (rootState.conversation.currentConversation && rootState.conversation.currentConversation.conversationId !== convId) {
        dispatch('cleanupRemovedMessages', convId)
      }
    },

    // 撤回消息
    async recallMessage({ commit, state, rootState, dispatch }, msg) {
      console.log('[MessageStore] Recalling message:', msg.id)
      
      try {
        const chatConn = rootState.conn.chatConn
        const mid = msg.serverMsgId || msg.id
        const convId = msg.chatType === 'groupChat' ? msg.to : 
          (msg.from === chatConn && chatConn.user ? msg.to : msg.from)
        
        await chatConn.recallMessage({
          mid,
          to: convId,
          chatType: msg.chatType
        })

        dispatch('onRecallMessage', { mid: msg.id, from: chatConn.user })
        console.log('[MessageStore] Message recalled:', msg.id)
      } catch (error) {
        console.error('[MessageStore] Failed to recall message:', error)
        throw error
      }
    },

    // 处理消息撤回事件
    onRecallMessage({ commit, state, rootState }, { mid, from }) {
      const recalledMessage = state.messageMap[mid]
      if (!recalledMessage) return

      const convId = recalledMessage.chatType === 'groupChat' ? recalledMessage.to : 
        (recalledMessage.from === rootState.conn.chatConn && chatConn.user ? recalledMessage.to : recalledMessage.from)

      // 标记消息为已撤回
      commit('UPDATE_MESSAGE_IN_MAP', {
        msgId: mid,
        updates: {
          noticeInfo: {
            type: 'notice',
            noticeType: 'recall',
            ext: { isRecalled: true, from }
          }
        }
      })

      // 更新会话最后一条消息
      if (recalledMessage.chatType !== 'chatRoom') {
        const conv = rootState.conversation.conversationList.find(
          c => c.conversationId === convId
        )
        if (conv && conv.lastMessage && conv.lastMessage.id === mid) {
          const isSelf = from === rootState.conn.chatConn && chatConn.user
          const recallMsg = {
            type: 'txt',
            msg: isSelf ? '你撤回了一条消息' : '对方撤回了一条消息',
            from,
            to: recalledMessage.to,
            chatType: recalledMessage.chatType,
            time: Date.now(),
            noticeInfo: {
              type: 'notice',
              noticeType: 'recall',
              ext: { isRecalled: true, from }
            }
          }
          commit('conversation/UPDATE_CONVERSATION', {
            conversationId: convId,
            updates: { lastMessage: recallMsg }
          }, { root: true })
        }
      }
    },

    // 删除消息
    async deleteMessage({ commit, state, rootState }, { cvs, msg }) {
      console.log('[MessageStore] Deleting message:', msg.id)
      
      try {
        const chatConn = rootState.conn.chatConn
        const messageId = msg.serverMsgId || msg.id
        
        await chatConn.removeHistoryMessages({
          targetId: cvs.conversationId,
          chatType: cvs.conversationType,
          messageIds: [messageId]
        })

        // 从本地移除
        commit('REMOVE_MESSAGE_FROM_MAP', msg.id)
        if (msg.serverMsgId) {
          commit('REMOVE_MESSAGE_FROM_MAP', msg.serverMsgId)
        }

        // 从会话消息列表移除
        commit('REMOVE_MESSAGE_ID_FROM_CONVERSATION', {
          convId: cvs.conversationId,
          msgId: msg.id
        })

        console.log('[MessageStore] Message deleted:', msg.id)
      } catch (error) {
        console.error('[MessageStore] Failed to delete message:', error)
      }
    },

    // 更新消息状态
    updateMessageStatus({ commit, state }, { msgId, status }) {
      const msg = state.messageMap[msgId]
      if (msg && msg.status !== 'read') {
        commit('UPDATE_MESSAGE_IN_MAP', { msgId, updates: { status } })
      }
    },

    // 设置引用消息
    setQuoteMessage({ commit }, msg) {
      commit('SET_QUOTE_MESSAGE', msg)
    },

    // 设置编辑消息 - 只保存纯数据，避免 SDK 方法导致 Vue 响应式警告
    setEditingMessage({ commit }, msg) {
      console.log('[MessageStore] setEditingMessage called, msg:', msg?.id)
      if (!msg) {
        commit('SET_EDITING_MESSAGE', null)
        return
      }
      // 提取纯数据，排除 SDK 方法
      const plainMsg = {
        id: msg.id,
        serverMsgId: msg.serverMsgId,
        mid: msg.mid,
        type: msg.type,
        msg: msg.msg,
        body: msg.body ? { ...msg.body } : undefined,
        to: msg.to,
        from: msg.from,
        chatType: msg.chatType,
        status: msg.status,
        time: msg.time,
        ext: msg.ext ? { ...msg.ext } : undefined,
        modifiedInfo: msg.modifiedInfo
      }
      console.log('[MessageStore] setEditingMessage plain msg:', plainMsg.id, 'content:', plainMsg.msg?.substring(0, 20))
      commit('SET_EDITING_MESSAGE', plainMsg)
    },

    // 设置播放的语音消息
    setPlayingAudioMessageId({ commit }, msgId) {
      commit('SET_PLAYING_AUDIO_MSG_ID', msgId)
    },

    // 清理超量消息
    cleanupRemovedMessages({ commit, state }, conversationId) {
      const info = state.conversationMessagesMap[conversationId]
      if (!info || info.messageIds.length <= MAX_MESSAGES_PER_CONVERSATION) {
        return
      }

      const removeCount = info.messageIds.length - MAX_MESSAGES_PER_CONVERSATION
      const messageIdsToRemove = info.messageIds.slice(0, removeCount)
      info.messageIds = info.messageIds.slice(removeCount)
      info.cursor = info.messageIds[0] || ''
      info.isLast = false

      // 清理消息映射
      messageIdsToRemove.forEach(msgId => {
        const msg = state.messageMap[msgId]
        if (msg) {
          commit('REMOVE_MESSAGE_FROM_MAP', msgId)
          if (msg.serverMsgId && msg.serverMsgId !== msgId) {
            commit('REMOVE_MESSAGE_FROM_MAP', msg.serverMsgId)
          }
        }
      })

      console.log(`[MessageStore] Cleaned up ${removeCount} messages from ${conversationId}`)
    },

    // 清空会话消息
    clearConversationMessages({ commit }, convId) {
      commit('CLEAR_CONVERSATION_MESSAGES', convId)
    },

    // 修改消息（编辑消息）
    async modifyServerMessage({ commit, state, rootState }, payload) {
      // 使用 alert 确保在 H5 中可见
      if (typeof alert !== 'undefined') {
        alert('modifyServerMessage called, payload: ' + JSON.stringify(payload ? { hasOldMsg: !!payload.oldMsg, newMsgText: payload.newMsgText } : null))
      }
      console.log('=========================================')
      console.log('[MessageStore] modifyServerMessage called')
      console.log('[MessageStore] payload:', payload)
      
      const { oldMsg, newMsgText } = payload || {}
      console.log('[MessageStore] oldMsg:', oldMsg ? oldMsg.id : 'null')
      console.log('[MessageStore] newMsgText:', newMsgText)
      
      try {
        const chatConn = rootState.conn.chatConn
        console.log('[MessageStore] chatConn:', chatConn ? 'exists' : 'null')
        if (!chatConn) {
          throw new Error('SDK not initialized')
        }

        // 获取消息ID：优先使用 serverMsgId（修改消息必须使用服务器消息ID）
        // 注意：modifyMessage API 要求传入服务器消息ID
        const msgId = oldMsg.serverMsgId
        if (!msgId) {
          console.error('[MessageStore] Cannot modify message: missing serverMsgId', oldMsg)
          uni.showToast({ title: '消息尚未同步到服务器，请稍后再试', icon: 'none' })
          throw new Error('Missing serverMsgId')
        }
        
        console.log('[MessageStore] Using serverMsgId:', msgId)
        
        const res = await chatConn.modifyMessage({
          id: msgId,
          msg: newMsgText,
          to: oldMsg.to,
          chatType: oldMsg.chatType
        })

        console.log('[MessageStore] Message modified:', res)

        // 更新本地消息 - 使用本地消息ID
        const localMsgId = oldMsg.id || oldMsg.mid
        console.log('[MessageStore] Updating local msg:', localMsgId, 'exists:', !!state.messageMap[localMsgId])
        if (localMsgId && state.messageMap[localMsgId]) {
          commit('UPDATE_MESSAGE_IN_MAP', {
            msgId: localMsgId,
            updates: {
              msg: newMsgText,
              modifiedInfo: {
                isModified: true,
                modifiedTime: Date.now()
              }
            }
          })
          console.log('[MessageStore] Local msg updated:', localMsgId)
        }

        // 同时更新 serverMsgId 对应的记录
        if (oldMsg.serverMsgId && state.messageMap[oldMsg.serverMsgId]) {
          commit('UPDATE_MESSAGE_IN_MAP', {
            msgId: oldMsg.serverMsgId,
            updates: {
              msg: newMsgText,
              modifiedInfo: {
                isModified: true,
                modifiedTime: Date.now()
              }
            }
          })
          console.log('[MessageStore] Server msg updated:', oldMsg.serverMsgId)
        }

        console.log('[MessageStore] Message update completed')
        return res
      } catch (error) {
        console.error('[MessageStore] Failed to modify message:', error)
        throw error
      }
    },

    // 更新被修改的消息（收到 onModifiedMessage 事件时调用）
    updateModifiedMessage({ commit, state }, { mid, msg, from }) {
      console.log('[MessageStore] Updating modified message:', mid, msg)
      
      // 查找包含此消息的记录
      let found = false
      
      // 通过 serverMsgId 查找
      if (state.messageMap[mid]) {
        commit('UPDATE_MESSAGE_IN_MAP', {
          msgId: mid,
          updates: {
            msg: msg,
            modifiedInfo: {
              isModified: true,
              modifiedTime: Date.now()
            }
          }
        })
        found = true
      }
      
      // 遍历所有消息查找可能引用此 serverMsgId 的本地消息
      Object.values(state.messageMap).forEach(message => {
        if (message.serverMsgId === mid) {
          commit('UPDATE_MESSAGE_IN_MAP', {
            msgId: message.id,
            updates: {
              msg: msg,
              modifiedInfo: {
                isModified: true,
                modifiedTime: Date.now()
              }
            }
          })
          found = true
        }
      })
      
      if (!found) {
        console.warn('[MessageStore] Modified message not found in local:', mid)
      }
    },

    // 清空所有数据
    clear({ commit }) {
      commit('CLEAR_ALL_MESSAGES')
    }
  }
}
