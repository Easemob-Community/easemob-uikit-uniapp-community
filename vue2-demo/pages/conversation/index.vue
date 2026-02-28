<template>
  <ConversationList />
</template>

<script>
import ConversationList from '@/ChatUIKit/modules/Conversation'

export default {
  components: {
    ConversationList
  },
  
  onShow() {
    // 页面显示时刷新会话列表
    this.$store.dispatch('conversation/getConversationList')
  }
}
</script>
