import store from './stores'

// ChatUIKit 主类
class ChatUIKit {
  constructor() {
    this.store = store
    this._initialized = false
    this._chatConn = null
  }

  /**
   * 初始化 ChatUIKit
   * @param {object} params - 初始化参数
   * @param {object} params.chat - 环信 SDK 实例
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
   */
  _setupSDKListeners() {
    if (!this._chatConn) return

    // 监听连接成功
    this._chatConn.addEventHandler('chatUIKitConn', {
      onConnected: () => {
        console.log('SDK connected')
        this.store.commit('conn/SET_CONNECTED', true)
        uni.$emit('chatConnected')
      },
      
      onDisconnected: () => {
        console.log('SDK disconnected')
        this.store.commit('conn/SET_CONNECTED', false)
        uni.$emit('chatDisconnected')
      },
      
      onOnline: () => {
        console.log('SDK online')
      },
      
      onOffline: () => {
        console.log('SDK offline')
      },
      
      onError: (error) => {
        console.error('SDK error:', error)
      },
      
      // 收到新消息
      onTextMessage: (message) => this._handleNewMessage(message),
      onImageMessage: (message) => this._handleNewMessage(message),
      onAudioMessage: (message) => this._handleNewMessage(message),
      onVideoMessage: (message) => this._handleNewMessage(message),
      onFileMessage: (message) => this._handleNewMessage(message),
      onCustomMessage: (message) => this._handleNewMessage(message),
      
      // 收到已读回执
      onChannelMessage: (message) => {
        console.log('Channel message:', message)
      }
    })
  }

  /**
   * 处理新消息
   */
  _handleNewMessage(message) {
    console.log('New message:', message)
    // 通过事件总线通知
    uni.$emit('chatOnNewMessage', message)
    // 刷新会话列表
    this.store.dispatch('conversation/getConversationList')
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
}

// 导出单例
const chatUIKit = new ChatUIKit()

export default chatUIKit
export { chatUIKit, store }
