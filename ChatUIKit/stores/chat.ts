/**
 * 聊天状态管理 Store
 * 原 MobX 类：ChatStore
 * 
 * 重构优化：
 * 1. 整合 SDK 事件处理
 * 2. 协调其他 Store 的数据流
 */

import { defineStore } from 'pinia'
import type { ConnState, Chat } from '../types/index'
import { useConnStore } from './conn'
import { useConfigStore } from './config'
import { useAppUserStore } from './appUser'
import { useContactStore } from './contact'
import { useConversationStore } from './conversation'
import { useGroupStore } from './group'
import { useMessageStore } from './message'
import { GroupEventFromIds } from '../const/index'
import { logger } from '../log'

interface ChatState {
  /** 是否已初始化 SDK 事件 */
  isInitEvent: boolean
  /** 连接状态 */
  connState: ConnState
}

export const useChatStore = defineStore('chat', {
  state: (): ChatState => ({
    isInitEvent: false,
    connState: 'none'
  }),

  getters: {
    /**
     * 获取连接状态
     */
    getConnState: (state) => state.connState,

    /**
     * 检查是否已登录
     */
    isLogin: () => {
      const connStore = useConnStore()
      try {
        return !connStore.getChatConn().logout
      } catch {
        return false
      }
    }
  },

  actions: {
    /**
     * 设置连接状态
     */
    setConnState(state: ConnState) {
      logger.info('[ChatStore] Connection state changed to:', state)
      this.connState = state
    },

    /**
     * 初始化 SDK 事件监听
     * 重构：使用箭头函数保持 this 指向
     */
    initSDKEvent() {
      if (this.isInitEvent) return
      
      logger.info('[ChatStore] Initializing SDK events')
      const connStore = useConnStore()
      const conn = connStore.getChatConn()

      // 连接成功
      conn.addEventHandler('chatStore', {
        onConnected: () => {
          this.setConnState('connected')
        },

        onDisconnected: () => {
          this.setConnState('disconnected')
        },

        onReconnecting: () => {
          this.setConnState('reconnecting')
        },

        // 文本消息
        onTextMessage: (msg: MixedMessageBody) => {
          this.handleReceivedMessage(msg)
        },

        // 图片消息
        onImageMessage: (msg: MixedMessageBody) => {
          this.handleReceivedMessage(msg)
        },

        // 语音消息
        onAudioMessage: (msg: MixedMessageBody) => {
          this.handleReceivedMessage(msg)
        },

        // 视频消息
        onVideoMessage: (msg: MixedMessageBody) => {
          this.handleReceivedMessage(msg)
        },

        // 文件消息
        onFileMessage: (msg: MixedMessageBody) => {
          this.handleReceivedMessage(msg)
        },

        // 自定义消息
        onCustomMessage: (msg: MixedMessageBody) => {
          this.handleReceivedMessage(msg)
        },

        // 撤回消息
        onRecallMessage: (msg: { mid: string; from: string }) => {
          const messageStore = useMessageStore()
          messageStore.onRecallMessage(msg.mid, msg.from)
        },

        // 消息已读
        onReadMessage: (message: { id: string; mid: string }) => {
          const messageStore = useMessageStore()
          messageStore.updateMessageStatus(message.mid, 'read')
        },

        // 联系人相关
        onContactInvited: (msg: Chat.ContactMsgBody) => {
          const contactStore = useContactStore()
          contactStore.addContactNotice({
            ...msg,
            ext: 'invited',
            time: Date.now()
          })
        },

        onContactAdded: (msg: Chat.ContactMsgBody) => {
          const contactStore = useContactStore()
          contactStore.getContacts()
          contactStore.addContactNotice({
            ...msg,
            ext: 'added',
            time: Date.now()
          })
        },

        onContactDeleted: (msg: Chat.ContactMsgBody) => {
          const contactStore = useContactStore()
          contactStore.deleteStoreContact(msg.from)
        },

        onContactAgreed: (msg: Chat.ContactMsgBody) => {
          const contactStore = useContactStore()
          contactStore.removeContactNotice(msg.from)
          contactStore.getContacts()
        },

        onContactRefuse: (msg: Chat.ContactMsgBody) => {
          const contactStore = useContactStore()
          contactStore.removeContactNotice(msg.from)
        },

        // 群组相关
        onGroupEvent: (event: Chat.GroupEvent) => {
          this.handleGroupEvent(event)
        },

        // 会话相关
        onConversationDelete: (conversation: Chat.ConversationItem) => {
          const convStore = useConversationStore()
          convStore.deleteConversation({
            conversationId: conversation.conversationId,
            conversationType: conversation.conversationType
          })
        },

        onConversationRead: (conversation: Chat.ConversationItem) => {
          const convStore = useConversationStore()
          const conv = convStore.getConversationById(conversation.conversationId)
          if (conv) {
            conv.unReadCount = 0
          }
        },

        onMuted: (data: { conversationId: string; conversationType: Chat.ChatType }) => {
          const convStore = useConversationStore()
          convStore.muteConvsMap[data.conversationId] = true
        },

        onUnMuted: (data: { conversationId: string; conversationType: Chat.ChatType }) => {
          const convStore = useConversationStore()
          delete convStore.muteConvsMap[data.conversationId]
        },

        onConversationPinned: (data: { conversationId: string; conversationType: Chat.ChatType }) => {
          const convStore = useConversationStore()
          const conv = convStore.getConversationById(data.conversationId)
          if (conv) {
            conv.isPinned = true
            conv.pinnedTime = Date.now()
          }
        },

        onConversationUnpinned: (data: { conversationId: string; conversationType: Chat.ChatType }) => {
          const convStore = useConversationStore()
          const conv = convStore.getConversationById(data.conversationId)
          if (conv) {
            conv.isPinned = false
            conv.pinnedTime = undefined
          }
        }
      })

      this.isInitEvent = true
      logger.info('[ChatStore] SDK events initialized')
    },

    /**
     * 处理接收到的消息
     */
    handleReceivedMessage(msg: MixedMessageBody) {
      const messageStore = useMessageStore()
      const appUserStore = useAppUserStore()

      // 获取发送者信息
      if (msg.from) {
        GroupEventFromIds.add(msg.from)
      }

      // 处理消息
      messageStore.onMessage(msg)

      // 异步获取用户信息
      if (msg.from) {
        appUserStore.getUsersInfoFromServer({ userIdList: [msg.from] })
      }
    },

    /**
     * 处理群组事件
     */
    handleGroupEvent(event: Chat.GroupEvent) {
      const groupStore = useGroupStore()
      const convStore = useConversationStore()

      // 获取相关用户信息
      if (event.from) {
        GroupEventFromIds.add(event.from)
      }

      switch (event.operation) {
        case 'memberPresence':
        case 'memberAbsence':
          // 成员进出，刷新群详情
          groupStore.fetchGroupDetails([event.gid])
          break

        case 'destroy':
          // 群解散
          groupStore.removeGroupFromList(event.gid)
          break

        case 'removedFromGroup':
          // 被移出群
          if (event.from === useConnStore().getChatConn().user) {
            groupStore.removeGroupFromList(event.gid)
          }
          break

        case 'updateAnnouncement':
        case 'updateInfo':
          // 群信息更新
          groupStore.fetchGroupDetails([event.gid])
          break

        default:
          break
      }
    },

    /**
     * 登录
     */
    async login(params: { user: string; pwd?: string; accessToken?: string }) {
      logger.info('[ChatStore] Logging in:', params.user)
      
      try {
        const connStore = useConnStore()
        const configStore = useConfigStore()
        const convStore = useConversationStore()
        const contactStore = useContactStore()
        const groupStore = useGroupStore()
        const appUserStore = useAppUserStore()

        const res = await connStore.getChatConn().open(params)
        logger.info('[ChatStore] Login successful')

        // 初始化 SDK 事件
        this.initSDKEvent()

        // 并行加载数据
        const featureConfig = configStore.getFeatureConfig()
        
        if (featureConfig.pinConversation) {
          convStore.getServerPinnedConversations()
        } else {
          convStore.getConversationList()
        }
        
        contactStore.getContacts()
        groupStore.getJoinedGroupList()
        
        appUserStore.getUsersInfoFromServer({ userIdList: [params.user] })
        appUserStore.getUsersPresenceFromServer({ userIdList: [params.user] })

        return res
      } catch (error) {
        logger.error('[ChatStore] Login failed:', error)
        throw error
      }
    },

    /**
     * 登出
     */
    async logout() {
      logger.info('[ChatStore] Logging out')
      
      try {
        const connStore = useConnStore()
        await connStore.getChatConn().close()
        this.clearStore()
        logger.info('[ChatStore] Logout successful')
      } catch (error) {
        logger.error('[ChatStore] Logout failed:', error)
        throw error
      }
    },

    /**
     * 清空所有 Store 数据
     */
    clearStore() {
      logger.info('[ChatStore] Clearing all stores')
      
      useConversationStore().clear()
      useMessageStore().clear()
      useContactStore().clear()
      useGroupStore().clear()
      useAppUserStore().clear()
      
      this.isInitEvent = false
      this.connState = 'none'
    },

    /**
     * 检测连接有效性（在 onShow 生命周期调用）
     */
    onShow() {
      if (this.isLogin()) {
        const connStore = useConnStore()
        connStore.getChatConn().onShow()
      }
    }
  }
})

// 处理 GroupEventFromIds 的类型问题
declare const GroupEventFromIds: Set<string>
interface MixedMessageBody extends Chat.MessageBody {
  noticeInfo?: any
  status?: any
  serverMsgId?: string
}
