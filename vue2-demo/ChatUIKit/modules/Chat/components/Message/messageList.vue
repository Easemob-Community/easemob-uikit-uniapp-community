<template>
  <view
    :class="['msg-list-wrap', { opacity: isOpacity }]"
    @tap="resetMessageState"
  >
    <scroll-view
      scroll-y
      :scroll-top="scrollTop"
      class="message-scroll-list"
      :scroll-into-view="scrollIntoViewId"
      :scroll-anchoring="true"
    >
      <view
        class="loadMore"
        v-if="!isLast && !isLoading"
        @tap="getHistoryMessage"
      >
        加载更多
      </view>
      <view class="isLast" v-if="isLast">没有更多消息</view>
      <view v-if="isLoading" class="loading"></view>
      <view
        :class="[
          'scroll-msg-item',
          { blink: blinkMsgId === (msg.serverMsgId || msg.id) }
        ]"
        v-for="(msg, idx) in msgs"
        :id="'msg-' + (msg.serverMsgId || msg.id)"
        :key="msg.id"
      >
        <NoticeMessageItem
          v-if="msg.noticeInfo && msg.noticeInfo.type === 'notice'"
          :msg="msg"
        />
        <MessageItem
          v-else
          :msg="msg"
          @onLongPress="onMessageLongPress"
          @jumpToMessage="setViewMsgId"
          :is-selected="msg.id === selectedMsgId"
        />
      </view>
    </scroll-view>
  </view>
</template>

<script>
import MessageItem from './messageItem.vue'
import NoticeMessageItem from './noticeMessageItem.vue'

export default {
  name: 'MessageList',

  components: {
    MessageItem,
    NoticeMessageItem
  },

  data() {
    return {
      scrollTop: 0,
      isLoading: false,
      currentViewMsgId: '',
      selectedMsgId: '',
      blinkMsgId: '',
      isOpacity: true
    }
  },

  computed: {
    currentConversation() {
      return this.$store.state.conversation.currentConversation
    },

    conversationId() {
      const conv = this.currentConversation
      return conv ? conv.conversationId : ''
    },

    conversationType() {
      const conv = this.currentConversation
      return conv ? conv.conversationType : ''
    },

    msgs() {
      if (!this.conversationId) return []
      return this.$store.getters['message/getConversationMessages'](this.conversationId)
    },

    isLast() {
      if (!this.conversationId) return true
      return !this.$store.getters['message/hasMoreHistory'](this.conversationId)
    },

    cursor() {
      if (!this.conversationId) return ''
      const info = this.$store.state.message.conversationMessagesMap[this.conversationId]
      return info && info.cursor || ''
    },

    scrollIntoViewId() {
      return this.currentViewMsgId ? 'msg-' + this.currentViewMsgId : ''
    }
  },

  watch: {
    msgs: {
      handler(newVal, oldVal) {
        if (this.isLoading || this.currentViewMsgId || (oldVal && newVal.length === oldVal.length)) {
          return
        }
        this.$nextTick(() => {
          this.scrollToBottom()
          setTimeout(() => {
            this.isOpacity = false
          }, 200)
        })
      },
      immediate: true
    },
    currentConversation: {
      handler(newVal, oldVal) {
        if (newVal && newVal.conversationId) {
          this.isOpacity = true
          this.loadHistoryMessages()
        }
      },
      immediate: true
    }
  },

  methods: {
    onMessageLongPress(msgId) {
      this.selectedMsgId = msgId
    },

    resetMessageState() {
      this.selectedMsgId = ''
    },

    // 加载历史消息（首次加载）
    loadHistoryMessages() {
      if (!this.conversationId || !this.conversationType) return
      
      const convMsgInfo = this.$store.state.message.conversationMessagesMap[this.conversationId]
      if (!convMsgInfo || convMsgInfo.isGetHistoryMessage !== true) {
        this.$store.dispatch('message/getHistoryMessages', {
          conversation: {
            conversationId: this.conversationId,
            conversationType: this.conversationType
          }
        })
      } else {
        // 已有消息，滚动到底部
        this.$nextTick(() => {
          this.scrollToBottom()
          setTimeout(() => {
            this.isOpacity = false
          }, 200)
        })
      }
    },

    async getHistoryMessage() {
      if (this.isLast || this.isLoading || !this.conversationId) {
        return
      }
      this.isLoading = true
      const firstMessage = this.msgs[0]
      const firstMessageId = firstMessage ? firstMessage.id : ''
      
      // #ifdef MP-WEIXIN
      this.currentViewMsgId = firstMessageId
      // #endif

      try {
        await this.$store.dispatch('message/getHistoryMessages', {
          conversation: {
            conversationId: this.conversationId,
            conversationType: this.conversationType
          },
          cursor: this.cursor,
          onSuccess: () => {
            // #ifdef APP-PLUS
            this.currentViewMsgId = firstMessageId
            // #endif
          }
        })
        
        // #ifdef WEB
        this.currentViewMsgId = firstMessageId
        // #endif
        
        this.$nextTick(() => {
          this.isLoading = false
          setTimeout(() => {
            this.currentViewMsgId = ''
          }, 300)
        })
      } catch (error) {
        this.isLoading = false
      }
    },

    scrollToBottom() {
      this.scrollTop = this.msgs.length * 999
      setTimeout(() => {
        this.scrollTop += 1
      }, 400)
    },

    setViewMsgId(msgId) {
      if (this.blinkMsgId) {
        return
      }
      this.currentViewMsgId = msgId
      this.blinkMsgId = msgId
      setTimeout(() => {
        this.blinkMsgId = ''
        this.currentViewMsgId = ''
      }, 1000)
    }
  }
}
</script>

<style lang="scss" scoped>
scroll-view ::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  background: transparent;
}

.msg-list-wrap {
  height: 100%;
  overflow: hidden;
}

.message-scroll-list {
  flex: 1;
  height: 100%;
  overflow: hidden auto;
  background-color: #f9fafa;
}

@keyframes blink {
  0% {
    background-color: #f9fafa;
  }
  50% {
    background-color: #e0e0e0;
  }
  100% {
    background-color: #f9fafa;
  }
}

.blink {
  animation: blink 1s infinite;
}

.scroll-msg-item {
  padding: 0 15px;
}

.opacity {
  opacity: 0;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading {
  width: 20px;
  height: 20px;
  margin: 10px auto;
  background-position: center center;
  background-image: url("https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/icon/spinner.png");
  background-size: 100%;
  animation: spin 1s linear infinite;
  background-repeat: no-repeat;
}

.isLast {
  text-align: center;
  padding: 10px 0;
  color: #999;
  font-size: 12px;
}

.loadMore {
  display: block;
  width: 100%;
  text-align: center;
  font-size: 14px;
  margin: 5px 0;
  color: #999;
}
</style>
