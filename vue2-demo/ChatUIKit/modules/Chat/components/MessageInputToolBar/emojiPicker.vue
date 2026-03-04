<template>
  <view class="emoji-picker-wrap">
    <view class="emojis-wrap">
      <view class="emojis-row" v-for="(emojiRow, index) in emojis" :key="index">
        <view
          v-for="emoji in emojiRow"
          :key="emoji.alt"
          class="emoji-item-wrap"
        >
          <image
            class="emoji"
            :src="emoji.url"
            @click="selectEmoji(emoji.alt)"
          />
        </view>
        <!-- 补充empty, 对齐表情 -->
        <template v-if="index === emojis.length - 1">
          <view class="emoji-empty"></view>
          <view class="emoji-empty"></view>
          <view class="emoji-empty"></view>
          <view class="emoji-empty"></view>
        </template>
      </view>
    </view>
  </view>
</template>

<script>
import { emojiList } from '../../../../const/emoji.js'
import { splitArrayIntoChunks } from '../../../../utils/index.js'

export default {
  name: 'EmojiPicker',

  data() {
    return {
      emojis: splitArrayIntoChunks(emojiList, 7)
    }
  },

  methods: {
    selectEmoji(alt) {
      this.$emit('onEmojiPick', alt)
    }
  }
}
</script>

<style lang="scss" scoped>
.emoji-picker-wrap {
  background: #f9fafa;
  padding: 10px 0;
}

.emojis-wrap {
  display: flex;
  align-items: center;
  flex-flow: row wrap;
  max-height: 268px;
  overflow-y: scroll;
}

.emojis-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
}

.emoji-item-wrap {
  width: 32px;
  height: 32px;
  margin: 8px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:active {
    background: #f1f2f3;
    border-radius: 5px;
  }
}

.emoji {
  width: 28px;
  height: 28px;
}

.emoji-empty {
  width: 32px;
  height: 32px;
  margin: 8px;
}
</style>
