<template>
  <view class="indexed-list">
    <scroll-view scroll-y class="indexed-list-scroll" :scroll-into-view="scrollIntoView">
      <view
        v-for="(group, index) in indexedData"
        :key="index"
        :id="'group-' + group.letter"
        class="indexed-group"
      >
        <view class="indexed-title">{{ group.letter }}</view>
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
        class="indexed-letter"
        @tap="scrollToLetter(letter)"
      >
        {{ letter }}
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'IndexedList',
  
  props: {
    options: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      scrollIntoView: ''
    }
  },
  
  computed: {
    indexedData() {
      const groups = {}
      this.options.forEach(item => {
        const firstLetter = this.getFirstLetter(item.name || item.userId || '#')
        if (!groups[firstLetter]) {
          groups[firstLetter] = []
        }
        groups[firstLetter].push(item)
      })
      
      const sortedLetters = Object.keys(groups).sort()
      return sortedLetters.map(letter => ({
        letter,
        data: groups[letter]
      }))
    },
    
    indexLetters() {
      return this.indexedData.map(g => g.letter)
    }
  },
  
  methods: {
    getFirstLetter(str) {
      if (!str) return '#'
      const first = str.charAt(0).toUpperCase()
      if (/[A-Z]/.test(first)) {
        return first
      }
      return '#'
    },
    
    scrollToLetter(letter) {
      this.scrollIntoView = 'group-' + letter
    },
    
    onItemTap(item) {
      this.$emit('itemTap', item)
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

.indexed-group {
  margin-bottom: 10px;
}

.indexed-title {
  padding: 8px 16px;
  background: #f5f5f5;
  font-size: 14px;
  color: #666;
}

.indexed-item {
  padding: 12px 16px;
  border-bottom: 0.5px solid #e3e6e8;
  background: #fff;
}

.default-item {
  font-size: 16px;
  color: #171a1c;
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
}
</style>
