<template>
  <view v-if="quoteMessage" class="quote-panel">
    <view class="quote-content">
      <view class="quote-title">
        <text class="quote-label">{{ $t('common.reply') }}</text>
        <text class="quote-sender">{{ quoteSender }}</text>
      </view>
      <view class="quote-preview">{{ quotePreview }}</view>
    </view>
    <view class="close-btn" @tap="closeQuote">
      <text class="close-icon">×</text>
    </view>
  </view>
</template>

<script>
import { formatMessage } from '../../../../utils/index.js'

export default {
  name: 'MessageQuotePanel',

  computed: {
    quoteMessage() {
      return this.$store.state.message.quoteMessage
    },

    quoteSender() {
      if (!this.quoteMessage) return ''
      const userInfo = this.$store.getters['appUser/getUserInfo'](this.quoteMessage.from)
      return userInfo.name || this.quoteMessage.from
    },

    quotePreview() {
      if (!this.quoteMessage) return ''
      return formatMessage(this.quoteMessage)
    }
  },

  methods: {
    closeQuote() {
      this.$store.dispatch('message/setQuoteMessage', null)
    }
  }
}
</script>

<style lang="scss" scoped>
.quote-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

.quote-content {
  flex: 1;
  min-width: 0;
}

.quote-title {
  display: flex;
  align-items: center;
  margin-bottom: 2px;
}

.quote-label {
  font-size: 12px;
  color: #009dff;
  margin-right: 6px;
}

.quote-sender {
  font-size: 12px;
  color: #5270ad;
}

.quote-preview {
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.close-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
}

.close-icon {
  font-size: 20px;
  color: #999;
}
</style>
