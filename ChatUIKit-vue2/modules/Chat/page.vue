<template>
  <view class="chat-page">
    <Chat :conversation-id="conversationId" :conversation-type="conversationType" />
  </view>
</template>

<script>
import Chat from './index.vue'

export default {
  name: 'ChatPage',

  components: {
    Chat
  },

  data() {
    return {
      conversationId: '',
      conversationType: ''
    }
  },

  onLoad(options) {
    // 支持两种参数格式：type/id 或 conversationType/conversationId
    this.conversationType = options.type || options.conversationType
    this.conversationId = options.id || options.conversationId

    console.log('[ChatPage] onLoad options:', options)
    console.log('[ChatPage] conversationType:', this.conversationType, 'conversationId:', this.conversationId)

    if (this.conversationId) {
      this.$store.commit('conversation/SET_CURRENT_CONVERSATION', {
        conversationId: this.conversationId,
        conversationType: this.conversationType
      })

      // 获取用户信息（用于显示导航栏标题）
      if (this.conversationType === 'singleChat') {
        this.$store.dispatch('appUser/getUsersInfoFromServer', {
          userIdList: [this.conversationId]
        })
      } else if (this.conversationType === 'groupChat') {
        this.$store.dispatch('group/getGroupInfoFromServer', {
          groupId: this.conversationId
        })
      }
    } else {
      console.error('[ChatPage] conversationId is empty!')
      uni.showToast({ title: '会话ID不能为空', icon: 'none' })
    }
  },

  onUnload() {
    this.$store.dispatch('message/setQuoteMessage', null)
    this.$store.dispatch('message/setEditingMessage', null)
    this.$store.commit('conversation/SET_CURRENT_CONVERSATION', null)
  }
}
</script>

<style scoped>
.chat-page {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
