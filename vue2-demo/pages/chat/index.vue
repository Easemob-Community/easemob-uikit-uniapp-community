<template>
  <view class="chat-page">
    <view class="navbar">
      <text class="back" @click="goBack">&lt; 返回</text>
      <text class="title">{{ conversationId }}</text>
    </view>
    <view class="content">
      <text>聊天功能暂未实现</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      conversationId: '',
      conversationType: ''
    }
  },
  
  onLoad(options) {
    this.conversationId = options.conversationId
    this.conversationType = options.conversationType
  },
  
  methods: {
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  height: 88rpx;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  border-bottom: 1rpx solid #e5e5e5;
  
  .back {
    font-size: 28rpx;
    color: #666;
    margin-right: 30rpx;
  }
  
  .title {
    flex: 1;
    font-size: 32rpx;
    font-weight: 500;
    text-align: center;
    padding-right: 80rpx;
  }
}

.content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  
  text {
    color: #999;
    font-size: 28rpx;
  }
}
</style>
