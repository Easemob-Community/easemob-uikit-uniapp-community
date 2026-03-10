<template>
  <view class="group-list-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view>{{ $t('group.title') }}</view>
      </template>
    </NavBar>
    <view class="list" v-if="groupList.length">
      <view
        v-for="group in groupList"
        :key="group.groupId || group.groupid"
        @click="toChatPage(group.groupId || group.groupid)"
      >
        <GroupItem :group="group" />
      </view>
    </view>
    <Empty v-else />
  </view>
</template>

<script>
import GroupItem from './components/GroupItem'
import Empty from '../../components/Empty'
import NavBar from '../../components/NavBar'

export default {
  name: 'GroupList',
  
  components: {
    GroupItem,
    Empty,
    NavBar
  },
  
  computed: {
    groupList() {
      return this.$store.state.group.groupList || []
    }
  },
  
  onShow() {
    this.loadGroupList()
  },
  
  methods: {
    loadGroupList() {
      this.$store.dispatch('group/getJoinedGroupList')
    },
    
    onBack() {
      uni.navigateBack()
    },
    
    toChatPage(id) {
      if (!id) {
        console.error('Group ID is undefined')
        return
      }
      uni.navigateTo({
        url: `/pages/chat/index?type=groupChat&id=${id}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.group-list-wrap {
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
