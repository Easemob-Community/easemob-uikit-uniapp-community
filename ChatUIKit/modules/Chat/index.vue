<template>
  <view
    :class="[
      'chat-wrap',
      { 'chat-wrap-keyboard-close': keyboardHeight === '0px' }
    ]"
    :style="{ height: `calc(100% - ${keyboardHeight})` }"
  >
    <ChatNav />
    <!-- 消息列表 -->
    <view class="msgs-wrap">
      <!-- 遮照层,点击关闭Toolbar -->
      <view v-if="isShowMask" class="mask" @tap="closeToolbar"></view>
      <MessageList
        ref="msgListRef"
        :conversationId="conversationId"
        :conversationType="conversationType"
      />
    </view>
    <MessageQuotePanel />
    <!-- 消息编辑 -->
    <MessageEdit
      v-if="isEditingMessage"
      :style="{
        position: 'fixed',
        width: '100%',
        height: `calc(100% - ${keyboardHeight})`,
        overflow: 'hidden',
        'z-index': 9
      }"
    />
    <!-- 输入框 -->
    <view class="chat-input-wrap">
      <MessageInput
        ref="msgInputRef"
        :preventEvent="isShowToolbar || isShowEmojiPicker"
        @onInputTap="onInputTap"
        @onMention="onMention"
        @onRecordAudio="
          isShowToolbar = false;
          isShowEmojiPicker = false;
        "
        @onShowToolbar="
          isShowToolbar = !isShowToolbar;
          isShowEmojiPicker = false;
        "
        @onShowEmojiPicker="
          isShowEmojiPicker = !isShowEmojiPicker;
          isShowToolbar = false;
        "
      />
    </view>
    <!-- input toolbar -->
    <view v-if="isShowToolbar" class="chat-input-toolbar-wrap">
      <MessageInputToolbar @onUserCardButtonTap="selectUserCard" />
    </view>
    <!-- emoji picker -->
    <EmojiPicker v-if="isShowEmojiPicker" @onEmojiPick="onEmojiPick" />
    <!-- mention list -->
    <MessageMentionList
      v-if="featureConfig.inputMention"
      ref="mentionListRef"
      @onSelect="onSelectMentionItem"
    />
    <!-- contact list -->
    <MessageContactList
      v-if="featureConfig.userCard"
      ref="contactListRef"
      @onSelect="onSelectUserCard"
    />
  </view>
</template>

<script setup lang="ts">
import ChatNav from "./components/ChatNav/index.vue";
import MessageList from "./components/Message/messageList.vue";
import MessageInput from "./components/MessageInput/index.vue";
import MessageInputToolbar from "./components/MessageInputToolBar/index.vue";
import EmojiPicker from "./components/MessageInputToolBar/emojiPicker.vue";
import MessageQuotePanel from "./components/Message/messageQuotePanel.vue";
import MessageEdit from "./components/Message/messageEdit.vue";
import MessageMentionList from "./components/MessageMentionList/index.vue";
import MessageContactList from "./components/MessageContactList/index.vue";
import { t } from "../../locales/index";
import { ref, onMounted, computed, onUnmounted, provide, watch } from "vue";
import { onLoad, onUnload } from "@dcloudio/uni-app";
import type { InputToolbarEvent, Chat } from "../../types/index";
import { 
  useMessageStore, 
  useConvStore, 
  useAppUserStore,
  useConfigStore 
} from "../../stores";
import { AT_ALL } from "../../const/index";
import { chatSDK } from "../../sdk";

// Pinia stores
const messageStore = useMessageStore();
const convStore = useConvStore();
const appUserStore = useAppUserStore();
const configStore = useConfigStore();

const msgListRef = ref(null);
const msgInputRef = ref(null);
const mentionListRef = ref(null);
const contactListRef = ref(null);
const conversationId = ref("");
const isShowToolbar = ref(false);
const isShowEmojiPicker = ref(false);
const keyboardHeight = ref("0px");
const conversationType = ref<Chat.ConversationItem["conversationType"]>(
  "" as Chat.ConversationItem["conversationType"]
);

const featureConfig = computed(() => configStore.featureConfig);

const isShowMask = computed(() => {
  return isShowToolbar.value || isShowEmojiPicker.value;
});

/** 使用 computed 替代 autorun */
const isEditingMessage = computed(() => !!messageStore.editingMessage);

/** 使用 watch 监听 quoteMessage 变化 */
watch(
  () => messageStore.quoteMessage,
  (quoteMsg) => {
    if (quoteMsg) {
      msgInputRef?.value?.setIsFocus(true);
    } else {
      msgInputRef?.value?.setIsFocus(false);
    }
  }
);

const onKeyboardHeightChange = ({ height }) => {
  keyboardHeight.value = height + "px";
  msgListRef?.value?.scrollToBottom();
};

const onInputTap = () => {
  closeToolbar();
  msgInputRef?.value?.setIsFocus(true);
};

const closeToolbar = () => {
  if (isShowToolbar.value === true) {
    isShowToolbar.value = false;
  }
  if (isShowEmojiPicker.value === true) {
    isShowEmojiPicker.value = false;
  }
};

const onEmojiPick = (alt: string) => {
  //@ts-ignore
  msgInputRef?.value.insertText(alt);
};

const onMention = () => {
  mentionListRef?.value?.showPopup();
};

const selectUserCard = () => {
  contactListRef?.value?.showPopup();
};

const onSelectMentionItem = (userIds: string[]) => {
  const userNicks = userIds.map((userId) => {
    if (userId === AT_ALL) {
      return t("mentionAll");
    }
    return appUserStore.getUserInfo(userId).name;
  });

  let str = userNicks.join("");
  if (userNicks.length === 0) {
    str = userNicks.join("@");
    return;
  }
  msgInputRef?.value.addMentionUserIds(userIds);
  msgInputRef?.value.insertText(str);
};

const onSelectUserCard = (userIds: string[]) => {
  const userId = userIds[0];
  const userInfo = appUserStore.getUserInfo(userId);
  const selfUserInfo = appUserStore.getSelfUserInfo();
  
  // 创建名片消息
  const userCardMsg = chatSDK.message.create({
    type: "custom",
    to: convStore.currConversation!.conversationId,
    chatType: convStore.currConversation!.conversationType,
    ext: {
      ease_chat_uikit_user_info: {
        avatarURL: selfUserInfo.avatar,
        nickname: selfUserInfo.name
      }
    },
    customEvent: "userCard",
    customExts: {
      avatar: userInfo.avatar,
      nickname: userInfo.name,
      uid: userId
    }
  });
  messageStore.sendMessage(userCardMsg);
};

onMounted(() => {
  if (!conversationId.value && !conversationType.value) {
    return;
  }
  convStore.markConversationRead({
    conversationId: conversationId.value,
    conversationType: conversationType.value
  });
});

onUnmounted(() => {
  messageStore.setQuoteMessage(null);
  messageStore.setEditingMessage(null);
  // messageStore.cleanupRemovedMessages(conversationId.value);
  convStore.setCurrentConversation(null);
  // 无需手动卸载 computed 和 watch
});

onLoad((option) => {
  conversationType.value = option?.type as Chat.ConversationItem["conversationType"];
  conversationId.value = option?.id;
  if (option?.id) {
    convStore.setCurrentConversation({
      conversationId: conversationId.value,
      conversationType: conversationType.value
    });
  }
  uni.onKeyboardHeightChange &&
    uni.onKeyboardHeightChange(onKeyboardHeightChange);
});

onUnload(() => {
  uni.onKeyboardHeightChange &&
    uni.offKeyboardHeightChange(onKeyboardHeightChange);
});

provide<InputToolbarEvent>("InputToolbarEvent", {
  closeToolbar
});
</script>

<style lang="scss" scoped>
@import url("./style.scss");
</style>
