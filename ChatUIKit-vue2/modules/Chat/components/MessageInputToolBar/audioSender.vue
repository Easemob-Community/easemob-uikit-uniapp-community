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

const MicIcon = ASSETS_URL + 'icon/mic.png'
const recorderManager = uni.getRecorderManager()

export default {
  name: 'AudioMessageSender',

  data() {
    return {
      MicIcon,
      showPopup: false,
      recording: false,
      recordStartTime: 0,
      tempFilePath: ''
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
      return this.$store.getters['appUser/getSelfUserInfo']
    }
  },

  mounted() {
    recorderManager.onStop((res) => {
      if (this.recording) {
        this.sendAudioMessage(res)
      }
    })

    recorderManager.onError((err) => {
      console.error('录音错误:', err)
      this.recording = false
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
      this.recording = true
      this.recordStartTime = Date.now()
      recorderManager.start({
        duration: 60000,
        sampleRate: 44100,
        numberOfChannels: 1,
        encodeBitRate: 192000,
        format: 'mp3'
      })
    },

    stopRecord() {
      const duration = Math.floor((Date.now() - this.recordStartTime) / 1000)
      if (duration < 1) {
        this.recording = false
        uni.showToast({ title: '录音时间太短', icon: 'none' })
        recorderManager.stop()
        return
      }
      recorderManager.stop()
      this.recording = false
      this.showPopup = false
    },

    cancelRecord() {
      this.recording = false
      recorderManager.stop()
    },

    sendAudioMessage(res) {
      const tempFilePath = res.tempFilePath
      const duration = Math.floor((Date.now() - this.recordStartTime) / 1000)
      const chatSDK = this.chatConn

      if (!chatSDK || !chatSDK.message) {
        console.error('SDK not initialized')
        return
      }

      const uploadUrl = chatSDK.apiUrl + '/' + chatSDK.orgName + '/' + chatSDK.appName + '/chatfiles'

      const token = chatSDK.token
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
