<template>
  <view class="user-item-wrap">
    <Avatar :src="userInfo.avatar" :placeholder="USER_AVATAR_URL" :size="40" />
    <view class="user-name">{{ userInfo.name }}</view>
  </view>
</template>

<script>
import Avatar from '../../../../components/Avatar/index.vue'
import { USER_AVATAR_URL } from '../../../../const/index'

export default {
  components: {
    Avatar
  },
  
  props: {
    user: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  
  data() {
    return {
      USER_AVATAR_URL
    }
  },
  
  computed: {
    userInfo() {
      return {
        name: this.user.name || this.user.nickname || this.user.userId,
        avatar: this.user.avatar || this.user.avatarURL || ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.user-item-wrap {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #fff;
  border-bottom: 0.5px solid #e3e6e8;
  width: 100%;
}

.user-name {
  margin-left: 12px;
  font-size: 16px;
  color: #171a1c;
}
</style>
