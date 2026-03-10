<template>
  <view>
    <NavBar :showBackArrow="false">
      <template v-slot:left>
        <Avatar
          :size="32"
          :src="userInfo.avatar"
          :placeholder="USER_AVATAR_URL"
        />
      </template>
      <template v-slot:center>
        <view class="title"></view>
      </template>
      <template v-slot:right>
        <view class="btn-wrap">
          <!-- #ifndef MP-WEIXIN-->
          <view class="action-btn" @tap="toAddContact"></view>
          <!-- #endif -->
        </view>
      </template>
    </NavBar>
    <!-- #ifdef MP-WEIXIN-->
    <view class="wx-btn-wrap">
      <view class="wx-btn" @tap="toAddContact"></view>
    </view>
    <!-- #endif -->
  </view>
</template>

<script>
import Avatar from '../../../../components/Avatar'
import NavBar from '../../../../components/NavBar'
import { USER_AVATAR_URL } from '../../../../const/index'

export default {
  name: 'ContactNav',
  
  components: {
    Avatar,
    NavBar
  },
  
  data() {
    return {
      USER_AVATAR_URL
    }
  },
  
  computed: {
    userInfo() {
      const info = this.$store.getters['appUser/getSelfUserInfo']
      return info ? info() : { name: '', avatar: '' }
    }
  },
  
  methods: {
    toAddContact() {
      uni.navigateTo({
        url: '/ChatUIKit/modules/ContactAdd/index'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  width: 98px;
  height: 16px;
  background: url("../../../../assets/contact.png") no-repeat;
  background-size: 100% 100%;
}

.btn-wrap {
  display: flex;
  width: 32px;
  justify-content: flex-end;
}

.action-btn {
  width: 24px;
  height: 24px;
  background: url("../../../../assets/icon/person_add.png") no-repeat;
  background-size: 100% 100%;
}

.wx-btn-wrap {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  bottom: 65px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(180deg, #009eff 0%, #334bff 100%);
  box-shadow: 8px 0px 24px 0px rgba(26, 26, 26, 0.1),
    0px 24px 36px 0px rgba(77, 77, 77, 0.15);
}

.wx-btn {
  width: 24px;
  height: 24px;
  background: url("../../../../assets/icon/wx_add.png") no-repeat;
  background-size: 100% 100%;
}
</style>
