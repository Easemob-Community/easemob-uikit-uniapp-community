<template>
  <view>
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="left-content">
          <Avatar
            class="nav-avatar"
            :size="32"
            :src="info.avatar"
            :placeholder="isSingleChat ? USER_AVATAR_URL : GROUP_AVATAR_URL"
            :withPresence="showPresenceIndicator"
            :presenceExt="info.presenceExt"
            :isOnline="info.isOnline"
          />
          <view class="name ellipsis">{{ info.name }}</view>
        </view>
      </template>
    </NavBar>
  </view>
</template>

<script>
import Avatar from '../../../../components/Avatar/index.vue'
import NavBar from '../../../../components/NavBar/index.vue'
import { USER_AVATAR_URL, GROUP_AVATAR_URL } from '../../../../const/index.js'

export default {
  name: 'ChatNav',

  components: {
    Avatar,
    NavBar
  },

  data() {
    return {
      USER_AVATAR_URL,
      GROUP_AVATAR_URL
    }
  },

  computed: {
    featureConfig() {
      return this.$store.getters['config/getFeatureConfig'] || {}
    },
    currentConversation() {
      return this.$store.state.conversation.currentConversation
    },

    info() {
      const conv = this.currentConversation
      if (!conv) {
        return { avatar: '', name: '', id: '' }
      }

      if (conv.conversationType === 'singleChat') {
        const userinfo = this.$store.getters['appUser/getUserInfo'](conv.conversationId)
        return {
          name: userinfo.name || conv.conversationId,
          id: conv.conversationId,
          avatar: userinfo.avatar,
          conversationType: conv.conversationType,
          presenceExt: userinfo.presenceExt,
          isOnline: userinfo.isOnline
        }
      } else {
        const groupInfo = this.$store.getters['group/getGroupById'](conv.conversationId)
        const groupName = this.$store.getters['group/getGroupName'](conv.conversationId)
        const groupAvatar = this.$store.getters['group/getGroupAvatar'](conv.conversationId)
        return {
          name: groupName || conv.conversationId,
          id: conv.conversationId,
          avatar: groupAvatar,
          conversationType: conv.conversationType
        }
      }
    },

    isSingleChat() {
      return this.info.conversationType === 'singleChat'
    },

    showPresenceIndicator() {
      // 检查功能配置是否启用在线状态
      if (this.featureConfig.usePresence === false) {
        return false
      }
      return this.isSingleChat
    }
  },

  mounted() {
    // 获取用户在线状态（如果需要）
    if (this.featureConfig.usePresence && this.isSingleChat && this.info.id) {
      // 简化处理，不实现 presence 功能
    }
  },

  methods: {
    onBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.name {
  max-width: 45vw;
  color: #171a1c;
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
  margin-left: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.left-content {
  display: flex;
  align-items: center;
}

.nav-avatar {
  height: 32px;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
