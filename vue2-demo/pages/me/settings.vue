<template>
  <view class="settings-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="title">设置</view>
      </template>
    </NavBar>
    
    <scroll-view class="settings-content" scroll-y>
      <!-- 外观设置 -->
      <view class="menu-group-name">外观设置</view>
      <view class="menu-wrap">
        <MenuItem
          class="settings-menu"
          title="语言"
          @click.native="showLanguagePicker = true"
        >
          <template v-slot:right>
            <view class="menu-value">{{ currentLanguage }}</view>
          </template>
        </MenuItem>
        <MenuItem
          class="settings-menu"
          title="头像形状"
          @click.native="toggleAvatarShape"
        >
          <template v-slot:right>
            <view class="menu-value">{{ avatarShape === 'circle' ? '圆形' : '方形' }}</view>
          </template>
        </MenuItem>
      </view>
      


      <view class="bottom-space"></view>
    </scroll-view>
    
    <!-- 语言选择弹窗 -->
    <view v-if="showLanguagePicker" class="picker-mask" @tap="showLanguagePicker = false">
      <view class="picker-content" @tap.stop>
        <view class="picker-header">
          <text class="picker-title">选择语言</text>
          <text class="picker-cancel" @tap="showLanguagePicker = false">取消</text>
        </view>
        <view class="picker-list">
          <view
            v-for="lang in languages"
            :key="lang.value"
            class="picker-item"
            :class="{ active: language === lang.value }"
            @tap="selectLanguage(lang.value)"
          >
            <text class="picker-item-text">{{ lang.label }}</text>
            <text v-if="language === lang.value" class="picker-check">✓</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import NavBar from '../../ChatUIKit/components/NavBar/index.vue'
import MenuItem from '../../ChatUIKit/components/MenuItem/index.vue'

export default {
  components: {
    NavBar,
    MenuItem
  },
  
  data() {
    return {
      showLanguagePicker: false,
      languages: [
        { label: '简体中文', value: 'zh-CN' },
        { label: 'English', value: 'en' }
      ],
      avatarShape: 'circle'
    }
  },
  
  computed: {
    language() {
      return this.$store.getters['config/getLanguage']
    },
    
    currentLanguage() {
      const lang = this.languages.find(l => l.value === this.language)
      return lang ? lang.label : '简体中文'
    }
  },
  
  onShow() {
    this.loadConfig()
  },
  
  methods: {
    loadConfig() {
      const config = this.$store.getters['config/getConfig']
      if (config) {
        // 加载头像形状
        this.avatarShape = config.avatarShape || 'circle'
        
        // 加载功能开关
        this.loadFeatures(config.features)
        this.loadPrivacy(config.privacy)
        this.loadChat(config.chat)
      }
    },
    


    onBack() {
      uni.navigateBack()
    },
    
    selectLanguage(lang) {
      this.$store.dispatch('config/setLanguage', lang)
      this.showLanguagePicker = false
      uni.showToast({ 
        title: '设置成功，重启后生效', 
        icon: 'none',
        duration: 2000
      })
    },
    
    toggleAvatarShape() {
      this.avatarShape = this.avatarShape === 'circle' ? 'square' : 'circle'
      this.$store.commit('config/UPDATE_CONFIG', { avatarShape: this.avatarShape })
      uni.showToast({ title: '设置成功', icon: 'success' })
    },
    

  }
}
</script>

<style lang="scss" scoped>
.settings-wrap {
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

.settings-content {
  flex: 1;
  overflow-y: scroll;
}

.menu-group-name {
  color: #75828A;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  margin-top: 24px;
  margin-bottom: 12px;
  padding: 0 16px;
}

.menu-wrap {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  margin: 0 16px;
  border-radius: 8px;
  overflow: hidden;
}

.settings-menu {
  padding: 0 16px;
}

.menu-value {
  color: #999;
  font-size: 14px;
}

.bottom-space {
  height: 40px;
}

// 选择器样式
.picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.picker-content {
  width: 100%;
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 0.5px solid #E3E6E8;
}

.picker-title {
  font-size: 16px;
  font-weight: 500;
  color: #171A1C;
}

.picker-cancel {
  font-size: 14px;
  color: #999;
}

.picker-list {
  max-height: 300px;
  overflow-y: scroll;
}

.picker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 0.5px solid #E3E6E8;
  
  &:active {
    background: #f5f5f5;
  }
  
  &.active {
    .picker-item-text {
      color: #009DFF;
    }
  }
}

.picker-item-text {
  font-size: 16px;
  color: #171A1C;
}

.picker-check {
  color: #009DFF;
  font-size: 18px;
  font-weight: bold;
}
</style>
