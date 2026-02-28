<template>
  <view class="item-wrap">
    <Avatar
      class="user-avatar"
      :size="40"
      :src="avatar || userInfo.avatar"
      :placeholder="USER_AVATAR_URL"
    />
    <view class="right">
      <view class="content">
        <view class="user-name ellipsis">{{ userInfo.name }}</view>
        <view class="tip ellipsis" v-text="t('contactRequestListTip')"></view>
      </view>

      <view class="action">
        <view class="btn btn-decline" @tap="declineContactInvite">{{ t("refuseFriend") }}</view>
        <view class="btn btn-accept" @tap="acceptContactInvite">{{ t("contactRequestAgreeButton") }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Avatar from "../../../../components/Avatar/index.vue";
import type { Chat } from "../../../../sdk";
import { USER_AVATAR_URL } from "../../../../const/index";
import { useAppUserStore, useContactStore } from "../../../../stores";
import { t } from "../../../../locales";

interface Props {
  user: Chat.ContactItem;
  avatar?: string;
}

const props = defineProps<Props>();

// Pinia stores
const appUserStore = useAppUserStore();
const contactStore = useContactStore();

/** 使用 computed 替代 autorun */
const userInfo = computed(() => {
  return appUserStore.getUserInfo(props.user.userId);
});

const acceptContactInvite = () => {
  // 检查是否已经是好友
  const isAlreadyContact = contactStore.contacts.some(
    contact => contact.userId === props.user.userId
  );
  
  if (isAlreadyContact) {
    uni.showToast({
      title: '已经是好友',
      icon: 'none'
    });
    // 移除该通知
    contactStore.removeContactNotice(props.user.userId);
    return;
  }
  
  contactStore.acceptContactInvite(props.user.userId);
};

const declineContactInvite = () => {
  contactStore.declineContactInvite(props.user.userId);
};

// 无需手动卸载 computed
</script>

<style lang="scss" scoped>
@import url("../../../../styles/common.scss");
.item-wrap {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  height: 60px;
  align-items: center;
  padding-left: 16px;
  &:active {
    background-color: #f5f5f5;
  }
}

.user-avatar {
  margin-right: 12px;
  flex-shrink: 0;
}

.user-name {
  font-size: 16px;
  color: #171a1c;
  line-height: 22px;
  font-weight: 500;
}

.right {
  flex: 1;
  width: 0;
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: space-between;
  border-bottom: 0.5px solid #e3e6e8;
}

.content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-right: 20px;
}

.tip {
  color: #75828a;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.action {
  margin-right: 16px;
  display: flex;
  gap: 8px;
}

.btn {
  min-width: 60px;
  text-align: center;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 14px;
}

.btn-accept {
  background-color: #009dff;
  color: #f9fafa;
}

.btn-decline {
  background-color: #f5f5f5;
  color: #75828a;
  border: 0.5px solid #e3e6e8;
}
</style>
