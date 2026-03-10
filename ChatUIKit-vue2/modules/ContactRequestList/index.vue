<template>
  <view class="request-list-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="title">{{ $t('nav.newRequest') }}</view>
      </template>
    </NavBar>
    <view class="list">
      <view v-if="contactApplyRequestList.length">
        <RequestItem
          v-for="request in contactApplyRequestList"
          :key="request.from"
          :user="{ userId: request.from }"
        />
      </view>
      <Empty v-else />
    </view>
  </view>
</template>

<script>
import NavBar from '../../components/NavBar'
import Empty from '../../components/Empty'
import RequestItem from './components/RequestItem'

export default {
  name: 'ContactRequestList',
  
  components: {
    NavBar,
    Empty,
    RequestItem
  },
  
  computed: {
    // 获取好友申请列表（只显示invited类型的）
    contactApplyRequestList() {
      const list = this.$store.getters['contact/getContactsNoticeList'] || []
      return list.filter(info => info.ext === 'invited')
    }
  },
  
  watch: {
    // 监听好友申请列表变化，自动获取申请者用户信息
    contactApplyRequestList: {
      immediate: true,
      handler(list) {
        if (list.length > 0) {
          const userIds = list.map(item => item.from).filter(Boolean)
          if (userIds.length > 0) {
            this.$store.dispatch('appUser/getUsersInfoFromServer', { userIdList: userIds })
          }
        }
      }
    }
  },
  
  methods: {
    onBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.request-list-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.title {
  color: #171a1c;
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
}

.list {
  flex: 1;
  overflow-y: scroll;
}
</style>
