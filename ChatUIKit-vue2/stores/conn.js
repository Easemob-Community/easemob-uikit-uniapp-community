// 连接和登录状态管理
export default {
  namespaced: true,

  state: {
    // SDK 实例
    chatConn: null,
    // 登录状态
    isLogin: false,
    // 当前用户信息
    user: null,
    // 连接状态
    connected: false
  },

  getters: {
    isLoggedIn: state => state.isLogin && state.connected,
    currentUser: state => state.user,
    getChatConn: state => state.chatConn
  },

  mutations: {
    SET_CHAT_CONN(state, conn) {
      state.chatConn = conn
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
    initConn({ commit }, conn) {
      commit('SET_CHAT_CONN', conn)
    },

    // 登录
    async login({ commit, state }, { user, pwd, accessToken }) {
      if (!state.chatConn) {
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
        
        const res = await state.chatConn.open(loginParams)
        
        console.log('[ConnStore] Login success:', res)
        
        commit('SET_USER', { userId: user })
        commit('SET_LOGIN_STATUS', true)
        commit('SET_CONNECTED', true)
        
        return res
      } catch (error) {
        console.error('[ConnStore] Login failed:', error)
        throw error
      }
    },

    // 登出
    async logout({ commit, state }) {
      if (state.chatConn) {
        try {
          await state.chatConn.close()
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
