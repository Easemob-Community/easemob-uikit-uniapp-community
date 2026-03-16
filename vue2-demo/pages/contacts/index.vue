<template>
  <view class="contacts-wrap">
    <view class="nav-bar">
      <text class="title">{{ $t('contact.title') }}</text>
    </view>
    
    <!-- #ifndef MP-WEIXIN -->
    <!-- H5/App 平台：使用 ContactList 组件 -->
    <ContactList />
    <!-- #endif -->
    
    <!-- #ifdef MP-WEIXIN -->
    <!-- 微信小程序：直接渲染，避免作用域插槽兼容问题 -->
    <view class="content">
      <!-- 新的朋友入口 -->
      <view class="special-item" @tap="goToRequests">
        <view class="special-item-content">
          <view class="special-item-icon new-request-icon"></view>
          <view class="special-item-info">
            <text class="special-item-title">{{ $t('contact.newFriends') }}</text>
          </view>
          <view v-if="unreadCount > 0" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</view>
        </view>
      </view>
      
      <!-- 群聊入口 -->
      <view class="special-item" @tap="goToGroups">
        <view class="special-item-content">
          <view class="special-item-icon group-icon"></view>
          <view class="special-item-info">
            <text class="special-item-title">{{ $t('contact.groups') }}</text>
          </view>
          <view class="special-item-count" v-if="groupList.length > 0">{{ groupList.length }}</view>
        </view>
      </view>
      
      <!-- 联系人列表 -->
      <scroll-view 
        scroll-y 
        class="contact-scroll" 
        :scroll-into-view="scrollIntoView"
        @scroll="onScroll"
      >
        <view
          v-for="(group, gIndex) in indexedContactList"
          :key="gIndex"
          :id="'group-' + group.letter"
          class="contact-group"
        >
          <view :class="['group-title', { active: activeLetter === group.letter }]">{{ group.letter }}</view>
          <view
            v-for="(item, idx) in group.data"
            :key="idx"
            class="contact-item"
            @tap="goToChat(item.userId)"
          >
            <Avatar 
              :src="item.avatar" 
              :size="40" 
              :placeholder="USER_AVATAR_URL"
              :withPresence="showPresenceIndicator"
              :userId="item.userId"
            />
            <text class="name">{{ item.name || item.userId }}</text>
          </view>
        </view>
      </scroll-view>
      
      <!-- 侧边索引 -->
      <view class="index-sidebar">
        <view
          v-for="letter in indexLetters"
          :key="letter"
          :class="['index-letter', { active: activeLetter === letter }]"
          @tap="scrollToLetter(letter)"
        >
          {{ letter }}
        </view>
      </view>
    </view>
    <!-- #endif -->
  </view>
</template>

<script>
// #ifndef MP-WEIXIN
import ContactList from '../../ChatUIKit/modules/ContactList'
// #endif
import Avatar from '../../ChatUIKit/components/Avatar/index.vue'
import { USER_AVATAR_URL } from '../../ChatUIKit/const/index'
// #ifdef MP-WEIXIN
import { groupByName } from '../../ChatUIKit/utils/index'
// #endif

export default {
  components: {
    // #ifndef MP-WEIXIN
    ContactList,
    // #endif
    Avatar
  },
  
  data() {
    return {
      USER_AVATAR_URL,
      // #ifdef MP-WEIXIN
      contactList: [],
      contactRequests: [],
      groupList: [],
      scrollIntoView: '',
      activeLetter: ''
      // #endif
    }
  },
  
  // #ifdef MP-WEIXIN
  computed: {
    unreadCount() {
      return this.contactRequests.filter(r => !r.isRead).length
    },
    
    featureConfig() {
      return this.$store.getters['config/getFeatureConfig'] || {}
    },
    
    showPresenceIndicator() {
      if (this.featureConfig.usePresence === false) {
        return false
      }
      return true
    },
    
    indexedContactList() {
      const groups = {}
      this.contactList.forEach(item => {
        const firstLetter = groupByName(item.name || item.userId || '#')
        if (!groups[firstLetter]) {
          groups[firstLetter] = []
        }
        groups[firstLetter].push(item)
      })
      
      const sortedLetters = Object.keys(groups).sort((a, b) => {
        if (a === '#') return 1
        if (b === '#') return -1
        return a.charCodeAt(0) - b.charCodeAt(0)
      })
      
      return sortedLetters.map(letter => ({
        letter,
        data: groups[letter]
      }))
    },
    
    indexLetters() {
      return this.indexedContactList.map(g => g.letter)
    }
  },
  
  watch: {
    indexedContactList: {
      immediate: true,
      handler(data) {
        if (data.length > 0 && !this.activeLetter) {
          this.activeLetter = data[0].letter
        }
      }
    }
  },
  // #endif
  
  onShow() {
    // #ifdef MP-WEIXIN
    this.loadData()
    // #endif
  },
  
  methods: {
    // #ifdef MP-WEIXIN
    async loadData() {
      // 加载联系人
      await this.$store.dispatch('contact/getContactsFromServer')
      await this.$store.dispatch('group/getJoinedGroupList')
      
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
    
    scrollToLetter(letter) {
      this.activeLetter = letter
      this.scrollIntoView = 'group-' + letter
      setTimeout(() => {
        this.scrollIntoView = ''
      }, 300)
    },
    
    onScroll(e) {
      const scrollTop = e.detail.scrollTop
      const groups = this.indexedContactList
      
      let currentHeight = 0
      for (const group of groups) {
        const groupHeight = 32 + (group.data.length * 60)
        if (scrollTop >= currentHeight && scrollTop < currentHeight + groupHeight) {
          this.activeLetter = group.letter
          break
        }
        currentHeight += groupHeight
      }
    },
    // #endif
    
    goToChat(userId) {
      if (!userId) return
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
  position: relative;
  overflow: hidden;
}

/* #ifdef MP-WEIXIN */
.contact-scroll {
  height: 100%;
}

.special-item {
  background: #fff;
  padding: 0 16px;
}

.special-item-content {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 0.5px solid #e3e6e8;
}

.special-item-icon {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  margin-right: 12px;
  flex-shrink: 0;
}

.new-request-icon {
  background: #ff9d00;
  display: flex;
  align-items: center;
  justify-content: center;
}

.new-request-icon::before {
  content: '+';
  font-size: 24px;
  color: #fff;
  font-weight: bold;
}

.group-icon {
  background: #00a4fd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.group-icon::before {
  content: '';
  width: 24px;
  height: 24px;
  background: url('../../ChatUIKit/assets/icon/createGroup.png') no-repeat center;
  background-size: contain;
}

.special-item-info {
  flex: 1;
}

.special-item-title {
  font-size: 16px;
  color: #171a1c;
  font-weight: 500;
}

.special-item-count {
  font-size: 14px;
  color: #75828a;
}

.badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #ff4d4f;
  color: #fff;
  font-size: 12px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact-group {
  margin-bottom: 10px;
}

.group-title {
  padding: 8px 16px;
  background: #f5f5f5;
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
  
  &.active {
    background: #e6f7ff;
    color: #009dff;
    font-weight: 600;
  }
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

.index-sidebar {
  position: absolute;
  right: 8px;
  top: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
}

.index-letter {
  padding: 2px 4px;
  font-size: 12px;
  color: #5270ad;
  line-height: 16px;
  min-width: 16px;
  text-align: center;
  border-radius: 50%;
  
  &.active {
    background: #e6f7ff;
    color: #009dff;
    font-weight: 600;
  }
}
/* #endif */
</style>
