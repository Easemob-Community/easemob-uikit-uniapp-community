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
        
        <view class="input-group">
          <text class="label">Token</text>
          <input 
            class="input" 
            v-model="form.token" 
            placeholder="请输入Token"
            password
            @confirm="handleLogin"
          />
        </view>
        
        <button 
          class="login-btn" 
          :loading="loading" 
          :disabled="loading || !form.userId || !form.token"
          @click="handleLogin"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </view>
      
      <view class="tips">
        <text>测试账号可以在环信控制台创建</text>
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
        token: ''
      },
      loading: false
    }
  },
  
  methods: {
    ...mapActions('conn', ['login']),
    
    async handleLogin() {
      if (!this.form.userId || !this.form.token) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' })
        return
      }
      
      this.loading = true
      
      try {
        await this.login({
          user: this.form.userId,
          accessToken: this.form.token
        })
        
        uni.showToast({ title: '登录成功', icon: 'success' })
        
        // 跳转会话列表
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/conversation/index'
          })
        }, 500)
        
      } catch (error) {
        uni.showToast({ 
          title: error.message || '登录失败', 
          icon: 'none',
          duration: 2000
        })
      } finally {
        this.loading = false
      }
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
  
  text {
    font-size: 24rpx;
    color: #999;
  }
}
</style>
