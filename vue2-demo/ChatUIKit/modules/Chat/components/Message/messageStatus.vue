<template>
  <view class="msg-status">
    <view v-if="msg.status === 'sending'" class="status-icon loading"></view>
    <view v-else-if="msg.status === 'failed'" class="status-icon failed" @tap="resend"></view>
    <view v-else-if="msg.status === 'sent'" class="status-text">已发送</view>
    <view v-else-if="msg.status === 'read'" class="status-text read">已读</view>
  </view>
</template>

<script>
export default {
  name: 'MessageStatus',

  props: {
    msg: {
      type: Object,
      required: true
    }
  },

  methods: {
    resend() {
      // 重新发送消息
      this.$emit('resend', this.msg)
    }
  }
}
</script>

<style lang="scss" scoped>
.msg-status {
  position: absolute;
  left: -24px;
  top: 50%;
  transform: translateY(-50%);
}

.status-icon {
  width: 18px;
  height: 18px;
}

.loading {
  background-image: url("https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/icon/spinner.png");
  background-size: 100%;
  animation: spin 1s linear infinite;
}

.failed {
  background-image: url("https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/icon/warning.png");
  background-size: 100%;
}

.status-text {
  font-size: 11px;
  color: #999;
  white-space: nowrap;
}

.read {
  color: #009dff;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
