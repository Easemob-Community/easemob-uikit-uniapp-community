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
      uni.chooseImage({
        count: 1,
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0]
          // 上传头像
          this.uploadAvatar(tempFilePath)
        }
      })
    },
    
    uploadAvatar(filePath) {
      uni.showLoading({ title: '上传中...' })
      
      // 这里简化处理，实际应该调用上传接口
      setTimeout(() => {
        // 更新本地用户信息
        this.$store.commit('appUser/SET_SELF_USER_INFO', {
          avatar: filePath
        })
        this.getUserInfo()
        uni.hideLoading()
        uni.showToast({ title: '上传成功', icon: 'success' })
      }, 1000)
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
