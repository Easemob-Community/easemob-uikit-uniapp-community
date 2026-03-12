<template>
  <view class="contacts-wrap">
    <view class="nav-bar">
      <text class="title">联系人</text>
    </view>
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
      
      <!-- 联系人列表 - 不使用插槽，直接渲染 -->
      <scroll-view 
        scroll-y 
        class="contact-scroll" 
        :scroll-into-view="scrollIntoView"
      >
        <view
          v-for="(group, gIndex) in indexedContactList"
          :key="gIndex"
          :id="'group-' + group.letter"
          class="contact-group"
        >
          <view class="group-title">{{ group.letter }}</view>
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
          class="index-letter"
          @tap="scrollToLetter(letter)"
        >
          {{ letter }}
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import Avatar from '../../ChatUIKit/components/Avatar/index.vue'
import { USER_AVATAR_URL } from '../../ChatUIKit/const/index'
import { groupByName } from '../../ChatUIKit/utils/index'

export default {
  components: {
    Avatar
  },
  
  data() {
    return {
      USER_AVATAR_URL,
      contactList: [],
      contactRequests: [],
      groupList: [],
      scrollIntoView: ''
    }
  },
  
  computed: {
    unreadCount() {
      return this.contactRequests.filter(r => !r.isRead).length
    },
    
    featureConfig() {
      return this.$store.getters['config/getFeatureConfig'] || {}
    },
    
    showPresenceIndicator() {
      // 检查功能配置是否启用在线状态
      if (this.featureConfig.usePresence === false) {
        return false
      }
      return true
    },
    
    // 按字母分组的联系人列表
    indexedContactList() {
      const groups = {}
      this.contactList.forEach(item => {
        const firstLetter = groupByName(item.name || item.userId || '#')
        if (!groups[firstLetter]) {
          groups[firstLetter] = []
        }
        groups[firstLetter].push(item)
      })
      
      // 排序：字母在前，# 在最后
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
    
    // 索引字母列表
    indexLetters() {
      return this.indexedContactList.map(g => g.letter)
    }
  },
  
  async onShow() {
    // 从服务器加载联系人数据
    await this.$store.dispatch('contact/getContactsFromServer')
    await this.$store.dispatch('group/getJoinedGroupList')
    this.loadData()
  },
  
  methods: {
    loadData() {
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
    
    goToChat(userId) {
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
    },
    
    scrollToLetter(letter) {
      this.scrollIntoView = 'group-' + letter
      setTimeout(() => {
        this.scrollIntoView = ''
      }, 300)
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
  /* 避免被刘海屏遮挡 */
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

.contact-scroll {
  height: 100%;
}

/* 特殊入口项样式 */
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

/* 联系人分组 */
.contact-group {
  margin-bottom: 10px;
}

.group-title {
  padding: 8px 16px;
  background: #f5f5f5;
  font-size: 14px;
  color: #666;
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

/* 侧边索引 */
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
}
</style>
