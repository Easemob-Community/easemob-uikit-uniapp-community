<template>
  <view class="msg-quote" @tap.stop="jumpToOriginMsg">
    <view class="quote-title" :style="titleStyle">
      <text class="quote-sender">{{ messageQuoteExt.msgSender }}</text>
    </view>
    <view class="quote-content">
      <text v-if="isTextPreview">{{ textContent }}</text>
      <view v-else class="quote-emoji-list">
        <text v-for="(item, idx) in emojiContent" :key="idx" class="quote-emoji-item">
          <text v-if="item.type === 'text'">{{ item.value }}</text>
          <image v-else class="quote-emoji-img" :src="item.value" mode="aspectFit" />
        </text>
      </view>
    </view>
  </view>
</template>

<script>
import { renderTxt } from '../../../../utils/index.js'

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
    },
    
    // 检查是否是纯文本预览（没有表情）
    isTextPreview() {
      const content = renderTxt(this.preview)
      return content.every(item => item.type === 'text')
    },
    
    // 纯文本内容
    textContent() {
      return this.preview
    },
    
    // 带表情的内容
    emojiContent() {
      return renderTxt(this.preview)
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
  padding: 4px 8px;
  margin-top: 6px;
  max-width: 100%;
}

.quote-title {
  display: flex;
  align-items: center;
  margin-bottom: 2px;
}

.quote-sender {
  font-size: 11px;
  color: #5270ad;
}

.quote-content {
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  line-height: 18px;
  display: flex;
  align-items: center;
}

.quote-emoji-list {
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.quote-emoji-item {
  display: inline-flex;
  align-items: center;
}

.quote-emoji-img {
  width: 16px;
  height: 16px;
  display: inline-block;
  vertical-align: middle;
}
</style>
