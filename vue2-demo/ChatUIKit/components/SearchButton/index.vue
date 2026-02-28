<template>
  <view class="search-btn" @tap="onTap">
    <view class="search-icon"></view>
    <view>{{ placeholder }}</view>
  </view>
</template>

<script>
export default {
  name: 'SearchButton',
  
  props: {
    placeholder: {
      type: String,
      default: '搜索'
    }
  },
  
  methods: {
    onTap() {
      this.$emit('tap')
    }
  }
}
</script>

<style lang="scss" scoped>
.search-icon {
  width: 22px;
  height: 22px;
  background: url("https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/icon/search.png");
  background-size: 100% 100%;
  margin-right: 5px;
}

.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  background: #f1f2f3;
  text-align: center;
  font-size: 16px;
  line-height: 22px;
  color: #919ba1;
  border-radius: 4px;
}
</style>
