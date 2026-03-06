<template>
  <view class="search-list-wrap">
    <NavBar @onLeftTap="cancelSearch">
      <template v-slot:left>
        <view class="input-wrap">
          <SearchInput
            ref="searchRef"
            placeholder="搜索联系人"
            @input="onInput"
            @cancel="cancelSearch"
          />
        </view>
      </template>
    </NavBar>

    <view class="search-content" v-if="searchList.length">
      <checkbox-group @change="checkboxChange">
        <label class="label" v-for="item in searchList" :key="item.userId" @click.prevent="">
          <checkbox
            class="checkbox"
            color="#009DFF"
            style="transform: scale(0.8)"
            :value="item.userId"
            :checked="checkedList.includes(item.userId)"
          />
          <UserItem
            class="search-item"
            :user="{ userId: item.userId, name: item.name, avatar: item.avatar }"
          />
        </label>
      </checkbox-group>
    </view>
    <Empty v-else-if="searchValue" text="未找到联系人" />
    <Empty v-else text="请输入搜索关键词" />
  </view>
</template>

<script>
import NavBar from '../../components/NavBar/index.vue'
import SearchInput from '../../components/SearchInput/index.vue'
import UserItem from './components/UserItem/index.vue'
import Empty from '../../components/Empty/index.vue'

export default {
  components: {
    NavBar,
    SearchInput,
    UserItem,
    Empty
  },
  
  props: {
    checkedList: {
      type: Array,
      default: () => []
    },
    contactList: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
  return {
      searchValue: '',
      searchRef: null
    }
  },
  
  computed: {
    searchList() {
      if (!this.searchValue) {
        return []
      }
      return this.contactList.filter(item => {
        const name = item.name || item.nickname || item.userId || ''
        return name.toLowerCase().includes(this.searchValue.toLowerCase())
      })
    }
  },
  
  methods: {
    onInput(value) {
      this.searchValue = value
    },
    
    checkboxChange(e) {
      const values = e.detail.value || []
      this.$emit('checkboxChange', values)
    },
    
    cancelSearch() {
      this.$emit('cancel')
    }
  }
}
</script>

<style lang="scss" scoped>
.label {
  display: flex;
  width: 100%;
  align-items: center;
  padding: 0 16px;
}

.search-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
}

.search-item {
  flex: 1;
}

.input-wrap {
  /*  #ifndef MP-WEIXIN  */
  width: calc(100vw - 50px);
  /*  #endif  */
  /*  #ifdef MP-WEIXIN  */
  width: calc(100vw - 150px);
  /*  #endif  */
}

.search-list-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: 5px;
  background: #fff;
}

.checkbox {
  margin-right: -5px;
}
</style>
