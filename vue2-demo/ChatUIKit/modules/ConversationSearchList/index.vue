<template>
  <view class="search-list-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="input-wrap">
          <SearchInput
            ref="searchRef"
            placeholder="搜索会话"
            @input="onInput"
            @cancel="cancelSearch"
          />
        </view>
      </template>
    </NavBar>
    <view class="search-content" v-if="searchList.length">
      <view
        class="search-item"
        v-for="item in searchList"
        :key="item.conversationId"
        @click="toChatPage(item)"
      >
        <GroupItem
          v-if="item.conversationType === 'groupChat'"
          :group="getGroupById(item.conversationId)"
        />
        <UserItem v-else :user="{ userId: item.conversationId }" />
      </view>
    </view>
    <Empty v-else />
  </view>
</template>

<script>
import NavBar from '../../components/NavBar'
import SearchInput from '../../components/SearchInput'
import GroupItem from '../GroupList/components/GroupItem'
import UserItem from '../ContactList/components/UserItem'
import Empty from '../../components/Empty'

export default {
  name: 'ConversationSearchList',
  
  components: {
    NavBar,
    SearchInput,
    GroupItem,
    UserItem,
    Empty
  },
  
  data() {
  return {
      searchValue: ''
    }
  },
  
  computed: {
    searchList() {
      if (!this.searchValue) {
        return []
      }
      const conversationList = this.$store.getters['conversation/sortedConversationList']
      return conversationList.filter((item) => {
        if (item.conversationType === 'singleChat') {
          const userInfo = this.$store.getters['appUser/getUserInfo'](item.conversationId)
          const name = userInfo.nickname || userInfo.name || item.conversationId
          return name.toLowerCase().includes(this.searchValue.toLowerCase())
        } else {
          const groupInfo = this.$store.getters['group/getGroupInfo'](item.conversationId)
          const groupName = groupInfo?.groupName || item.conversationId
          return groupName.toLowerCase().includes(this.searchValue.toLowerCase())
        }
      })
    }
  },
  
  methods: {
    onInput(value) {
      this.searchValue = value
    },
    
    getGroupById(groupId) {
      const group = this.$store.getters['group/getGroupById'](groupId)
      return group || { groupId }
    },
    
    cancelSearch() {
      uni.navigateBack()
    },
    
    onBack() {
      uni.navigateBack()
    },
    
    toChatPage(item) {
      uni.navigateTo({
        url: `/pages/chat/index?id=${item.conversationId}&type=${item.conversationType}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.search-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
}

.search-item {
  box-sizing: border-box;
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
