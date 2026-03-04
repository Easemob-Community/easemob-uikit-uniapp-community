<template>
  <view class="tool-usercard-wrap tool-item" @tap="onTap">
    <ItemContainer :title="title" :iconUrl="UserCardIcon"> </ItemContainer>
  </view>
</template>

<script>
import ItemContainer from './itemContainer.vue'
import { ASSETS_URL } from '../../../../const/index.js'

const UserCardIcon = ASSETS_URL + 'icon/usercard.png'

export default {
  name: 'UserCard',

  components: {
    ItemContainer
  },

  data() {
    return {
      UserCardIcon,
      title: '名片'
    }
  },

  methods: {
    onTap() {
      this.$emit('onUserCardButtonTap')
    }
  }
}
</script>

<style lang="scss" scoped>
.tool-item {
  display: flex;
  justify-content: center;
}
</style>
