<template>
  <view class="login-container">
    <view class="login-box">
      <view class="logo">
        <text class="logo-text">环信 Chat</text>
      </view>
      
      <view class="form">
        <view class="input-group">
          <text class="label">用户ID</text>
          <input 
            class="input" 
            v-model="form.userId" 
            placeholder="请输入用户ID"
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
            <text>Token 登录</text>
          </view>
          <view 
            class="tab" 
            :class="{ active: loginType === 'password' }"
            @click="loginType = 'password'"
          >
            <text>密码登录</text>
          </view>
        </view>
        
        <view class="input-group" v-if="loginType === 'token'">
          <text class="label">Token</text>
          <input 
            class="input" 
            v-model="form.token" 
            placeholder="请输入Token"
            password
            @confirm="handleLogin"
          />
        </view>
        
        <view class="input-group" v-else>
          <text class="label">密码</text>
          <input 
            class="input" 
            v-model="form.password" 
            placeholder="请输入密码"
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
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </view>
      
      <view class="tips">
        <text class="tip-text">测试账号可以在环信控制台创建</text>
        <text class="tip-link" @click="openConsole">打开环信控制台</text>
      </view>
      
      <!-- AppKey 配置提示 -->
      <view class="config-tip" v-if="showConfigTip">
        <text class="config-title">⚠️ 请先配置 AppKey</text>
        <text class="config-content">请修改 utils/IM.js 中的 SDK_CONFIG.appKey</text>
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
      showConfigTip: false
    }
  },
  
  mounted() {
    // 检查是否配置了 AppKey
    this.checkAppKeyConfig()
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
    
    async handleLogin() {
      if (!this.form.userId) {
        uni.showToast({ title: '请输入用户ID', icon: 'none' })
        return
      }
      
      if (this.loginType === 'token' && !this.form.token) {
        uni.showToast({ title: '请输入Token', icon: 'none' })
        return
      }
      
      if (this.loginType === 'password' && !this.form.password) {
        uni.showToast({ title: '请输入密码', icon: 'none' })
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
        
        // 设置当前用户信息
        this.$store.commit('appUser/SET_SELF_USER_INFO', {
          name: this.form.userId,
          nickname: this.form.userId,
          userId: this.form.userId,
          presenceExt: 'Online',
          isOnline: true
        })
        
        uni.showToast({ title: '登录成功', icon: 'success' })
        
        // 跳转会话列表（使用 switchTab 跳转到 tabbar 页面）
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/conversation/index'
          })
        }, 500)
        
      } catch (error) {
        console.error('登录失败:', error)
        
        let errorMsg = '登录失败'
        if (error.message && error.message.includes('appKey')) {
          errorMsg = '请先在 utils/IM.js 中配置正确的 AppKey'
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
        title: '提示',
        content: '请访问 https://console.easemob.com 创建应用',
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
