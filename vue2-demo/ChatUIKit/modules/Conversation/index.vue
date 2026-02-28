<template>
  <ConversationList />
</template>

<script>
import ConversationList from './components/ConversationList'

export default {
  name: 'Conversation',
  components: {
    ConversationList
  }
}
</script>

<style lang="scss" scoped>
@import "../../styles/common.scss";
</style>
