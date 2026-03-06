<template>
  <view
    class="swipe-menu-wrap"
    @touchmove="touchMoveHandler"
    @touchstart="touchStartHandler"
    :style="{ transform: `translateX(${showDeleteMenu ? -80 : 0}px)` }"
  >
    <view class="user-item-wrap" @tap="onTap">
      <Avatar :src="userInfo.avatar" :placeholder="USER_AVATAR_URL" />
      <view class="user-info">
        <view class="user-name">{{ userInfo.name }}</view>
        <view v-if="showPresence && userInfo.presenceExt" class="presence-text">
          {{ userInfo.presenceExt }}
        </view>
      </view>
    </view>
    <view class="menu-wrap">
      <view class="menu delete" @click.stop="onDelete">删除</view>
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
    },
    showMenu: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      USER_AVATAR_URL,
      startX: 0,
      showDeleteMenu: false
    }
  },
  
  watch: {
    showMenu(newVal) {
      this.showDeleteMenu = newVal
    }
  },
  
  computed: {
    userInfo() {
      const userId = this.user.userId
      const storeUser = this.$store.getters['appUser/getUserInfo'](userId)
      return {
        name: storeUser.nickname || storeUser.name || this.user.name || userId,
        avatar: storeUser.avatarURL || storeUser.avatar || this.user.avatar || '',
        presenceExt: storeUser.presenceExt || this.user.presenceExt || ''
      }
    },
    
    showPresence() {
      // 简化处理，不使用在线状态
      return false
    }
  },
  
  methods: {
    onTap() {
      if (this.showDeleteMenu) {
        this.showDeleteMenu = false
        this.$emit('onSwipe', null)
        return
      }
      this.$emit('onTap', this.user.userId)
    },
    
    onDelete() {
      uni.showModal({
        title: '删除好友',
        content: `确定要删除好友 "${this.userInfo.name}" 吗？`,
        confirmColor: '#FF002B',
        success: (res) => {
          if (res.confirm) {
            this.$emit('onDelete', this.user.userId)
          }
          this.showDeleteMenu = false
          this.$emit('onSwipe', null)
        }
      })
    },
    
    touchStartHandler(e) {
      this.startX = e.touches[0].pageX
    },
    
    touchMoveHandler(e) {
      const pageX = e.touches[0].pageX
      const moveX = pageX - this.startX

      if (Math.abs(moveX) < 60) return

      if (moveX > 0) {
        this.showDeleteMenu = false
        this.$emit('onSwipe', null)
      } else {
        this.showDeleteMenu = true
        this.$emit('onSwipe', this.user.userId)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.swipe-menu-wrap {
  display: flex;
  position: relative;
  transition: transform 0.2s ease;
}

.user-item-wrap {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #fff;
  border-bottom: 0.5px solid #e3e6e8;
  width: 100%;
  flex-shrink: 0;
}

.user-info {
  margin-left: 12px;
  flex: 1;
}

.user-name {
  font-size: 16px;
  color: #171a1c;
}

.presence-text {
  font-size: 12px;
  color: #75828a;
  margin-top: 2px;
}

.menu-wrap {
  display: flex;
  position: absolute;
  right: -80px;
  top: 0;
  bottom: 0;
  width: 80px;
}

.menu {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
}

.delete {
  background-color: #ff002b;
}
</style>
