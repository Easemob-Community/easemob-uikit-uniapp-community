<template>
  <view class="contact-list-wrap">
    <ContactNav />
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
</template>

<script>
import ContactNav from './components/ContactNav'
import IndexedList from '../../components/IndexedList'
import UserItem from './components/UserItem'
import { isWXProgram } from '../../utils/index'

export default {
  name: 'ContactList',
  
  components: {
    ContactNav,
    IndexedList,
    UserItem
  },
  
  data() {
    return {
      isWXProgram: isWXProgram(),
      selectedUserId: null
    }
  },
  
  computed: {
    contactList() {
      const contacts = this.$store.state.contact.contacts
      return contacts.map((contact) => ({
        ...contact,
        ...this.$store.getters['appUser/getUserInfo'](contact.userId),
        id: contact.userId
      }))
    },
    
    contactRequestCount() {
      // 获取好友请求未读数，如果没有相关 store 则返回 0
      return this.$store.state.contact.contactsNoticeInfo?.unReadCount || 0
    },
    
    joinedGroupCount() {
      return this.$store.state.group.groupList.length
    }
  },
  
  onShow() {
    // 页面显示时获取联系人列表
    this.getContacts()
    this.getJoinedGroups()
  },
  
  methods: {
    getContacts() {
      this.$store.dispatch('contact/getContactsFromServer')
    },
    
    getJoinedGroups() {
      this.$store.dispatch('group/getJoinedGroupList')
    },
    
    onGroupTap() {
      uni.navigateTo({
        url: '/ChatUIKit/modules/GroupList/index'
      })
    },
    
    onContactTap(userId) {
      uni.navigateTo({
        url: `/ChatUIKit/modules/Chat/index?type=singleChat&id=${userId}`
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
@import url("../../styles/common.scss");

.contact-list-wrap {
  height: 100%;
  background: #f9fafa;
}

.contact-list {
  height: 100%;
}

.block {
  height: calc(52px + var(--status-bar-height));
}

.wx-block {
  height: calc(76px + var(--status-bar-height));
}
</style>
