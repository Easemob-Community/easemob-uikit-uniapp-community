<template>
  <view class="index-list">
    <scroll-view
      style="height: 100%"
      class="index-scroll-list"
      scroll-y
      :scroll-into-view="scrollIndexItem"
    >
      <slot name="header"></slot>
      <!-- 群组入口 -->
      <view v-if="hasGroupItem" class="index-item-wrap group-item" @tap="onGroupTap">
        <view class="index-item">
          <view class="special-item">
            <view class="group-icon"></view>
            <text>群组</text>
            <text v-if="groupCount" class="count">({{ groupCount }})</text>
          </view>
        </view>
      </view>
      <!-- 新的朋友入口 -->
      <view v-if="hasNewRequestItem" class="index-item-wrap new-request-item" @tap="onNewRequestTap">
        <view class="index-item">
          <view class="special-item">
            <view class="new-request-icon"></view>
            <text>新的朋友</text>
            <view v-if="requestCount" class="badge">{{ requestCount > 99 ? '99+' : requestCount }}</view>
          </view>
        </view>
      </view>
      <checkbox-group v-if="withCheckbox" @change="checkboxChange">
        <view
          :id="formatInitial(item)"
          class="initial"
          v-for="item in initialData"
          :key="item"
        >
          <view class="letter">{{ item }}</view>
          <view
            class="index-item-wrap"
            v-for="indexedItem in indexedData[item]"
            :key="indexedItem.id || indexedItem.userId"
          >
            <label class="label">
              <checkbox
                class="checkbox"
                backgroundColor="#f9fafa"
                borderColor="#ACB4B9"
                activeBackgroundColor="#009DFF"
                activeBorderColor="#009DFF"
                style="transform:scale(0.8)"
                iconColor="#fff"
                :value="indexedItem.id || indexedItem.userId"
                :checked="checkedList.includes(indexedItem.id || indexedItem.userId)"
              />
              <view class="index-item">
                <slot name="indexedItem" :item="indexedItem"></slot>
              </view>
            </label>
          </view>
        </view>
      </checkbox-group>
      <view v-else>
        <view
          :id="formatInitial(item)"
          class="initial"
          v-for="item in initialData"
          :key="item"
        >
          <view class="letter">{{ item }}</view>
          <view>
            <view
              class="index-item-wrap"
              v-for="indexedItem in indexedData[item]"
              :key="indexedItem.id || indexedItem.userId"
              @tap="onItemTap(indexedItem)"
            >
              <view class="index-item">
                <slot name="indexedItem" :item="indexedItem"></slot>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="letter-box">
      <view
        @tap="scrollInToView(item)"
        :class="[
          'letter-box-item',
          { active: scrollIndexItem === formatInitial(item) }
        ]"
        v-for="item in Object.keys(indexedData || {})"
        :key="item"
      >
        {{ item }}
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
    withCheckbox: {
      type: Boolean,
      default: false
    },
    checkedList: {
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
    groupCount: {
      type: Number,
      default: 0
    },
    requestCount: {
      type: Number,
      default: 0
    }
  },
  
  data() {
    return {
      scrollIndexItem: '',
      timerId: null
    }
  },
  
  computed: {
    indexedData() {
      const dataObj = {}
      
      for (const item of this.options) {
        const displayName = item.name || item.remark || item.userId || ''
        const initial = groupByName(displayName) || ''
        if (!dataObj[initial]) {
          dataObj[initial] = []
        }
        dataObj[initial].push(item)
      }
      
      const sortedKeys = Object.keys(dataObj).sort((key1, key2) => {
        return key1.charCodeAt(0) - key2.charCodeAt(0)
      })
      
      const sortedData = {}
      sortedKeys.forEach(key => {
        sortedData[key] = dataObj[key]
      })
      
      // 将 # 放到最后
      if (sortedData['#']) {
        const hashData = sortedData['#']
        delete sortedData['#']
        sortedData['#'] = hashData
      }
      
      return sortedData
    },
    
    initialData() {
      return Object.keys(this.indexedData)
    }
  },
  
  methods: {
    formatInitial(id) {
      return id === '#' ? 'hash' : id
    },
    
    scrollInToView(id) {
      this.scrollIndexItem = this.formatInitial(id)
      clearTimeout(this.timerId)
      this.timerId = setTimeout(() => {
        this.scrollIndexItem = ''
      }, 600)
    },
    
    checkboxChange(e) {
      const values = e.detail.value
      this.$emit('checkboxChange', values)
    },
    
    onGroupTap() {
      this.$emit('onGroupTap')
    },
    
    onNewRequestTap() {
      this.$emit('onNewRequestTap')
    },
    
    onItemTap(item) {
      this.$emit('onContactTap', item.userId)
    }
  }
}
</script>

<style lang="scss" scoped>
.index-list {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.index-scroll-list {
  width: calc(100% - 16px);
  height: 100%;

  .initial {
    width: 100%;
    .letter {
      padding-left: 16px;
      width: 100%;
      height: 32px;
      color: #797d82;
      font-size: 14px;
      line-height: 20px;
      font-weight: 500;
      box-sizing: border-box;
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }
    .index-item-wrap {
      width: 100%;
      background: #f9fafa;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      box-sizing: border-box;
      &:active {
        background: #f5f5f5;
      }
    }
  }
}

.letter-box {
  width: 16px;
  text-align: center;
  .letter-box-item {
    height: 16px;
    width: 100%;
    font-size: 12px;
    line-height: 14px;
    font-weight: 500;
    color: #75828a;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .active {
    background: #009dff;
    color: #fff;
    border-radius: 50%;
  }
}

.label {
  display: flex;
  width: 100%;
  align-items: center;
  margin-left: 16px;
}

.index-item {
  flex: 1;
}

.checkbox {
  margin-right: -5px;
}

.special-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background: #fff;
  border-bottom: 0.5px solid #e3e6e8;
  font-size: 16px;
  color: #171a1c;
}

.group-icon {
  width: 40px;
  height: 40px;
  background: #009dff;
  border-radius: 8px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.group-icon::before {
  content: '';
  width: 24px;
  height: 24px;
  background: url('../../assets/icon/group.png') no-repeat center;
  background-size: contain;
}

.new-request-icon {
  width: 40px;
  height: 40px;
  background: #f59e0b;
  border-radius: 8px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.new-request-icon::before {
  content: '👤+';
  font-size: 18px;
  color: #fff;
}

.count {
  margin-left: 5px;
  color: #75828a;
  font-size: 14px;
}

.badge {
  margin-left: auto;
  background: #f35;
  color: #fff;
  font-size: 12px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

scroll-view ::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  background: transparent;
}
</style>
