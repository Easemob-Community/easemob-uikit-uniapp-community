<template>
  <view class="request-list-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="title">新的朋友</view>
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
    contactApplyRequestList() {
      return this.$store.state.contact.contactsNoticeInfo.list.filter((info) => {
        return info.ext === 'invited'
      })
    }
  },
  
  watch: {
    contactApplyRequestList: {
      immediate: true,
      handler(list) {
        if (list.length > 0) {
          const userIds = list.map((item) => item.from).filter(Boolean)
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

.list {
  flex: 1;
  overflow-y: scroll;
}
</style>
