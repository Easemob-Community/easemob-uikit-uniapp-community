<template>
  <view
    class="avatar"
    :style="{ width: size + 'px', height: size + 'px' }"
  >
    <view :class="['image-wrap', avatarShape]">
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
    </view>
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
    // 是否显示在线状态徽标（需配合 userId 或手动传入 isOnline/presenceExt）
    withPresence: {
      type: Boolean,
      default: false
    },
    // 用户ID，传入后自动从 store 获取 presence 信息（推荐方式）
    userId: {
      type: String,
      default: ''
    },
    // 手动传入在线状态（优先级高于 store，用于特定场景覆盖）
    isOnline: {
      type: Boolean,
      default: false
    },
    // 手动传入状态扩展信息（优先级高于 store，用于特定场景覆盖）
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
    
    // 全局功能配置
    featureConfig() {
      return this.$store.getters['config/getFeatureConfig'] || {}
    },
    
    // 是否显示在线状态徽标
    showPresence() {
      // 优先检查全局配置，如果 usePresence 为 false 则不显示
      if (this.featureConfig.usePresence === false) {
        return false
      }
      return this.withPresence
    },
    
    // 从 store 自动获取的 presence 信息（当传入 userId 时）
    storePresence() {
      if (!this.userId) return null
      return this.$store.state.appUser.userPresenceMap[this.userId]
    },
    
    // 最终使用的在线状态（store 优先级高于手动传入的 props，确保同步）
    finalIsOnline() {
      // 如果传入了 userId，优先从 store 获取（确保多页面同步）
      if (this.userId && this.storePresence) {
        return this.storePresence.isOnline || false
      }
      // 否则使用手动传入的值
      return this.isOnline
    },
    
    // 最终使用的状态扩展信息（store 优先级高于手动传入的 props）
    finalPresenceExt() {
      // 如果传入了 userId，优先从 store 获取
      if (this.userId && this.storePresence) {
        return this.storePresence.presenceExt || ''
      }
      // 否则使用手动传入的值
      return this.presenceExt
    },
    
    // 在线状态徽标样式类
    presenceClass() {
      if (this.finalIsOnline) {
        switch (this.finalPresenceExt) {
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
  display: inline-block;
}

.avatar .image-wrap {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.avatar .image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-wrap.cover-view {
  width: 100%;
  text-align: center;
  color: #fff;
  background-color: rgba(107, 96, 99, 0.4);
  position: absolute;
  left: 50%;
  top: 66%;
  transform: translate(-50%, 0);
}

.image-wrap.circle {
  border-radius: 50%;
  .image {
    border-radius: 50%;
  }
}

.image-wrap.square {
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
