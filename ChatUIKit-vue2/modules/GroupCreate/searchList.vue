<template>
  <view class="group-create-search">
    <!-- 搜索栏 -->
    <view class="search-header">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="searchKeyword"
          placeholder="搜索联系人"
          confirm-type="search"
          @input="onSearchInput"
          @confirm="onSearchConfirm"
        />
        <text 
          v-if="searchKeyword" 
          class="clear-icon"
          @tap="clearSearch"
        >✕</text>
      </view>
      <text class="cancel-btn" @tap="onCancel">取消</text>
    </view>
    
    <!-- 已选择成员区域 -->
    <view v-if="selectedUsers.length > 0" class="selected-section">
      <scroll-view class="selected-list" scroll-x>
        <view 
          v-for="user in selectedUsers" 
          :key="user.userId"
          class="selected-item"
        >
          <image 
            class="selected-avatar" 
            :src="user.avatar || '/static/images/default_avatar.png'" 
            mode="aspectFill"
          />
          <text class="selected-name">{{ user.nickname || user.userId }}</text>
          <text class="remove-btn" @tap="removeSelected(user)">✕</text>
        </view>
      </scroll-view>
    </view>
    
    <!-- 联系人列表 -->
    <scroll-view 
      class="contact-list" 
      scroll-y 
      :style="{ height: listHeight + 'px' }"
    >
      <!-- 字母索引 -->
      <view class="index-sidebar">
        <text 
          v-for="letter in indexLetters" 
          :key="letter"
          class="index-letter"
          :class="{ active: activeLetter === letter }"
          @tap="scrollToLetter(letter)"
        >{{ letter }}</text>
      </view>
      
      <!-- 分组列表 -->
      <view v-if="filteredContacts.length > 0">
        <view 
          v-for="group in filteredContacts" 
          :key="group.letter"
          class="contact-group"
          :id="'group-' + group.letter"
        >
          <!-- 分组标题 -->
          <view 
            class="group-title"
            :class="{ 'title-highlight': activeLetter === group.letter }"
          >
            {{ group.letter }}
          </view>
          
          <!-- 联系人项 -->
          <view
            v-for="contact in group.data"
            :key="contact.userId"
            class="contact-item"
            @tap="toggleSelect(contact)"
          >
            <!-- 选择框 -->
            <view class="checkbox" :class="{ checked: isSelected(contact.userId) }">
              <text v-if="isSelected(contact.userId)" class="check-icon">✓</text>
            </view>
            
            <!-- 头像 -->
            <image 
              class="contact-avatar" 
              :src="contact.avatar || '/static/images/default_avatar.png'" 
              mode="aspectFill"
            />
            
            <!-- 信息 -->
            <view class="contact-info">
              <text class="contact-name">{{ contact.nickname || contact.userId }}</text>
              <text v-if="contact.remark" class="contact-remark">{{ contact.remark }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-icon">🔍</text>
        <text class="empty-text">
          {{ searchKeyword ? '未找到匹配的联系人' : '暂无联系人' }}
        </text>
      </view>
    </scroll-view>
    
    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <text class="selected-count">已选择 {{ selectedUsers.length }} 人</text>
      <button 
        class="create-btn"
        :disabled="selectedUsers.length === 0"
        @tap="onCreateGroup"
      >
        确定
      </button>
    </view>
    
    <!-- 顶部提示 -->
    <view 
      v-if="showToast" 
      class="toast-tip"
    >
      {{ toastMessage }}
    </view>
  </view>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { groupByName, debounce } from '../../utils/index.js'

export default {
  name: 'GroupCreateSearchList',
  
  data() {
    return {
      searchKeyword: '',
      selectedUsers: [],
      filteredContacts: [],
      activeLetter: 'A',
      showToast: false,
      toastMessage: '',
      listHeight: 0
    }
  },
  
  computed: {
    ...mapState('contact', {
      contacts: state => state.contacts
    }),
    
    // 字母索引列表
    indexLetters() {
      const letters = this.filteredContacts.map(g => g.letter)
      // 添加 # 如果不在列表中
      if (!letters.includes('#')) {
        letters.push('#')
      }
      return letters.sort()
    }
  },
  
  created() {
    // 防抖搜索
    this.debouncedSearch = debounce(this.performSearch, 300)
    
    // 计算列表高度
    this.calcListHeight()
  },
  
  mounted() {
    // 加载联系人
    this.loadContacts()
  },
  
  methods: {
    // 计算列表高度
    calcListHeight() {
      const systemInfo = uni.getSystemInfoSync()
      // 减去搜索栏、已选区域和底部栏高度
      this.listHeight = systemInfo.windowHeight - 100 - (this.selectedUsers.length > 0 ? 100 : 0) - 60
    },
    
    // 加载联系人
    loadContacts() {
      this.$store.dispatch('contact/getContactsFromServer').then(() => {
        this.performSearch()
      })
    },
    
    // 搜索输入
    onSearchInput() {
      this.debouncedSearch()
    },
    
    // 确认搜索
    onSearchConfirm() {
      this.performSearch()
    },
    
    // 清除搜索
    clearSearch() {
      this.searchKeyword = ''
      this.performSearch()
    },
    
    // 执行搜索
    performSearch() {
      let contacts = [...this.contacts]
      
      // 关键字过滤
      if (this.searchKeyword.trim()) {
        const keyword = this.searchKeyword.toLowerCase()
        contacts = contacts.filter(contact => {
          const name = (contact.nickname || contact.userId || '').toLowerCase()
          const remark = (contact.remark || '').toLowerCase()
          return name.includes(keyword) || remark.includes(keyword)
        })
      }
      
      // 按拼音分组
      this.filteredContacts = this.groupContacts(contacts)
      
      // 更新首字母
      if (this.filteredContacts.length > 0) {
        this.activeLetter = this.filteredContacts[0].letter
      }
    },
    
    // 联系人分组
    groupContacts(contacts) {
      const groups = {}
      
      contacts.forEach(contact => {
        const name = contact.nickname || contact.userId || ''
        const letter = groupByName(name)
        
        if (!groups[letter]) {
          groups[letter] = {
            letter,
            data: []
          }
        }
        
        groups[letter].data.push(contact)
      })
      
      // 排序并转换为数组
      return Object.keys(groups)
        .sort((a, b) => {
          if (a === '#') return 1
          if (b === '#') return -1
          return a.localeCompare(b)
        })
        .map(key => groups[key])
    },
    
    // 滚动到指定字母
    scrollToLetter(letter) {
      this.activeLetter = letter
      // 可以添加滚动到指定分组的逻辑
      uni.showToast({
        title: letter,
        duration: 500,
        icon: 'none'
      })
    },
    
    // 是否已选择
    isSelected(userId) {
      return this.selectedUsers.some(user => user.userId === userId)
    },
    
    // 切换选择状态
    toggleSelect(contact) {
      const index = this.selectedUsers.findIndex(user => user.userId === contact.userId)
      
      if (index > -1) {
        // 取消选择
        this.selectedUsers.splice(index, 1)
      } else {
        // 添加选择
        // 限制最大选择人数
        if (this.selectedUsers.length >= 500) {
          this.showToastTip('最多选择500人')
          return
        }
        this.selectedUsers.push({
          userId: contact.userId,
          nickname: contact.nickname,
          avatar: contact.avatar
        })
      }
      
      // 更新列表高度
      this.calcListHeight()
    },
    
    // 移除已选择的用户
    removeSelected(user) {
      const index = this.selectedUsers.findIndex(u => u.userId === user.userId)
      if (index > -1) {
        this.selectedUsers.splice(index, 1)
        this.calcListHeight()
      }
    },
    
    // 显示提示
    showToastTip(message) {
      this.toastMessage = message
      this.showToast = true
      setTimeout(() => {
        this.showToast = false
      }, 2000)
    },
    
    // 创建群组
    onCreateGroup() {
      if (this.selectedUsers.length === 0) {
        this.showToastTip('请至少选择一位联系人')
        return
      }
      
      const memberIds = this.selectedUsers.map(user => user.userId)
      
      // 触发事件，让父组件处理创建逻辑
      this.$emit('onCreateGroup', {
        members: memberIds,
        memberDetails: this.selectedUsers
      })
    },
    
    // 取消
    onCancel() {
      this.$emit('onCancel')
    }
  }
}
</script>

<style lang="scss" scoped>
.group-create-search {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

// 搜索栏
.search-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #fff;
  border-bottom: 1px solid #e5e5e5;
}

.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 6px;
  padding: 8px 12px;
}

.search-icon {
  font-size: 14px;
  color: #999;
  margin-right: 8px;
}

.search-input {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.clear-icon {
  font-size: 12px;
  color: #999;
  padding: 4px;
}

.cancel-btn {
  font-size: 14px;
  color: #009dff;
  margin-left: 12px;
}

// 已选择区域
.selected-section {
  background-color: #fff;
  padding: 10px 0;
  border-bottom: 1px solid #e5e5e5;
}

.selected-list {
  white-space: nowrap;
  padding: 0 12px;
}

.selected-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
  position: relative;
}

.selected-avatar {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  background-color: #f0f0f0;
}

.selected-name {
  font-size: 11px;
  color: #666;
  margin-top: 4px;
  max-width: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 16px;
  height: 16px;
  background-color: #999;
  color: #fff;
  border-radius: 50%;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 联系人列表
.contact-list {
  flex: 1;
  position: relative;
}

.index-sidebar {
  position: fixed;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  padding: 10px 2px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
}

.index-letter {
  font-size: 10px;
  color: #666;
  padding: 2px 4px;
  line-height: 1.2;
  
  &.active {
    color: #009dff;
    font-weight: bold;
  }
}

.contact-group {
  background-color: #fff;
}

.group-title {
  padding: 8px 16px;
  font-size: 13px;
  color: #666;
  background-color: #f5f5f5;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &.title-highlight {
    background-color: #009dff;
    color: #fff;
  }
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #f5f5f5;
  
  &:active {
    background-color: #f5f5f5;
  }
}

.checkbox {
  width: 22px;
  height: 22px;
  border: 2px solid #ddd;
  border-radius: 50%;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &.checked {
    background-color: #009dff;
    border-color: #009dff;
  }
}

.check-icon {
  font-size: 12px;
  color: #fff;
  font-weight: bold;
}

.contact-avatar {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  background-color: #f0f0f0;
  margin-right: 12px;
}

.contact-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.contact-name {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.contact-remark {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

// 底部操作栏
.bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background-color: #fff;
  border-top: 1px solid #e5e5e5;
}

.selected-count {
  font-size: 14px;
  color: #666;
}

.create-btn {
  min-width: 80px;
  height: 36px;
  background-color: #009dff;
  color: #fff;
  font-size: 14px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  
  &[disabled] {
    background-color: #ccc;
    color: #fff;
  }
  
  &:active:not([disabled]) {
    opacity: 0.8;
  }
}

// 提示
.toast-tip {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  z-index: 100;
}
</style>
