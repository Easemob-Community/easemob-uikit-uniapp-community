<template>
  <view class="message-input-wrap">
    <!-- #ifndef WEB -->
    <view
      v-if="featureConfig.inputAudio"
      @tap="showAudioPopup"
      class="icon-wrap"
    >
      <view class="icon audio-icon"></view>
    </view>
    <AudioMessageSender v-if="featureConfig.inputAudio" ref="audioPopupRef" />
    <!-- #endif -->
    <view class="send-input" @tap="onInputTap">
      <input
        :class="[{ 'prevent-event': preventEvent }]"
        v-model="text"
        cursor-spacing="20"
        type="text"
        :focus="isFocus"
        :adjust-position="false"
        :auto-blur="true"
        confirm-type="send"
        :confirm-hold="true"
        @input="onInput"
        @confirm="handleSendMessage"
        @blur="onBlur"
        @focus="onFocus"
        placeholder="发送消息"
      />
    </view>
    <view v-if="featureConfig.inputEmoji" class="icon-wrap">
      <view class="icon emoji-icon" @tap.stop="showEmojiPicker"></view>
    </view>
    <view class="icon-wrap" v-if="isShowToolbar && text.length === 0">
      <view class="icon plus-icon" @tap.stop="showToolbar"></view>
    </view>
    <view class="icon-wrap" v-else>
      <view class="icon send-icon" @tap.stop="handleSendMessage"></view>
    </view>
  </view>
</template>

<script>
import AudioMessageSender from '../MessageInputToolBar/audioSender.vue'
import { formatTextMessage } from '../../../../utils/index.js'
import { ASSETS_URL } from '../../../../const/index.js'

export default {
  name: 'MessageInput',

  components: {
    AudioMessageSender
  },

  props: {
    preventEvent: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      isFocus: false,
      text: '',
      mentionUserIds: []
    }
  },

  computed: {
    featureConfig() {
      return this.$store.getters['config/getFeatureConfig'] || {}
    },
    
    isShowToolbar() {
      return this.featureConfig.inputVideo || this.featureConfig.inputImage
    },

    currentConversation() {
      return this.$store.state.conversation.currentConversation
    }
  },

  methods: {
    showAudioPopup() {
      // #ifdef APP-PLUS
      // 检查权限
      // #endif
      this.$refs.audioPopupRef && this.$refs.audioPopupRef.showAudioPopup()
      this.$emit('onRecordAudio')
    },

    showToolbar() {
      this.$emit('onShowToolbar')
    },

    showEmojiPicker() {
      this.$emit('onShowEmojiPicker')
    },

    onInputTap() {
      this.$emit('onInputTap')
    },

    onInput(e) {
      // uni-app recognizes mention messages
      const inputText = e && e.detail && e.detail.value
      if (
        this.featureConfig.inputMention &&
        this.currentConversation && this.currentConversation.conversationType === 'groupChat'
      ) {
        if (inputText.endsWith('@') || inputText.endsWith('@\n')) {
          this.isFocus = false
          this.$emit('onMention', true)
        }
      }
    },

    async handleSendMessage() {
      let textMessage = formatTextMessage(this.text).trim()
      if (!textMessage) {
        console.warn('No text message')
        return
      }

      let msgQuoteExt = {}
      let isAtAll = false
      if (this.mentionUserIds.includes('ALL')) isAtAll = true

      const quoteMessage = this.$store.state.message.quoteMessage
      const selfUserInfo = this.$store.getters['appUser/getSelfUserInfo']
      const chatSDK = this.$store.state.conn.chatSDK

      if (!chatSDK || !chatSDK.message) {
        console.error('SDK not initialized')
        uni.showToast({ title: 'SDK 未初始化', icon: 'none' })
        return
      }

      if (quoteMessage) {
        msgQuoteExt = {
          msgID: quoteMessage.serverMsgId || quoteMessage.id,
          msgPreview: this.formatMessage(quoteMessage),
          msgSender: selfUserInfo.nickname || '',
          msgType: quoteMessage.type
        }
        this.$store.dispatch('message/setQuoteMessage', null)
      }

      const msg = chatSDK.message.create({
        to: this.currentConversation.conversationId,
        chatType: this.currentConversation.conversationType,
        type: 'txt',
        msg: textMessage,
        ext: {
          em_at_list: isAtAll ? 'ALL' : this.mentionUserIds,
          ease_chat_uikit_user_info: {
            avatarURL: selfUserInfo.avatar,
            nickname: selfUserInfo.name
          },
          msgQuote: msgQuoteExt.msgID ? msgQuoteExt : undefined
        }
      })

      this.text = ''
      this.mentionUserIds = []

      try {
        await this.$store.dispatch('message/sendMessage', { msg })
        this.$nextTick(() => {
          this.$emit('onMessageSend')
        })
      } catch (error) {
        uni.showToast({
          title: '发送失败: ' + (error.message || ''),
          icon: 'none'
        })
      }
    },

    formatMessage(message) {
      let lastMsg = ''
      switch (message && message.type) {
        case 'txt':
          lastMsg = (message && message.msg) || ''
          break
        case 'img':
          lastMsg = '[图片]'
          break
        case 'audio':
          lastMsg = '[语音]'
          break
        case 'file':
          lastMsg = '[文件]'
          break
        case 'video':
          lastMsg = '[视频]'
          break
        case 'custom':
          if (message.customEvent === 'userCard') {
            lastMsg = '[名片]'
          } else {
            lastMsg = '[自定义]'
          }
          break
        default:
          lastMsg = '[未知消息]'
          break
      }
      return lastMsg
    },

    onBlur() {
      this.isFocus = false
      this.$emit('onBlur')
    },

    onFocus() {
      this.isFocus = true
      this.$emit('onFocus')
    },

    insertText(emoji) {
      this.text += emoji
    },

    setIsFocus(focus) {
      this.isFocus = focus
    },

    addMentionUserIds(userIds) {
      this.mentionUserIds = [...new Set([...this.mentionUserIds, ...userIds])]
    }
  }
}
</script>

<style lang="scss" scoped>
.message-input-wrap {
  display: flex;
  align-items: center;
  padding: 0 8px;
  height: 100%;
}

.icon-wrap {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 28px;
  height: 28px;
  background-size: cover;
  background-repeat: no-repeat;
}

.audio-icon {
  background-image: url("https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/icon/audio.png");
}

.emoji-icon {
  background-image: url("https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/icon/emoji.png");
}

.plus-icon {
  background-image: url("https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/icon/plus.png");
}

.send-icon {
  background-image: url("https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/icon/send.png");
}

.send-input {
  flex: 1;
  margin: 0 8px;
}

.send-input input {
  height: 36px;
  background: #fff;
  border-radius: 4px;
  padding: 0 10px;
  font-size: 14px;
}

.prevent-event {
  pointer-events: none;
}
</style>
