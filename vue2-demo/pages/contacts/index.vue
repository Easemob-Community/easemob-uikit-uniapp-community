<template>
  <view class="contacts-wrap">
    <view class="nav-bar">
      <text class="title">联系人</text>
    </view>
    <view class="content">
      <IndexedList
        :options="contactList"
        :hasGroupItem="true"
        :hasNewRequestItem="true"
        @onGroupTap="goToGroups"
        @onContactTap="goToChat"
        @onNewRequestTap="goToRequests"
        :requestCount="unreadCount"
        :groupCount="groupList.length"
      >
        <view class="contact-item" slot="indexedItem" slot-scope="{ item }" @tap.stop="goToChat(item.userId)">
          <Avatar 
            :src="item.avatar" 
            :size="40" 
            :placeholder="USER_AVATAR_URL"
            :withPresence="showPresenceIndicator"
            :userId="item.userId"
          />
          <text class="name">{{ item.name || item.userId }}</text>
        </view>
      </IndexedList>
    </view>
  </view>
</template>

<script>
import IndexedList from '../../ChatUIKit/components/IndexedList/index.vue'
import Avatar from '../../ChatUIKit/components/Avatar/index.vue'
import { USER_AVATAR_URL } from '../../ChatUIKit/const/index'

export default {
  components: {
    IndexedList,
    Avatar
  },
  
  data() {
    return {
      USER_AVATAR_URL,
      contactList: [],
      contactRequests: [],
      groupList: []
    }
  },
  
  computed: {
    unreadCount() {
      return this.contactRequests.filter(r => !r.isRead).length
    },
    
    featureConfig() {
      return this.$store.getters['config/getFeatureConfig'] || {}
    },
    
    showPresenceIndicator() {
      // 检查功能配置是否启用在线状态
      if (this.featureConfig.usePresence === false) {
        return false
      }
      return true
    }
  },
  
  async onShow() {
    // 从服务器加载联系人数据
    await this.$store.dispatch('contact/getContactsFromServer')
    await this.$store.dispatch('group/getJoinedGroupList')
    this.loadData()
  },
  
  methods: {
    loadData() {
      const store = this.$store.state
      
      // 获取联系人列表
      if (store.contact && store.contact.contacts) {
        this.contactList = store.contact.contacts.map(contact => {
          const userInfo = this.$store.getters['appUser/getUserInfo'](contact.userId) || {}
          return {
            ...contact,
            userId: contact.userId,
            name: userInfo.nickname || userInfo.name || contact.name || contact.userId,
            avatar: userInfo.avatarURL || userInfo.avatar || contact.avatar || ''
          }
        })
      }
      
      // 获取好友请求
      if (store.contact && store.contact.contactsNoticeInfo) {
        this.contactRequests = store.contact.contactsNoticeInfo.list || []
      }
      
      // 获取群组列表
      if (store.group && store.group.groupList) {
        this.groupList = store.group.groupList
      }
    },
    
    goToChat(userId) {
      uni.navigateTo({
        url: `/pages/chat/index?type=singleChat&id=${userId}`
      })
    },
    
    goToRequests() {
      uni.navigateTo({
        url: '/ChatUIKit/modules/ContactRequestList/index'
      })
    },
    
    goToGroups() {
      uni.navigateTo({
        url: '/ChatUIKit/modules/GroupList/index'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.contacts-wrap {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.nav-bar {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
  /* 避免被刘海屏遮挡 */
  margin-top: max(var(--status-bar-height), constant(safe-area-inset-top));
  margin-top: max(var(--status-bar-height), env(safe-area-inset-top));
  
  .title {
    font-size: 18px;
    font-weight: 500;
    color: #333;
  }
}

.content {
  flex: 1;
  overflow: hidden;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 0.5px solid #e3e6e8;
  
  &:active {
    background: #f5f5f5;
  }
  
  .name {
    margin-left: 12px;
    font-size: 16px;
    color: #171a1c;
  }
}
</style>
