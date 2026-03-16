<template>
  <view class="profile-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="title">个人信息</view>
      </template>
    </NavBar>
    <view class="menu-wrap">
      <MenuItem
        class="profile-menu"
        title="头像"
        @click.native="changeAvatar"
      >
        <template v-slot:right>
          <Avatar
            class="profile-avatar"
            :src="userInfo.avatar"
            :size="40"
            :placeholder="USER_AVATAR_URL"
          />
        </template>
      </MenuItem>
      <MenuItem
        class="profile-menu"
        title="昵称"
        @click.native="toProfileSetting"
      >
        <template v-slot:right>
          <view class="profile-name ellipsis">{{ userInfo.name || userId }}</view>
        </template>
      </MenuItem>
    </view>
  </view>
</template>

<script>
import NavBar from '../../ChatUIKit/components/NavBar/index.vue'
import Avatar from '../../ChatUIKit/components/Avatar/index.vue'
import MenuItem from '../../ChatUIKit/components/MenuItem/index.vue'
import { USER_AVATAR_URL } from '../../ChatUIKit/const/index'

export default {
  components: {
    NavBar,
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
        return { name: '', avatar: '' }
      }
      return {
        name: selfInfo.nickname || selfInfo.name,
        avatar: selfInfo.avatar
      }
    }
  },
  
  methods: {
    
    onBack() {
      uni.navigateBack()
    },
    
    toProfileSetting() {
      uni.navigateTo({
        url: '/pages/me/profileSetting'
      })
    },
    
    changeAvatar() {
      uni.showModal({
        title: '提示',
        content: '头像上传功能需要您自行准备文件上传服务，将图片上传后获取返回的URL地址，再通过 updateUserInfo 接口设置到用户属性中。',
        showCancel: false,
        confirmText: '知道了'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #F9FAFA;
}

.title {
  font-size: 18px;
  font-weight: 500;
  color: #171A1C;
}

.menu-wrap {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  background-color: #fff;
}

.profile-menu {
  padding: 0 16px;
}

.profile-name {
  width: calc(100vw - 200px);
  text-align: right;
  color: #666;
  font-size: 14px;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
