<template>
  <view class="group-create-wrap">
    <view class="group-create-content" v-if="!isSearch">
      <NavBar class="nav-bar" @onLeftTap="onBack">
        <template v-slot:left>
          <view class="title">{{ $t('createGroup') }}</view>
        </template>
      </NavBar>
      <view class="search-wrap" @tap="isSearch = true">
        <SearchButton :placeholder="$t('searchContact')" />
      </view>
      <!-- #ifndef MP-WEIXIN -->
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
      <!-- #endif -->
      <!-- #ifdef MP-WEIXIN -->
      <scroll-view
        v-if="contactList.length"
        scroll-y
        class="contact-indexed-list"
      >
        <view
          v-for="group in indexedContactList"
          :key="group.letter"
          :id="'group-' + group.letter"
        >
          <view class="group-title">{{ group.letter }}</view>
          <view
            v-for="contact in group.data"
            :key="contact.userId"
            class="contact-item-wrap"
            @tap="toggleContact(contact.userId)"
          >
            <view class="checkbox-wrap">
              <view
                :class="['checkbox', { checked: selectedUserIds.includes(contact.userId) }]"
              >
                <text v-if="selectedUserIds.includes(contact.userId)" class="check-icon">✓</text>
              </view>
            </view>
            <UserItem class="contact-item" :user="contact" />
          </view>
        </view>
      </scroll-view>
      <view class="index-sidebar" v-if="contactList.length">
        <view
          v-for="letter in indexLetters"
          :key="letter"
          class="index-letter"
          @tap="scrollToLetter(letter)"
        >
          {{ letter }}
        </view>
      </view>
      <!-- #endif -->
      <view class="empty-wrap" v-if="!contactList.length">
        <Empty />
      </view>
      <view class="create-btn-wrap">
        <Button
          class="crate-btn"
          :disabled="!selectedUserIds.length"
          @tap="createGroup"
        >
          {{ $t('createGroupBtn') + '(' + selectedUserIds.length + ')' }}
        </Button>
      </view>
    </view>
    <SearchList
      v-else
      class="search-list-comp"
      :checkedList="selectedUserIds"
      @checkboxChange="onCheckboxChange"
      @cancel="isSearch = false"
    />
  </view>
</template>

<script>
import SearchButton from '../../components/SearchButton'
import NavBar from '../../components/NavBar'
import UserItem from '../ContactList/components/UserItem'
import Empty from '../../components/Empty'
// #ifndef MP-WEIXIN
import IndexedList from '../../components/IndexedList'
// #endif
// #ifdef MP-WEIXIN
import { groupByName } from '../../utils/index'
// #endif
import Button from '../../components/Button'
import SearchList from './searchList'

export default {
  name: 'GroupCreate',

  components: {
    SearchButton,
    NavBar,
    UserItem,
    Empty,
    // #ifndef MP-WEIXIN
    IndexedList,
    // #endif
    Button,
    SearchList
  },

  data() {
    return {
      isSearch: false,
      selectedUserIds: [],
      scrollIntoView: '' // MP-WEIXIN only
    }
  },

  computed: {
    contactList() {
      const contacts = this.$store.state.contact.contacts || []
      return contacts.map((contact) => {
        const userInfo = this.$store.getters['appUser/getUserInfo'](contact.userId) || {}
        return {
          ...contact,
          ...userInfo,
          id: contact.userId
        }
      })
    },

    // #ifdef MP-WEIXIN
    indexedContactList() {
      const groups = {}
      this.contactList.forEach(contact => {
        const name = contact.name || contact.nickname || contact.userId
        const initial = groupByName(name)
        if (!groups[initial]) {
          groups[initial] = []
        }
        groups[initial].push(contact)
      })
      const sortedKeys = Object.keys(groups).sort((a, b) => {
        if (a === '#') return 1
        if (b === '#') return -1
        return a.localeCompare(b)
      })
      return sortedKeys.map(letter => ({
        letter,
        data: groups[letter]
      }))
    },

    indexLetters() {
      return this.indexedContactList.map(g => g.letter)
    }
    // #endif
  },

  methods: {
    // #ifdef MP-WEIXIN
    toggleContact(userId) {
      const index = this.selectedUserIds.indexOf(userId)
      if (index === -1) {
        this.selectedUserIds.push(userId)
      } else {
        this.selectedUserIds.splice(index, 1)
      }
    },

    scrollToLetter(letter) {
      this.scrollIntoView = 'group-' + letter
      setTimeout(() => {
        this.scrollIntoView = ''
      }, 300)
    },
    // #endif

    onCheckboxChange(values) {
      this.selectedUserIds = values
    },

    createGroup() {
      if (!this.selectedUserIds.length) {
        return
      }

      const selfInfo = this.$store.getters['appUser/getSelfUserInfo']()
      const selfName = selfInfo ? selfInfo.name : ''

      let groupName = this.selectedUserIds
        .map((userId) => {
          const userInfo = this.$store.getters['appUser/getUserInfo'](userId)
          return userInfo ? userInfo.name : userId
        })
        .join('、')
      
      // 群组名字为当前用户的名字加上选中的用户的名字
      groupName = selfName + '、' + groupName

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
        title: 'loading',
        mask: true
      })

      this.$store
        .dispatch('group/createGroup', { data: params })
        .then(async (res) => {
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
              url: `/ChatUIKit/modules/Chat/index?type=groupChat&id=${groupId}`
            })
          }
        })
        .finally(() => {
          uni.hideLoading()
        })
    },

    onBack() {
      uni.redirectTo({
        url: '/ChatUIKit/modules/Conversation/index'
      })
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
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  margin-bottom: 45px;
}

.search-list-comp {
  height: 100%;
}

.crate-btn {
  width: 100%;
}

// MP-WEIXIN styles
.contact-item-wrap {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background-color: #fff;
  border-bottom: 0.5px solid #e3e6e8;
}

.checkbox-wrap {
  margin-right: 12px;
}

.checkbox {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;

  &.checked {
    background-color: #009dff;
    border-color: #009dff;
  }
}

.check-icon {
  color: #fff;
  font-size: 12px;
}

.group-title {
  padding: 8px 15px;
  background-color: #f5f5f5;
  color: #666;
  font-size: 14px;
}

.index-sidebar {
  position: fixed;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 100;
}

.index-letter {
  padding: 2px 5px;
  font-size: 11px;
  color: #666;
}
</style>
