// 消息管理 Store
import Vue from 'vue'

const PAGE_SIZE = 15
const MAX_MESSAGES_PER_CONVERSATION = 100

/**
 * 深克隆消息对象，移除 SDK 添加的特殊原型方法
 * 解决微信小程序中 JSON.stringify 无法序列化 SDK 自定义对象（如 Long 类型）的问题
 * @param {Object} msg - SDK 消息对象
 * @returns {Object} - 纯数据对象
 */
function cloneMessage(msg) {
  if (!msg || typeof msg !== 'object') return msg
  
  // 处理数组
  if (Array.isArray(msg)) {
    return msg.map(item => cloneMessage(item))
  }
  
  // 处理 SDK 特殊对象（Long 类型等）
  // 检测特征：有 isZero 方法，或者有 low/high 属性
  if (msg.isZero || msg.toNumber || (msg.low !== undefined && msg.high !== undefined)) {
    try {
      // 转换为字符串或数字
      if (msg.toNumber) return msg.toNumber()
      if (msg.toString) return msg.toString()
      return Number(msg)
    } catch (e) {
      return String(msg)
    }
  }
  
  // 普通对象，递归克隆
  const result = {}
  for (const key in msg) {
    if (msg.hasOwnProperty(key)) {
      const value = msg[key]
      
      // 跳过函数
      if (typeof value === 'function') continue
      
      // 递归克隆
      result[key] = cloneMessage(value)
    }
  }
  return result
}

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
      // 深克隆消息以移除 SDK 特殊对象，避免微信小程序 JSON.stringify 错误
      const clonedMsg = cloneMessage(msg)
      Vue.set(state.messageMap, clonedMsg.id, clonedMsg)
    },

    UPDATE_MESSAGE_IN_MAP(state, { msgId, updates }) {
      console.log('[MessageStore] UPDATE_MESSAGE_IN_MAP:', msgId, 'exists:', !!state.messageMap[msgId])
      if (state.messageMap[msgId]) {
        const oldMsg = state.messageMap[msgId]
        // 深克隆更新内容以移除 SDK 特殊对象
        const clonedUpdates = cloneMessage(updates)
        const newMsg = { ...oldMsg, ...clonedUpdates }
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

    // 提取消息的纯数据字段，避免存储 SDK 特殊对象
    extractPlainMessage(msg, currentUserId) {
      // 基础字段
      const plainMsg = {
        id: typeof msg.id === 'string' ? msg.id : String(msg.id || ''),
        type: msg.type,
        chatType: msg.chatType,
        from: msg.from || currentUserId || '',
        to: msg.to || '',
        msg: msg.msg || '',
        time: typeof msg.time === 'number' ? msg.time : Date.now(),
        status: msg.status || 'sending',
        ext: msg.ext || {}
      }
      
      // 处理 body 字段
      if (msg.body) {
        plainMsg.body = {
          type: msg.body.type,
          msg: msg.body.msg
        }
        
        // 复制附件相关字段
        if (msg.body.length !== undefined) plainMsg.body.length = msg.body.length
        if (msg.body.url !== undefined) plainMsg.body.url = msg.body.url
        if (msg.body.filename !== undefined) plainMsg.body.filename = msg.body.filename
        if (msg.body.file_length !== undefined) plainMsg.body.file_length = msg.body.file_length
        if (msg.body.thumb !== undefined) plainMsg.body.thumb = msg.body.thumb
      }
      
      // 复制其他可选字段
      if (msg.serverMsgId !== undefined) plainMsg.serverMsgId = msg.serverMsgId
      if (msg.localMsgId !== undefined) plainMsg.localMsgId = msg.localMsgId
      if (msg.mid !== undefined) plainMsg.mid = msg.mid
      
      return plainMsg
    },

    // 发送消息
    async sendMessage({ commit, state, rootState, dispatch }, { msg, uploadFileFunc }) {
      if (msg.type === 'delivery' || msg.type === 'read' || msg.type === 'channel') {
        return
      }

      const chatConn = rootState.conn.chatConn
      const currentUserId = chatConn && chatConn.user

      try {
        // 准备本地消息 - 提取纯数据，避免 SDK 特殊对象
        let msgCopy = dispatch('extractPlainMessage', msg, currentUserId)

        // 同步附件消息格式
        if (msgCopy.type === 'audio') {
          msgCopy.length = msgCopy.body?.length
          msgCopy.url = msgCopy.body?.url
        }
        if (msgCopy.type === 'file') {
          msgCopy.file_length = msgCopy.body?.file_length
          msgCopy.url = msgCopy.body?.url
          msgCopy.filename = msgCopy.body?.filename
        }
        if (msgCopy.type === 'video') {
          msgCopy.url = msgCopy.body?.url
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

        // 构建纯数据的新本地消息，避免存储 SDK 特殊对象
        const newLocalMsg = {
          ...msgCopy,
          status: 'sent',
          serverMsgId: serverMsgId,
          id: msgCopy.id
        }
        
        // 从 res.message 中提取纯数据字段
        if (res.message) {
          if (res.message.time !== undefined) newLocalMsg.time = res.message.time
          if (res.message.onlineState !== undefined) newLocalMsg.onlineState = res.message.onlineState
          if (res.message.msg !== undefined) newLocalMsg.msg = res.message.msg
        }

        // 特殊处理视频和图片消息
        if (msg.type === 'video') {
          newLocalMsg.thumb = res.message?.thumb
          newLocalMsg.url = msgCopy.url
        }
        if (msg.type === 'img') {
          newLocalMsg.thumb = msgCopy.thumb
          newLocalMsg.url = msgCopy.url
        }

        commit('UPDATE_MESSAGE_IN_MAP', { msgId: msgCopy.id, updates: newLocalMsg })
        
        // 同时存储服务器消息（提取纯数据）
        if (res.message) {
          const plainServerMsg = dispatch('extractPlainMessage', res.message, currentUserId)
          plainServerMsg.status = 'sent'
          plainServerMsg.id = res.serverMsgId
          plainServerMsg.serverMsgId = res.serverMsgId
          commit('ADD_MESSAGE_TO_MAP', plainServerMsg)
        }

        // 更新会话
        if (msg.chatType !== 'chatRoom') {
          const conv = rootState.conversation.conversationList.find(
            c => c.conversationId === convId
          )
          // 提取纯数据用于 lastMessage
          const lastMsgPlain = dispatch('extractPlainMessage', msgCopy, currentUserId)
          if (conv) {
            commit('conversation/UPDATE_CONVERSATION', {
              conversationId: convId,
              updates: {
                lastMessage: lastMsgPlain,
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
              lastMessage: lastMsgPlain,
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
      const chatConn = rootState.conn.chatConn
      const currentUserId = chatConn && chatConn.user
      
      // 提取纯数据，避免存储 SDK 特殊对象
      const plainMsg = dispatch('extractPlainMessage', msg, currentUserId)
      plainMsg.serverMsgId = msg.serverMsgId || msg.id
      
      // 添加到消息映射
      if (!state.messageMap[plainMsg.id]) {
        commit('ADD_MESSAGE_TO_MAP', plainMsg)
        dispatch('insertMessage', plainMsg)
      }

      // 获取会话ID
      const chatConn = rootState.conn.chatConn
      const currentUserId = chatConn && chatConn.user
      const convId = plainMsg.chatType === 'groupChat' ? plainMsg.to : 
        (plainMsg.from === currentUserId ? plainMsg.to : plainMsg.from)

      if (plainMsg.chatType === 'chatRoom') return

      const conv = rootState.conversation.conversationList.find(
        c => c.conversationId === convId
      )
      const isSelf = plainMsg.from === currentUserId

      if (conv) {
        commit('conversation/UPDATE_CONVERSATION', {
          conversationId: convId,
          updates: {
            lastMessage: plainMsg,
            unReadCount: isSelf ? conv.unReadCount : conv.unReadCount + 1
          }
        }, { root: true })
        commit('conversation/MOVE_CONVERSATION_TO_TOP', convId, { root: true })

        // 如果当前正在查看该会话，标记已读
        if (rootState.conversation.currentConversation && rootState.conversation.currentConversation.conversationId === convId) {
          dispatch('conversation/markConversationAsRead', {
            conversationId: convId,
            conversationType: plainMsg.chatType
          }, { root: true })
        }
      } else {
        // 创建新会话
        const newConv = {
          conversationId: convId,
          conversationType: plainMsg.chatType,
          lastMessage: plainMsg,
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
      console.log('=========================================')
      console.log('[MessageStore] modifyServerMessage called')
      console.log('[MessageStore] payload:', payload)
      
      const { oldMsg, newMsgText } = payload || {}
      console.log('[MessageStore] oldMsg:', oldMsg ? oldMsg.id : 'null')
      console.log('[MessageStore] newMsgText:', newMsgText)
      
      try {
        const chatConn = rootState.conn.chatConn
        const chatSDK = rootState.conn.chatSDK
        console.log('[MessageStore] chatConn:', chatConn ? 'exists' : 'null')
        console.log('[MessageStore] chatSDK:', chatSDK ? 'exists' : 'null')
        if (!chatConn || !chatSDK) {
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
        console.log('[MessageStore] oldMsg.to:', oldMsg.to, 'oldMsg.chatType:', oldMsg.chatType)
        
        // 官网 API 格式: messageId + modifiedMessage
        const modifiedMessage = chatSDK.message.create({
          to: oldMsg.to,
          type: oldMsg.type,
          chatType: oldMsg.chatType,
          msg: newMsgText
        })
        
        const modifyParams = {
          messageId: msgId,
          modifiedMessage: modifiedMessage
        }
        console.log('[MessageStore] modifyParams:', modifyParams)
        
        let res
        try {
          res = await chatConn.modifyMessage(modifyParams)
        } catch (sdkError) {
          console.error('[MessageStore] modifyMessage SDK error:', sdkError)
          throw sdkError
        }

        console.log('[MessageStore] Message modified:', res)

        // 更新本地消息 - 使用本地消息ID
        const localMsgId = oldMsg.id || oldMsg.mid
        console.log('[MessageStore] Updating local msg:', localMsgId, 'exists:', !!state.messageMap[localMsgId])
        
        if (localMsgId && state.messageMap[localMsgId]) {
          commit('UPDATE_MESSAGE_IN_MAP', {
            msgId: localMsgId,
            updates: {
              msg: newMsgText,
              modifiedInfo: res?.modifiedInfo || { isModified: true, modifiedTime: Date.now() }
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
              modifiedInfo: res?.modifiedInfo || { isModified: true, modifiedTime: Date.now() }
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
