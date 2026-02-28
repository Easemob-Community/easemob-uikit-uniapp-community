<template>
  <ConversationList />
</template>

<script>
// 使用相对路径
import ConversationList from '../../ChatUIKit/modules/Conversation'

export default {
  components: {
    ConversationList
  }
  // 会话列表数据在 SDK 连接成功后自动加载（ChatUIKit._loadInitialData）
  // 页面切换时直接从 store 读取，不再重复请求远端数据
}
</script>
