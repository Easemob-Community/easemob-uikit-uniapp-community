<template>
  <view class="me-wrap">
    <view class="me-info-wrap">
      <Avatar
        class="me-avatar"
        :src="userInfo.avatar"
        :size="100"
        :placeholder="USER_AVATAR_URL"
        :withPresence="true"
        :presenceExt="userInfo.presenceExt"
        :isOnline="userInfo.isOnline"
      />
      <view class="name">{{ userInfo.name || userId }}</view>
      <view class="userId">
        {{ "ID: " + userId }}
        <view class="copy" @tap="copy">复制</view>
      </view>
    </view>
    <view class="content">
      <view class="menu-group-name">设置</view>
      <view class="menu-wrap">
        <view class="menu-item" @tap="logout">
          <text class="menu-title">退出登录</text>
          <text class="arrow">></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import Avatar from '../../ChatUIKit/components/Avatar/index.vue'
import { USER_AVATAR_URL } from '../../ChatUIKit/const/index'
import { CHAT_STORE } from '../../ChatUIKit/const/index'

export default {
  components: {
    Avatar
  },
  
  data() {
    return {
      USER_AVATAR_URL,
      userId: '',
      userInfo: {}
    }
  },
  
  onShow() {
    this.getUserInfo()
  },
  
  methods: {
    getUserInfo() {
      const conn = this.$store.state.conn.conn
      if (conn) {
        this.userId = conn.user
      }
      // 从 store 获取用户信息
      const state = this.$store.state
      if (state.data && state.data.userInfos) {
        this.userInfo = state.data.userInfos[this.userId] || {}
      }
    },
    
    copy() {
      uni.setClipboardData({
        data: this.userId,
        success: () => {
          uni.showToast({ title: '已复制', icon: 'none' })
        }
      })
    },
    
    logout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 执行登出
            this.$store.dispatch('conn/closeConn')
            uni.removeStorageSync(CHAT_STORE)
            uni.reLaunch({
              url: '/pages/login/index'
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.me-wrap {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.me-info-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.me-avatar {
  margin-bottom: 16px;
}

.name {
  font-size: 20px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 8px;
}

.userId {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy {
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-size: 12px;
}

.content {
  padding: 16px;
}

.menu-group-name {
  font-size: 12px;
  color: #999;
  margin: 16px 8px 8px;
}

.menu-wrap {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background: #f5f5f5;
  }
}

.menu-title {
  font-size: 16px;
  color: #333;
}

.arrow {
  font-size: 14px;
  color: #999;
}
</style>
