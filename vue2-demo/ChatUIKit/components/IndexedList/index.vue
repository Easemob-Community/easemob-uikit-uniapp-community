<template>
  <view class="indexed-list">
    <scroll-view 
      scroll-y 
      class="indexed-list-scroll" 
      :scroll-into-view="scrollIntoView"
      @scroll="onScroll"
    >
      <!-- 新的朋友入口 -->
      <view v-if="hasNewRequestItem" class="special-item" @tap="onNewRequestTap">
        <view class="special-item-content">
          <view class="special-item-icon new-request-icon"></view>
          <view class="special-item-info">
            <text class="special-item-title">新的朋友</text>
          </view>
          <view v-if="requestCount > 0" class="badge">{{ requestCount > 99 ? '99+' : requestCount }}</view>
        </view>
      </view>
      
      <!-- 群聊入口 -->
      <view v-if="hasGroupItem" class="special-item" @tap="onGroupTap">
        <view class="special-item-content">
          <view class="special-item-icon group-icon"></view>
          <view class="special-item-info">
            <text class="special-item-title">群聊</text>
          </view>
          <view class="special-item-count" v-if="groupCount > 0">{{ groupCount }}</view>
        </view>
      </view>
      
      <!-- 联系人列表 -->
      <view
        v-for="(group, index) in indexedData"
        :key="index"
        :id="'group-' + group.letter"
        class="indexed-group"
        :data-letter="group.letter"
      >
        <view :class="['indexed-title', { active: activeLetter === group.letter }]">{{ group.letter }}</view>
        <view
          v-for="(item, idx) in group.data"
          :key="idx"
          class="indexed-item"
          @tap="onItemTap(item)"
        >
          <slot name="indexedItem" :item="item" :index="idx">
            <view class="default-item">{{ item.name || item.userId }}</view>
          </slot>
        </view>
      </view>
    </scroll-view>
    <view class="indexed-sidebar">
      <view
        v-for="letter in indexLetters"
        :key="letter"
        :class="['indexed-letter', { active: activeLetter === letter }]"
        @tap="scrollToLetter(letter)"
      >
        {{ letter }}
      </view>
    </view>
  </view>
</template>

<script>
import { groupByName } from '../../utils/index'

export default {
  name: 'IndexedList',
  
  props: {
    options: {
      type: Array,
      default: () => []
    },
    hasGroupItem: {
      type: Boolean,
      default: false
    },
    hasNewRequestItem: {
      type: Boolean,
      default: false
    },
    requestCount: {
      type: Number,
      default: 0
    },
    groupCount: {
      type: Number,
      default: 0
    }
  },
  
  data() {
    return {
      scrollIntoView: '',
      activeLetter: ''
    }
  },
  
  computed: {
    indexedData() {
      const groups = {}
      this.options.forEach(item => {
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
    
    indexLetters() {
      return this.indexedData.map(g => g.letter)
    }
  },
  
  watch: {
    indexedData: {
      immediate: true,
      handler(data) {
        // 默认高亮第一个字母
        if (data.length > 0 && !this.activeLetter) {
          this.activeLetter = data[0].letter
        }
      }
    }
  },
  
  methods: {
    scrollToLetter(letter) {
      this.scrollIntoView = 'group-' + letter
      this.activeLetter = letter
      // 延迟重置 scrollIntoView，以便下次点击相同字母也能触发滚动
      setTimeout(() => {
        this.scrollIntoView = ''
      }, 300)
    },
    
    onItemTap(item) {
      this.$emit('onContactTap', item.userId || item.id)
    },
    
    onNewRequestTap() {
      this.$emit('onNewRequestTap')
    },
    
    onGroupTap() {
      this.$emit('onGroupTap')
    },
    
    onScroll(e) {
      // 根据滚动位置计算当前可见的字母
      const scrollTop = e.detail.scrollTop
      const groups = this.indexedData
      
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
  }
}
</script>

<style lang="scss" scoped>
.indexed-list {
  display: flex;
  height: 100%;
  position: relative;
}

.indexed-list-scroll {
  flex: 1;
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
  background: url('../../assets/icon/createGroup.png') no-repeat center;
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

.indexed-group {
  margin-bottom: 10px;
}

.indexed-title {
  padding: 8px 16px;
  background: #f5f5f5;
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
}

.indexed-title.active {
  background: #e6f7ff;
  color: #009dff;
  font-weight: 600;
}

.indexed-item {
  background: #fff;
}

.default-item {
  font-size: 16px;
  color: #171a1c;
  padding: 12px 16px;
  border-bottom: 0.5px solid #e3e6e8;
}

.indexed-sidebar {
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
}

.indexed-letter {
  padding: 2px 4px;
  font-size: 12px;
  color: #5270ad;
  line-height: 16px;
  min-width: 16px;
  text-align: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.indexed-letter.active {
  background: #e6f7ff;
  color: #009dff;
}
</style>
