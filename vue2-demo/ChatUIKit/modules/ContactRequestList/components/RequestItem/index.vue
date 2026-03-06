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
import { USER_AVATAR_URL } from '../../../../const'

export default {
  name: 'RequestItem',
  
  components: {
    Avatar
  },
  
  props: {
    user: {
      type: Object,
      default: () => ({})
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
    acceptContactInvite() {
      // 检查是否已经是好友
      const isAlreadyContact = this.$store.state.contact.contacts.some(
        contact => contact.userId === this.user.userId
      )
      
      if (isAlreadyContact) {
        uni.showToast({
          title: '已经是好友',
          icon: 'none'
        })
        // 移除该通知
        this.$store.commit('contact/REMOVE_CONTACT_NOTICE', this.user.userId)
        return
      }
      
      this.$store.dispatch('contact/acceptContactInvite', this.user.userId)
    },
    
    declineContactInvite() {
      this.$store.dispatch('contact/declineContactInvite', this.user.userId)
    }
  }
}
</script>

<style lang="scss" scoped>
@import url("../../../../styles/common.scss");

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
</style>
