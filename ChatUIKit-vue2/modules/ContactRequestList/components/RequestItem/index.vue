<template>
  <view class="item-wrap">
    <Avatar
      class="user-avatar"
      :size="40"
      :src="avatar || userInfo.avatar"
      :placeholder="USER_AVATAR_URL"
    />
    <view class="right">
      <view class="content">
        <view class="user-name ellipsis">{{ userInfo.name }}</view>
        <view class="tip ellipsis">请求添加您为好友</view>
      </view>

      <view class="action">
        <view class="btn btn-decline" @tap="declineContactInvite">拒绝</view>
        <view class="btn btn-accept" @tap="acceptContactInvite">同意</view>
      </view>
    </view>
  </view>
</template>

<script>
import Avatar from '../../../../components/Avatar'
import { USER_AVATAR_URL } from '../../../../const/index'

export default {
  name: 'RequestItem',
  
  components: {
    Avatar
  },
  
  props: {
    user: {
      type: Object,
      required: true
    },
    avatar: {
      type: String,
      default: ''
    }
  },
  
  data() {
    return {
      USER_AVATAR_URL
    }
  },
  
  computed: {
    userInfo() {
      return this.$store.getters['appUser/getUserInfo'](this.user.userId)
    }
  },
  
  methods: {
    async acceptContactInvite() {
      // 检查是否已经是好友
      const isAlreadyContact = this.$store.getters['contact/isContact'](this.user.userId)
      
      if (isAlreadyContact) {
        uni.showToast({
          title: '已经是好友',
          icon: 'none'
        })
        // 移除该通知
        this.$store.dispatch('contact/removeContactNotice', this.user.userId)
        return
      }
      
      try {
        await this.$store.dispatch('contact/acceptContactInvite', this.user.userId)
        uni.showToast({
          title: '已同意',
          icon: 'none'
        })
      } catch (error) {
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },
    
    async declineContactInvite() {
      try {
        await this.$store.dispatch('contact/declineContactInvite', this.user.userId)
        uni.showToast({
          title: '已拒绝',
          icon: 'none'
        })
      } catch (error) {
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.item-wrap {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  height: 60px;
  align-items: center;
  padding-left: 16px;
  &:active {
    background-color: #f5f5f5;
  }
}

.user-avatar {
  margin-right: 12px;
  flex-shrink: 0;
}

.user-name {
  font-size: 16px;
  color: #171a1c;
  line-height: 22px;
  font-weight: 500;
}

.right {
  flex: 1;
  width: 0;
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: space-between;
  border-bottom: 0.5px solid #e3e6e8;
}

.content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-right: 20px;
}

.tip {
  color: #75828a;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.action {
  margin-right: 16px;
  display: flex;
  gap: 8px;
}

.btn {
  min-width: 60px;
  text-align: center;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 14px;
}

.btn-accept {
  background-color: #009dff;
  color: #f9fafa;
}

.btn-decline {
  background-color: #f5f5f5;
  color: #75828a;
  border: 0.5px solid #e3e6e8;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
