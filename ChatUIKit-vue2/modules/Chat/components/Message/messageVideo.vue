<template>
  <view class="msg-video">
    <video
      v-if="showVideo"
      :src="videoUrl"
      class="video"
      :style="videoStyle"
      object-fit="cover"
      @error="onError"
    />
    <view v-else class="video-placeholder" @tap="playVideo">
      <image class="video-thumb" :src="msg.thumb" mode="aspectFit" />
      <view class="play-icon">
        <view class="triangle"></view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'VideoMessage',

  props: {
    msg: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      showVideo: false,
      MAX_SIZE: 225
    }
  },

  computed: {
    videoUrl() {
      return this.msg.url || this.msg.body?.url
    },

    videoStyle() {
      return {
        width: this.MAX_SIZE + 'px',
        height: this.MAX_SIZE + 'px'
      }
    }
  },

  methods: {
    onError() {
      uni.showToast({ title: '视频加载失败', icon: 'none' })
    },

    playVideo() {
      const videoUrl = this.videoUrl
      if (!videoUrl) return

      // #ifdef APP-PLUS || H5
      this.showVideo = true
      // #endif

      // #ifdef MP-WEIXIN
      uni.previewMedia({
        sources: [{
          url: videoUrl,
          type: 'video',
          poster: this.msg.thumb
        }]
      })
      // #endif
    }
  }
}
</script>

<style lang="scss" scoped>
.msg-video {
  position: relative;
}

.video {
  border-radius: 4px;
}

.video-placeholder {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-thumb {
  width: 225px;
  height: 225px;
  border-radius: 4px;
  background: #000;
}

.play-icon {
  position: absolute;
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.triangle {
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-left: 18px solid #fff;
  border-bottom: 10px solid transparent;
  margin-left: 4px;
}
</style>
