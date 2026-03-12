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
        <view class="copy" @tap="copy"></view>
      </view>
    </view>
    <view class="content">
      <view class="menu-group-name">{{ $t('me.meSettingGroupName') }}</view>
      <view class="menu-wrap">
        <MenuItem
          class="me-menu"
          :title="$t('me.meStatus')"
          @click.native="toPresenceSetting"
        >
          <template v-slot:left>
            <view class="icon status"></view>
          </template>
        </MenuItem>
        <MenuItem
          class="me-menu"
          :title="$t('me.meInfo')"
          @click.native="toProfile"
        >
          <template v-slot:left>
            <view class="icon person"></view>
          </template>
        </MenuItem>
        <MenuItem
          class="me-menu"
          :title="$t('me.meAbout')"
          @click.native="toAbout"
        >
          <template v-slot:left>
            <view class="icon about"></view>
          </template>
        </MenuItem>
        <MenuItem
          class="me-menu"
          :title="$t('me.meSettings')"
          @click.native="toSettings"
        >
          <template v-slot:left>
            <view class="icon settings"></view>
          </template>
        </MenuItem>
      </view>
      <view class="menu-group-name">{{ $t('me.meLoginGroupName') }}</view>
      <view class="logout" @tap="logout">{{ $t('me.meLogout') }}</view>
    </view>
  </view>
</template>

<script>
import Avatar from '../../ChatUIKit/components/Avatar/index.vue'
import MenuItem from '../../ChatUIKit/components/MenuItem/index.vue'
import { USER_AVATAR_URL } from '../../ChatUIKit/const/index'
import { CHAT_STORE } from '../../ChatUIKit/const/index'

export default {
  components: {
    Avatar,
    MenuItem
  },
  
  data() {
    return {
      USER_AVATAR_URL
    }
  },
  
  computed: {
    userId() {
      const user = this.$store.state.conn.user
      return user ? user.userId || '' : ''
    },
    
    userInfo() {
      const selfInfo = this.$store.getters['appUser/getSelfUserInfo']()
      if (!selfInfo) {
        return { name: '', avatar: '', presenceExt: 'Online', isOnline: true }
      }
      const presenceExt = selfInfo.presenceExt || 'Online'
      const isOnline = presenceExt !== 'Offline'
      return {
        name: selfInfo.nickname || selfInfo.name || this.userId,
        avatar: selfInfo.avatar,
        presenceExt: presenceExt,
        isOnline: isOnline
      }
    }
  },
  
  methods: {
    
    copy() {
      uni.setClipboardData({
        data: this.userId,
        success: () => {
          uni.showToast({ title: this.$t('common.copySuccess') || '已复制', icon: 'none' })
        }
      })
    },
    
    logout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 先跳转页面，再执行登出（避免登出阻塞跳转）
            uni.navigateTo({
              url: '/pages/login/index',
              success: () => {
                // 页面跳转成功后执行登出
                this.$store.dispatch('conn/logout')
                uni.removeStorageSync(CHAT_STORE)
              },
              fail: () => {
                uni.showToast({ title: '跳转失败', icon: 'none' })
              }
            })
          }
        }
      })
    },
    
    toProfile() {
      uni.navigateTo({
        url: '/pages/me/profile'
      })
    },
    
    toAbout() {
      uni.navigateTo({
        url: '/pages/me/about'
      })
    },
    
    toPresenceSetting() {
      uni.navigateTo({
        url: '/pages/me/presence'
      })
    },
    
    toSettings() {
      uni.navigateTo({
        url: '/pages/me/settings'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.me-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #F9FAFA;
}

.me-info-wrap {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #F9FAFA;
  padding-top: calc(60px + var(--status-bar-height));
  padding-bottom: 20px;
}

.name {
  color: #171A1C;
  text-align: center;
  font-size: 20px;
  font-weight: 590;
  margin-top: 12px;
  margin-bottom: 5px;
}

.userId {
  display: flex;
  align-items: center;
  color: #ACB4B9;
  text-align: center;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
}

.copy {
  width: 16px;
  height: 16px;
  margin-left: 4px;
  background-image: url('../../static/icon/copy.png');
  background-size: 100% 100%;
}

.icon {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  margin-right: 8px;
}

.status {
  background-color: #00CC52;
  background-image: url('../../static/icon/status.png');
  background-size: 18px 18px;
  background-position: center center;
  background-repeat: no-repeat;
}

.person {
  background-color: #FF337C;
  background-image: url('../../static/icon/personal.png');
  background-size: 18px 18px;
  background-position: center center;
  background-repeat: no-repeat;
}

.about {
  background-color: #009DFF;
  background-image: url('../../static/icon/about.png');
  background-size: 18px 18px;
  background-position: center center;
  background-repeat: no-repeat;
}

.settings {
  background-color: #8E8E93;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings::before {
  content: '⚙';
  font-size: 18px;
  color: #fff;
}

.menu-group-name {
  color: #75828A;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
  margin-top: 24px;
  margin-bottom: 12px;
  padding: 0 16px;
}

.content {
  flex: 1;
  height: 100%;
  overflow-y: scroll;
}

.menu-wrap {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  margin: 8px 16px 16px;
  border-radius: 8px;
  overflow: hidden;
}

.me-menu {
  /* 使用 MenuItem 默认的 padding */
}

.logout {
  display: flex;
  color: #009DFF;
  font-size: 16px;
  font-weight: 500;
  background-color: #fff;
  padding: 16px;
  margin: 8px 16px;
  border-radius: 8px;
}
</style>
