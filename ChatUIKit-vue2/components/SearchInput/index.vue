<template>
  <view class="search-input-warp">
    <view class="content">
      <view class="icon"></view>
      <input
        v-model="text"
        class="input"
        @input="handleInput"
        type="text"
        :focus="isFocus"
        @blur="onBlur"
        @focus="onFocus"
        confirm-type="done"
        :placeholder="placeholder"
      />
      <view v-if="text.length" class="clear-icon" @tap="handleClear"></view>
    </view>
    <view v-if="showCancel" @tap="handleCancel" class="cancel">取消</view>
  </view>
</template>

<script>
export default {
  name: 'SearchInput',
  
  props: {
    placeholder: {
      type: String,
      default: '搜索'
    },
    showCancel: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      text: '',
      isFocus: true
    }
  },
  
  methods: {
    handleInput(e) {
      this.$emit('input', e.detail.value)
    },
    
    handleClear() {
      this.text = ''
      this.$emit('input', '')
    },
    
    handleCancel() {
      this.$emit('cancel')
    },
    
    onBlur() {
      this.isFocus = false
    },
    
    onFocus() {
      this.isFocus = true
    },
    
    setIsFocus(focus) {
      this.isFocus = focus
    }
  }
}
</script>

<style lang="scss" scoped>
.search-input-warp {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .content {
    display: flex;
    width: 100%;
    height: 36px;
    background: #f1f2f3;
    border-radius: 4px;
    align-items: center;
    color: #171a1c;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 22px;
    padding: 0 5px;
  }
}
.input {
  flex: 1;
}

.icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  background-image: url("/static/icon/search.png");
  background-size: 100% 100%;
  margin-right: 5px;
}

.clear-icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  background-image: url("/static/icon/cancel.png");
  background-size: 100% 100%;
}

.cancel {
  flex-shrink: 0;
  color: #009dff;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 18px;
  margin: 0 0 0 20px;
}
</style>
