<template>
  <view class="profile-setting-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="title">修改昵称</view>
      </template>
    </NavBar>
    <view class="content">
      <textarea
        class="textarea"
        :maxlength="128"
        auto-height="true"
        focus="true"
        placeholder="请输入昵称"
        v-model="inputValue"
      ></textarea>
      <view class="count">{{ inputValue.length }} / 128</view>
    </view>

    <view class="profile-btn-wrap">
      <button class="profile-btn" :disabled="disabled" @tap="updateNickName">确定</button>
    </view>
  </view>
</template>

<script>
import NavBar from '../../ChatUIKit/components/NavBar/index.vue'

export default {
  components: {
    NavBar
  },
  
  data() {
    return {
      inputValue: '',
      originalName: ''
    }
  },
  
  computed: {
    disabled() {
      return !this.inputValue.trim() || this.inputValue === this.originalName
    }
  },
  
  onShow() {
    this.getUserInfo()
  },
  
  methods: {
    getUserInfo() {
      const selfInfo = this.$store.getters['appUser/getSelfUserInfo']
      if (selfInfo) {
        this.originalName = selfInfo.nickname || selfInfo.name || ''
        this.inputValue = this.originalName
      }
    },
    
    onBack() {
      uni.navigateBack()
    },
    
    async updateNickName() {
      if (this.disabled) return
      
      uni.showLoading({ title: '保存中...' })
      
      try {
        await this.$store.dispatch('appUser/updateUserInfo', {
          nickname: this.inputValue.trim()
        })
        
        uni.hideLoading()
        uni.showToast({
          title: '修改成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          uni.navigateBack()
        }, 500)
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '修改失败',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-setting-wrap {
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

.content {
  margin-top: 20px;
  padding: 16px;
  background-color: #fff;
}

.textarea {
  width: 100%;
  min-height: 100px;
  font-size: 16px;
  color: #171A1C;
  line-height: 1.5;
}

.count {
  text-align: right;
  color: #ACB4B9;
  font-size: 14px;
  margin-top: 8px;
}

.profile-btn-wrap {
  position: fixed;
  width: 100%;
  box-sizing: border-box;
  bottom: 0;
  display: flex;
  padding: 14px;
  align-items: center;
  border-top: 0.5px solid #E3E6E8;
  background: #fff;
}

.profile-btn {
  width: 100%;
  height: 44px;
  background-color: #009DFF;
  color: #fff;
  font-size: 16px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &[disabled] {
    background-color: #ccc;
    color: #fff;
  }
  
  &:active:not([disabled]) {
    opacity: 0.8;
  }
}
</style>
