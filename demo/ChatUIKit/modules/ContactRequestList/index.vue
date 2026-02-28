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
import { computed, watch } from "vue";
import NavBar from "../../components/NavBar/index.vue";
import Empty from "../../components/Empty/index.vue";
import RequestItem from "./components/RequestItem/index.vue";
import { t } from "../../locales/index";
import { useContactStore, useAppUserStore } from "../../stores";

// Pinia stores
const contactStore = useContactStore();
const appUserStore = useAppUserStore();

/** 使用 computed 替代 autorun */
const contactApplyRequestList = computed(() => {
  return contactStore.contactsNoticeInfo.list.filter((info) => {
    return info.ext === "invited";
  });
});

// 自动获取申请者用户信息
watch(
  contactApplyRequestList,
  (list) => {
    if (list.length > 0) {
      const userIds = list.map((item) => item.from).filter(Boolean);
      if (userIds.length > 0) {
        appUserStore.getUsersInfoFromServer({ userIdList: userIds });
      }
    }
  },
  { immediate: true }
);

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
