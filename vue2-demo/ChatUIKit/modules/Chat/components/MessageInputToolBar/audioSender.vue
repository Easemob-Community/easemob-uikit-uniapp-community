<template>
  <view v-if="showPopup" class="audio-popup" @tap="hideAudioPopup">
    <view class="audio-content" @tap.stop>
      <view class="audio-title">{{ recording ? '松开 结束' : '按住 说话' }}</view>
      <view 
        class="audio-button"
        @touchstart="startRecord"
        @touchend="stopRecord"
        @touchcancel="cancelRecord"
      >
        <image class="mic-icon" :src="MicIcon" />
      </view>
    </view>
  </view>
</template>

<script>
import { ASSETS_URL } from '../../../../const/index.js'

const MicIcon = ASSETS_URL + 'icon/mic_on.png'
const recorderManager = uni.getRecorderManager()

export default {
  name: 'AudioMessageSender',

  data() {
    return {
      MicIcon,
      showPopup: false,
      recording: false,
      recordStartTime: 0,
      tempFilePath: '',
      shouldSendOnStop: false
    }
  },

  computed: {
    currentConversation() {
      return this.$store.state.conversation.currentConversation
    },

    chatConn() {
      return this.$store.state.conn.chatSDK
    },

    selfUserInfo() {
      const info = this.$store.getters['appUser/getSelfUserInfo']
      return info ? info() : { name: '', avatar: '' }
    }
  },

  mounted() {
    // 使用箭头函数保持 this 上下文
    recorderManager.onStop((res) => {
      console.log('[AudioSender] onStop fired, shouldSendOnStop:', this.shouldSendOnStop, 'recording:', this.recording)
      if (this.shouldSendOnStop) {
        this.shouldSendOnStop = false
        this.sendAudioMessage(res)
      }
    })

    recorderManager.onError((err) => {
      console.error('[AudioSender] 录音错误:', err)
      this.recording = false
      this.shouldSendOnStop = false
      uni.showToast({ title: '录音失败', icon: 'none' })
    })
  },

  methods: {
    showAudioPopup() {
      this.showPopup = true
    },

    hideAudioPopup() {
      if (!this.recording) {
        this.showPopup = false
      }
    },

    startRecord() {
      console.log('[AudioSender] startRecord')
      this.recording = true
      this.shouldSendOnStop = true
      this.recordStartTime = Date.now()
      // #ifdef MP-WEIXIN
      // 微信小程序需要先检查权限
      uni.authorize({
        scope: 'scope.record',
        success: () => {
          recorderManager.start({
            duration: 60000,
            sampleRate: 44100,
            numberOfChannels: 1,
            encodeBitRate: 192000,
            format: 'mp3'
          })
        },
        fail: () => {
          this.recording = false
          this.shouldSendOnStop = false
          uni.showToast({ title: '请授权麦克风权限', icon: 'none' })
        }
      })
      // #endif
      // #ifndef MP-WEIXIN
      recorderManager.start({
        duration: 60000,
        sampleRate: 44100,
        numberOfChannels: 1,
        encodeBitRate: 192000,
        format: 'mp3'
      })
      // #endif
    },

    stopRecord() {
      console.log('[AudioSender] stopRecord')
      const duration = Math.floor((Date.now() - this.recordStartTime) / 1000)
      if (duration < 1) {
        this.shouldSendOnStop = false
        this.recording = false
        uni.showToast({ title: '录音时间太短', icon: 'none' })
        recorderManager.stop()
        return
      }
      // 标记应该发送，等待 onStop 回调
      this.recording = false
      this.showPopup = false
      recorderManager.stop()
    },

    cancelRecord() {
      console.log('[AudioSender] cancelRecord')
      this.shouldSendOnStop = false
      this.recording = false
      recorderManager.stop()
    },

    sendAudioMessage(res) {
      const tempFilePath = res.tempFilePath
      const duration = Math.floor((Date.now() - this.recordStartTime) / 1000)
      const chatSDK = this.$store.state.conn.chatSDK
      const chatConn = this.$store.state.conn.chatConn

      if (!chatSDK || !chatSDK.message) {
        console.error('SDK not initialized')
        return
      }

      if (!chatConn) {
        console.error('Connection not initialized')
        return
      }

      const uploadUrl = chatConn.apiUrl + '/' + chatConn.orgName + '/' + chatConn.appName + '/chatfiles'

      const token = chatConn.token
      const requestParams = {
        url: uploadUrl,
        filePath: tempFilePath,
        name: 'file',
        header: {
          Authorization: 'Bearer ' + token
        }
      }

      const audioMsg = chatSDK.message.create({
        type: 'audio',
        to: this.currentConversation.conversationId,
        chatType: this.currentConversation.conversationType,
        body: {
          url: tempFilePath,
          length: duration
        },
        ext: {
          ease_chat_uikit_user_info: {
            avatarURL: this.selfUserInfo.avatar,
            nickname: this.selfUserInfo.name
          }
        }
      })

      this.$store.dispatch('message/sendMessage', {
        msg: audioMsg,
        uploadFileFunc: () => {
          return uni.uploadFile(requestParams)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.audio-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.audio-content {
  background: #fff;
  border-radius: 12px;
  padding: 30px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.audio-title {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.audio-button {
  width: 80px;
  height: 80px;
  background: #009dff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mic-icon {
  width: 40px;
  height: 40px;
}
</style>
