<template>
  <view class="msg-user-card" @tap="onTap">
    <view class="card-header">
      <Avatar
        :size="40"
        :src="userInfo.avatar"
        :placeholder="USER_AVATAR_URL"
      />
      <view class="user-info">
        <view class="user-name">{{ userInfo.nickname }}</view>
        <view class="user-id">{{ userInfo.uid }}</view>
      </view>
    </view>
    <view class="card-footer">
      <text>{{ $t('message.userCard') }}</text>
    </view>
  </view>
</template>

<script>
import Avatar from '../../../../components/Avatar/index.vue'
import { USER_AVATAR_URL } from '../../../../const/index.js'

export default {
  name: 'UserCardMessage',

  components: {
    Avatar
  },

  props: {
    msg: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      USER_AVATAR_URL
    }
  },

  computed: {
    userInfo() {
      const customExts = this.msg.customExts || (this.msg.ext && this.msg.ext.customExts) || {}
      return {
        avatar: customExts.avatar || '',
        nickname: customExts.nickname || $t('message.unknownUser'),
        uid: customExts.uid || ''
      }
    }
  },

  methods: {
    onTap() {
      const uid = this.userInfo.uid
      if (uid) {
        // 可以跳转到用户详情页
        this.$emit('onUserCardTap', uid)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.msg-user-card {
  width: 240px;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  padding: 12px;
}

.user-info {
  flex: 1;
  margin-left: 10px;
  min-width: 0;
}

.user-name {
  font-size: 16px;
  color: #171a1c;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-id {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-footer {
  padding: 8px 12px;
  border-top: 1px solid #e0e0e0;
  font-size: 12px;
  color: #999;
}
</style>
