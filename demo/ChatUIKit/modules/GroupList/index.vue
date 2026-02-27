<template>
  <view class="group-list-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view v-text="t('groupList')"></view>
      </template>
    </NavBar>
    <view class="list" v-if="groupList.length">
      <view
        v-for="group in groupList"
        :key="group.groupId"
        @click="toChatPage(group.groupId)"
      >
        <GroupItem :group="group" />
      </view>
    </view>
    <Empty v-else />
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import GroupItem from "./components/GroupItem/index.vue";
import Empty from "../../components/Empty/index.vue";
import NavBar from "../../components/NavBar/index.vue";
import { useGroupStore } from "../../stores";
import { t } from "../../locales/index";

// Pinia store
const groupStore = useGroupStore();

/** 使用 computed 替代 autorun */
const groupList = computed(() => groupStore.joinedGroupList);

const onBack = () => {
  uni.navigateBack();
};

const toChatPage = (id: string) => {
  uni.navigateTo({
    url: `/ChatUIKit/modules/Chat/index?type=groupChat&id=${id}`
  });
};

// 无需手动卸载 computed
</script>

<style lang="scss" scoped>
.group-list-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.list {
  flex: 1;
  padding-right: 16px;
  overflow-y: scroll;
}
</style>
