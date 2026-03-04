<template>
  <view
    :class="[
      'chat-wrap',
      { 'chat-wrap-keyboard-close': keyboardHeight === '0px' }
    ]"
    :style="{ height: 'calc(100% - ' + keyboardHeight + ')' }"
  >
    <ChatNav />
    <!-- 消息列表 -->
    <view class="msgs-wrap">
      <!-- 遮照层,点击关闭Toolbar -->
      <view v-if="isShowMask" class="mask" @tap="closeToolbar"></view>
      <MessageList
        ref="msgListRef"
        :conversationId="conversationId"
        :conversationType="conversationType"
      />
    </view>
    <MessageQuotePanel />
    <!-- 消息编辑 -->
    <MessageEdit
      v-if="isEditingMessage"
      :style="{
        position: 'fixed',
        width: '100%',
        height: 'calc(100% - ' + keyboardHeight + ')',
        overflow: 'hidden',
        'z-index': 9
      }"
    />
    <!-- 输入框 -->
    <view class="chat-input-wrap">
      <MessageInput
        ref="msgInputRef"
        :preventEvent="isShowToolbar || isShowEmojiPicker"
        @onInputTap="onInputTap"
        @onMention="onMention"
        @onRecordAudio="onRecordAudio"
        @onShowToolbar="onShowToolbar"
        @onShowEmojiPicker="onShowEmojiPicker"
      />
    </view>
    <!-- input toolbar -->
    <view v-if="isShowToolbar" class="chat-input-toolbar-wrap">
      <MessageInputToolbar @onUserCardButtonTap="selectUserCard" />
    </view>
    <!-- emoji picker -->
    <EmojiPicker v-if="isShowEmojiPicker" @onEmojiPick="onEmojiPick" />
    <!-- mention list -->
    <MessageMentionList
      v-if="featureConfig.inputMention"
      ref="mentionListRef"
      @onSelect="onSelectMentionItem"
    />
    <!-- contact list -->
    <MessageContactList
      v-if="featureConfig.userCard"
      ref="contactListRef"
      @onSelect="onSelectUserCard"
    />
  </view>
</template>

<script>
import ChatNav from './components/ChatNav/index.vue'
import MessageList from './components/Message/messageList.vue'
import MessageInput from './components/MessageInput/index.vue'
import MessageInputToolbar from './components/MessageInputToolBar/index.vue'
import EmojiPicker from './components/MessageInputToolBar/emojiPicker.vue'
import MessageQuotePanel from './components/Message/messageQuotePanel.vue'
import MessageEdit from './components/Message/messageEdit.vue'
import MessageMentionList from './components/MessageMentionList/index.vue'
import MessageContactList from './components/MessageContactList/index.vue'
import { ASSETS_URL, USER_AVATAR_URL } from '../../const/index.js'

export default {
  name: 'Chat',

  components: {
    ChatNav,
    MessageList,
    MessageInput,
    MessageInputToolbar,
    EmojiPicker,
    MessageQuotePanel,
    MessageEdit,
    MessageMentionList,
    MessageContactList
  },

  data() {
    return {
      conversationId: '',
      conversationType: '',
      isShowToolbar: false,
      isShowEmojiPicker: false,
      keyboardHeight: '0px',
      featureConfig: {
        inputMention: true,
        userCard: true,
        usePresence: false
      }
    }
  },

  computed: {
    isShowMask() {
      return this.isShowToolbar || this.isShowEmojiPicker
    },

    isEditingMessage() {
      return !!this.$store.state.message.editingMessage
    }
  },

  watch: {
    '$store.state.message.quoteMessage'(quoteMsg) {
      if (quoteMsg) {
        this.$refs.msgInputRef && this.$refs.msgInputRef.setIsFocus(true)
      } else {
        this.$refs.msgInputRef && this.$refs.msgInputRef.setIsFocus(false)
      }
    }
  },

  onLoad(options) {
    // 兼容两种参数名：type/id 或 conversationType/conversationId
    this.conversationType = options.type || options.conversationType
    this.conversationId = options.id || options.conversationId
    
    if (this.conversationId) {
      this.$store.commit('conversation/SET_CURRENT_CONVERSATION', {
        conversationId: this.conversationId,
        conversationType: this.conversationType
      })
    }

    // 监听键盘高度变化
    if (uni.onKeyboardHeightChange) {
      uni.onKeyboardHeightChange(this.onKeyboardHeightChange)
    }
  },

  onUnload() {
    this.$store.dispatch('message/setQuoteMessage', null)
    this.$store.dispatch('message/setEditingMessage', null)
    this.$store.commit('conversation/SET_CURRENT_CONVERSATION', null)
    
    if (uni.offKeyboardHeightChange) {
      uni.offKeyboardHeightChange(this.onKeyboardHeightChange)
    }
  },

  mounted() {
    if (!this.conversationId && !this.conversationType) {
      return
    }
    // 标记会话已读
    this.$store.dispatch('conversation/markConversationAsRead', {
      conversationId: this.conversationId,
      conversationType: this.conversationType
    })
  },

  methods: {
    onKeyboardHeightChange({ height }) {
      this.keyboardHeight = height + 'px'
      this.$refs.msgListRef && this.$refs.msgListRef.scrollToBottom()
    },

    onInputTap() {
      this.closeToolbar()
      this.$refs.msgInputRef && this.$refs.msgInputRef.setIsFocus(true)
    },

    closeToolbar() {
      if (this.isShowToolbar) {
        this.isShowToolbar = false
      }
      if (this.isShowEmojiPicker) {
        this.isShowEmojiPicker = false
      }
    },

    onEmojiPick(alt) {
      this.$refs.msgInputRef && this.$refs.msgInputRef.insertText(alt)
    },

    onMention() {
      this.$refs.mentionListRef && this.$refs.mentionListRef.showPopup()
    },

    selectUserCard() {
      this.$refs.contactListRef && this.$refs.contactListRef.showPopup()
    },

    onSelectMentionItem(userIds) {
      const userNicks = userIds.map(userId => {
        if (userId === 'ALL') {
          return '@所有人'
        }
        const userInfo = this.$store.getters['appUser/getUserInfo'](userId)
        return userInfo.name
      })

      let str = userNicks.join('')
      if (userNicks.length === 0) {
        str = userNicks.join('@')
        return
      }
      this.$refs.msgInputRef && this.$refs.msgInputRef.addMentionUserIds(userIds)
      this.$refs.msgInputRef && this.$refs.msgInputRef.insertText(str)
    },

    onSelectUserCard(userIds) {
      const userId = userIds[0]
      const userInfo = this.$store.getters['appUser/getUserInfo'](userId)
      const selfUserInfo = this.$store.getters['appUser/getSelfUserInfo']
      const chatConn = this.$store.state.conn.chatConn
      
      // 创建名片消息
      const userCardMsg = chatConn.message.create({
        type: 'custom',
        to: this.conversationId,
        chatType: this.conversationType,
        ext: {
          ease_chat_uikit_user_info: {
            avatarURL: selfUserInfo.avatar,
            nickname: selfUserInfo.name
          }
        },
        customEvent: 'userCard',
        customExts: {
          avatar: userInfo.avatar,
          nickname: userInfo.name,
          uid: userId
        }
      })
      
      this.$store.dispatch('message/sendMessage', { msg: userCardMsg })
    },

    onRecordAudio() {
      this.isShowToolbar = false
      this.isShowEmojiPicker = false
    },

    onShowToolbar() {
      this.isShowToolbar = !this.isShowToolbar
      this.isShowEmojiPicker = false
    },

    onShowEmojiPicker() {
      this.isShowEmojiPicker = !this.isShowEmojiPicker
      this.isShowToolbar = false
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f9fafa;
  position: relative;
}

.msgs-wrap {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.chat-input-wrap {
  background: #f9fafa;
  border-top: 0.5px solid #e0e0e0;
  padding: 8px 0;
}

.chat-input-toolbar-wrap {
  background: #f9fafa;
}
</style>
