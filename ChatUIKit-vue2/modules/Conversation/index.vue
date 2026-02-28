<template>
  <view class="conversation-container">
    <!-- 导航栏 -->
    <view class="navbar">
      <text class="navbar-title">会话</text>
      <view class="navbar-right" v-if="totalUnreadCount > 0">
        <text class="badge">{{ totalUnreadCount > 99 ? '99+' : totalUnreadCount }}</text>
      </view>
    </view>
    
    <!-- 会话列表 -->
    <scroll-view 
      class="conversation-list" 
      scroll-y 
      refresher-enabled
      :refresher-triggered="loading"
      @refresherrefresh="onRefresh"
    >
      <!-- 空状态 -->
      <view class="empty-state" v-if="conversationList.length === 0 && !loading">
        <text class="empty-text">暂无会话</text>
        <text class="empty-subtext">开始聊天吧</text>
      </view>
      
      <!-- 列表项 -->
      <view 
        class="conversation-item" 
        v-for="item in conversationList" 
        :key="item.conversationId"
        @click="onItemClick(item)"
        @longpress="onItemLongPress(item)"
      >
        <!-- 头像 -->
        <view class="avatar">
          <image 
            class="avatar-img" 
            :src="item.avatar || '/static/logo.png'" 
            mode="aspectFill"
          />
          <view class="unread-badge" v-if="item.unReadCount > 0">
            <text class="unread-text">{{ item.unReadCount > 99 ? '99+' : item.unReadCount }}</text>
          </view>
        </view>
        
        <!-- 内容 -->
        <view class="content">
          <view class="content-header">
            <text class="name">{{ item.name || item.conversationId }}</text>
            <text class="time">{{ formatTime(item.lastMessage && item.lastMessage.time) }}</text>
          </view>
          <text class="preview" :class="{ 'unread': item.unReadCount > 0 }">
            {{ formatMessagePreview(item.lastMessage) }}
          </text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部操作菜单 -->
    <view class="action-sheet" v-if="showActionSheet" @click="hideActionSheet">
      <view class="action-sheet-content" @click.stop>
        <view class="action-item delete" @click="onDelete">
          <text>删除会话</text>
        </view>
        <view class="action-item cancel" @click="hideActionSheet">
          <text>取消</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { formatTime, formatMessagePreview } from '../../utils'

export default {
  name: 'ConversationList',
  
  data() {
    return {
      showActionSheet: false,
      selectedItem: null
    }
  },
  
  computed: {
    ...mapState('conversation', ['conversationList', 'loading', 'totalUnreadCount'])
  },
  
  mounted() {
    // 加载会话列表
    this.getConversationList()
    
    // 监听登录成功事件
    uni.$on('chatLoginSuccess', this.onLoginSuccess)
    
    // 监听新消息事件（从 SDK 回调转发）
    uni.$on('chatOnNewMessage', this.onNewMessage)
  },
  
  beforeDestroy() {
    uni.$off('chatLoginSuccess', this.onLoginSuccess)
    uni.$off('chatOnNewMessage', this.onNewMessage)
  },
  
  methods: {
    ...mapActions('conversation', [
      'getConversationList', 
      'deleteConversation',
      'selectConversation'
    ]),
    
    formatTime,
    formatMessagePreview,
    
    onLoginSuccess() {
      this.getConversationList()
    },
    
    onNewMessage() {
      // 收到新消息时刷新列表
      this.getConversationList()
    },
    
    onRefresh() {
      this.getConversationList()
    },
    
    onItemClick(item) {
      this.selectConversation(item)
      // 跳转到聊天页面（后续实现）
      uni.navigateTo({
        url: `/pages/chat/index?conversationId=${item.conversationId}&conversationType=${item.conversationType}`
      })
    },
    
    onItemLongPress(item) {
      this.selectedItem = item
      this.showActionSheet = true
    },
    
    hideActionSheet() {
      this.showActionSheet = false
      this.selectedItem = null
    },
    
    async onDelete() {
      if (!this.selectedItem) return
      
      uni.showModal({
        title: '提示',
        content: '确定删除该会话吗？',
        success: async (res) => {
          if (res.confirm) {
            await this.deleteConversation(this.selectedItem)
          }
          this.hideActionSheet()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.conversation-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.navbar {
  height: 88rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 1rpx solid #e5e5e5;
  
  &-title {
    font-size: 36rpx;
    font-weight: 500;
    color: #333;
  }
  
  &-right {
    position: absolute;
    right: 30rpx;
    
    .badge {
      background: #ff4d4f;
      color: #fff;
      font-size: 24rpx;
      padding: 4rpx 12rpx;
      border-radius: 24rpx;
    }
  }
}

.conversation-list {
  flex: 1;
  overflow: hidden;
}

.empty-state {
  padding: 200rpx 40rpx;
  text-align: center;
  
  .empty-text {
    display: block;
    font-size: 32rpx;
    color: #999;
    margin-bottom: 16rpx;
  }
  
  .empty-subtext {
    font-size: 28rpx;
    color: #bbb;
  }
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  
  &:active {
    background: #f5f5f5;
  }
  
  .avatar {
    position: relative;
    width: 96rpx;
    height: 96rpx;
    margin-right: 24rpx;
    
    &-img {
      width: 100%;
      height: 100%;
      border-radius: 12rpx;
    }
    
    .unread-badge {
      position: absolute;
      top: -8rpx;
      right: -8rpx;
      min-width: 36rpx;
      height: 36rpx;
      background: #ff4d4f;
      border-radius: 18rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 8rpx;
      box-sizing: border-box;
      
      .unread-text {
        color: #fff;
        font-size: 22rpx;
      }
    }
  }
  
  .content {
    flex: 1;
    min-width: 0;
    
    &-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12rpx;
      
      .name {
        font-size: 32rpx;
        color: #333;
        font-weight: 500;
        max-width: 400rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .time {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .preview {
      font-size: 28rpx;
      color: #999;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      
      &.unread {
        color: #333;
        font-weight: 500;
      }
    }
  }
}

.action-sheet {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  
  &-content {
    width: 100%;
    background: #f5f5f5;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
    
    .action-item {
      background: #fff;
      height: 100rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1rpx solid #e5e5e5;
      
      text {
        font-size: 32rpx;
      }
      
      &.delete {
        color: #ff4d4f;
      }
      
      &.cancel {
        margin-top: 16rpx;
        border-bottom: none;
        color: #333;
      }
      
      &:active {
        background: #f5f5f5;
      }
    }
  }
}
</style>
