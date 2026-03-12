<template>
  <view class="contact-list-wrap">
    <view class="contact-list-content">
      <view class="header-wrap">
        <ContactNav />
      </view>
      <!-- nav占位 -->
      <view :class="isWXProgram ? 'wx-block' : 'block'"></view>
      <view class="contact-list">
        <IndexedList
        :options="contactList"
        :hasGroupItem="true"
        :hasNewRequestItem="true"
        @onGroupTap="onGroupTap"
        @onContactTap="onContactTap"
        @onNewRequestTap="onNewRequestTap"
        :requestCount="contactRequestCount"
        :groupCount="joinedGroupCount"
      >
        <template v-slot:indexedItem="slotProps">
          <UserItem 
            :user="slotProps.item" 
            :showMenu="selectedUserId === slotProps.item.userId"
            @onTap="onContactTap"
            @onDelete="onDeleteContact"
            @onSwipe="handleSwipe"
          />
        </template>
        </IndexedList>
      </view>
    </view>
  </view>
</template>

<script>
import ContactNav from './components/ContactNav'
import IndexedList from '../../components/IndexedList'
import UserItem from './components/UserItem'

export default {
  name: 'ContactList',
  
  components: {
    ContactNav,
    IndexedList,
    UserItem
  },
  
  data() {
    return {
      selectedUserId: null
    }
  },
  
  computed: {
    isWXProgram() {
      try {
        return uni.getSystemInfoSync().uniPlatform === 'mp-weixin'
      } catch (e) {
        return false
      }
    },
    
    // 合并联系人信息和用户信息
    contactList() {
      const contacts = this.$store.state.contact.contacts || []
      return contacts.map(contact => {
        const userInfo = this.$store.getters['appUser/getUserInfo'](contact.userId) || {}
        return {
          ...contact,
          ...userInfo,
          userId: contact.userId,  // 确保 userId 字段存在
          id: contact.userId,
          name: userInfo.nickname || userInfo.name || contact.name || contact.userId
        }
      })
    },
    
    // 好友申请未读数
    contactRequestCount() {
      return this.$store.getters['contact/getContactsNoticeUnreadCount'] || 0
    },
    
    // 加入的群组数量
    joinedGroupCount() {
      return this.$store.state.group.groupList?.length || 0
    }
  },
  
  onShow() {
    // 页面显示时刷新联系人列表
    this.loadContacts()
  },
  
  methods: {
    loadContacts() {
      this.$store.dispatch('contact/getContactsFromServer')
    },
    
    onGroupTap() {
      uni.navigateTo({
        url: '/ChatUIKit/modules/GroupList/index'
      })
    },
    
    onContactTap(userId) {
      if (!userId) return
      uni.navigateTo({
        url: `/pages/chat/index?type=singleChat&id=${userId}`
      })
    },
    
    onNewRequestTap() {
      uni.navigateTo({
        url: '/ChatUIKit/modules/ContactRequestList/index'
      })
    },
    
    handleSwipe(userId) {
      this.selectedUserId = userId
    },
    
    async onDeleteContact(userId) {
      try {
        await this.$store.dispatch('contact/deleteContact', userId)
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        })
      } catch (error) {
        uni.showToast({
          title: '删除失败',
          icon: 'none'
        })
      }
      this.selectedUserId = null
    }
  }
}
</script>

<style lang="scss" scoped>
.contact-list-wrap {
  height: 100%;
  background: #f9fafa;
  position: relative;
  overflow: hidden;
}

.contact-list-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.contact-list {
  flex: 1;
  overflow: hidden;
}

.header-wrap {
  position: fixed;
  z-index: 999;
  width: 100%;
  background: #f9fafa;
}

.block,
.wx-block {
  flex-shrink: 0;
}

.block {
  height: calc(52px + var(--status-bar-height));
}

.wx-block {
  height: calc(76px + var(--status-bar-height));
}
</style>
