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
            :userId="showPresenceIndicator ? info.id : ''"
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
      // 获取当前页面栈
      const pages = getCurrentPages()
      console.log('[ChatNav] Page stack length:', pages ? pages.length : 0)
      
      // 尝试 navigateBack，如果失败则使用 switchTab
      if (pages && pages.length > 1) {
        uni.navigateBack({
          fail: () => {
            // navigateBack 失败，使用 switchTab 作为备选
            this.fallbackToTabBar()
          }
        })
      } else {
        // 页面栈为空或只有当前页面，使用 switchTab 返回
        this.fallbackToTabBar()
      }
    },
    
    fallbackToTabBar() {
      // 根据会话类型决定返回到哪个 tabBar 页面
      const currentConversation = this.$store.state.conversation.currentConversation
      if (currentConversation) {
        if (currentConversation.conversationType === 'singleChat') {
          // 单聊优先返回联系人列表
          uni.switchTab({
            url: '/ChatUIKit/modules/ContactList/index',
            fail: () => {
              uni.switchTab({
                url: '/ChatUIKit/modules/Conversation/index'
              })
            }
          })
        } else {
          // 群聊优先返回会话列表
          uni.switchTab({
            url: '/ChatUIKit/modules/Conversation/index'
          })
        }
      } else {
        // 默认返回会话列表
        uni.switchTab({
          url: '/ChatUIKit/modules/Conversation/index'
        })
      }
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
