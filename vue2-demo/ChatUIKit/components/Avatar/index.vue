<template>
  <view
    :class="['avatar', avatarShape]"
    :style="{ width: size + 'px', height: size + 'px' }"
  >
    <image
      class="image"
      :src="imageSrc"
      :alt="alt"
      @error="handleImageError"
      @load="handleImageLoad"
    />
    <image
      v-if="isLoading"
      class="image loading-avatar"
      :src="placeholder"
    />
    <view v-if="showPresence" class="presence-wrap">
      <view :class="['status', presenceClass]"></view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Avatar',
  
  props: {
    src: {
      type: String,
      default: ''
    },
    alt: {
      type: String,
      default: ''
    },
    size: {
      type: Number,
      default: 50
    },
    shape: {
      type: String,
      default: '' // 'circle' | 'square'，空字符串表示从 config 读取
    },
    placeholder: {
      type: String,
      default: ''
    },
    withPresence: {
      type: Boolean,
      default: false
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    presenceExt: {
      type: String,
      default: ''
    }
  },
  
  data() {
    return {
      isError: false,
      isLoading: true
    }
  },
  
  computed: {
    avatarShape() {
      if (this.shape) {
        return this.shape
      }
      // 从 config store 读取头像形状
      const themeConfig = this.$store.getters['config/getThemeConfig']
      return themeConfig?.avatarShape || 'circle'
    },
    
    showPresence() {
      // 检查功能配置是否启用在线状态
      const featureConfig = this.$store.getters['config/getFeatureConfig']
      if (featureConfig?.usePresence === false) {
        return false
      }
      console.log('[Avatar] showPresence:', this.withPresence, 'isOnline:', this.isOnline, 'presenceExt:', this.presenceExt)
      return this.withPresence
    },
    
    presenceClass() {
      console.log('[Avatar] presenceClass - isOnline:', this.isOnline, 'presenceExt:', this.presenceExt)
      if (this.isOnline) {
        switch (this.presenceExt) {
          case 'Online':
            return 'online'
          case 'Offline':
            return 'offline'
          case 'Away':
            return 'leave'
          case 'Busy':
            return 'busy'
          case 'Do Not Disturb':
            return 'do-not-disturb'
          default:
            return 'custom'
        }
      }
      return 'offline'
    },
    
    imageSrc() {
      if (this.isError) {
        return this.placeholder
      }
      return this.src || this.placeholder
    }
  },
  
  methods: {
    handleImageError() {
      this.isError = true
    },
    
    handleImageLoad() {
      this.isLoading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.avatar {
  position: relative;
  overflow: hidden;
  display: inline-block;
}

.avatar .image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image cover-view {
  width: 100%;
  text-align: center;
  color: #fff;
  background-color: rgba(107, 96, 99, 0.4);
  position: absolute;
  left: 50%;
  top: 66%;
  transform: translate(-50%, 0);
}

.avatar.circle {
  .image {
    border-radius: 50%;
  }
}

.avatar.square {
  border-radius: 4px;
}

.presence-wrap {
  position: absolute;
  right: -3px;
  bottom: -3px;
  width: 20%;
  height: 20%;
  background: #fff;
  padding: 3px;
  border-radius: 50%;
  min-width: 8px;
  min-height: 8px;
}

.status {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.online {
  background-image: url("https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/presence/online.png");
  background-size: 100% 100%;
}

.offline {
  background-image: url("https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/presence/offline.png");
  background-size: 100% 100%;
}

.busy {
  background-image: url("https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/presence/busy.png");
  background-size: 100% 100%;
}

.leave {
  background-image: url("https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/presence/leave.png");
  background-size: 100% 100%;
}

.do-not-disturb {
  background-image: url("https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/presence/nodistribute.png");
  background-size: 100% 100%;
}

.custom {
  background-image: url("https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/presence/custom.png");
  background-size: 100% 100%;
}

.loading-avatar {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}
</style>
