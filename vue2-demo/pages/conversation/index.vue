<template>
  <ConversationList />
</template>

<script>
// 使用相对路径
import ConversationList from '../../ChatUIKit/modules/Conversation'

export default {
  components: {
    ConversationList
  },
  
  onShow() {
    // 页面显示时刷新会话列表
    if (this.$store) {
      this.$store.dispatch('conversation/getConversationList')
    }
  }
}
</script>
