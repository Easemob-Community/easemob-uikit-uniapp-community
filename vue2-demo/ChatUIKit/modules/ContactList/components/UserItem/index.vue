<template>
  <view class="user-item-wrap" @tap="onTap">
    <Avatar 
      :src="userInfo.avatar" 
      :placeholder="userAvatarPlaceholder"
      :withPresence="showPresenceIndicator"
      :userId="safeUser.userId || ''"
    />
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
    featureConfig() {
      return this.$store.getters['config/getFeatureConfig'] || {}
    },
    
    safeUser() {
      return this.user || {}
    },
    
    userInfo() {
      const userId = this.safeUser.userId || ''
      // 从 store 获取用户信息
      const storeUser = userId ? this.$store.getters['appUser/getUserInfo'](userId) : {}
      return {
        name: storeUser.nickname || storeUser.name || this.safeUser.name || userId,
        avatar: storeUser.avatarURL || storeUser.avatar || this.safeUser.avatar || ''
      }
    },
    
    showPresenceIndicator() {
      // 检查功能配置是否启用在线状态
      if (this.featureConfig.usePresence === false) {
        return false
      }
      return true
    }
  },
  
  methods: {
    onTap() {
      if (this.safeUser.userId) {
        this.$emit('onTap', this.safeUser.userId)
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
  position: relative;
}

.user-info {
  margin-left: 12px;
  flex: 1;
}

.user-name {
  font-size: 16px;
  color: #171a1c;
}

.presence-debug {
  position: absolute;
  left: 45px;
  top: 5px;
  width: 16px;
  height: 16px;
  background: #ff0000;
  color: #fff;
  border-radius: 50%;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
