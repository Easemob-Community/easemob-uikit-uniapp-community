<template>
  <view class="notice-message">
    <view class="notice-content">
      <text>{{ noticeText }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'NoticeMessageItem',

  props: {
    msg: {
      type: Object,
      required: true
    }
  },

  computed: {
    noticeText() {
      const noticeInfo = this.msg.noticeInfo
      if (!noticeInfo) return ''

      if (noticeInfo.noticeType === 'recall') {
        const from = noticeInfo.ext && noticeInfo.ext.from
        const conn = this.$store.getters['conn/getChatConn']
        const currentUserId = conn && conn.user
        if (from === currentUserId) {
          return '你撤回了一条消息'
        } else {
          return '对方撤回了一条消息'
        }
      }

      return (noticeInfo.ext && noticeInfo.ext.text) || ''
    }
  }
}
</script>

<style lang="scss" scoped>
.notice-message {
  display: flex;
  justify-content: center;
  margin: 10px 0;
}

.notice-content {
  background: rgba(0, 0, 0, 0.1);
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  color: #999;
}
</style>
