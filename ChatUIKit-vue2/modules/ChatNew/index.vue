<template>
  <view class="new-chat-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="title">新建会话</view>
      </template>
    </NavBar>
    <view class="search-wrap">
      <SearchButton placeholder="搜索联系人" @onTap="toContactSearch" />
    </view>
    <IndexedList
      v-if="contactList.length"
      class="contact-indexed-list"
      :options="contactList"
      @itemTap="toChatPage"
    >
      <template v-slot:indexedItem="{ item }">
        <UserItem :user="item" />
      </template>
    </IndexedList>
    <Empty v-else />
  </view>
</template>

<script>
import NavBar from '../../components/NavBar'
import SearchButton from '../../components/SearchButton'
import UserItem from '../ContactList/components/UserItem'
import Empty from '../../components/Empty'
import IndexedList from '../../components/IndexedList'

export default {
  name: 'ChatNew',
  
  components: {
    NavBar,
    SearchButton,
    UserItem,
    Empty,
    IndexedList
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
    }
  },
  
  mounted() {
    // 加载联系人列表
    this.$store.dispatch('contact/getContactsFromServer')
  },
  
  methods: {
    toContactSearch() {
      uni.showToast({ title: '搜索功能开发中', icon: 'none' })
    },
    
    toChatPage(item) {
      uni.redirectTo({
        url: `/pages/chat/index?type=singleChat&id=${item.userId}`
      })
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

.new-chat-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.contact-indexed-list {
  flex: 1;
  overflow-y: scroll;
}
</style>
