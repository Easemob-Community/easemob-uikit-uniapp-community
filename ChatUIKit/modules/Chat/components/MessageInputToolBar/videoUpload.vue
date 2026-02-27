<template>
  <view class="tool-video-wrap tool-item" @tap="chooseVideo">
    <ItemContainer :title="title" :iconUrl="videoButton"> </ItemContainer>
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

const videoButton = ASSETS_URL + "icon/videoButton.png";

const title = t("videoUpload");

const toolbarInject = inject<InputToolbarEvent>("InputToolbarEvent");

// Pinia stores
const convStore = useConvStore();
const messageStore = useMessageStore();
const appUserStore = useAppUserStore();
const connStore = useConnStore();

const conn = computed(() => connStore.getChatConn);
const selfUserInfo = computed(() => appUserStore.getSelfUserInfo());

const chooseVideo = () => {
  uni.chooseVideo({
    sourceType: ["camera", "album"],
    success: function (res) {
      sendVideoMessage(res);
    }
  });
};

const sendVideoMessage = (res: any) => {
  const tempFilePath = res?.tempFilePath;
  const uploadUrl = `${conn.value.apiUrl}/${conn.value.orgName}/${conn.value.appName}/chatfiles`;
  if (!tempFilePath) {
    return;
  }
  const token = conn.value.token;
  const filename = tempFilePath.replace(/^.*[\\/]/, "").split("?")[0] || "video.mp4";
  const requestParams = {
    url: uploadUrl,
    filePath: tempFilePath,
    fileType: "video",
    name: "file",
    header: {
      Authorization: "Bearer " + token
    }
  };

  const videoMsg = chatSDK.message.create({
    type: "video",
    to: convStore.currConversation!.conversationId,
    chatType: convStore.currConversation!.conversationType,
    //@ts-ignore
    body: {
      url: tempFilePath,
      filename: filename,
    },
    ext: {
      ease_chat_uikit_user_info: {
        avatarURL: selfUserInfo.value.avatar,
        nickname: selfUserInfo.value.name
      }
    }
  });
  toolbarInject?.closeToolbar();
  messageStore.sendMessage(videoMsg, () => {
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
