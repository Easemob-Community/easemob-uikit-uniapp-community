<template>
  <view class="menu-item" @tap="onTap">
    <view class="menu-left" v-if="$slots.left || title || $slots.description || description">
      <slot name="left"></slot>
      <view class="menu-title-wrap">
        <text v-if="title" class="menu-title">{{ title }}</text>
        <text v-if="description" class="menu-description">{{ description }}</text>
        <slot name="description"></slot>
      </view>
    </view>
    <view class="menu-right">
      <slot name="right"></slot>
      <text v-if="showArrow" class="arrow">></text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MenuItem',
  props: {
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    showArrow: {
      type: Boolean,
      default: true
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
.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #fff;
  border-bottom: 0.5px solid #E3E6E8;
  min-height: 56px;
  box-sizing: border-box;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background-color: #f5f5f5;
  }
}

.menu-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.menu-title-wrap {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.menu-title {
  font-size: 16px;
  color: #171A1C;
  font-weight: 400;
}

.menu-description {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  line-height: 16px;
}

.menu-right {
  display: flex;
  align-items: center;
}

.arrow {
  font-size: 14px;
  color: #999;
  margin-left: 8px;
}
</style>
