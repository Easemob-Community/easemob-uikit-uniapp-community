import store from './stores'
import { i18n } from './locales'

// ChatUIKit 主类
class ChatUIKit {
  constructor() {
    this.store = store
    this._initialized = false
    this._chatConn = null
    this._eventHandlerName = 'chatUIKitHandler'
    this._listenersSetup = false
  }

  /**
   * 初始化 ChatUIKit
   * @param {object} params - 初始化参数
   * @param {object} params.chat - 环信 SDK 实例 (EMClient/connection)
   * @param {object} params.sdk - 环信 SDK 本身 (包含 message 方法)
   * @param {object} params.config - 配置项（可选）
   */
  init(params) {
    if (this._initialized) {
      console.warn('ChatUIKit already initialized')
      return
    }

    if (!params.chat) {
      throw new Error('SDK connection instance is required')
    }

    this._chatConn = params.chat
    
    // 初始化 store - 存储 connection 和 SDK
    this.store.commit('conn/SET_CHAT_CONN', params.chat)
    if (params.sdk) {
      this.store.commit('conn/SET_CHAT_SDK', params.sdk)
    }
    
    // 初始化配置中心
    this.store.dispatch('config/initConfig')
    
    // 初始化 i18n
    i18n.init()
    
    // 如果传入自定义配置，合并到配置中心
    if (params.config) {
      this.store.dispatch('config/updateConfig', params.config)
      // 如果配置了语言，同步设置 i18n
      if (params.config.language) {
        i18n.setLocale(params.config.language)
      }
    } else {
      // 同步配置中心的语言设置到 i18n
      const storedLang = uni.getStorageSync('ChatUIKit_Locale')
      if (storedLang) {
        i18n.setLocale(storedLang)
      }
    }
    
    // 设置 SDK 监听
    this._setupSDKListeners()
    
    this._initialized = true
    console.log('ChatUIKit initialized')
  }

  /**
   * 设置 SDK 事件监听
   * 参考 ChatUIKit/stores/chat.ts 的实现
   */
  _setupSDKListeners() {
    if (!this._chatConn) return
    if (this._listenersSetup) return
    
    this._listenersSetup = true
    const conn = this._chatConn

    // 添加事件处理器
    conn.addEventHandler(this._eventHandlerName, {
      // 连接成功
      onConnected: () => {
        console.log('[ChatUIKit] SDK connected')
        this.store.commit('conn/SET_CONNECTED', true)
        this.store.commit('conn/SET_LOGIN_STATUS', true)
        
        // 获取当前用户信息
        this.store.dispatch('appUser/getSelfUserInfoFromServer')
        
        // 注：在线状态由 onPresenceStatusChange 事件回调自动更新，无需主动获取
        
        // 加载初始数据
        this._loadInitialData()
        
        // 通知登录成功
        uni.$emit('chatLoginSuccess')
        uni.$emit('chatConnected')
      },

      // 连接断开
      onDisconnected: () => {
        console.log('[ChatUIKit] SDK disconnected')
        this.store.commit('conn/SET_CONNECTED', false)
        uni.$emit('chatDisconnected')
      },

      // 重连中
      onReconnecting: () => {
        console.log('[ChatUIKit] SDK reconnecting')
        uni.$emit('chatReconnecting')
      },

      // 文本消息
      onTextMessage: (msg) => {
        this._handleReceivedMessage(msg)
      },

      // 图片消息
      onImageMessage: (msg) => {
        this._handleReceivedMessage(msg)
      },

      // 语音消息
      onAudioMessage: (msg) => {
        this._handleReceivedMessage(msg)
      },

      // 视频消息
      onVideoMessage: (msg) => {
        this._handleReceivedMessage(msg)
      },

      // 文件消息
      onFileMessage: (msg) => {
        this._handleReceivedMessage(msg)
      },

      // 自定义消息
      onCustomMessage: (msg) => {
        this._handleReceivedMessage(msg)
      },

      // 撤回消息
      onRecallMessage: (msg) => {
        console.log('[ChatUIKit] Message recalled:', msg)
        // 处理消息撤回
        this.store.dispatch('message/onRecallMessage', {
          mid: msg.mid,
          from: msg.from
        })
        uni.$emit('chatRecallMessage', msg)
      },

      // 消息被修改（编辑）
      onModifiedMessage: (msg) => {
        console.log('[ChatUIKit] Message modified:', msg)
        // 更新本地消息
        if (msg.mid && msg.msg) {
          this.store.dispatch('message/updateModifiedMessage', {
            mid: msg.mid,
            msg: msg.msg,
            from: msg.from
          })
        }
        uni.$emit('chatModifiedMessage', msg)
      },

      // 消息已读回执
      onReadMessage: (msg) => {
        console.log('[ChatUIKit] Message read:', msg)
        // 更新消息状态为已读
        this.store.dispatch('message/updateMessageStatus', {
          msgId: msg.mid,
          status: 'read'
        })
        uni.$emit('chatReadMessage', msg)
      },

      // 会话已读（channel ack）
      onChannelMessage: (msg) => {
        console.log('[ChatUIKit] Channel message:', msg)
        // 只更新对应会话的未读数，不刷新整个列表
        if (msg.from) {
          const conversationId = msg.from
          this.store.commit('conversation/UPDATE_CONVERSATION', {
            conversationId: conversationId,
            updates: { unReadCount: 0 }
          })
          // 重新计算总未读数
          this.store.dispatch('conversation/recalculateTotalUnread')
        }
        uni.$emit('chatChannelMessage', msg)
      },

      // 联系人相关事件
      onContactInvited: (msg) => {
        console.log('[ChatUIKit] Contact invited:', msg)
        // 添加好友申请通知
        this.store.dispatch('contact/addContactNotice', {
          from: msg.from,
          to: msg.to,
          status: 'pending',
          ext: 'invited',
          time: Date.now()
        })
        uni.$emit('chatContactInvited', msg)
      },

      onContactAdded: (msg) => {
        console.log('[ChatUIKit] Contact added:', msg)
        // 刷新联系人列表
        this.store.dispatch('contact/getContactsFromServer')
        uni.$emit('chatContactAdded', msg)
      },

      onContactDeleted: (msg) => {
        console.log('[ChatUIKit] Contact deleted:', msg)
        // 从本地移除联系人
        this.store.commit('contact/REMOVE_CONTACT', msg.from)
        uni.$emit('chatContactDeleted', msg)
      },

      onContactAgreed: (msg) => {
        console.log('[ChatUIKit] Contact agreed:', msg)
        // 刷新联系人列表
        this.store.dispatch('contact/getContactsFromServer')
        uni.$emit('chatContactAgreed', msg)
      },

      onContactRefuse: (msg) => {
        console.log('[ChatUIKit] Contact refused:', msg)
        uni.$emit('chatContactRefuse', msg)
      },

      // 群组事件
      onGroupEvent: (event) => {
        console.log('[ChatUIKit] Group event:', event)
        uni.$emit('chatGroupEvent', event)
      },

      // 会话相关事件
      onConversationDelete: (conversation) => {
        console.log('[ChatUIKit] Conversation deleted:', conversation)
        this.store.commit('conversation/REMOVE_CONVERSATION', conversation.conversationId)
        uni.$emit('chatConversationDelete', conversation)
      },

      onConversationRead: (conversation) => {
        console.log('[ChatUIKit] Conversation read:', conversation)
        // 更新会话未读数为0
        this.store.commit('conversation/UPDATE_CONVERSATION', {
          conversationId: conversation.conversationId,
          updates: { unReadCount: 0 }
        })
        uni.$emit('chatConversationRead', conversation)
      },

      // 错误处理
      onError: (error) => {
        console.error('[ChatUIKit] SDK error:', error)
        uni.$emit('chatError', error)
      },

      // 在线状态变更 - SDK 事件回调
      onPresenceStatusChange: (msg) => {
        // 更新用户在线状态到 stores
        if (msg && msg.length > 0) {
          msg.forEach((item) => {
            let isOnline = false
            // SDK 返回的是 statusDetails 数组
            if (item.statusDetails && Array.isArray(item.statusDetails)) {
              // 检查是否有任一设备状态为 1（在线）
              isOnline = item.statusDetails.some(detail => detail.status === 1)
            } else if (
              item.status &&
              typeof item.status === 'object' &&
              !Array.isArray(item.status)
            ) {
              // 兼容旧版格式
              const statusValues = Object.values(item.status)
              if (statusValues.indexOf('1') > -1) isOnline = true
            }
            this.store.commit('appUser/SET_USER_PRESENCE', {
              userId: item.uid || item.userId,
              presence: {
                presenceExt: item.ext || '',
                isOnline: isOnline
              }
            })
          })
        }
        uni.$emit('chatPresenceStatusChange', msg)
      },

      // 在线状态
      onOnline: () => {
        console.log('[ChatUIKit] SDK online')
        uni.$emit('chatOnline')
      },

      onOffline: () => {
        console.log('[ChatUIKit] SDK offline')
        uni.$emit('chatOffline')
      }
    })

    console.log('[ChatUIKit] SDK event listeners registered')
  }

  /**
   * 处理接收到的消息
   * @param {object} msg - 消息对象
   */
  _handleReceivedMessage(msg) {
    console.log('[ChatUIKit] Received message:', msg)
    
    // 处理消息 - 添加到消息列表并更新会话
    this.store.dispatch('message/onMessage', msg)
    
    // 通知新消息
    uni.$emit('chatOnNewMessage', msg)
  }

  /**
   * 加载初始数据（登录后或连接成功后调用）
   */
  _loadInitialData() {
    console.log('[ChatUIKit] Loading initial data...')
    
    // 加载会话列表（首次从服务器获取）
    this.store.dispatch('conversation/getServerConversations')
    
    // 加载群组列表（用于显示群头像和名称）
    this.store.dispatch('group/getJoinedGroupList')
  }

  /**
   * 检测连接有效性（在 App onShow 生命周期调用）
   */
  onShow() {
    if (this.isLoggedIn()) {
      try {
        this._chatConn.onShow()
      } catch (e) {
        console.error('[ChatUIKit] onShow error:', e)
      }
    }
  }

  /**
   * 获取 Store 实例
   */
  getStore() {
    return this.store
  }

  /**
   * 获取当前登录状态
   */
  isLoggedIn() {
    return this.store.getters['conn/isLoggedIn']
  }

  /**
   * 获取 SDK 连接实例
   */
  getChatConn() {
    return this._chatConn
  }
}

// 导出单例
const chatUIKit = new ChatUIKit()

export default chatUIKit
export { chatUIKit, store }
