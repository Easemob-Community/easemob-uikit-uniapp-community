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
      <view v-if="props.hasGroupItem" class="index-item-wrap group-item" @tap="onGroupTap">
        <view class="index-item">
          <view class="special-item">
            <view class="group-icon"></view>
            <text>群组</text>
            <text v-if="props.groupCount" class="count">({{ props.groupCount }})</text>
          </view>
        </view>
      </view>
      <!-- 新的朋友入口 -->
      <view v-if="props.hasNewRequestItem" class="index-item-wrap new-request-item" @tap="onNewRequestTap">
        <view class="index-item">
          <view class="special-item">
            <view class="new-request-icon"></view>
            <text>新的朋友</text>
            <view v-if="props.requestCount" class="badge">{{ props.requestCount > 99 ? '99+' : props.requestCount }}</view>
          </view>
        </view>
      </view>
      <checkbox-group v-if="props.withCheckbox" @change="checkboxChange">
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
                :checked="props.checkedList.includes(indexedItem.id || indexedItem.userId)"
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

<script lang="ts" setup>
import { ref, computed } from "vue";
import { groupByName } from "../../utils/index";

let timerId: any = "";

interface IndexedItem {
  name?: string;
  id?: number;
  userId?: string;
  remark?: string;
  [key: string]: any;
}

interface Props {
  options: IndexedItem[];
  withCheckbox?: boolean;
  checkedList?: string[];
  hasGroupItem?: boolean;
  hasNewRequestItem?: boolean;
  groupCount?: number;
  requestCount?: number;
}

const emits = defineEmits(["checkboxChange", "onGroupTap", "onNewRequestTap"]);
const props = defineProps<Props>();
const scrollIndexItem = ref("");

// 将 initialData 和 indexedData 存储为一个组合数据结构，避免重复计算
const indexedData = computed(() => {
  const dataObj: Record<string, IndexedItem[]> = {};

  for (const item of props.options) {
    // 兼容不同数据格式：优先使用 name，其次使用 remark，最后使用 userId
    const displayName = item.name || item.remark || item.userId || "";
    const initial = groupByName(displayName) || "";
    if (!dataObj[initial]) {
      dataObj[initial] = [];
    }
    dataObj[initial].push(item);
  }

  const sortedData = Object.keys(dataObj)
    .sort(([key1], [key2]) => {
      return key1.charCodeAt(0) - key2.charCodeAt(0);
    })
    .reduce((acc, key) => {
      acc[key] = dataObj[key];
      return acc;
    }, {});
  // 将 # 放到最后
  let lastData = sortedData["#"];
  delete sortedData["#"];
  if (lastData) {
    sortedData["#"] = lastData;
  }

  return sortedData;
});

const initialData = computed(() => Object.keys(indexedData.value));

const checkboxChange = (e) => {
  const values = e.detail.value;
  emits("checkboxChange", values);
};

// 格式化 id
const formatInitial = (id: string) => (id === "#" ? "hash" : id);

const scrollInToView = (id: string) => {
  scrollIndexItem.value = formatInitial(id);
  clearTimeout(timerId); // 取消上一个定时器
  timerId = setTimeout(() => {
    scrollIndexItem.value = ""; // 延迟重置
  }, 600);
};

const onGroupTap = () => {
  emits("onGroupTap");
};

const onNewRequestTap = () => {
  emits("onNewRequestTap");
};
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
