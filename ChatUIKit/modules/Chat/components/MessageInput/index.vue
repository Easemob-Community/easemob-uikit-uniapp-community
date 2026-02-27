<template>
  <view class="message-input-wrap">
    <!-- #ifndef WEB -->
    <view
      v-if="featureConfig.inputAudio"
      @tap="showAudioPopup"
      class="icon-wrap"
    >
      <view class="icon audio-icon"></view>
    </view>
    <AudioMessageSender v-if="featureConfig.inputAudio" ref="audioPopupRef" />
    <!-- #endif -->
    <view class="send-input" @tap="onInputTap">
      <input
        :class="[{ 'prevent-event': props.preventEvent }]"
        v-model="text"
        cursor-spacing="20"
        type="text"
        :focus="isFocus"
        :adjust-position="false"
        :auto-blur="true"
        confirm-type="send"
        :confirm-hold="true"
        @input="onInput"
        @confirm="handleSendMessage"
        @blur="onBlur"
        @focus="onFocus"
        :placeholder="t('sendMessagePlaceholder')"
      />
    </view>
    <view v-if="featureConfig.inputEmoji" class="icon-wrap">
      <view class="icon emoji-icon" @tap.stop="showEmojiPicker"></view>
    </view>
    <view class="icon-wrap" v-if="isShowToolbar && text.length === 0">
      <view class="icon plus-icon" @tap.stop="showToolbar"></view>
    </view>
    <view class="icon-wrap" v-else>
      <view class="icon send-icon" @tap.stop="handleSendMessage"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from "vue";
import AudioMessageSender from "../MessageInputToolBar/audioSender.vue";
import {
  formatTextMessage,
  formatMessage,
  isAndroid
} from "../../../../utils/index";
import { useConvStore, useMessageStore, useAppUserStore, useConfigStore } from "../../../../stores";
import { t } from "../../../../locales/index";
import { AT_ALL } from "../../../../const/index";
import { MessageQuoteExt } from "../../../../types/index";
import { chatSDK } from "../../../../sdk";
import permission from "../../../../utils/permission";

interface Props {
  preventEvent: boolean; // 输入框是否禁止事件
}

// Pinia stores
const convStore = useConvStore();
const messageStore = useMessageStore();
const appUserStore = useAppUserStore();
const configStore = useConfigStore();

const featureConfig = computed(() => configStore.featureConfig);

const isShowToolbar = computed(() => 
  featureConfig.value.inputVideo || featureConfig.value.inputImage
);

const props = defineProps<Props>();

const emits = defineEmits([
  "onMessageSend",
  "onShowToolbar",
  "onShowEmojiPicker",
  "onRecordAudio",
  "onInputTap",
  "onBlur",
  "onFocus",
  "onMention"
]);

const isFocus = ref(false);
const audioPopupRef = ref(null);
const text = ref("");
const mentionUserIds = ref<string[]>([]);

const showAudioPopup = async () => {
  //#ifdef APP-PLUS
  if (isAndroid) {
    const result = await permission.requestAndroidPermission(
      "android.permission.RECORD_AUDIO"
    );
    if (result !== 1) {
      uni.showToast({
        title: t("getMicrophonePermissionFailed"),
        icon: "none"
      });
      return;
    }
  }
  // #endif
  audioPopupRef.value.showAudioPopup();
  emits("onRecordAudio");
};

const showToolbar = () => {
  emits("onShowToolbar");
};

const showEmojiPicker = () => {
  emits("onShowEmojiPicker");
};

const onInputTap = () => {
  emits("onInputTap");
};

const onInput = (e: any) => {
  // uni-app recognizes mention messages
  const inputText = e?.detail?.value;
  if (
    featureConfig.value.inputMention &&
    convStore.currConversation?.conversationType === "groupChat"
  ) {
    if (inputText.endsWith("@") || inputText.endsWith("@\n")) {
      isFocus.value = false;
      emits("onMention", true);
    }
  }
};

const handleSendMessage = async () => {
  let textMessage = formatTextMessage(text.value).trim();
  if (!textMessage) {
    console.warn("No text message");
    return;
  }
  let msgQuoteExt: MessageQuoteExt = {} as MessageQuoteExt;
  let isAtAll = false;
  if (mentionUserIds.value.includes(AT_ALL)) isAtAll = true;
  
  const quoteMessage = messageStore.quoteMessage;
  const selfUserInfo = appUserStore.getSelfUserInfo();
  
  if (quoteMessage) {
    msgQuoteExt = {
      msgID: quoteMessage.serverMsgId || quoteMessage.id,
      msgPreview: formatMessage(quoteMessage),
      msgSender: selfUserInfo.nickname || "",
      msgType: quoteMessage.type
    };
    messageStore.setQuoteMessage(null);
  }
  
  const msg = chatSDK.message.create({
    to: convStore.currConversation!.conversationId,
    chatType: convStore.currConversation!.conversationType,
    type: "txt",
    msg: textMessage,
    ext: {
      em_at_list: isAtAll ? AT_ALL : mentionUserIds.value,
      ease_chat_uikit_user_info: {
        avatarURL: selfUserInfo.avatar,
        nickname: selfUserInfo.name
      },
      msgQuote: msgQuoteExt?.msgID ? msgQuoteExt : undefined
    }
  });
  
  text.value = "";
  mentionUserIds.value = [];
  
  try {
    await messageStore.sendMessage(msg);
    nextTick(() => {
      emits("onMessageSend");
    });
  } catch (error: any) {
    uni.showToast({
      title: `send failed: ${error.message}`,
      icon: "none"
    });
  }
};

const onBlur = () => {
  isFocus.value = false;
  emits("onBlur");
};

const onFocus = () => {
  isFocus.value = true;
  emits("onFocus");
};

defineExpose({
  insertText(emoji: string) {
    text.value += emoji;
  },
  setIsFocus(focus: boolean) {
    isFocus.value = focus;
  },
  addMentionUserIds(userIds: string[]) {
    mentionUserIds.value = [...new Set([...mentionUserIds.value, ...userIds])];
  }
});
</script>

<style lang="scss" scoped>
@import url("./style.scss");
</style>
