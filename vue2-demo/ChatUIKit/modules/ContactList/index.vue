<template>
  <view class="contact-list-wrap">
    <view class="contact-list-content">
      <view class="header-wrap">
        <ContactNav />
      </view>
      <!-- nav占位 -->
      <view :class="isWXProgram ? 'wx-block' : 'block'"></view>
      <view class="contact-list">
        <!-- #ifndef MP-WEIXIN -->
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
        <!-- #endif -->
        
        <!-- #ifdef MP-WEIXIN -->
        <!-- 微信小程序：直接渲染，避免作用域插槽兼容问题 -->
        <scroll-view 
          scroll-y 
          class="wx-contact-scroll" 
          :scroll-into-view="scrollIntoView"
          @scroll="onScroll"
        >
          <!-- 新的朋友入口 -->
          <view class="wx-special-item" @tap="onNewRequestTap">
            <view class="wx-special-content">
              <view class="wx-special-icon new-request"></view>
              <view class="wx-special-info">
                <text class="wx-special-title">{{ $t('contact.newFriends') }}</text>
              </view>
              <view v-if="contactRequestCount > 0" class="wx-badge">
                {{ contactRequestCount > 99 ? '99+' : contactRequestCount }}
              </view>
            </view>
          </view>
          
          <!-- 群聊入口 -->
          <view class="wx-special-item" @tap="onGroupTap">
            <view class="wx-special-content">
              <view class="wx-special-icon group"></view>
              <view class="wx-special-info">
                <text class="wx-special-title">{{ $t('contact.groups') }}</text>
              </view>
              <view class="wx-special-count" v-if="joinedGroupCount > 0">{{ joinedGroupCount }}</view>
            </view>
          </view>
          
          <!-- 联系人列表 -->
          <view
            v-for="(group, gIndex) in indexedContactList"
            :key="gIndex"
            :id="'group-' + group.letter"
            class="wx-contact-group"
          >
            <view :class="['wx-group-title', { active: activeLetter === group.letter }]">
              {{ group.letter }}
            </view>
            <UserItem 
              v-for="(item, idx) in group.data"
              :key="idx"
              :user="item" 
              :showMenu="selectedUserId === item.userId"
              @onTap="onContactTap"
              @onDelete="onDeleteContact"
              @onSwipe="handleSwipe"
            />
          </view>
        </scroll-view>
        
        <!-- 侧边索引 -->
        <view class="wx-index-sidebar">
          <view
            v-for="letter in indexLetters"
            :key="letter"
            :class="['wx-index-letter', { active: activeLetter === letter }]"
            @tap="scrollToLetter(letter)"
          >
            {{ letter }}
          </view>
        </view>
        <!-- #endif -->
      </view>
    </view>
  </view>
</template>

<script>
import ContactNav from './components/ContactNav'
import IndexedList from '../../components/IndexedList'
import UserItem from './components/UserItem'
// #ifdef MP-WEIXIN
import { groupByName } from '../../utils/index'
// #endif

export default {
  name: 'ContactList',
  
  components: {
    ContactNav,
    IndexedList,
    UserItem
  },
  
  data() {
    return {
      selectedUserId: null,
      // #ifdef MP-WEIXIN
      scrollIntoView: '',
      activeLetter: ''
      // #endif
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
      const contacts = this.$store.state.contact.contacts
      if (!contacts || !Array.isArray(contacts)) {
        return []
      }
      return contacts.map(contact => {
        const userId = contact?.userId || ''
        const userInfo = userId ? (this.$store.getters['appUser/getUserInfo'](userId) || {}) : {}
        return {
          ...contact,
          ...userInfo,
          userId: userId,
          id: userId,
          name: userInfo.nickname || userInfo.name || contact?.name || userId
        }
      }).filter(item => item.userId)
    },
    
    // 好友申请未读数
    contactRequestCount() {
      return this.$store.getters['contact/getContactsNoticeUnreadCount'] || 0
    },
    
    // 加入的群组数量
    joinedGroupCount() {
      return this.$store.state.group.groupList?.length || 0
    },
    
    // #ifdef MP-WEIXIN
    // 按字母分组的联系人列表（仅微信小程序需要）
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
    
    // 索引字母列表（仅微信小程序需要）
    indexLetters() {
      return this.indexedContactList.map(g => g.letter)
    }
    // #endif
  },
  
  // #ifdef MP-WEIXIN
  watch: {
    indexedContactList: {
      immediate: true,
      handler(data) {
        // 默认高亮第一个字母
        if (data.length > 0 && !this.activeLetter) {
          this.activeLetter = data[0].letter
        }
      }
    }
  },
  // #endif
  
  onLoad() {
    // 页面加载时刷新联系人列表（小程序页面生命周期）
    this.loadContacts()
  },
  
  onShow() {
    // 页面显示时刷新联系人列表
    this.loadContacts()
  },
  
  mounted() {
    // 组件挂载时也加载数据（作为组件使用时）
    this.loadContacts()
  },
  
  methods: {
    async loadContacts() {
      await this.$store.dispatch('contact/getContactsFromServer')
      // 批量获取联系人用户属性
      const contacts = this.$store.state.contact.contacts || []
      if (contacts.length > 0) {
        const userIdList = contacts.map(contact => contact.userId).filter(Boolean)
        if (userIdList.length > 0) {
          this.$store.dispatch('appUser/getUsersInfoFromServer', { userIdList })
        }
      }
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
    },
    
    // #ifdef MP-WEIXIN
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
      
      // 估算每个分组的高度（标题32px + 每个item约60px）
      let currentHeight = 0
      for (const group of groups) {
        const groupHeight = 32 + (group.data.length * 60)
        if (scrollTop >= currentHeight && scrollTop < currentHeight + groupHeight) {
          this.activeLetter = group.letter
          break
        }
        currentHeight += groupHeight
      }
    }
    // #endif
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
  position: relative;
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

/* #ifdef MP-WEIXIN */
.wx-contact-scroll {
  height: 100%;
}

.wx-special-item {
  background: #fff;
  padding: 0 16px;
}

.wx-special-content {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 0.5px solid #e3e6e8;
}

.wx-special-icon {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  margin-right: 12px;
  flex-shrink: 0;
}

.wx-special-icon.new-request {
  background: #ff9d00;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wx-special-icon.new-request::before {
  content: '+';
  font-size: 24px;
  color: #fff;
  font-weight: bold;
}

.wx-special-icon.group {
  background: #00a4fd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wx-special-icon.group::before {
  content: '';
  width: 24px;
  height: 24px;
  background: url('../../assets/icon/createGroup.png') no-repeat center;
  background-size: contain;
}

.wx-special-info {
  flex: 1;
}

.wx-special-title {
  font-size: 16px;
  color: #171a1c;
  font-weight: 500;
}

.wx-special-count {
  font-size: 14px;
  color: #75828a;
}

.wx-badge {
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

.wx-contact-group {
  margin-bottom: 10px;
}

.wx-group-title {
  padding: 8px 16px;
  background: #f5f5f5;
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
}

.wx-group-title.active {
  background: #e6f7ff;
  color: #009dff;
  font-weight: 600;
}

.wx-index-sidebar {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  z-index: 100;
}

.wx-index-letter {
  padding: 2px 4px;
  font-size: 12px;
  color: #5270ad;
  line-height: 16px;
  min-width: 16px;
  text-align: center;
  border-radius: 50%;
}

.wx-index-letter.active {
  background: #e6f7ff;
  color: #009dff;
  font-weight: 600;
}
/* #endif */
</style>
