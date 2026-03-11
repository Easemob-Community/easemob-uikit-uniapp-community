<template>
  <view class="item-container">
    <view class="item-icon-wrap">
      <image class="item-icon" :src="iconUrl" />
    </view>
    <view class="item-title">{{ title }}</view>
  </view>
</template>

<script>
export default {
  name: 'ItemContainer',

  props: {
    title: {
      type: String,
      default: ''
    },
    iconUrl: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
.item-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
}

.item-icon-wrap {
  width: 56px;
  height: 56px;
  background: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.item-icon {
  width: 32px;
  height: 32px;
}

.item-title {
  font-size: 12px;
  color: #666;
}
</style>
