<template>
  <view 
    class="msg-audio" 
    @tap="playAudio"
    :style="{ width: audioWidth + 'px' }"
  >
    <image
      class="audio-icon"
      :src="isPlaying ? AudioPlayingIcon : AudioIcon"
    />
    <span class="audio-duration">{{ duration }}"</span>
  </view>
</template>

<script>
import { ASSETS_URL } from '../../../../const/index.js'

const AudioIcon = ASSETS_URL + 'icon/audio3.png'
const AudioPlayingIcon = ASSETS_URL + 'icon/audio-play.gif'
const MAX_WIDTH = 200
const MIN_WIDTH = 80

export default {
  name: 'AudioMessage',

  props: {
    msg: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      AudioIcon,
      AudioPlayingIcon,
      innerAudioContext: null
    }
  },

  computed: {
    isPlaying() {
      return this.$store.state.message.playingAudioMsgId === this.msg.id
    },

    duration() {
      return this.msg.length || (this.msg.body && this.msg.body.length) || 0
    },

    audioWidth() {
      const width = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, this.duration * 8))
      return width
    }
  },

  beforeDestroy() {
    if (this.innerAudioContext) {
      this.innerAudioContext.destroy()
    }
  },

  methods: {
    playAudio() {
      const audioUrl = this.msg.url || (this.msg.body && this.msg.body.url)
      if (!audioUrl) return

      // 如果正在播放，则停止
      if (this.isPlaying) {
        this.$store.dispatch('message/setPlayingAudioMessageId', '')
        if (this.innerAudioContext) {
          this.innerAudioContext.stop()
        }
        return
      }

      // 设置当前播放的消息ID
      this.$store.dispatch('message/setPlayingAudioMessageId', this.msg.id)

      // 创建音频上下文
      if (!this.innerAudioContext) {
        this.innerAudioContext = uni.createInnerAudioContext()
        this.innerAudioContext.onEnded(() => {
          this.$store.dispatch('message/setPlayingAudioMessageId', '')
        })
        this.innerAudioContext.onError(() => {
          this.$store.dispatch('message/setPlayingAudioMessageId', '')
          uni.showToast({ title: '播放失败', icon: 'none' })
        })
      }

      this.innerAudioContext.src = audioUrl
      this.innerAudioContext.play()
    }
  }
}
</script>

<style lang="scss" scoped>
.msg-audio {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  min-width: 80px;
  height: 36px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.audio-icon {
  width: 20px;
  height: 20px;
}

.audio-duration {
  margin-left: 8px;
  font-size: 14px;
  color: #666;
}
</style>
