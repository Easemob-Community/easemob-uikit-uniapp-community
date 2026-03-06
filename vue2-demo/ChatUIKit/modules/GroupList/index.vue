<template>
  <view class="group-list-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="nav-title">群聊</view>
      </template>
    </NavBar>
    <view class="list" v-if="groupList.length">
      <view
        v-for="group in groupList"
        :key="group.groupId || group.groupid"
        class="group-item-container"
        @tap="toChatPage(group.groupId || group.groupid)"
      >
        <GroupItem :group="group" />
      </view>
    </view>
    <Empty v-else text="暂无群组" />
  </view>
</template>

<script>
import GroupItem from './components/GroupItem/index.vue'
import Empty from '../../components/Empty/index.vue'
import NavBar from '../../components/NavBar/index.vue'

export default {
  components: {
    GroupItem,
    Empty,
    NavBar
  },
  
  computed: {
    groupList() {
      return this.$store.state.group?.groupList || []
    }
  },
  
  onShow() {
    // 刷新群组列表
    this.$store.dispatch('group/getJoinedGroupList')
  },
  
  methods: {
    onBack() {
      uni.navigateBack()
    },
    
    toChatPage(groupId) {
      if (!groupId) {
        console.error('Group ID is undefined')
        return
      }
      uni.navigateTo({
        url: `/pages/chat/index?type=groupChat&id=${groupId}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.group-list-wrap {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
  overflow: hidden;
}

.nav-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
  background: #fff;
}

.group-item-container {
  &:active {
    background: #f5f5f5;
  }
}
</style>
