<template>
  <view class="conversation-list-wrap">
    <view class="conversation-list-content">
      <view class="header-wrap">
        <ConversationNav />
        <SearchButton class="convs-search-btn" @tap="onSearch" />
      </view>
      <!-- nav占位 -->
      <view :class="isWXProgram ? 'wx-block' : 'block'"></view>
      <view v-if="conversationList.length" class="convs-wrap">
        <view
          v-for="conv in conversationList"
          :key="conv.conversationId"
          :data-id="conv.conversationId"
        >
          <ConversationItem
            :conversation="conv"
            :showMenu="
              selectedConvId ? selectedConvId === conv.conversationId : false
            "
            @mute="onMuteButtonClick"
            @pin="pinConversation"
            @delete="deleteConversation"
            @leftSwipe="handleLeftSwipe"
          />
        </view>
      </view>
      <Empty v-if="!conversationList.length" />
    </view>
  </view>
</template>

<script setup lang="ts">
import ConversationNav from "../ConversationNav/index.vue";
import ConversationItem from "../ConversationItem/index.vue";
import SearchButton from "../../../../components/SearchButton/index.vue";
import Empty from "../../../../components/Empty/index.vue";
import { ref, computed } from "vue";
import type { Chat } from "../../../../types/index";
import { useConversationStore, useAppUserStore } from "../../../../stores";
import { isWXProgram } from "../../../../utils/index";

// Pinia stores
const convStore = useConversationStore();
const appUserStore = useAppUserStore();

const selectedConvId = ref<string | null>(null);

/**
 * 优化：直接使用 computed 引用 store 状态
 * 无需 deepClone，Pinia 状态已经是响应式的
 */
const conversationList = computed(() => convStore.sortedConversationList);

// 用户信息用于显示
const userInfo = computed(() => appUserStore.getSelfUserInfo());

const deleteConversation = (conv: Chat.ConversationItem) => {
  convStore.deleteConversation({
    conversationId: conv.conversationId,
    conversationType: conv.conversationType
  });
};

const muteConversation = (conv: Chat.ConversationItem) => {
  convStore.setSilentModeForConversation(
    { conversationId: conv.conversationId, conversationType: conv.conversationType },
    true
  );
};

const unMuteConversation = (conv: Chat.ConversationItem) => {
  convStore.setSilentModeForConversation(
    { conversationId: conv.conversationId, conversationType: conv.conversationType },
    false
  );
};

const pinConversation = (conv: Chat.ConversationItem) => {
  convStore.pinConversation(
    { conversationId: conv.conversationId, conversationType: conv.conversationType },
    !conv.isPinned
  );
};

const onMuteButtonClick = (conv: Chat.ConversationItem) => {
  const isMute = convStore.getConversationMuteStatus(conv.conversationId);
  if (isMute) {
    unMuteConversation(conv);
  } else {
    muteConversation(conv);
  }
};

const handleLeftSwipe = (convId: string | null) => {
  selectedConvId.value = convId;
};

const onSearch = () => {
  uni.navigateTo({
    url: "/ChatUIKit/modules/ConversationSearchList/index"
  });
};

// 无需手动卸载 computed！
</script>

<style lang="scss" scoped>
.title {
  width: 50px;
  height: 22px;
  background: url("../../../../assets/chat.png") no-repeat;
  background-size: 100% 100%;
}

.btn-wrap {
  display: flex;
  width: 32px;
  justify-content: flex-end;
}

.action-btn {
  width: 24px;
  height: 24px;
  background: url("../../../../assets/icon/plus.png") no-repeat;
  background-size: 100% 100%;
}

.header-wrap {
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 999;
  padding: 0 8px 8px 8px;
  width: 100%;
  background: #f9fafa;
  box-sizing: border-box;
}

.convs-search-btn {
  margin: 8px;
}

.block {
  height: calc(104px + var(--status-bar-height));
}

.wx-block {
  height: 151px;
}

@import url("../../../../styles//common.scss");
@import url("./style.scss");
.dangerous-btn {
  color: #ff002b;
}
</style>
