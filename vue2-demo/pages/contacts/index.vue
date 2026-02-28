<template>
  <view class="contacts-wrap">
    <view class="nav-bar">
      <text class="title">联系人</text>
    </view>
    <view class="content">
      <!-- 好友请求 -->
      <view class="section-item" @tap="goToRequests" v-if="contactRequests.length > 0">
        <view class="icon request"></view>
        <text class="label">新的朋友</text>
        <view class="badge" v-if="unreadCount > 0">{{ unreadCount }}</view>
        <text class="arrow">></text>
      </view>
      
      <!-- 群组 -->
      <view class="section-item" @tap="goToGroups">
        <view class="icon group"></view>
        <text class="label">我的群组</text>
        <text class="count" v-if="groupList.length > 0">{{ groupList.length }}个</text>
        <text class="arrow">></text>
      </view>
      
      <!-- 联系人列表 -->
      <view class="contact-section">
        <view class="section-title">{{ contactList.length }}位联系人</view>
        <view 
          class="contact-item" 
          v-for="contact in contactList" 
          :key="contact.userId"
          @tap="goToChat(contact.userId)"
        >
          <Avatar 
            :src="contact.avatar" 
            :size="40" 
            :placeholder="USER_AVATAR_URL"
          />
          <text class="name">{{ contact.name || contact.userId }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import Avatar from '../../ChatUIKit/components/Avatar/index.vue'
import { USER_AVATAR_URL } from '../../ChatUIKit/const/index'

export default {
  components: {
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
    }
  },
  
  onShow() {
    this.loadData()
  },
  
  methods: {
    loadData() {
      const store = this.$store.state
      
      // 获取联系人列表
      if (store.contacts && store.contacts.contacts) {
        this.contactList = store.contacts.contacts.map(contact => {
          const userInfo = store.data && state.data.userInfos ? state.data.userInfos[contact.userId] : {}
          return {
            ...contact,
            ...userInfo
          }
        })
      }
      
      // 获取好友请求
      if (store.contacts && store.contacts.contactsNoticeInfo) {
        this.contactRequests = store.contacts.contactsNoticeInfo.list || []
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
      uni.showToast({ title: '好友请求功能开发中', icon: 'none' })
    },
    
    goToGroups() {
      uni.showToast({ title: '群组功能开发中', icon: 'none' })
    }
  }
}
</script>

<style lang="scss" scoped>
.contacts-wrap {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.nav-bar {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-bottom: 1px solid #eee;
  
  .title {
    font-size: 18px;
    font-weight: 500;
    color: #333;
  }
}

.content {
  padding-top: 8px;
}

.section-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  margin-bottom: 1px;
  
  &:active {
    background: #f5f5f5;
  }
  
  .icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &.request {
      background: #ff9500;
    }
    
    &.group {
      background: #34c759;
    }
  }
  
  .label {
    flex: 1;
    font-size: 16px;
    color: #333;
  }
  
  .count {
    font-size: 14px;
    color: #999;
    margin-right: 8px;
  }
  
  .badge {
    min-width: 18px;
    height: 18px;
    background: #ff3b30;
    color: #fff;
    font-size: 12px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 5px;
    margin-right: 8px;
  }
  
  .arrow {
    font-size: 14px;
    color: #ccc;
  }
}

.contact-section {
  margin-top: 8px;
  background: #fff;
  
  .section-title {
    padding: 8px 16px;
    font-size: 12px;
    color: #999;
    background: #f5f5f5;
  }
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  
  &:active {
    background: #f5f5f5;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  .name {
    margin-left: 12px;
    font-size: 16px;
    color: #333;
  }
}
</style>
