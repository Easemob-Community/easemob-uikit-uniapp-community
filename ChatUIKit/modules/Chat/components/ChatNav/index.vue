<template>
  <view>
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="left-content">
          <Avatar
            class="nav-avatar"
            :size="32"
            :src="info.avatar"
            :placeholder="isSingleChat ? USER_AVATAR_URL : GROUP_AVATAR_URL"
            :withPresence="isSingleChat ? true : false"
            :presenceExt="info.presenceExt"
            :isOnline="info.isOnline"
          />
          <view class="name ellipsis">{{ info.name }}</view>
        </view>
      </template>
    </NavBar>
  </view>
</template>

<script setup lang="ts">
import Avatar from "../../../../components/Avatar/index.vue";
import NavBar from "../../../../components/NavBar/index.vue";
import { computed, onMounted, onUnmounted } from "vue";
import { 
  useConversationStore, 
  useAppUserStore, 
  useGroupStore,
  useConfigStore 
} from "../../../../stores";
import type { Chat } from "../../../../types";
import { USER_AVATAR_URL, GROUP_AVATAR_URL } from "../../../../const";

// Pinia stores
const convStore = useConversationStore();
const appUserStore = useAppUserStore();
const groupStore = useGroupStore();
const configStore = useConfigStore();

const featureConfig = configStore.getFeatureConfig;

/**
 * 关键优化：使用 computed 替代 autorun
 * 自动追踪 currConversation 变化
 */
const info = computed(() => {
  const conv = convStore.currConversation;
  if (!conv) {
    return { avatar: "", name: "", id: "" };
  }

  if (conv.conversationType === "singleChat") {
    const userinfo = appUserStore.getUserInfo(conv.conversationId);
    return {
      name: userinfo.name,
      id: conv.conversationId,
      avatar: userinfo.avatar,
      conversationType: conv.conversationType,
      presenceExt: userinfo.presenceExt,
      isOnline: userinfo.isOnline
    };
  } else {
    const groupInfo = groupStore.getGroupInfoFromStore(conv.conversationId);
    return {
      name: groupStore.getGroupName(conv.conversationId),
      id: conv.conversationId,
      avatar: groupStore.getGroupAvatar(conv.conversationId),
      conversationType: conv.conversationType
    };
  }
});

const isSingleChat = computed(() => {
  return info.value.conversationType === "singleChat";
});

const onBack = () => {
  uni.navigateBack();
};

onMounted(() => {
  if (featureConfig.usePresence && isSingleChat.value && info.value.id) {
    // 获取用户在线状态
    appUserStore.getUsersPresenceFromServer({
      userIdList: [info.value.id]
    });
    // 订阅用户在线状态
    appUserStore.subscribePresence({
      userIdList: [info.value.id]
    });
  }
});

onUnmounted(() => {
  if (featureConfig.usePresence && isSingleChat.value && info.value.id) {
    // 取消订阅用户在线状态
    appUserStore.unsubscribePresence({
      userIdList: [info.value.id]
    });
  }
  // 无需手动卸载 computed！
});
</script>

<style lang="scss" scoped>
@import url("../../../../styles/common.scss");

.name {
  max-width: 45vw;
  color: #171a1c;
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
  margin-left: 8px;
}

.left-content {
  display: flex;
  align-items: center;
}

.nav-avatar {
  height: 32px;
}
</style>
