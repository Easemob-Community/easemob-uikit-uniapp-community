<template>
  <view class="group-item-wrap">
    <Avatar 
      :src="groupAvatar" 
      :placeholder="GROUP_AVATAR_URL" 
      :size="40" 
    />
    <view class="group-name">{{ groupName }}</view>
  </view>
</template>

<script>
import Avatar from '../../../../components/Avatar/index.vue'
import { GROUP_AVATAR_URL } from '../../../../const/index'

export default {
  components: {
    Avatar
  },
  
  props: {
    group: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  
  data() {
    return {
      GROUP_AVATAR_URL
    }
  },
  
  computed: {
    groupId() {
      return this.group?.groupId || this.group?.groupid || ''
    },
    
    groupName() {
      // 优先使用 group 对象的 name（兼容驼峰和小写）
      const name = this.group?.groupName || this.group?.groupname
      if (name) return name
      // 否则从 store 获取
      return this.$store.getters['group/getGroupName'](this.groupId)
    },
    
    groupAvatar() {
      // 优先使用 group 对象的 avatar（兼容驼峰和小写）
      const avatar = this.group?.avatar || this.group?.avatarurl
      if (avatar) return avatar
      // 否则从 store 获取
      return this.$store.getters['group/getGroupAvatar'](this.groupId)
    }
  }
}
</script>

<style lang="scss" scoped>
.group-item-wrap {
  display: flex;
  align-items: center;
  padding: 12px 0;
  background: #fff;
  border-bottom: 0.5px solid #e3e6e8;
}

.group-name {
  margin-left: 12px;
  font-size: 16px;
  color: #171a1c;
}
</style>
