<template>
  <view class="conversation-list-wrap">
    <view class="conversation-list-content">
      <view class="header-wrap">
        <ConversationNav />
        <SearchButton class="convs-search-btn" @onTap="onSearch" />
      </view>
      <!-- nav占位 -->
      <view :class="isWXProgram ? 'wx-block' : 'block'"></view>
      <view v-if="conversationList.length" class="convs-wrap">
        <view
          v-for="conv in conversationList"
          :key="conv.conversationId"
          :data-id="conv.conversationId"
        >
          <ConversationItem
            :conversation="conv"
            :showMenu="selectedConvId ? selectedConvId === conv.conversationId : false"
            @mute="onMuteButtonClick"
            @pin="pinConversation"
            @delete="deleteConversation"
            @leftSwipe="handleLeftSwipe"
          />
        </view>
      </view>
      <Empty v-if="!conversationList.length" />
    </view>
  </view>
</template>

<script>
import ConversationNav from '../ConversationNav'
import ConversationItem from '../ConversationItem'
import SearchButton from '../../../../components/SearchButton'
import Empty from '../../../../components/Empty'

export default {
  name: 'ConversationList',
  
  components: {
    ConversationNav,
    ConversationItem,
    SearchButton,
    Empty
  },
  
  data() {
    return {
      selectedConvId: null
    }
  },
  
  computed: {
    isWXProgram() {
      try {
        return uni.getSystemInfoSync().uniPlatform === 'mp-weixin'
      } catch (e) {
        return false
      }
    },
    
    conversationList() {
      // 从 store 获取会话列表（首次由 SDK 连接成功后加载，后续直接从 store 读取）
      return this.$store.getters['conversation/sortedConversationList']
    }
  },
  
  methods: {
    
    deleteConversation(conv) {
      this.$store.dispatch('conversation/deleteConversation', {
        conversationId: conv.conversationId,
        conversationType: conv.conversationType
      })
    },
    
    muteConversation(conv) {
      this.$store.dispatch('conversation/setSilentModeForConversation', {
        conversationId: conv.conversationId,
        conversationType: conv.conversationType,
        isMute: true
      })
    },
    
    unMuteConversation(conv) {
      this.$store.dispatch('conversation/setSilentModeForConversation', {
        conversationId: conv.conversationId,
        conversationType: conv.conversationType,
        isMute: false
      })
    },
    
    pinConversation(conv) {
      this.$store.dispatch('conversation/pinConversation', {
        conversationId: conv.conversationId,
        conversationType: conv.conversationType,
        isPinned: !conv.isPinned
      })
    },
    
    onMuteButtonClick(conv) {
      const isMute = this.$store.getters['conversation/getConversationMuteStatus'](
        conv.conversationId
      )
      if (isMute) {
        this.unMuteConversation(conv)
      } else {
        this.muteConversation(conv)
      }
    },
    
    handleLeftSwipe(convId) {
      this.selectedConvId = convId
    },
    
    onSearch() {
      uni.navigateTo({
        url: '/ChatUIKit/modules/ConversationSearchList/index'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  width: 50px;
  height: 22px;
  background: url("https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/chat.png") no-repeat;
  background-size: 100% 100%;
}

.btn-wrap {
  display: flex;
  width: 32px;
  justify-content: flex-end;
}

.action-btn {
  width: 24px;
  height: 24px;
  background: url("https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/icon/plus.png") no-repeat;
  background-size: 100% 100%;
}

.header-wrap {
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 999;
  padding: 0 8px 8px 8px;
  width: 100%;
  background: #f9fafa;
  box-sizing: border-box;
}

.convs-search-btn {
  margin: 8px;
}

.block {
  height: calc(104px + var(--status-bar-height));
}

.wx-block {
  height: 151px;
}

.conversation-list-wrap {
  height: 100%;
  position: relative;
  overflow: hidden;
}

.conversation-list-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.wx-block,
.block {
  flex-shrink: 0;
}

.convs-wrap {
  box-sizing: border-box;
  flex: 1;
  overflow-x: hidden;
  overflow-y: scroll;
}

.dangerous-btn {
  color: #ff002b;
}
</style>
