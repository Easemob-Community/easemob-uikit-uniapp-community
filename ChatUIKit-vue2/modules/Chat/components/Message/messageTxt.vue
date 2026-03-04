<template>
  <view class="msg-text">
    <span class="msg">
      <span
        :class="[{ 'emoji-wrap': item.type !== 'text' }]"
        v-for="(item, idx) in data"
        :key="idx"
      >
        <span v-if="item.type === 'text'">{{ item.value }}</span>
        <image v-else class="msg-emoji" :src="item.value" />
      </span>
    </span>
    <view
      v-if="msg.modifiedInfo"
      :class="['msg-edited-tag', { self: isSelf }]"
    >
      已编辑
    </view>
  </view>
</template>

<script>
import { renderTxt } from '../../../../utils/index.js'

export default {
  name: 'TextMessage',

  props: {
    msg: {
      type: Object,
      required: true
    }
  },

  computed: {
    data() {
      return renderTxt(this.msg.msg)
    },

    isSelf() {
      const currentUserId = this.$store.state.conn.chatConn?.user
      return this.msg.from === currentUserId || this.msg.from === ''
    }
  }
}
</script>

<style lang="scss" scoped>
.emoji-wrap {
  vertical-align: middle;
}

.msg-text {
  text-align: left;
  overflow-y: auto;
  word-break: break-all;
  word-wrap: break-word;
  white-space: break-spaces;
  min-height: 18.5px;
}

.msg-emoji {
  width: 20px;
  height: 20px;
  vertical-align: middle;
}

.msg-edited-tag {
  font-size: 11px;
  line-height: 14px;
  color: #5270ad;
  text-align: right;
  margin-top: 8px;
}

.self {
  color: #f8f9fc;
}
</style>
