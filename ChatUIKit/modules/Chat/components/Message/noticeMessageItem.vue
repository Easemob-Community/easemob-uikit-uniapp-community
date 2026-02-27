<template>
  <view class="msg-notice">
    <view class="notice">
      <view class="notice-content">
        <view class="notice-text">
          <view v-if="noticeType === 'recall'">
            {{
              `"${
                appUserStore.getUserInfo(msg?.noticeInfo?.ext?.from).name
              }" ${t("recallNotice")}`
            }}
          </view>
          <view v-else-if="noticeType === 'group'">
            {{
              `"${
                appUserStore.getUserInfo(msg?.noticeInfo?.ext?.from).name
              }" ${noticeExt.operation} ${t("group")}`
            }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { MixedMessageBody } from "../../../../types/index";
import { useAppUserStore } from "../../../../stores";
import { t } from "../../../../locales/index";
import { computed } from "vue";

interface Props {
  msg: MixedMessageBody;
}

const props = defineProps<Props>();

// Pinia store
const appUserStore = useAppUserStore();

const noticeExt = computed(() => props.msg.noticeInfo?.ext || {});
const noticeType = computed(() => props.msg.noticeInfo?.noticeType);
</script>

<style lang="scss" scoped>
.msg-notice {
  margin: 10px 0;
}
.notice-text {
  text-align: center;
  font-size: 12px;
  color: #acb4b9;
  line-height: 16px;
}
</style>
