<template>
  <view class="group-create-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="title">创建群组</view>
      </template>
    </NavBar>
    <view class="search-wrap">
      <SearchButton placeholder="搜索联系人" />
    </view>
    <scroll-view scroll-y class="contact-list">
      <view
        v-for="contact in contactList"
        :key="contact.userId"
        class="contact-item"
        @tap="toggleSelect(contact.userId)"
      >
        <view class="checkbox" :class="{ checked: selectedUserIds.includes(contact.userId) }">
          <view v-if="selectedUserIds.includes(contact.userId)" class="check-icon">✓</view>
        </view>
        <UserItem :user="contact" />
      </view>
      <Empty v-if="!contactList.length" />
    </scroll-view>
    <view class="create-btn-wrap">
      <UIKITButton
        :disabled="!selectedUserIds.length"
        @tap="createGroup"
      >
        创建({{ selectedUserIds.length }})
      </UIKITButton>
    </view>
  </view>
</template>

<script>
import NavBar from '../../components/NavBar'
import SearchButton from '../../components/SearchButton'
import UserItem from '../ContactList/components/UserItem'
import Empty from '../../components/Empty'
import UIKITButton from '../../components/Button'

export default {
  name: 'GroupCreate',
  
  components: {
    NavBar,
    SearchButton,
    UserItem,
    Empty,
    UIKITButton
  },
  
  data() {
    return {
      selectedUserIds: []
    }
  },
  
  computed: {
    contactList() {
      const contacts = this.$store.state.contact.contacts || []
      return contacts.map(contact => {
        const userInfo = this.$store.getters['appUser/getUserInfo'](contact.userId)
        return {
          ...contact,
          name: userInfo.name || userInfo.nickname || contact.userId,
          avatar: userInfo.avatar || userInfo.avatarURL || ''
        }
      })
    },
    
    selfUserInfo() {
      return this.$store.state.appUser.selfUserInfo || {}
    }
  },
  
  mounted() {
    this.$store.dispatch('contact/getContactsFromServer')
  },
  
  methods: {
    toggleSelect(userId) {
      const index = this.selectedUserIds.indexOf(userId)
      if (index > -1) {
        this.selectedUserIds.splice(index, 1)
      } else {
        this.selectedUserIds.push(userId)
      }
    },
    
    async createGroup() {
      if (!this.selectedUserIds.length) {
        return
      }
      
      const userNames = this.selectedUserIds.map(userId => {
        const userInfo = this.$store.getters['appUser/getUserInfo'](userId)
        return userInfo.name || userInfo.nickname || userId
      })
      
      const groupName = (this.selfUserInfo.nickname || this.selfUserInfo.name) + '、' + userNames.join('、')
      
      uni.showLoading({
        title: '创建中',
        mask: true
      })
      
      try {
        const result = await this.$store.dispatch('group/createGroup', {
          groupname: groupName,
          members: this.selectedUserIds,
          desc: groupName,
          public: true,
          allowinvites: true,
          inviteNeedConfirm: false,
          approval: false,
          maxusers: 1000
        })
        
        const groupId = result.data?.groupid || result.data?.groupId
        if (groupId) {
          uni.redirectTo({
            url: `/pages/chat/index?type=groupChat&id=${groupId}`
          })
        }
      } catch (error) {
        uni.showToast({
          title: '创建失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    onBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  color: #171a1c;
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
}

.search-wrap {
  flex-shrink: 0;
  padding: 7px 8px;
}

.group-create-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.contact-list {
  flex: 1;
  overflow-y: scroll;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 0.5px solid #e3e6e8;
  background: #fff;
}

.checkbox {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #ccc;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.checked {
    background: #009dff;
    border-color: #009dff;
  }
}

.check-icon {
  color: #fff;
  font-size: 12px;
}

.create-btn-wrap {
  flex-shrink: 0;
  padding: 14px;
  border-top: 0.5px solid #e3e6e8;
  background: #f9fafa;
}
</style>
