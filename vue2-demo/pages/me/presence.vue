<template>
  <view class="presence-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="title">在线状态</view>
      </template>
    </NavBar>
    <view class="menu-wrap">
      <radio-group class="radio-group" @change="onChange">
        <label v-for="item in presenceMenus" :key="item.value" class="label">
          <radio
            class="presence-radio"
            :value="item.value"
            :checked="checkedStatus === item.value"
            color="#009DFF"
          />
          <MenuItem
            class="presence-menu"
            :title="item.title"
            :showArrow="false"
          />
        </label>
      </radio-group>
    </view>

    <view class="presence-btn-wrap">
      <button class="presence-btn" @tap="publishPresence">确定</button>
    </view>
  </view>
</template>

<script>
import NavBar from '../../ChatUIKit/components/NavBar/index.vue'
import MenuItem from '../../ChatUIKit/components/MenuItem/index.vue'

const PRESENCE_STATUS_LIST = ['Online', 'Offline', 'Away', 'Busy', 'Do Not Disturb']

const STATUS_TITLE_MAP = {
  'Online': '在线',
  'Offline': '离线',
  'Away': '离开',
  'Busy': '忙碌',
  'Do Not Disturb': '勿扰'
}

export default {
  components: {
    NavBar,
    MenuItem
  },
  
  data() {
    return {
      presenceMenus: PRESENCE_STATUS_LIST.map(status => ({
        title: STATUS_TITLE_MAP[status] || status,
        value: status
      })),
      presenceExt: '',
      checkedStatus: 'Online'
    }
  },
  
  onShow() {
    this.getPresenceStatus()
  },
  
  methods: {
    getPresenceStatus() {
      const selfInfo = this.$store.getters['appUser/getSelfUserInfo']
      if (selfInfo && selfInfo.presenceExt) {
        this.presenceExt = selfInfo.presenceExt
        if (PRESENCE_STATUS_LIST.includes(selfInfo.presenceExt)) {
          this.checkedStatus = selfInfo.presenceExt
        }
      }
    },
    
    onBack() {
      uni.navigateBack()
    },
    
    onChange(e) {
      this.checkedStatus = e.detail.value
    },
    
    async publishPresence() {
      uni.showLoading({ title: '设置中...' })
      
      try {
        // 调用 SDK 发布在线状态
        await this.$store.dispatch('appUser/publishPresence', {
          presenceExt: this.checkedStatus
        })
        
        uni.hideLoading()
        uni.showToast({
          title: '设置成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          uni.navigateBack()
        }, 500)
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '设置失败',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.presence-wrap {
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
  margin-top: 20px;
  background-color: #fff;
}

.radio-group {
  display: flex;
  flex-direction: column;
}

.label {
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 0.5px solid #E3E6E8;
}

.presence-radio {
  margin-right: 12px;
}

.presence-menu {
  flex: 1;
  padding: 12px 0;
}

.presence-btn-wrap {
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

.presence-btn {
  width: 100%;
  height: 44px;
  background-color: #009DFF;
  color: #fff;
  font-size: 16px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    opacity: 0.8;
  }
}
</style>
