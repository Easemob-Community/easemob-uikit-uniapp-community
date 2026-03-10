<template>
  <view v-if="visible" class="mention-popup">
    <view class="mention-mask" @tap="hidePopup"></view>
    <view class="mention-content">
      <view class="mention-header">
        <text class="mention-title">{{ $t('nav.selectMention') }}</text>
        <view class="close-btn" @tap="hidePopup">
          <text class="close-icon">×</text>
        </view>
      </view>
      <scroll-view class="mention-list" scroll-y>
        <view class="mention-item" @tap="selectAll">
          <Avatar :size="36" :src="''" :placeholder="GROUP_AVATAR_URL" />
          <text class="mention-name">{{ $t('message.mentionAll') }}</text>
        </view>
        <view
          class="mention-item"
          v-for="member in groupMembers"
          :key="member.userId"
          @tap="selectMember(member)"
        >
          <Avatar
            :size="36"
            :src="member.avatar"
            :placeholder="USER_AVATAR_URL"
          />
          <text class="mention-name">{{ member.nickname || member.userId }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import Avatar from '../../../../components/Avatar/index.vue'
import { USER_AVATAR_URL, GROUP_AVATAR_URL } from '../../../../const/index.js'

export default {
  name: 'MessageMentionList',

  components: {
    Avatar
  },

  data() {
    return {
      visible: false,
      USER_AVATAR_URL,
      GROUP_AVATAR_URL
    }
  },

  computed: {
    currentConversation() {
      return this.$store.state.conversation.currentConversation
    },

    groupMembers() {
      // 简化处理，实际应该从 store 获取群成员
      return []
    }
  },

  methods: {
    showPopup() {
      this.visible = true
    },

    hidePopup() {
      this.visible = false
    },

    selectAll() {
      this.$emit('onSelect', ['ALL'])
      this.hidePopup()
    },

    selectMember(member) {
      this.$emit('onSelect', [member.userId])
      this.hidePopup()
    }
  }
}
</script>

<style lang="scss" scoped>
.mention-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.mention-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.mention-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 12px 12px 0 0;
  max-height: 60%;
  display: flex;
  flex-direction: column;
}

.mention-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.mention-title {
  font-size: 16px;
  font-weight: 500;
  color: #171a1c;
}

.close-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon {
  font-size: 24px;
  color: #999;
}

.mention-list {
  flex: 1;
  max-height: 400px;
}

.mention-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.mention-name {
  margin-left: 12px;
  font-size: 15px;
  color: #171a1c;
}
</style>
