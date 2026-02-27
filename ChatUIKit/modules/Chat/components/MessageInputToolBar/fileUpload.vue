<template>
  <view class="tool-video-wrap tool-item" @tap="chooseFile">
    <ItemContainer :title="title" :iconUrl="fileButton"> </ItemContainer>
  </view>
</template>

<script lang="ts" setup>
import ItemContainer from "./itemContainer.vue";
import { ASSETS_URL } from "../../../../const/index";
import type { InputToolbarEvent } from "../../../../types/index";
import { inject, computed } from "vue";
import { t } from "../../../../locales/index";
import { useConvStore, useMessageStore, useAppUserStore, useConnStore } from "../../../../stores";
import { chatSDK } from "../../../../sdk";

const fileButton = ASSETS_URL + "icon/folder.png";

const title = t("file");

const toolbarInject = inject<InputToolbarEvent>("InputToolbarEvent");

// Pinia stores
const convStore = useConvStore();
const messageStore = useMessageStore();
const appUserStore = useAppUserStore();
const connStore = useConnStore();

const conn = computed(() => connStore.getChatConn);
const selfUserInfo = computed(() => appUserStore.getSelfUserInfo());

const chooseFile = () => {
  // #ifdef MP-WEIXIN
  wx.chooseMessageFile({
    count: 1,
    type: "all",
    success(res) {
      sendFileMessage({ tempFile: res.tempFiles[0] });
    },
    fail(e) {
      console.error("chooseMessageFile failed", e);
    }
  });
  // #endif

  // h5 选择文件
  // #ifdef WEB
  uni.chooseFile({
    count: 1,
    success(res) {
      sendFileMessage({ tempFile: res.tempFiles[0] });
    }
  });
  // #endif;
};

const sendFileMessage = (res: any) => {
  const tempFile = res?.tempFile;
  const uploadUrl = `${conn.value.apiUrl}/${conn.value.orgName}/${conn.value.appName}/chatfiles`;
  if (!tempFile) {
    return;
  }

  const token = conn.value.token;
  const requestParams = {
    url: uploadUrl,
    filePath: tempFile.path,
    name: "file",
    header: {
      Authorization: "Bearer " + token
    }
  };

  const fileMsg = chatSDK.message.create({
    type: "file",
    to: convStore.currConversation!.conversationId,
    chatType: convStore.currConversation!.conversationType,
    //@ts-ignore
    body: {
      url: tempFile.path,
      filename: tempFile.name,
      //@ts-ignore
      file_length: tempFile.size
    },
    ext: {
      ease_chat_uikit_user_info: {
        avatarURL: selfUserInfo.value.avatar,
        nickname: selfUserInfo.value.name
      }
    }
  });
  toolbarInject?.closeToolbar();
  messageStore.sendMessage(fileMsg, () => {
    return uni.uploadFile(requestParams);
  });
};
</script>

<style lang="scss" scoped>
.tool-item {
  display: flex;
  justify-content: center;
}
</style>
