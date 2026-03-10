<template>
  <view class="user-item-wrap" @tap="onTap">
    <Avatar :src="userInfo.avatar" :placeholder="userAvatarPlaceholder" />
    <view class="user-info">
      <view class="user-name">{{ userInfo.name }}</view>
    </view>
  </view>
</template>

<script>
import Avatar from '../../../../components/Avatar'
import { USER_AVATAR_URL } from '../../../../const'

export default {
  name: 'UserItem',
  
  components: {
    Avatar
  },
  
  props: {
    user: {
      type: Object,
      default: () => ({})
    }
  },
  
  data() {
    return {
      userAvatarPlaceholder: USER_AVATAR_URL
    }
  },
  
  computed: {
    userInfo() {
      const userId = this.user.userId
      // 从 store 获取用户信息
      const storeUser = this.$store.getters['appUser/getUserInfo'](userId)
      return {
        name: storeUser.nickname || storeUser.name || this.user.name || userId,
        avatar: storeUser.avatarURL || storeUser.avatar || this.user.avatar || ''
      }
    }
  },
  
  methods: {
    onTap() {
      this.$emit('onTap', this.user.userId)
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
}

.user-info {
  margin-left: 12px;
  flex: 1;
}

.user-name {
  font-size: 16px;
  color: #171a1c;
}
</style>
