/**
 * 会话管理 Store
 * 原 MobX 类：ConversationStore
 * 
 * 重构优化：
 * 1. 使用对象替代 Map 存储会话信息
 * 2. 计算属性缓存未读数等派生状态
 * 3. 简化会话置顶和免打扰管理
 */

import { defineStore } from 'pinia'
import type { 
  ConversationBaseInfo, 
  UIKITConversationItem, 
  AT_TYPE,
  MixedMessageBody,
  Chat 
} from '../types/index'
import { useConnStore } from './conn'
import { useAppUserStore } from './appUser'
import { useMessageStore } from './message'
import { chatSDK } from '../sdk'
import { AT_ALL } from '../const/index'
import { sortByPinned, getTimeStringAutoShort } from '../utils/index'
import { logger } from '../log'

interface ConversationState {
  /** 会话列表 */
  conversationList: UIKITConversationItem[]
  /** 当前选中的会话 */
  currConversation: ConversationBaseInfo | null
  /** 会话免打扰状态映射 */
  muteConvsMap: Record<string, boolean>
  /** 分页参数 */
  pageParams: { pageSize: number; cursor: string }
  /** 置顶会话分页参数 */
  pinParams: { pageSize: number; cursor: string }
}

export const useConversationStore = defineStore('conversation', {
  state: (): ConversationState => ({
    conversationList: [],
    currConversation: null,
    muteConvsMap: {},
    pageParams: { pageSize: 20, cursor: '' },
    pinParams: { pageSize: 20, cursor: '' }
  }),

  getters: {
    /**
     * 计算总未读数（排除免打扰会话）
     * 优化：使用计算属性自动缓存
     */
    totalUnreadCount: (state) => {
      return state.conversationList.reduce((prev, curr) => {
        const isMuted = state.muteConvsMap[curr.conversationId]
        return prev + (isMuted ? 0 : curr.unReadCount)
      }, 0)
    },

    /**
     * 获取排序后的会话列表（置顶优先）
     */
    sortedConversationList: (state) => {
      return [...state.conversationList].sort(sortByPinned)
    },

    /**
     * 根据ID获取会话
     */
    getConversationById: (state) => (conversationId: string) => {
      return state.conversationList.find(
        item => item.conversationId === conversationId
      )
    },

    /**
     * 检查会话是否免打扰
     */
    getConversationMuteStatus: (state) => (conversationId: string) => {
      return !!state.muteConvsMap[conversationId]
    },

    /**
     * 获取当前会话ID
     */
    getCurrentConversationId: (state) => {
      return state.currConversation?.conversationId
    },

    /**
     * 格式化会话时间显示
     */
    getConversationTime: () => (message?: MixedMessageBody) => {
      if (!message?.time) return ''
      return getTimeStringAutoShort(message.time, true)
    }
  },

  actions: {
    /**
     * 从消息获取会话ID
     */
    getCvsIdFromMessage(msg: MixedMessageBody): string {
      if (msg.chatType === 'groupChat') {
        return msg.to
      }
      // 单聊：需要判断消息方向
      // 获取当前用户ID
      const connStore = useConnStore()
      const currentUserId = connStore.getChatConn.user
      // 如果 from 是当前用户，则会话ID是 to（接收者），否则是 from（发送者）
      return msg.from === currentUserId ? msg.to : msg.from
    },

    /**
     * 设置当前会话
     */
    setCurrentConversation(conversation: ConversationBaseInfo | null) {
      this.currConversation = conversation
    },

    /**
     * 获取会话列表
     */
    async getConversationList(cursor?: string) {
      logger.info('[ConversationStore] Getting conversation list')
      
      try {
        const connStore = useConnStore()
        const res = await connStore.getChatConn.getServerConversations({
          pageSize: this.pageParams.pageSize,
          cursor: cursor || '',
          includeEmptyConversations: true
        })
                logger.info('[ConversationStore] Got conversation list:', res.data)
        
        // SDK 返回标准格式：conversations 数组
        const conversations = res.data?.conversations || []
        
        if (conversations.length > 0) {
          // 直接使用 SDK 返回的标准格式（已包含 conversationId, conversationType, unReadCount 等）
          this.mergeConversations(conversations as UIKITConversationItem[])
          this.pageParams.cursor = res.data?.cursor || ''
          
          // 异步获取用户信息
          const appUserStore = useAppUserStore()
          const userIds = conversations
            .filter((c: any) => c.conversationType === 'singleChat')
            .map((c: any) => c.conversationId)
          if (userIds.length > 0) {
            appUserStore.getUsersInfoFromServer({ userIdList: userIds })
          }
          
          logger.info('[ConversationStore] Got conversations:', conversations.length)
        }
        return res
      } catch (error) {
        logger.error('[ConversationStore] Failed to get conversations:', error)
        throw error
      }
    },

    /**
     * 获取置顶会话列表
     */
    async getServerPinnedConversations(cursor?: string) {
      logger.info('[ConversationStore] Getting pinned conversations')
      
      try {
        const connStore = useConnStore()
        const res = await connStore.getChatConn.getServerPinnedConversations({
          pageSize: this.pinParams.pageSize,
          cursor: cursor || ''
        })

        if (res.data?.conversations) {
          // 标记为置顶
          const pinnedConvs = res.data.conversations.map(c => ({
            ...c,
            isPinned: true
          }))
          this.mergeConversations(pinnedConvs)
          this.pinParams.cursor = res.data.cursor || ''
        }
        return res
      } catch (error) {
        logger.error('[ConversationStore] Failed to get pinned conversations:', error)
        throw error
      }
    },

    /**
     * 合并会话列表（保留本地状态）
     */
    mergeConversations(newConversations: Chat.ConversationItem[]) {
      const existingIds = new Set(this.conversationList.map(c => c.conversationId))
      
      newConversations.forEach(serverConv => {
        const localConv = this.conversationList.find(
          c => c.conversationId === serverConv.conversationId
        )
        
        if (localConv) {
          // 更新服务器属性，保留本地属性
          Object.assign(localConv, {
            isPinned: serverConv.isPinned ?? localConv.isPinned,
            pinnedTime: serverConv.pinnedTime ?? localConv.pinnedTime
          })
        } else {
          // 新增会话
          this.conversationList.push(serverConv as UIKITConversationItem)
        }
      })
    },

    /**
     * 置顶/取消置顶会话
     */
    async pinConversation(conversation: ConversationBaseInfo, isPinned: boolean) {
      logger.info('[ConversationStore] Pinning conversation:', conversation.conversationId, isPinned)
      
      try {
        const connStore = useConnStore()
        await connStore.getChatConn.pinConversation({
          conversationId: conversation.conversationId,
          conversationType: conversation.conversationType,
          isPinned
        })
        
        // 更新本地状态
        const conv = this.getConversationById(conversation.conversationId)
        if (conv) {
          conv.isPinned = isPinned
          conv.pinnedTime = isPinned ? Date.now() : undefined
        }
        
        logger.info('[ConversationStore] Successfully pinned conversation')
      } catch (error) {
        logger.error('[ConversationStore] Failed to pin conversation:', error)
        throw error
      }
    },

    /**
     * 设置会话免打扰
     */
    async setSilentModeForConversation(conversation: ConversationBaseInfo, isMute: boolean) {
      logger.info('[ConversationStore] Setting silent mode:', conversation.conversationId, isMute)
      
      try {
        const connStore = useConnStore()
        if (isMute) {
          await connStore.getChatConn.setSilentModeForConversation({
            conversationId: conversation.conversationId,
            type: conversation.conversationType === 'singleChat' ? 'chat' : 'groupchat',
            options: { paramType: 0, remindType: 'NONE' }
          })
        } else {
          await connStore.getChatConn.clearRemindTypeForConversation({
            conversationId: conversation.conversationId,
            type: conversation.conversationType === 'singleChat' ? 'chat' : 'groupchat'
          })
        }
        
        // 更新本地状态
        if (isMute) {
          this.muteConvsMap[conversation.conversationId] = true
        } else {
          delete this.muteConvsMap[conversation.conversationId]
        }
        
        logger.info('[ConversationStore] Successfully set silent mode')
      } catch (error) {
        logger.error('[ConversationStore] Failed to set silent mode:', error)
        throw error
      }
    },

    /**
     * 删除会话
     */
    async deleteConversation(conversation: ConversationBaseInfo) {
      logger.info('[ConversationStore] Deleting conversation:', conversation.conversationId)
      
      try {
        const connStore = useConnStore()
        await connStore.getChatConn.deleteConversation({
          channel: conversation.conversationType,
          conversationId: conversation.conversationId
        })
        
        // 从列表移除
        const index = this.conversationList.findIndex(
          c => c.conversationId === conversation.conversationId
        )
        if (index > -1) {
          this.conversationList.splice(index, 1)
        }
        
        // 清理相关数据
        const messageStore = useMessageStore()
        messageStore.clearConversationMessages(conversation.conversationId)
        
        logger.info('[ConversationStore] Successfully deleted conversation')
      } catch (error) {
        logger.error('[ConversationStore] Failed to delete conversation:', error)
        throw error
      }
    },

    /**
     * 标记会话已读
     */
    async markConversationRead(conversation: ConversationBaseInfo) {
      logger.info('[ConversationStore] Marking conversation as read:', conversation.conversationId)
      
      try {
        const connStore = useConnStore()
        const conn = connStore.getChatConn
        
        // 创建已读回执消息 (使用 channel 类型)
        const readMsg = chatSDK.message.create({
          type: 'channel',
          chatType: conversation.conversationType,
          to: conversation.conversationId
        })
        
        // 发送已读回执
        await conn.send(readMsg)
        
        // 更新本地未读数
        const conv = this.getConversationById(conversation.conversationId)
        if (conv) {
          conv.unReadCount = 0
        }
      } catch (error) {
        logger.error('[ConversationStore] Failed to mark read:', error)
      }
    },

    /**
     * 更新会话的最后一条消息
     */
    updateConversationLastMessage(
      conversation: ConversationBaseInfo,
      message: MixedMessageBody,
      unReadCount: number
    ) {
      const conv = this.getConversationById(conversation.conversationId)
      if (conv) {
        conv.lastMessage = message
        conv.unReadCount = unReadCount
      }
    },

    /**
     * 将会话移到顶部
     */
    moveConversationTop(conversation: UIKITConversationItem) {
      const index = this.conversationList.findIndex(
        c => c.conversationId === conversation.conversationId
      )
      if (index > -1) {
        const [conv] = this.conversationList.splice(index, 1)
        this.conversationList.unshift(conv)
      } else {
        this.conversationList.unshift(conversation)
      }
    },

    /**
     * 创建新会话
     */
    createConversation(
      conversation: ConversationBaseInfo,
      message: MixedMessageBody,
      unReadCount: number
    ): UIKITConversationItem {
      const newConv: UIKITConversationItem = {
        conversationId: conversation.conversationId,
        conversationType: conversation.conversationType,
        lastMessage: message,
        unReadCount
      }
      this.conversationList.push(newConv)
      return newConv
    },

    /**
     * 设置 @ 类型
     */
    setAtTypeByMessage(msg: MixedMessageBody) {
      if (msg.chatType !== 'groupChat' || msg.type !== 'txt') return
      
      const convId = this.getCvsIdFromMessage(msg)
      const conv = this.getConversationById(convId)
      if (!conv) return

      const content = msg.msg || ''
      const atType: AT_TYPE = content.includes(AT_ALL) 
        ? 'ALL' 
        : content.includes(msg.to) 
          ? 'ME' 
          : 'NONE'
      
      conv.atType = atType
    },

    /**
     * 清空数据
     */
    clear() {
      this.conversationList = []
      this.currConversation = null
      this.muteConvsMap = {}
      this.pageParams = { pageSize: 20, cursor: '' }
      this.pinParams = { pageSize: 20, cursor: '' }
    }
  }
})
