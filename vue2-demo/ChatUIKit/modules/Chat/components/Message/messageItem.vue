<template>
  <view
    class="msg-item-wrap"
    :style="{ flexDirection: isSelf ? 'row-reverse' : 'row' }"
  >
    <view class="avatar-wrap">
      <Avatar
        :size="28"
        :src="userAvatar"
        :placeholder="USER_AVATAR_URL"
      />
    </view>
    <view class="msg-content" :style="{ textAlign: isSelf ? 'right' : 'left' }">
      <view :class="['msg-body', { 'msg-body-self': isSelf }]">
        <view class="user-nickname" v-if="!isSelf">
          {{ userNickname }}
        </view>
        <view
          :class="bubbleClass"
          :id="'msg-bubble-' + msg.id"
          @longpress="onMessageBubblePress"
          @touchstart="onTouchStart"
          @touchend="onTouchEnd"
          @touchmove="onTouchMove"
        >
          <MessageStatus
            v-if="messageStatus && isSelf && msg.status"
            :msg="msg"
          />
          <view v-if="msg.type === 'txt'">
            <TextMessage :msg="msg" />
          </view>
          <view v-else-if="msg.type === 'img'">
            <ImageMessage :msg="msg" />
          </view>
          <view v-else-if="msg.type === 'video'">
            <VideoMessage :msg="msg" />
          </view>
          <view v-else-if="msg.type === 'audio'">
            <AudioMessage :msg="msg" />
          </view>
          <view v-else-if="msg.type === 'custom'">
            <UserCardMessage v-if="msg.customEvent === 'userCard'" :msg="msg" />
          </view>
          <view v-else-if="msg.type === 'file'">
            <FileMessage :msg="msg" />
          </view>
        </view>
        <view
          v-if="hasQuote"
          class="msg-quote-container"
        >
          <MessageQuote
            :msg-id="msg.ext.msgQuote.msgID"
            :message-quote-ext="msg.ext.msgQuote"
            :title-style="{ justifyContent: isSelf ? 'flex-end' : 'flex-start' }"
            @jumpToMessage="jumpToMessage"
          />
        </view>
      </view>
      <view class="msg-time">{{ formatTime(msg.time) }}</view>
      <MessageActions
        v-if="isSelected"
        ref="actionRef"
        :msg="plainMsg"
        :is-selected="isSelected"
      />
    </view>
  </view>
</template>

<script>
import Avatar from '../../../../components/Avatar/index.vue'
import TextMessage from './messageTxt.vue'
import ImageMessage from './messageImage.vue'
import VideoMessage from './messageVideo.vue'
import AudioMessage from './messageAudio.vue'
import FileMessage from './messageFile.vue'
import UserCardMessage from './messageUserCard.vue'
import MessageQuote from './messageQuote.vue'
import MessageActions from './messageActions.vue'
import MessageStatus from './messageStatus.vue'
import { USER_AVATAR_URL } from '../../../../const/index.js'

export default {
  name: 'MessageItem',

  components: {
    Avatar,
    TextMessage,
    ImageMessage,
    VideoMessage,
    AudioMessage,
    FileMessage,
    UserCardMessage,
    MessageQuote,
    MessageActions,
    MessageStatus
  },

  props: {
    msg: {
      type: Object,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      USER_AVATAR_URL,
      longPressTimer: null,
      isLongPress: false,
      messageStatus: true
    }
  },

  computed: {
    isSelf() {
      const conn = this.$store.getters['conn/getChatConn']
      const currentUserId = conn && conn.user
      return currentUserId === this.msg.from || this.msg.from === ''
    },

    extUserInfo() {
      return (this.msg.ext && this.msg.ext.ease_chat_uikit_user_info) || {}
    },

    userAvatar() {
      const userInfo = this.getUserInfo(this.msg.from || '')
      return userInfo.avatar || this.extUserInfo.avatarURL || ''
    },

    userNickname() {
      const userInfo = this.getUserInfo(this.msg.from || '')
      return userInfo.nickname || this.extUserInfo.nickname
    },

    hasQuote() {
      return this.msg.ext && this.msg.ext.msgQuote && this.msg.ext.msgQuote.msgID
    },

    bubbleClass() {
      let className = 'msg-bubble'
      if (this.msg.type !== 'img' && this.msg.type !== 'video') {
        if (this.isSelf) {
          className = 'msg-bubble msg-bubble-self-bg'
        } else {
          className = 'msg-bubble msg-bubble-bg'
        }
      }
      return className
    },

    // 净化消息对象，排除 SDK 方法，避免 Vue 响应式警告
    plainMsg() {
      const msg = this.msg
      return {
        id: msg.id,
        serverMsgId: msg.serverMsgId,
        mid: msg.mid,
        type: msg.type,
        msg: msg.msg,
        body: msg.body,
        to: msg.to,
        from: msg.from,
        chatType: msg.chatType,
        status: msg.status,
        time: msg.time,
        ext: msg.ext,
        modifiedInfo: msg.modifiedInfo
      }
    }
  },

  methods: {
    getUserInfo(id) {
      return this.$store.getters['appUser/getUserInfo'](id || '')
    },

    formatTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    },

    jumpToMessage(id) {
      this.$emit('jumpToMessage', id)
    },

    onMessageBubblePress(e) {
      console.log('[MessageItem] Long press triggered for msg:', this.msg.id)
      this.doLongPress(e)
    },

    doLongPress(e) {
      this.isLongPress = true
      this.$emit('onLongPress', this.msg.id)
      this.$nextTick(() => {
        setTimeout(() => {
          console.log('[MessageItem] Calling handleLongPress, actionRef:', this.$refs.actionRef)
          this.$refs.actionRef && this.$refs.actionRef.handleLongPress(e, this)
        }, 50)
      })
    },

    onTouchStart(e) {
      console.log('[MessageItem] Touch start for msg:', this.msg.id)
      this.isLongPress = false
      this.longPressTimer = setTimeout(() => {
        console.log('[MessageItem] Long press detected by timer for msg:', this.msg.id)
        this.doLongPress(e)
      }, 600)
    },

    onTouchEnd() {
      console.log('[MessageItem] Touch end for msg:', this.msg.id)
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer)
        this.longPressTimer = null
      }
    },

    onTouchMove() {
      // 移动时取消长按
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer)
        this.longPressTimer = null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.msg-item-wrap {
  width: 100%;
  display: flex;
  margin-bottom: 15px;
  align-items: center;
  color: #333;

  .user-nickname {
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 16px;
    color: #5270ad;
  }

  .msg-bubble-bg {
    padding: 8px;
    background: #e5f5ff;
    color: #171a1c;
  }

  .msg-bubble-self-bg {
    padding: 8px;
    background: #009dff;
    color: #fff;
  }

  .msg-bubble {
    position: relative;
    font-size: 16px;
    line-height: 22px;
    display: inline-block;
    word-break: break-all;
    border-radius: 4px;
    max-width: calc(100vw - 100px);
    min-width: 15px;
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
  }

  .msg-bubble-bg:before {
    content: "";
    position: absolute;
    left: -9px;
    bottom: 10px;
    border: 5px solid transparent;
    border-right: 5px solid #e5f5ff;
  }

  .msg-bubble-self-bg:before {
    content: "";
    position: absolute;
    right: -9px;
    bottom: 10px;
    border: 5px solid transparent;
    border-left: 5px solid #009dff;
  }

  .msg-content {
    width: 100%;
    position: relative;
    margin: 10px 8px -12px 8px;
  }

  .avatar-wrap {
    align-self: self-end;
  }

  .msg-time {
    font-size: 12px;
    color: #acb4b9;
    line-height: 16px;
  }

  .msg-quote-container {
    margin-top: 4px;
    max-width: calc(100vw - 100px);
  }
  
  .msg-body {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .msg-body-self {
    align-items: flex-end;
  }
}
</style>
