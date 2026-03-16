<template>
  <view class="login-container">
    <view class="login-box">
      <view class="logo">
        <text class="logo-text">EaseIM Chat</text>
        <text class="sdk-version" v-if="sdkVersion">SDK v{{ sdkVersion }}</text>
      </view>
      
      <view class="form">
        <view class="input-group">
          <text class="label">{{ $t('login.username') }}</text>
          <input 
            class="input" 
            v-model="form.userId" 
            :placeholder="$t('login.userIdPlaceholder')"
            @confirm="handleLogin"
          />
        </view>
        
        <!-- 登录方式切换 -->
        <view class="login-type-tabs">
          <view 
            class="tab" 
            :class="{ active: loginType === 'token' }"
            @click="loginType = 'token'"
          >
            <text>{{ $t('login.tokenLogin') }}</text>
          </view>
          <view 
            class="tab" 
            :class="{ active: loginType === 'password' }"
            @click="loginType = 'password'"
          >
            <text>{{ $t('login.passwordLogin') }}</text>
          </view>
        </view>
        
        <view class="input-group" v-if="loginType === 'token'">
          <text class="label">{{ $t('login.token') }}</text>
          <input 
            class="input" 
            v-model="form.token" 
            :placeholder="$t('login.tokenPlaceholder')"
            password
            @confirm="handleLogin"
          />
        </view>
        
        <view class="input-group" v-else>
          <text class="label">{{ $t('login.password') }}</text>
          <input 
            class="input" 
            v-model="form.password" 
            :placeholder="$t('login.passwordPlaceholder')"
            password
            @confirm="handleLogin"
          />
        </view>
        
        <button 
          class="login-btn" 
          :loading="loading" 
          :disabled="loading || !form.userId || !(form.token || form.password)"
          @click="handleLogin"
        >
          {{ loading ? $t('login.loggingIn') : $t('login.login') }}
        </button>
      </view>
      
      <view class="tips">
        <text class="tip-text">{{ $t('login.tip') }}</text>
        <text class="tip-link" @click="openConsole">{{ $t('login.console') }}</text>
      </view>
      
      <!-- AppKey 配置提示 -->
      <view class="config-tip" v-if="showConfigTip">
        <text class="config-title">⚠️ {{ $t('login.configAppKeyTitle') }}</text>
        <text class="config-content">{{ $t('login.configAppKeyContent') }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Login',
  
  data() {
    return {
      form: {
        userId: '',
        token: '',
        password: ''
      },
      loginType: 'token', // 'token' 或 'password'
      loading: false,
      showConfigTip: false,
      sdkVersion: ''
    }
  },
  
  mounted() {
    // 检查是否配置了 AppKey
    this.checkAppKeyConfig()
    // 获取 SDK 版本
    this.getSDKVersion()
  },
  
  methods: {
    ...mapActions('conn', ['login']),
    
    checkAppKeyConfig() {
      // 简单的检查，实际应该读取配置文件
      const isDefaultAppKey = true // 这里可以读取实际的配置
      if (isDefaultAppKey) {
        this.showConfigTip = true
      }
    },
    
    getSDKVersion() {
      try {
        // 使用 getter 获取 SDK，避免访问被 Vue 观察的 state
        const chatSDK = this.$store.getters['conn/getChatSDK']
        if (chatSDK && chatSDK.version) {
          this.sdkVersion = chatSDK.version
          console.log('[Login] SDK Version:', this.sdkVersion)
        } else {
          // 如果 store 中没有，说明 SDK 还未初始化到 store
          console.log('[Login] SDK version not available in store, trying direct import...')
          // 尝试直接导入获取版本
          const { EMClient } = require('../../../utils/IM')
          if (EMClient && EMClient.version) {
            this.sdkVersion = EMClient.version
            console.log('[Login] SDK Version (from import):', this.sdkVersion)
          }
        }
      } catch (error) {
        console.log('[Login] Failed to get SDK version:', error)
      }
    },
    
    async handleLogin() {
      if (!this.form.userId) {
        uni.showToast({ title: this.$t('login.userIdPlaceholder'), icon: 'none' })
        return
      }
      
      if (this.loginType === 'token' && !this.form.token) {
        uni.showToast({ title: this.$t('login.tokenPlaceholder'), icon: 'none' })
        return
      }
      
      if (this.loginType === 'password' && !this.form.password) {
        uni.showToast({ title: this.$t('login.passwordPlaceholder'), icon: 'none' })
        return
      }
      
      this.loading = true
      
      try {
        const loginParams = {
          user: this.form.userId
        }
        
        if (this.loginType === 'token') {
          loginParams.accessToken = this.form.token
        } else {
          loginParams.pwd = this.form.password
        }
        
        await this.login(loginParams)
        
        // 注：用户信息和在线状态由 SDK 事件回调自动更新
        
        uni.showToast({ title: this.$t('login.loginSuccess'), icon: 'success' })
        
        // 跳转会话列表（使用 switchTab 跳转到 tabbar 页面）
        setTimeout(() => {
          uni.switchTab({
            url: '/ChatUIKit/modules/Conversation/index'
          })
        }, 500)
        
      } catch (error) {
        console.error('登录失败:', error)
        
        let errorMsg = this.$t('login.loginFailed')
        if (error.message && error.message.includes('appKey')) {
          errorMsg = this.$t('login.configAppKey')
          this.showConfigTip = true
        } else if (error.message) {
          errorMsg = error.message
        }
        
        uni.showToast({ 
          title: errorMsg, 
          icon: 'none',
          duration: 3000
        })
      } finally {
        this.loading = false
      }
    },
    
    openConsole() {
      // #ifdef H5
      window.open('https://console.easemob.com', '_blank')
      // #endif
      
      // #ifndef H5
      uni.showModal({
        title: this.$t('common.tip'),
        content: this.$t('login.consoleTip'),
        showCancel: false
      })
      // #endif
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.login-box {
  width: 100%;
  max-width: 600rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
}

.logo {
  text-align: center;
  margin-bottom: 60rpx;
}

.logo-text {
  font-size: 48rpx;
  font-weight: bold;
  color: #667eea;
  display: block;
}

.sdk-version {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.form {
  .login-type-tabs {
    display: flex;
    margin-bottom: 30rpx;
    border-bottom: 2rpx solid #f0f0f0;
    
    .tab {
      flex: 1;
      text-align: center;
      padding: 20rpx 0;
      position: relative;
      
      text {
        font-size: 28rpx;
        color: #999;
      }
      
      &.active {
        text {
          color: #667eea;
          font-weight: 500;
        }
        
        &::after {
          content: '';
          position: absolute;
          bottom: -2rpx;
          left: 20%;
          right: 20%;
          height: 4rpx;
          background: #667eea;
          border-radius: 2rpx;
        }
      }
    }
  }
  
  .input-group {
    margin-bottom: 40rpx;
    
    .label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 16rpx;
    }
    
    .input {
      width: 100%;
      height: 88rpx;
      background: #f5f5f5;
      border-radius: 12rpx;
      padding: 0 24rpx;
      font-size: 28rpx;
      box-sizing: border-box;
    }
  }
}

.login-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 32rpx;
  border-radius: 12rpx;
  margin-top: 40rpx;
  
  &:disabled {
    opacity: 0.6;
  }
  
  &:active {
    opacity: 0.8;
  }
}

.tips {
  text-align: center;
  margin-top: 40rpx;
  
  .tip-text {
    display: block;
    font-size: 24rpx;
    color: #999;
    margin-bottom: 10rpx;
  }
  
  .tip-link {
    font-size: 24rpx;
    color: #667eea;
    
    &:active {
      opacity: 0.7;
    }
  }
}

.config-tip {
  margin-top: 40rpx;
  padding: 30rpx;
  background: #fff9e6;
  border-radius: 12rpx;
  border: 2rpx solid #ffd700;
  
  .config-title {
    display: block;
    font-size: 28rpx;
    color: #d4a000;
    font-weight: 500;
    margin-bottom: 10rpx;
  }
  
  .config-content {
    display: block;
    font-size: 24rpx;
    color: #b8860b;
  }
}
</style>
