// 连接和登录状态管理

// 使用外部变量存储 SDK，避免 Vue 响应式系统的影响
// SDK 实例（connection）包含内部状态，被 Vue 观察后会导致小程序报错
let _chatConn = null
let _chatSDK = null

export default {
  namespaced: true,

  state: {
    // 登录状态
    isLogin: false,
    // 当前用户信息
    user: null,
    // 连接状态
    connected: false,
    // 标记：SDK 是否已初始化（不存储实际 SDK 对象）
    _sdkInitialized: false
  },

  getters: {
    isLoggedIn: state => state.isLogin && state.connected,
    currentUser: state => state.user,
    // 从外部变量返回 SDK，避免 Vue 观察
    getChatConn: () => _chatConn,
    getChatSDK: () => _chatSDK
  },

  mutations: {
    SET_CHAT_CONN(state, conn) {
      // 存储到外部变量，避免 Vue 响应式处理
      _chatConn = conn
      state._sdkInitialized = !!(_chatConn && _chatSDK)
    },
    SET_CHAT_SDK(state, sdk) {
      // 存储到外部变量，避免 Vue 响应式处理
      _chatSDK = sdk
      state._sdkInitialized = !!(_chatConn && _chatSDK)
    },
    SET_LOGIN_STATUS(state, status) {
      state.isLogin = status
    },
    SET_USER(state, user) {
      state.user = user
    },
    SET_CONNECTED(state, connected) {
      state.connected = connected
    }
  },

  actions: {
    // 初始化 SDK 连接
    initConn({ commit }, { conn, sdk }) {
      commit('SET_CHAT_CONN', conn)
      commit('SET_CHAT_SDK', sdk)
    },

    // 登录
    async login({ commit, dispatch, getters }, { user, pwd, accessToken }) {
      const chatConn = getters.getChatConn
      if (!chatConn) {
        throw new Error('SDK not initialized')
      }
      
      try {
        // 构建登录参数
        const loginParams = { user }
        
        // 支持密码或 Token 登录
        if (accessToken) {
          loginParams.accessToken = accessToken
        } else if (pwd) {
          loginParams.pwd = pwd
        } else {
          throw new Error('Password or accessToken is required')
        }
        
        const res = await chatConn.open(loginParams)
        
        commit('SET_USER', { userId: user })
        commit('SET_LOGIN_STATUS', true)
        commit('SET_CONNECTED', true)
        
        // 登录成功后获取当前用户信息
        dispatch('appUser/getSelfUserInfoFromServer', null, { root: true })
        
        return res
      } catch (error) {
        console.error('[ConnStore] Login failed:', error)
        throw error
      }
    },

    // 登出
    async logout({ commit, getters }) {
      const chatConn = getters.getChatConn
      if (chatConn) {
        try {
          await chatConn.close()
        } catch (error) {
          console.error('[ConnStore] Logout error:', error)
        }
      }
      commit('SET_LOGIN_STATUS', false)
      commit('SET_CONNECTED', false)
      commit('SET_USER', null)
    },

    // 连接断开
    onDisconnected({ commit }) {
      commit('SET_CONNECTED', false)
    },

    // 连接成功
    onConnected({ commit }) {
      commit('SET_CONNECTED', true)
    }
  }
}
