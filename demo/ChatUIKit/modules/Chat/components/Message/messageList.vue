<template>
  <view
    :class="['msg-list-wrap', { opacity: isOpacity }]"
    @tap="resetMessageState"
  >
    <scroll-view
      scroll-y
      :scroll-top="scrollTop"
      class="message-scroll-list"
      :scroll-into-view="`msg-${currentViewMsgId}`"
      :scroll-anchoring="true"
    >
      <view
        class="loadMore"
        v-if="!isLast && !isLoading"
        @tap="getHistoryMessage"
      >
        {{ t("loadMore") }}
      </view>
      <view class="isLast" v-if="isLast">{{ t("noMoreMessage") }}</view>
      <view v-if="isLoading" class="loading"></view>
      <view
        :class="[
          'scroll-msg-item',
          { blink: blinkMsgId === (msg.serverMsgId || msg.id) }
        ]"
        v-for="(msg, idx) in msgs"
        :id="`msg-${msg.serverMsgId || msg.id}`"
        :key="msg.id"
      >
        <!-- 微信风格时间间隔 -->
        <!-- <MessageTime
          :curr-time="msg.time"
          :prev-time="idx > 0 ? msgs[idx - 1].time : 0"
        /> -->
        <NoticeMessageItem
          v-if="msg?.noticeInfo?.type === 'notice'"
          :msg="msg"
        />
        <MessageItem
          v-else
          :msg="msg"
          @onLongPress="onMessageLongPress"
          @jumpToMessage="setViewMsgId"
          :isSelected="msg.id === selectedMsgId"
        />
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import MessageItem from "./messageItem.vue";
import MessageTime from "./messageTime.vue";
import NoticeMessageItem from "./noticeMessageItem.vue";
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from "vue";
import type { MixedMessageBody, Chat } from "../../../../types/index";
import { useMessageStore } from "../../../../stores";
import { t } from "../../../../locales";

interface Props {
  conversationId: string;
  conversationType: Chat.ConversationItem["conversationType"];
}
const props = defineProps<Props>();

// Pinia store
const messageStore = useMessageStore();

const scrollTop = ref(0);
const isLoading = ref(false);
const currentViewMsgId = ref<string>("");
const selectedMsgId = ref("");
const blinkMsgId = ref(""); // 闪烁的消息id
const isOpacity = ref(true);

/** 使用 computed 获取消息列表 */
const msgs = computed(() => {
  return messageStore.getConversationMessages(props.conversationId);
});

/** 是否还有更多历史消息 */
const isLast = computed(() => {
  return !messageStore.hasMoreHistory(props.conversationId);
});

/** 获取 cursor 用于分页加载 */
const cursor = computed(() => {
  return messageStore.conversationMessagesMap[props.conversationId]?.cursor || "";
});

const onMessageLongPress = (msgId: string) => {
  selectedMsgId.value = msgId;
};

const resetMessageState = () => {
  selectedMsgId.value = "";
};

// 监听消息列表变化，自动滚动到底部
watch(
  () => msgs.value.length,
  (newLength, oldLength) => {
    if (isLoading.value || currentViewMsgId.value || (oldLength && newLength === oldLength)) {
      return;
    }
    nextTick(() => {
      scrollToBottom();
      setTimeout(() => {
        isOpacity.value = false;
      }, 200);
    });
  }
);

onMounted(() => {
  // 如果没拉取过历史消息，拉取历史消息
  const convMsgInfo = messageStore.conversationMessagesMap[props.conversationId];
  if (!convMsgInfo || convMsgInfo.isGetHistoryMessage !== true) {
    messageStore.getHistoryMessages({
      conversationId: props.conversationId,
      conversationType: props.conversationType
    } as Chat.ConversationItem);
  } else {
    // 已有消息，滚动到底部
    nextTick(() => {
      scrollToBottom();
      setTimeout(() => {
        isOpacity.value = false;
      }, 200);
    });
  }
});

const getHistoryMessage = async () => {
  if (isLast.value || isLoading.value === true) {
    return;
  }
  isLoading.value = true;
  const firstMessageId = msgs.value[0]?.id || "";
  // #ifdef MP-WEIXIN
  currentViewMsgId.value = firstMessageId;
  // #endif
  try {
    await messageStore.getHistoryMessages(
      {
        conversationId: props.conversationId,
        conversationType: props.conversationType
      } as Chat.ConversationItem,
      cursor.value,
      () => {
        // 获取历史消息接口成功，获取当前可视区域的第一条消息id
        // #ifdef APP-PLUS
        currentViewMsgId.value = firstMessageId;
        // #endif
      }
    );
    // #ifdef WEB
    currentViewMsgId.value = firstMessageId;
    // #endif
    nextTick(() => {
      isLoading.value = false;
      const timer = setTimeout(() => {
        currentViewMsgId.value = "";
        clearTimeout(timer);
      }, 300);
    });
  } catch (error) {
    isLoading.value = false;
  }
};

const scrollToBottom = () => {
  scrollTop.value = msgs.value.length * 999;
  setTimeout(() => {
    scrollTop.value += 1;
  }, 400);
};

const setViewMsgId = (msgId: string) => {
  if (blinkMsgId.value) {
    return;
  }
  currentViewMsgId.value = msgId;
  blinkMsgId.value = msgId;
  setTimeout(() => {
    blinkMsgId.value = "";
    currentViewMsgId.value = "";
  }, 1000);
};

// 无需手动卸载 computed

onUnmounted(() => {
  // 清理工作（如有需要）
});

defineExpose({
  scrollToBottom
});
</script>

<style lang="scss" scoped>
scroll-view ::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  background: transparent;
}

.msg-list-wrap {
  height: 100%;
  overflow: hidden;
}

.message-scroll-list {
  flex: 1;
  height: 100%;
  overflow: hidden auto;
  background-color: #f9fafa;
}

@keyframes blink {
  0% {
    background-color: #f9fafa;
  }
  50% {
    background-color: #e0e0e0; /* 可以调整颜色 */
  }
  100% {
    background-color: #f9fafa;
  }
}

.blink {
  animation: blink 1s infinite;
}

.scroll-msg-item {
  padding: 0 15px;
}

.opacity {
  opacity: 0;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading {
  width: 20px;
  height: 20px;
  margin: 10px auto;
  background-position: center center;
  background-image: url("../../../../assets/icon/spinner.png");
  background-size: 100%;
  animation: spin 1s linear infinite;
  background-repeat: no-repeat;
}

.isLast {
  text-align: center;
  padding: 10px 0;
  color: #999;
  font-size: 12px;
}

.loadMore {
  display: block;
  width: 100%;
  text-align: center;
  font-size: 14px;
  margin: 5px 0;
  color: #999;
}
</style>
