<template>
  <view class="msg-status-wrap">
    <view v-if="msg.status === 'sending'" class="msg-status sending"></view>
    <view v-else-if="msg.status === 'sent'" class="msg-status sent"></view>
    <view v-else-if="msg.status === 'failed'" class="msg-status failed" @tap="resend"></view>
    <view v-else-if="msg.status === 'received'" class="msg-status received"></view>
    <view v-else-if="msg.status === 'read'" class="msg-status read"></view>
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
      this.$emit('resend', this.msg)
    }
  }
}
</script>

<style lang="scss" scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.msg-status-wrap {
  position: absolute;
  display: inline-block;
  left: -24px;
  bottom: 0px;
}

.msg-status {
  width: 20px;
  height: 20px;
}

.sending {
  background-position: center center;
  background-image: url("https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/icon/spinner.png");
  background-size: 100%;
  animation: spin 1s linear infinite;
  background-repeat: no-repeat;
}

.sent {
  background-position: center center;
  background-image: url("https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/icon/check.png");
  background-size: 100%;
  background-repeat: no-repeat;
}

.failed {
  background-position: center center;
  background-image: url("https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/icon/failed.png");
  background-size: 100%;
  background-repeat: no-repeat;
}

.received {
  background-position: center center;
  background-image: url("https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/icon/received.png");
  background-size: 100%;
  background-repeat: no-repeat;
}

.read {
  background-position: center center;
  background-image: url("https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/icon/read.png");
  background-size: 100%;
  background-repeat: no-repeat;
}
</style>
