<template>
  <view class="msg-text">
    <view class="msg">
      <block
        v-for="(item, idx) in data"
        :key="idx"
      >
        <text v-if="item.type === 'text'" class="text-part">{{ item.value }}</text>
        <image v-else class="msg-emoji" :src="item.value" mode="aspectFit" />
      </block>
    </view>
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
      console.log('[TextMessage] Rendering msg:', this.msg.id, 'content:', this.msg.msg?.substring(0, 20), 'modifiedInfo:', this.msg.modifiedInfo)
      return renderTxt(this.msg.msg)
    },

    isSelf() {
      const conn = this.$store.state.conn.chatConn
      const currentUserId = conn && conn.user
      return this.msg.from === currentUserId || this.msg.from === ''
    }
  },
}
</script>

<style lang="scss" scoped>
.msg-text {
  text-align: left;
  word-break: break-all;
  word-wrap: break-word;
  line-height: 22px;
  font-size: 16px;
}

.msg {
  display: inline;
  font-size: 0;
}

.msg-content {
  display: inline;
}

.text-part {
  display: inline;
  font-size: 16px;
  line-height: 22px;
  vertical-align: middle;
}

.msg-emoji {
  width: 22px;
  height: 22px;
  display: inline-block;
  vertical-align: top;
  margin: 0 1px;
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
