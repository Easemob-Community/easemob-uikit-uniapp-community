<template>
  <view class="search-list-wrap">
    <NavBar @onLeftTap="cancelSearch">
      <template v-slot:left>
        <view class="input-wrap">
          <SearchInput
            ref="searchRef"
            :placeholder="$t('searchContact')"
            @input="onInput"
            @cancel="cancelSearch"
          />
        </view>
      </template>
    </NavBar>

    <view class="search-content" v-if="searchList.length">
      <checkbox-group @change="checkboxChange">
        <label class="label" v-for="item in searchList" :key="item.userId">
          <checkbox
            class="checkbox"
            style="transform: scale(0.8)"
            :value="item.userId"
            :checked="checkedList.includes(item.userId)"
          />
          <UserItem
            class="search-item"
            :user="{ userId: item.userId }"
          />
        </label>
      </checkbox-group>
    </view>
    <Empty v-else />
  </view>
</template>

<script>
import NavBar from '../../components/NavBar'
import SearchInput from '../../components/SearchInput'
import UserItem from '../ContactList/components/UserItem'
import Empty from '../../components/Empty'

export default {
  name: 'GroupCreateSearchList',

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
    }
  },

  data() {
    return {
      searchValue: ''
    }
  },

  computed: {
    contacts() {
      return this.$store.state.contact.contacts || []
    },

    searchList() {
      if (!this.searchValue) {
        return []
      }
      return this.contacts.filter((item) => {
        const userInfo = this.$store.getters['appUser/getUserInfo'](item.userId) || {}
        const name = userInfo.name || ''
        return name.includes(this.searchValue)
      })
    }
  },

  methods: {
    onInput(value) {
      this.searchValue = value
    },

    checkboxChange(e) {
      const values = e.detail.value
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
}

.search-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0 16px;
  overflow-y: scroll;
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
  height: calc(100% - var(--status-bar-height));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: 5px;
}
</style>
