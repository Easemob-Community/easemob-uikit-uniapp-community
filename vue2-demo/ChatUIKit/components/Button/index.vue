<template>
  <button
    :class="['uikit-button', { disabled: disabled }]"
    :disabled="disabled"
    @tap="handleTap"
  >
    <slot />
  </button>
</template>

<script>
export default {
  name: 'UIKITButton',
  
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  
  methods: {
    handleTap() {
      if (!this.disabled) {
        this.$emit('tap')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.uikit-button {
  width: 100%;
  height: 48px;
  background: #009dff;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  &.disabled {
    background: #ccc;
    opacity: 0.6;
  }
  
  &:active {
    opacity: 0.8;
  }
}
</style>

<!-- #ifdef MP-WEIXIN -->
<style lang="scss">
.uikit-button::after {
  display: none !important;
  border: none !important;
}
</style>
<!-- #endif -->
