<template>
  <Chat :conversation-id="conversationId" :conversation-type="conversationType" />
</template>

<script>
import Chat from '../../ChatUIKit/modules/Chat/index.vue'

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
    this.conversationType = options.type || options.conversationType
    this.conversationId = options.id || options.conversationId
    
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
    }
  },

  onUnload() {
    this.$store.dispatch('message/setQuoteMessage', null)
    this.$store.dispatch('message/setEditingMessage', null)
    this.$store.commit('conversation/SET_CURRENT_CONVERSATION', null)
  }
}
</script>
