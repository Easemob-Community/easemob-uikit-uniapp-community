<template>
  <view
    class="swipe-menu-wrap"
    @touchmove="touchMoveHandler"
    @touchstart="touchStartHandler"
    :style="{ transform: 'translateX(' + (showMenu ? -272 : 0) + 'px)' }"
  >
    <view
      :class="[
        'conversation-item-wrap',
        { 'pin-conversation-item-wrap': conversation.isPinned }
      ]"
      @tap="toChatPage"
    >
      <view class="avatar-wrap">
        <Avatar
          :src="conversationInfo.avatar"
          :placeholder="getAvatarPlaceholder()"
          :size="50"
        />
      </view>
      <view class="content-wrap">
        <view class="user-info-wrap">
          <view class="info-wrap">
            <view class="user-nick-name ellipsis">
              {{ conversationInfo.name }}
            </view>
            <image
              v-if="isMute"
              style="width: 20px; height: 20px"
              src="../../../../assets/icon/mute.png"
            />
          </view>
          <view class="msg-wrap">
            <view
              v-if="conversation.atType && conversation.atType !== 'NONE'"
              class="mention-tag"
            >
              {{ conversation.atType === 'ALL' ? '[有人@我]' : '[有人@我]' }}
            </view>
            <view
              class="last-msg ellipsis"
              v-if="conversation.lastMessage && conversation.lastMessage.type === 'txt'"
            >
              <span
                v-if="
                  conversation.conversationType === 'groupChat' &&
                  !conversation.lastMessage.noticeInfo
                "
              >{{ getLastMsgFrom(conversation.lastMessage) }}:</span>
              <span>{{ conversation.lastMessage.msg }}</span>
            </view>
            <view v-else class="last-msg ellipsis">
              {{ formatLastMessage(conversation) }}
            </view>
          </view>
        </view>
        <view class="msg-right-wrap">
          <view class="time">{{ getConversationTime(conversation.lastMessage) }}</view>
          <view v-if="conversation.unReadCount">
            <view v-if="isMute" class="unread-mute"></view>
            <view v-else class="unread-count">
              {{ conversation.unReadCount > 99 ? '99+' : conversation.unReadCount }}
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="menu-wrap">
      <view
        :class="['menu', menu.class]"
        v-for="menu in currentMenuList"
        :key="menu.action"
        @click.stop="handleMenuClick(menu.action)"
      >
        {{ menu.name }}
      </view>
    </view>
  </view>
</template>

<script>
import Avatar from '../../../../components/Avatar'

export default {
  name: 'ConversationItem',
  
  components: {
    Avatar
  },
  
  props: {
    conversation: {
      type: Object,
      required: true
    },
    showMenu: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      startX: 0,
      isTapDelete: false
    }
  },
  
  computed: {
    isMute() {
      return this.$store.getters['conversation/getConversationMuteStatus'](
        this.conversation.conversationId
      )
    },
    
    conversationInfo() {
      const convId = this.conversation.conversationId
      if (this.conversation.conversationType === 'groupChat') {
        // 从 group store 获取
        const group = this.$store.getters['group/getGroupById'](convId)
        return {
          name: group ? group.groupName : convId,
          avatar: group ? group.avatar : ''
        }
      } else {
        // 从 appUser store 获取
        const userInfo = this.$store.getters['appUser/getUserInfo'](convId)
        return userInfo || { name: convId, avatar: '' }
      }
    },
    
    menuList() {
      const list = []
      // 静音功能
      list.push({
        name: this.isMute ? '取消静音' : '静音',
        action: 'mute',
        class: 'mute'
      })
      // 置顶功能
      list.push({
        name: this.conversation.isPinned ? '取消置顶' : '置顶',
        action: 'pin',
        class: 'pin'
      })
      // 删除功能
      list.push({
        name: '删除',
        action: 'delete',
        class: 'delete'
      })
      return list
    },
    
    confirmDeleteMenu() {
      return [
        {
          name: '确认删除',
          action: 'confirmDelete',
          class: 'confirm-delete'
        }
      ]
    },
    
    currentMenuList() {
      return this.isTapDelete ? this.confirmDeleteMenu : this.menuList
    }
  },
  
  methods: {
    getAvatarPlaceholder() {
      return this.conversation.conversationType === 'groupChat'
        ? '../../assets/group_avatar_default.png'
        : '../../assets/avatar_default.png'
    },
    
    getLastMsgFrom(msg) {
      if (this.conversation.conversationType === 'groupChat') {
        const from = msg.from || this.$store.state.conn.chatConn.user
        const userInfo = this.$store.getters['appUser/getUserInfo'](from)
        return userInfo ? userInfo.nickname : from
      }
      return ''
    },
    
    getConversationTime(lastMessage) {
      if (!lastMessage || !lastMessage.time) return ''
      
      const date = new Date(lastMessage.time)
      const now = new Date()
      const isToday = date.toDateString() === now.toDateString()
      
      if (isToday) {
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }
      
      const isYesterday = new Date(now - 86400000).toDateString() === date.toDateString()
      if (isYesterday) {
        return '昨天'
      }
      
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
    },
    
    formatLastMessage(conversation) {
      const message = conversation.lastMessage
      if (!message) return ''
      
      switch (message.type) {
        case 'img':
          return '[图片]'
        case 'audio':
          return '[语音]'
        case 'video':
          return '[视频]'
        case 'file':
          return '[文件]'
        case 'loc':
          return '[位置]'
        case 'custom':
          return '[自定义消息]'
        default:
          return message.msg || ''
      }
    },
    
    toChatPage() {
      if (this.showMenu) {
        this.isTapDelete = false
        this.$emit('leftSwipe', null)
        return
      }
      uni.navigateTo({
        url: `/pages/chat/index?conversationType=${this.conversation.conversationType}&conversationId=${this.conversation.conversationId}`
      })
    },
    
    handleMenuClick(action) {
      if (action === 'mute') {
        this.$emit('mute', this.conversation)
      } else if (action === 'pin') {
        this.$emit('pin', this.conversation)
      } else if (action === 'delete') {
        this.isTapDelete = true
        return
      } else if (action === 'confirmDelete') {
        this.$emit('delete', this.conversation)
      }
      this.$emit('leftSwipe', null)
      this.isTapDelete = false
    },
    
    touchStartHandler(e) {
      this.startX = e.touches[0].pageX
    },
    
    touchMoveHandler(e) {
      if (this.menuList.length === 0) return
      const pageX = e.touches[0].pageX
      const moveX = pageX - this.startX
      
      if (Math.abs(moveX) < 60) return
      
      if (moveX > 0) {
        this.$emit('leftSwipe', null)
        this.isTapDelete = false
      } else {
        this.$emit('leftSwipe', this.conversation.conversationId)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.conversation-item-wrap {
  display: flex;
  padding: 0 15px;
  align-items: center;
}

.pin-conversation-item-wrap {
  background: #F1F2F3;
}

.content-wrap {
  height: 74px;
  display: flex;
  flex: 1;
  align-items: center;
  border-bottom: 0.5px solid #E3E6E8;
}

.mention-tag {
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 18px;
  color: #009DFF;
  margin-right: 2px;
}

.avatar-wrap {
  position: relative;
}

.unread-mute {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-top: 10px;
  background: #009DFF;
  border-radius: 50%;
}

.unread-count {
  display: inline-block;
  width: fit-content;
  padding: 1px 4px;
  height: 15px;
  min-width: 10px;
  font-size: 12px;
  text-align: center;
  line-height: 16px;
  border-radius: 9px;
  background: #009DFF;
  color: #fff;
  margin-top: 5px;
}

.user-info-wrap {
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-left: 12px;
}

.info-wrap {
  display: flex;
  align-items: center;
}

.user-nick-name {
  font-size: 16px;
  max-width: calc(100vw - 200px);
  color: #171A1C;
  line-height: 22px;
  flex-shrink: 0;
  flex-grow: 0;
}

.msg-wrap {
  display: flex;
}

.last-msg {
  flex: 1;
  width: 0;
  min-height: 18px;
  font-size: 14px;
  color: #75828A;
  line-height: 18px;
}

.time {
  flex-shrink: 0;
  margin-left: 15px;
  color: #75828A;
  font-size: 12px;
  line-height: 16px;
}

.msg-right-wrap {
  text-align: right;
}

.swipe-menu-wrap {
  transition: all 0.4s ease;
  position: relative;
}

.emoji-wrap {
  vertical-align: middle;
}

.menu-wrap {
  position: absolute;
  right: -272px;
  top: 0;
  width: 272px;
  height: 100%;
  text-align: center;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  line-height: 22px;
  font-size: 16px;
  font-weight: 500;
}

.mute {
  width: 100%;
  background: #5270ad;
}

.pin {
  width: 100%;
  background: #009dff;
}

.delete {
  width: 100%;
  background: #75828A;
}

.confirm-delete {
  width: 100%;
  background: #f35;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
