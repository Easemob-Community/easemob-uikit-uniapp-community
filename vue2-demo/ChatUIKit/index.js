import store from './stores'

// ChatUIKit 主类
class ChatUIKit {
  constructor() {
    this.store = store
    this._initialized = false
    this._chatConn = null
    this._eventHandlerName = 'chatUIKitHandler'
  }

  /**
   * 初始化 ChatUIKit
   * @param {object} params - 初始化参数
   * @param {object} params.chat - 环信 SDK 实例 (EMClient)
   * @param {object} params.config - 配置项
   */
  init(params) {
    if (this._initialized) {
      console.warn('ChatUIKit already initialized')
      return
    }

    if (!params.chat) {
      throw new Error('SDK instance is required')
    }

    this._chatConn = params.chat
    
    // 初始化 store
    this.store.commit('conn/SET_CHAT_CONN', params.chat)
    
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

    const conn = this._chatConn

    // 添加事件处理器
    conn.addEventHandler(this._eventHandlerName, {
      // 连接成功
      onConnected: () => {
        console.log('[ChatUIKit] SDK connected')
        this.store.commit('conn/SET_CONNECTED', true)
        this.store.commit('conn/SET_LOGIN_STATUS', true)
        
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
        uni.$emit('chatRecallMessage', msg)
      },

      // 消息已读回执
      onReadMessage: (msg) => {
        console.log('[ChatUIKit] Message read:', msg)
        uni.$emit('chatReadMessage', msg)
      },

      // 会话已读（channel ack）
      onChannelMessage: (msg) => {
        console.log('[ChatUIKit] Channel message:', msg)
        // 刷新会话列表以更新未读数
        this.store.dispatch('conversation/getServerConversations')
        uni.$emit('chatChannelMessage', msg)
      },

      // 联系人相关事件
      onContactInvited: (msg) => {
        console.log('[ChatUIKit] Contact invited:', msg)
        uni.$emit('chatContactInvited', msg)
      },

      onContactAdded: (msg) => {
        console.log('[ChatUIKit] Contact added:', msg)
        uni.$emit('chatContactAdded', msg)
      },

      onContactDeleted: (msg) => {
        console.log('[ChatUIKit] Contact deleted:', msg)
        uni.$emit('chatContactDeleted', msg)
      },

      onContactAgreed: (msg) => {
        console.log('[ChatUIKit] Contact agreed:', msg)
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
    
    // 通知新消息
    uni.$emit('chatOnNewMessage', msg)
    
    // 刷新会话列表
    this.store.dispatch('conversation/getServerConversations')
  }

  /**
   * 加载初始数据（登录后或连接成功后调用）
   */
  _loadInitialData() {
    console.log('[ChatUIKit] Loading initial data...')
    
    // 加载会话列表（首次从服务器获取）
    this.store.dispatch('conversation/getServerConversations')
    
    // 后续可添加：加载联系人列表、群组列表等
    // this.store.dispatch('contact/getContacts')
    // this.store.dispatch('group/getGroupList')
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
