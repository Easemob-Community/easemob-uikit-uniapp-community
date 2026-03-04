<template>
  <view class="msg-quote" @tap.stop="jumpToOriginMsg">
    <view class="quote-title" :style="titleStyle">
      <text class="quote-sender">{{ messageQuoteExt.msgSender }}</text>
    </view>
    <view class="quote-content">{{ preview }}</view>
  </view>
</template>

<script>
export default {
  name: 'MessageQuote',

  props: {
    msgId: {
      type: String,
      default: ''
    },
    messageQuoteExt: {
      type: Object,
      default: () => ({})
    },
    titleStyle: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    preview() {
      return this.messageQuoteExt.msgPreview || ''
    }
  },

  methods: {
    jumpToOriginMsg() {
      if (this.msgId) {
        this.$emit('jumpToMessage', this.msgId)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.msg-quote {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  padding: 6px 10px;
  margin-bottom: 6px;
  max-width: 100%;
}

.quote-title {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.quote-sender {
  font-size: 12px;
  color: #5270ad;
}

.quote-content {
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}
</style>
