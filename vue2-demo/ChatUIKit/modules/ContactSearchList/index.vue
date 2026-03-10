<template>
  <view class="search-list-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="input-wrap">
          <SearchInput
            ref="searchRef"
            placeholder="搜索联系人"
            @input="onInput"
            @cancel="cancelSearch"
          />
        </view>
      </template>
    </NavBar>
    <view class="search-content" v-if="searchList.length">
      <view class="search-item">
        <UserItem
          v-for="item in searchList"
          :key="item.userId"
          @tap="toChatPage(item)"
          :user="{ userId: item.userId, name: item.name }"
        />
      </view>
    </view>
    <Empty v-else />
  </view>
</template>

<script>
import NavBar from '../../components/NavBar'
import SearchInput from '../../components/SearchInput'
import UserItem from '../ContactList/components/UserItem'
import Empty from '../../components/Empty'

export default {
  name: 'ContactSearchList',
  
  components: {
    NavBar,
    SearchInput,
    UserItem,
    Empty
  },
  
  data() {
    return {
      searchValue: '',
      sourceUrl: ''
    }
  },
  
  computed: {
    searchList() {
      if (!this.searchValue) {
        return []
      }
      const contacts = this.$store.state.contact.contacts || []
      return contacts.filter(item => {
        const userInfo = this.$store.getters['appUser/getUserInfo'](item.userId) || {}
        const name = userInfo.nickname || userInfo.name || item.name || item.userId
        return name.toLowerCase().includes(this.searchValue.toLowerCase())
      })
    }
  },
  
  onLoad(options) {
    this.sourceUrl = options?.url || ''
  },
  
  methods: {
    onInput(value) {
      this.searchValue = value
    },
    
    cancelSearch() {
      if (this.sourceUrl) {
        uni.redirectTo({
          url: this.sourceUrl
        })
      } else {
        uni.navigateBack()
      }
    },
    
    toChatPage(item) {
      uni.redirectTo({
        url: `/pages/chat/index?id=${item.userId}&type=singleChat`
      })
    },
    
    onBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.search-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: scroll;
}

.search-item {
  padding-right: 16px;
}

.input-wrap {
  /*  #ifndef MP-WEIXIN  */
  width: calc(100vw - 50px);
  /*  #endif  */
  /*  #ifdef MP-WEIXIN  */
  width: calc(100vw - 150px);
  /*  #endif  */
}

.search-list-wrap {
  height: calc(100% - var(--status-bar-height));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: 5px;
}
</style>
