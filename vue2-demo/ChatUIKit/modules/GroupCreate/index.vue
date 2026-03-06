<template>
  <view class="group-create-wrap">
    <view class="group-create-content" v-if="!isSearch">
      <NavBar class="nav-bar" @onLeftTap="onBack">
        <template v-slot:left>
          <view class="title">创建群组</view>
        </template>
      </NavBar>
      <view class="search-wrap" @tap="isSearch = true">
        <SearchButton placeholder="搜索联系人" />
      </view>
      <IndexedList
        v-if="contactList.length"
        class="contact-indexed-list"
        :checkedList="selectedUserIds"
        :options="contactList"
        :withCheckbox="true"
        @checkboxChange="onCheckboxChange"
      >
        <template v-slot:indexedItem="slotProps">
          <UserItem class="contact-item" :user="slotProps.item" />
        </template>
      </IndexedList>
      <view class="empty-wrap" v-else>
        <Empty text="暂无联系人" />
      </view>
      <view class="create-btn-wrap">
        <button
          class="create-btn uikit-button"
          :disabled="!selectedUserIds.length"
          :class="{ disabled: !selectedUserIds.length }"
          @click="createGroup"
        >
          创建({{ selectedUserIds.length }})
        </button>
      </view>
    </view>
    <SearchList
      v-else
      class="search-list-comp"
      :checkedList="selectedUserIds"
      :contactList="contactList"
      @checkboxChange="onCheckboxChange"
      @cancel="isSearch = false"
    />
  </view>
</template>

<script>
import SearchButton from '../../components/SearchButton/index.vue'
import NavBar from '../../components/NavBar/index.vue'
import UserItem from './components/UserItem/index.vue'
import Empty from '../../components/Empty/index.vue'
import IndexedList from '../../components/IndexedList/index.vue'
import SearchList from './searchList.vue'

export default {
  components: {
    SearchButton,
    NavBar,
    UserItem,
    Empty,
    IndexedList,
    SearchList
  },
  
  data() {
    return {
      isSearch: false,
      selectedUserIds: []
    }
  },
  
  computed: {
    contactList() {
      const contacts = this.$store.state.contact?.contacts || []
      return contacts.map(contact => {
        const userInfo = this.$store.getters['appUser/getUserInfo'](contact.userId) || {}
        return {
          ...contact,
          ...userInfo,
          id: contact.userId,
          name: userInfo.nickname || userInfo.name || contact.name || contact.userId
        }
      })
    }
  },
  
  methods: {
    onCheckboxChange(values) {
      this.selectedUserIds = values
    },
    
    async createGroup() {
      if (!this.selectedUserIds.length) {
        return
      }
      
      const selfUserInfo = this.$store.getters['appUser/getSelfUserInfo']
      const memberNames = this.selectedUserIds.map(userId => {
        const info = this.$store.getters['appUser/getUserInfo'](userId)
        return info.nickname || info.name || userId
      })
      
      // 群组名字为当前用户的名字加上选中的用户的名字
      let groupName = selfUserInfo.nickname || selfUserInfo.name || '我'
      groupName = groupName + '、' + memberNames.join('、')
      
      // 限制群组名称长度
      if (groupName.length > 50) {
        groupName = groupName.substring(0, 50) + '...'
      }
      
      const params = {
        groupname: groupName,
        members: this.selectedUserIds,
        desc: groupName,
        public: true,
        allowinvites: true,
        inviteNeedConfirm: false,
        approval: false, // 无需审批即可加入群组
        maxusers: 1000
      }
      
      uni.showLoading({
        title: '创建中...',
        mask: true
      })
      
      try {
        const res = await this.$store.dispatch('group/createGroup', { data: params })
        const groupId = res.data?.groupid || res.data?.groupId
        
        if (groupId) {
          // 添加新群组到列表并获取详情
          await this.$store.dispatch('group/addNewGroup', {
            groupid: groupId,
            groupname: params.groupname,
            groupId: groupId,
            groupName: params.groupname
          })
          
          uni.redirectTo({
            url: `/pages/chat/index?type=groupChat&id=${groupId}`
          })
        }
      } catch (error) {
        console.error('创建群组失败:', error)
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
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
}

.search-wrap {
  flex-shrink: 0;
  padding: 7px 8px;
}

.nav-bar {
  flex-shrink: 0;
}

.group-create-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.group-create-wrap {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
}

.contact-indexed-list {
  flex: 1;
  overflow-y: scroll;
}

.empty-wrap {
  flex: 1;
}

.create-btn-wrap {
  flex-shrink: 0;
  display: flex;
  padding: 14px;
  align-items: center;
  border-top: 0.5px solid #e3e6e8;
  background: #f9fafa;
  backdrop-filter: blur(10px);
  margin-bottom: 0;
  padding-bottom: calc(14px + env(safe-area-inset-bottom));
}

.search-list-comp {
  height: 100%;
}

.create-btn {
  width: 100%;
}

.uikit-button {
  width: 100%;
  height: 48px;
  background: #009dff;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.disabled {
    background: #ccc;
    opacity: 0.6;
  }
  
  &:active {
    opacity: 0.8;
  }
}

/* #ifdef MP-WEIXIN */
.uikit-button::after {
  border: none;
}
/* #endif */
</style>
