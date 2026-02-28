/**
 * 消息管理 Store
 * 原 MobX 类：MessageStore
 * 
 * 重构优化：
 * 1. 使用对象存储消息，数组存储消息ID顺序
 * 2. 分离消息内容和消息列表管理
 * 3. 简化响应式更新逻辑
 */

import { defineStore } from 'pinia'
import type { 
  MixedMessageBody, 
  Chat, 
  ConversationBaseInfo,
  MessageStatus 
} from '../types/index'
import { useConnStore } from './conn'
import { useConversationStore } from './conversation'
import { useAppUserStore } from './appUser'
import { chatSDK } from '../sdk'
import { MAX_MESSAGES_PER_CONVERSATION } from '../const/index'
import { logger } from '../log'

// 消息列表信息
interface ConversationMessagesInfo {
  messageIds: string[]
  cursor: string
  isLast: boolean
  isGetHistoryMessage?: boolean
}

interface MessageState {
  /** 消息内容映射表 key: messageId */
  messageMap: Record<string, MixedMessageBody>
  /** 会话消息ID列表映射 key: conversationId */
  conversationMessagesMap: Record<string, ConversationMessagesInfo>
  /** 当前播放的语音消息ID */
  playingAudioMsgId: string
  /** 当前引用的消息 */
  quoteMessage: MixedMessageBody | null
  /** 当前编辑的消息 */
  editingMessage: Chat.ModifiedMsg | null
}

const PAGE_SIZE = 15

export const useMessageStore = defineStore('message', {
  state: (): MessageState => ({
    messageMap: {},
    conversationMessagesMap: {},
    playingAudioMsgId: '',
    quoteMessage: null,
    editingMessage: null
  }),

  getters: {
    /**
     * 获取指定消息
     */
    getMessageById: (state) => (msgId: string): MixedMessageBody | undefined => {
      return state.messageMap[msgId]
    },

    /**
     * 获取会话消息列表
     */
    getConversationMessages: (state) => (convId: string): MixedMessageBody[] => {
      const info = state.conversationMessagesMap[convId]
      if (!info) return []
      return info.messageIds
        .map(id => state.messageMap[id])
        .filter(Boolean)
    },

    /**
     * 获取消息数量
     */
    getConversationMessageCount: (state) => (convId: string): number => {
      return state.conversationMessagesMap[convId]?.messageIds.length || 0
    },

    /**
     * 检查是否还有更多历史消息
     */
    hasMoreHistory: (state) => (convId: string): boolean => {
      const info = state.conversationMessagesMap[convId]
      return info ? !info.isLast : true
    },

    /**
     * 是否正在播放指定语音消息
     */
    isPlayingAudio: (state) => (msgId: string): boolean => {
      return state.playingAudioMsgId === msgId
    },

    /**
     * 检查消息是否来自当前用户
     */
    checkMessageFromIsSelf: () => (msg: MixedMessageBody): boolean => {
      const connStore = useConnStore()
      const currentUserId = connStore.getChatConn.user
      return msg.from === currentUserId
    }
  },

  actions: {
    /**
     * 添加消息到映射表
     */
    addMessageToMap(msg: MixedMessageBody): boolean {
      if (this.messageMap[msg.id]) {
        return false
      }
      this.messageMap[msg.id] = msg
      return true
    },

    /**
     * 从映射表移除消息
     */
    removeMessageFromMap(msgId: string) {
      delete this.messageMap[msgId]
    },

    /**
     * 获取历史消息
     */
    async getHistoryMessages(
      conversation: Chat.ConversationItem,
      cursor?: string,
      onSuccess?: () => void
    ) {
      logger.info('[MessageStore] Getting history messages for:', conversation.conversationId)
      
      try {
        const connStore = useConnStore()
        const dt = await connStore.getChatConn.getHistoryMessages({
          targetId: conversation.conversationId,
          chatType: conversation.conversationType,
          pageSize: PAGE_SIZE,
          cursor: cursor || ''
        })

        logger.info('[MessageStore] Got history messages:', dt.messages?.length)

        // 收集新消息ID
        const newMessageIds: string[] = []
        dt.messages?.forEach((msg: MixedMessageBody) => {
          if (this.addMessageToMap(msg)) {
            newMessageIds.push(msg.id)
          }
        })

        onSuccess?.()

        // 更新会话消息列表
        const info = this.conversationMessagesMap[conversation.conversationId]
        if (info && info.isGetHistoryMessage) {
          // 已有历史消息，新消息添加到前面
          const existingIds = new Set(info.messageIds)
          const prependIds = newMessageIds.reverse().filter(id => !existingIds.has(id))
          info.messageIds = [...prependIds, ...info.messageIds]
          info.cursor = dt.cursor || ''
          info.isLast = dt.isLast
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
            info.messageIds = allMessageIds
            info.cursor = dt.cursor || ''
            info.isLast = dt.isLast
            info.isGetHistoryMessage = true
          } else {
            this.conversationMessagesMap[conversation.conversationId] = {
              messageIds: allMessageIds,
              cursor: dt.cursor || '',
              isLast: dt.isLast,
              isGetHistoryMessage: true
            }
          }
        }
      } catch (error) {
        logger.error('[MessageStore] Failed to get history messages:', error)
        const info = this.conversationMessagesMap[conversation.conversationId]
        if (info) {
          info.isLast = true
        }
      }
    },

    /**
     * 插入新消息
     */
    insertMessage(msg: MixedMessageBody) {
      const convStore = useConversationStore()
      const convId = convStore.getCvsIdFromMessage(msg)
      
      const info = this.conversationMessagesMap[convId]
      if (info) {
        if (!info.messageIds.includes(msg.id)) {
          info.messageIds.push(msg.id)
        }
      } else {
        this.conversationMessagesMap[convId] = {
          messageIds: [msg.id],
          cursor: '',
          isLast: false
        }
      }
    },

    /**
     * 发送消息
     */
    async sendMessage(msg: MixedMessageBody, uploadFileFunc?: () => Promise<any>) {
      if (msg.type === 'delivery' || msg.type === 'read' || msg.type === 'channel') {
        return
      }

      const convStore = useConversationStore()
      const connStore = useConnStore()
      const appUserStore = useAppUserStore()
      
      const currentUserId = connStore.getChatConn.user

      try {
        // 准备本地消息 - 确保包含 from 字段
        let msgCopy: MixedMessageBody = { 
          ...msg, 
          from: msg.from || currentUserId,
          status: 'sending' as MessageStatus 
        }

        // 同步附件消息格式
        if (msgCopy.type === 'audio') {
          (msgCopy as any).length = (msgCopy as any).body?.length
          ;(msgCopy as any).url = (msgCopy as any).body?.url
        }
        if (msgCopy.type === 'file') {
          (msgCopy as any).file_length = (msgCopy as any).body?.file_length
          ;(msgCopy as any).url = (msgCopy as any).body?.url
          ;(msgCopy as any).filename = (msgCopy as any).body?.filename
        }
        if (msgCopy.type === 'video') {
          ;(msgCopy as any).url = (msgCopy as any).body?.url
        }
        if (msgCopy.type === 'img') {
          ;(msgCopy as any).thumb = (msgCopy as any).url
        }

        // 添加到本地
        this.addMessageToMap(msgCopy)
        this.insertMessage(msgCopy)

        // 上传文件（如有）
        if (uploadFileFunc) {
          logger.info('[MessageStore] Uploading file...')
          const res = await uploadFileFunc()
          const data = JSON.parse(res.data)
          const url = `${data.uri}/${data.entities[0].uuid}`
          
          if (msg.type === 'img') {
            ;(msg as any).url = url
          } else if (['audio', 'file', 'video'].includes(msg.type)) {
            ;(msg as any).body.url = url
          }
        }

        // 发送消息
        const res = await connStore.getChatConn.send(msg)
        logger.info('[MessageStore] Message sent:', res)

        // 更新本地消息状态
        const convId = convStore.getCvsIdFromMessage(msgCopy)
        const conv = convStore.getConversationById(convId)
        
        const newLocalMsg: MixedMessageBody = {
          ...msgCopy,
          ...(res.message as any),
          status: 'sent',
          serverMsgId: res.serverMsgId,
          id: msgCopy.id
        }

        // 特殊处理视频和图片消息
        if (msg.type === 'video') {
          newLocalMsg.thumb = (res.message as Chat.VideoMsgBody).thumb
          ;(newLocalMsg as any).url = (msgCopy as Chat.VideoMsgBody).url
        }
        if (msg.type === 'img') {
          newLocalMsg.thumb = (msgCopy as Chat.ImgMsgBody).thumb
          ;(newLocalMsg as any).url = (msgCopy as Chat.ImgMsgBody).url
        }

        this.messageMap[msgCopy.id] = newLocalMsg
        
        // 同时存储服务器消息
        if (res.message) {
          this.messageMap[res.serverMsgId] = {
            ...res.message,
            status: 'sent',
            id: res.serverMsgId
          } as MixedMessageBody
        }

        // 更新会话
        if (msg.chatType !== 'chatRoom') {
          if (conv) {
            convStore.updateConversationLastMessage(
              { conversationId: convId, conversationType: msg.chatType },
              msg,
              conv.unReadCount
            )
            convStore.moveConversationTop(conv)
          } else {
            const newConv = convStore.createConversation(
              { conversationId: convId, conversationType: msg.chatType },
              msg,
              0
            )
            convStore.moveConversationTop(newConv)
          }
        }
      } catch (error) {
        logger.error('[MessageStore] Failed to send message:', error)
        this.updateMessageStatus(msg.id, 'failed')
      }
    },

    /**
     * 处理接收到的消息
     */
    onMessage(msg: MixedMessageBody) {
      const convStore = useConversationStore()
      const appUserStore = useAppUserStore()
      
      const isNewMsg = this.addMessageToMap(msg)
      if (isNewMsg) {
        this.insertMessage(msg)
      }

      // 设置 @ 类型
      convStore.setAtTypeByMessage(msg)

      if (msg.chatType === 'chatRoom') return

      const convId = convStore.getCvsIdFromMessage(msg)
      const conv = convStore.getConversationById(convId)
      const isSelf = msg.from === useConnStore().getChatConn.user

      if (conv) {
        convStore.updateConversationLastMessage(
          { conversationId: convId, conversationType: msg.chatType },
          msg,
          isSelf ? conv.unReadCount : conv.unReadCount + 1
        )
        convStore.moveConversationTop(conv)

        // 如果当前正在查看该会话，标记已读
        if (convStore.currConversation?.conversationId === convId) {
          convStore.markConversationRead({
            conversationId: convId,
            conversationType: msg.chatType
          })
        }
      } else {
        // 创建新会话
        const newConv = convStore.createConversation(
          { conversationId: convId, conversationType: msg.chatType },
          msg,
          isSelf ? 0 : 1
        )
        convStore.moveConversationTop(newConv)
      }

      // 清理非当前会话的消息
      if (convStore.currConversation?.conversationId !== convId) {
        this.cleanupRemovedMessages(convId)
      }
    },

    /**
     * 撤回消息
     */
    async recallMessage(msg: MixedMessageBody) {
      logger.info('[MessageStore] Recalling message:', msg.id)
      
      try {
        const convStore = useConversationStore()
        const connStore = useConnStore()
        const mid = msg.serverMsgId || msg.id
        
        await connStore.getChatConn.recallMessage({
          mid,
          to: convStore.getCvsIdFromMessage(msg),
          chatType: msg.chatType
        })

        this.onRecallMessage(msg.id, connStore.getChatConn.user)
        logger.info('[MessageStore] Message recalled:', msg.id)
      } catch (error) {
        logger.error('[MessageStore] Failed to recall message:', error)
        throw error
      }
    },

    /**
     * 处理消息撤回事件
     */
    onRecallMessage(mid: string, from: string) {
      const recalledMessage = this.messageMap[mid]
      if (!recalledMessage) return

      const convStore = useConversationStore()
      const cvsId = convStore.getCvsIdFromMessage(recalledMessage)

      // 标记消息为已撤回
      this.messageMap[mid] = {
        ...recalledMessage,
        noticeInfo: {
          type: 'notice',
          noticeType: 'recall',
          ext: { isRecalled: true, from }
        }
      }

      // 更新会话最后一条消息
      if (recalledMessage.chatType !== 'chatRoom') {
        const conv = convStore.getConversationById(cvsId)
        if (conv?.lastMessage?.id === mid) {
          const isSelf = from === useConnStore().getChatConn.user
          const t = (key: string) => key // 简化，实际需要国际化
          
          conv.lastMessage = chatSDK.message.create({
            type: 'txt',
            msg: isSelf ? '你撤回了一条消息' : '对方撤回了一条消息',
            from,
            to: recalledMessage.to,
            chatType: recalledMessage.chatType
          }) as MixedMessageBody
          
          ;(conv.lastMessage as any).noticeInfo = {
            type: 'notice',
            noticeType: 'recall',
            ext: { isRecalled: true, from }
          }
        }
      }
    },

    /**
     * 删除消息
     */
    async deleteMessage(cvs: ConversationBaseInfo, msg: MixedMessageBody) {
      logger.info('[MessageStore] Deleting message:', msg.id)
      
      try {
        const connStore = useConnStore()
        const messageId = msg.serverMsgId || msg.id
        
        await connStore.getChatConn.removeHistoryMessages({
          targetId: cvs.conversationId,
          chatType: cvs.conversationType,
          messageIds: [messageId]
        })

        // 从本地移除
        this.removeMessageFromMap(msg.id)
        if (msg.serverMsgId) {
          this.removeMessageFromMap(msg.serverMsgId)
        }

        // 从会话消息列表移除
        const info = this.conversationMessagesMap[cvs.conversationId]
        if (info) {
          const idx = info.messageIds.findIndex(id => id === msg.id)
          if (idx > -1) {
            info.messageIds.splice(idx, 1)
          }
        }

        logger.info('[MessageStore] Message deleted:', msg.id)
      } catch (error) {
        logger.error('[MessageStore] Failed to delete message:', error)
      }
    },

    /**
     * 更新消息状态
     */
    updateMessageStatus(msgId: string, status: MessageStatus) {
      const msg = this.messageMap[msgId]
      if (msg && msg.status !== 'read') {
        msg.status = status
      }
    },

    /**
     * 设置引用消息
     */
    setQuoteMessage(msg: MixedMessageBody | null) {
      this.quoteMessage = msg
    },

    /**
     * 设置编辑消息
     */
    setEditingMessage(msg: Chat.ModifiedMsg | null) {
      this.editingMessage = msg
    },

    /**
     * 设置播放的语音消息
     */
    setPlayingAudioMessageId(msgId: string) {
      this.playingAudioMsgId = msgId
    },

    /**
     * 清理超量消息
     */
    cleanupRemovedMessages(conversationId: string) {
      const info = this.conversationMessagesMap[conversationId]
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
        const msg = this.messageMap[msgId]
        if (msg) {
          this.removeMessageFromMap(msgId)
          if (msg.serverMsgId && msg.serverMsgId !== msgId) {
            this.removeMessageFromMap(msg.serverMsgId)
          }
        }
      })

      logger.info(`[MessageStore] Cleaned up ${removeCount} messages from ${conversationId}`)
    },

    /**
     * 清空会话消息
     */
    clearConversationMessages(convId: string) {
      const info = this.conversationMessagesMap[convId]
      if (info) {
        info.messageIds.forEach(msgId => {
          delete this.messageMap[msgId]
        })
        delete this.conversationMessagesMap[convId]
      }
    },

    /**
     * 清空所有数据
     */
    clear() {
      this.messageMap = {}
      this.conversationMessagesMap = {}
      this.playingAudioMsgId = ''
      this.quoteMessage = null
      this.editingMessage = null
    }
  }
})
