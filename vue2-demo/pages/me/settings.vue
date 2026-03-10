<template>
  <view class="settings-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="title">{{ $t('settings.title') }}</view>
      </template>
    </NavBar>
    
    <scroll-view class="settings-content" scroll-y>
      <!-- 外观设置 -->
      <view class="menu-group-name">{{ $t('settings.appearance') }}</view>
      <view class="menu-wrap">
        <MenuItem
          class="settings-menu"
          :title="$t('settings.language')"
          @click.native="showLanguagePicker = true"
        >
          <template v-slot:right>
            <view class="menu-value">{{ currentLanguage }}</view>
          </template>
        </MenuItem>
        <MenuItem
          class="settings-menu"
          :title="$t('settings.avatarShape')"
          @click.native="toggleAvatarShape"
        >
          <template v-slot:right>
            <view class="menu-value">{{ avatarShape === 'circle' ? $t('settings.circle') : $t('settings.square') }}</view>
          </template>
        </MenuItem>
      </view>
      
      <!-- 输入区域功能 -->
      <view class="menu-group-name">{{ $t('settings.inputFeatures') }}</view>
      <view class="menu-wrap">
        <MenuItem
          v-for="(item, index) in inputFeatures"
          :key="index"
          class="settings-menu"
          :title="$t(item.labelKey)"
          :description="item.descKey ? $t(item.descKey) : ''"
          :showArrow="false"
        >
          <template v-slot:right>
            <switch
              :checked="item.enabled"
              @change="e => toggleFeature(item.key, e.detail.value)"
              color="#009DFF"
            />
          </template>
        </MenuItem>
      </view>
      
      <!-- 消息操作功能 -->
      <view class="menu-group-name">{{ $t('settings.messageActions') }}</view>
      <view class="menu-wrap">
        <MenuItem
          v-for="(item, index) in messageActionFeatures"
          :key="index"
          class="settings-menu"
          :title="$t(item.labelKey)"
          :showArrow="false"
        >
          <template v-slot:right>
            <switch
              :checked="item.enabled"
              @change="e => toggleFeature(item.key, e.detail.value)"
              color="#009DFF"
            />
          </template>
        </MenuItem>
      </view>
      
      <!-- 会话功能 -->
      <view class="menu-group-name">{{ $t('settings.conversationFeatures') }}</view>
      <view class="menu-wrap">
        <MenuItem
          v-for="(item, index) in conversationFeatures"
          :key="index"
          class="settings-menu"
          :title="$t(item.labelKey)"
          :showArrow="false"
        >
          <template v-slot:right>
            <switch
              :checked="item.enabled"
              @change="e => toggleFeature(item.key, e.detail.value)"
              color="#009DFF"
            />
          </template>
        </MenuItem>
      </view>
      
      <!-- 其他功能 -->
      <view class="menu-group-name">{{ $t('settings.otherFeatures') }}</view>
      <view class="menu-wrap">
        <MenuItem
          v-for="(item, index) in otherFeatures"
          :key="index"
          class="settings-menu"
          :title="$t(item.labelKey)"
          :showArrow="false"
        >
          <template v-slot:right>
            <switch
              :checked="item.enabled"
              @change="e => toggleFeature(item.key, e.detail.value)"
              color="#009DFF"
            />
          </template>
        </MenuItem>
      </view>
      
      <view class="bottom-space"></view>
    </scroll-view>
    
    <!-- 语言选择弹窗 -->
    <view v-if="showLanguagePicker" class="picker-mask" @tap="showLanguagePicker = false">
      <view class="picker-content" @tap.stop>
        <view class="picker-header">
          <text class="picker-title">{{ $t('settings.selectLanguage') }}</text>
          <text class="picker-cancel" @tap="showLanguagePicker = false">{{ $t('common.cancel') }}</text>
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
import { setLocale } from '../../ChatUIKit/locales'

export default {
  components: {
    NavBar,
    MenuItem
  },
  
  data() {
    return {
      showLanguagePicker: false,
      currentLanguageValue: uni.getStorageSync('ChatUIKit_Locale') || 'zh-CN',
      languages: [
        { label: '简体中文', value: 'zh-CN' },
        { label: 'English', value: 'en' }
      ],
      avatarShape: 'circle',
      inputFeatures: [
        { labelKey: 'settings.inputVoice', key: 'inputVoice', enabled: true, descKey: 'settings.inputVoiceDesc' },
        { labelKey: 'settings.inputEmoji', key: 'inputEmoji', enabled: true },
        { labelKey: 'settings.inputQuote', key: 'inputQuote', enabled: true },
        { labelKey: 'settings.inputEdit', key: 'inputEdit', enabled: true },
        { labelKey: 'settings.inputImage', key: 'inputImage', enabled: true },
        { labelKey: 'settings.inputAudio', key: 'inputAudio', enabled: true, descKey: 'settings.inputAudioDesc' },
        { labelKey: 'settings.inputVideo', key: 'inputVideo', enabled: true },
        { labelKey: 'settings.inputFile', key: 'inputFile', enabled: true }
      ],
      messageActionFeatures: [
        { labelKey: 'settings.copyMessage', key: 'copyMessage', enabled: true },
        { labelKey: 'settings.deleteMessage', key: 'deleteMessage', enabled: true },
        { labelKey: 'settings.recallMessage', key: 'recallMessage', enabled: true },
        { labelKey: 'settings.editMessage', key: 'editMessage', enabled: true },
        { labelKey: 'settings.replyMessage', key: 'replyMessage', enabled: true }
      ],
      conversationFeatures: [
        { labelKey: 'settings.pinConversation', key: 'pinConversation', enabled: true },
        { labelKey: 'settings.muteConversation', key: 'muteConversation', enabled: true },
        { labelKey: 'settings.deleteConversation', key: 'deleteConversation', enabled: true }
      ],
      otherFeatures: [
        { labelKey: 'settings.useUserInfo', key: 'useUserInfo', enabled: true },
        { labelKey: 'settings.usePresence', key: 'usePresence', enabled: true },
        { labelKey: 'settings.messageStatus', key: 'messageStatus', enabled: true },
        { labelKey: 'settings.userCard', key: 'userCard', enabled: true }
      ]
    }
  },
  
  computed: {
    language() {
      return this.currentLanguageValue
    },
    
    currentLanguage() {
      const lang = this.languages.find(l => l.value === this.currentLanguageValue)
      return lang ? lang.label : '简体中文'
    }
  },
  
  onShow() {
    this.loadConfig()
  },
  
  methods: {
    loadConfig() {
      const themeConfig = this.$store.getters['config/getThemeConfig']
      const featureConfig = this.$store.getters['config/getFeatureConfig']
      
      if (themeConfig) {
        this.avatarShape = themeConfig.avatarShape || 'circle'
      }
      
      if (featureConfig) {
        // 加载输入功能
        this.inputFeatures.forEach(item => {
          item.enabled = featureConfig[item.key] !== false
        })
        // 加载消息操作
        this.messageActionFeatures.forEach(item => {
          item.enabled = featureConfig[item.key] !== false
        })
        // 加载会话功能
        this.conversationFeatures.forEach(item => {
          item.enabled = featureConfig[item.key] !== false
        })
        // 加载其他功能
        this.otherFeatures.forEach(item => {
          item.enabled = featureConfig[item.key] !== false
        })
      }
    },
    
    onBack() {
      uni.navigateBack()
    },
    
    selectLanguage(lang) {
      // 设置语言并保存
      setLocale(lang)
      this.currentLanguageValue = lang
      this.showLanguagePicker = false
      uni.showToast({ 
        title: this.$t('settings.languageChanged'), 
        icon: 'none',
        duration: 2000
      })
    },
    
    toggleAvatarShape() {
      this.avatarShape = this.avatarShape === 'circle' ? 'square' : 'circle'
      this.$store.dispatch('config/setThemeConfig', { avatarShape: this.avatarShape })
      uni.showToast({ title: this.$t('common.success'), icon: 'success' })
    },
    
    toggleFeature(key, enabled) {
      this.$store.dispatch('config/setFeature', { feature: key, enabled })
    }
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
