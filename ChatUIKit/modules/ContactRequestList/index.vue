<template>
  <view class="request-list-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="title" v-text="t('contactRequestListTitle')"></view>
      </template>
    </NavBar>
    <view class="list">
      <view v-if="contactApplyRequestList.length">
        <RequestItem
          v-for="request in contactApplyRequestList"
          :key="request.from"
          :user="{ userId: request.from }"
        />
      </view>
      <Empty v-else />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import NavBar from "../../components/NavBar/index.vue";
import Empty from "../../components/Empty/index.vue";
import RequestItem from "./components/RequestItem/index.vue";
import { t } from "../../locales/index";
import { useContactStore } from "../../stores";

// Pinia store
const contactStore = useContactStore();

/** 使用 computed 替代 autorun */
const contactApplyRequestList = computed(() => {
  return contactStore.contactsNoticeInfo.list.filter((info) => {
    return info.ext === "invited";
  });
});

const onBack = () => {
  uni.navigateBack();
};

// 无需手动卸载 computed
</script>

<style lang="scss" scoped>
.request-list-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.list {
  flex: 1;
  overflow-y: scroll;
}
</style>
