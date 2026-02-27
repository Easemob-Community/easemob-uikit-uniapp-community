<template>
  <view class="contact-list-wrap">
    <ContactNav />
    <view :class="isWXProgram ? 'wx-block' : 'block'"></view>
    <view class="contact-list">
      <IndexedList
        :options="contactList"
        :hasGroupItem="true"
        :hasNewRequestItem="true"
        @onGroupTap="onGroupTap"
        @onContactTap="onContactTap"
        @onNewRequestTap="onNewRequestTap"
        :requestCount="contactRequestCount"
        :groupCount="joinedGroupCount"
      >
        <template v-slot:indexedItem="slotProps">
          <UserItem @tap="onContactTap(slotProps.item.userId)" :user="slotProps.item" />
        </template>
      </IndexedList>
    </view>
  </view>
</template>

<script setup lang="ts">
import ContactNav from "./components/ContactNav/index.vue";
import IndexedList from "../../components/IndexedList/index.vue";
import { computed } from "vue";
import { useContactStore, useGroupStore, useAppUserStore } from "../../stores";
import UserItem from "./components/UserItem/index.vue";
import { isWXProgram } from "../../utils/index";

const contactStore = useContactStore();
const groupStore = useGroupStore();

// Pinia stores
const appUserStore = useAppUserStore();

/** 使用 computed 替代 autorun，合并联系人信息和用户信息 */
const contactList = computed(() => {
  return contactStore.contacts.map((contact) => ({
    ...contact,
    ...appUserStore.getUserInfo(contact.userId),
    id: contact.userId
  }));
});
const contactRequestCount = computed(() => contactStore.contactsNoticeInfo.unReadCount);
const joinedGroupCount = computed(() => groupStore.groupList.length);

const onGroupTap = () => {
  uni.navigateTo({
    url: "/ChatUIKit/modules/GroupList/index"
  });
};

const onContactTap = (userId: string) => {
  uni.navigateTo({
    url: `/ChatUIKit/modules/Chat/index?type=singleChat&id=${userId}`
  });
};

const onNewRequestTap = () => {
  uni.navigateTo({
    url: "/ChatUIKit/modules/ContactRequestList/index"
  });
};
</script>
<style lang="scss" scoped>
@import url("../../styles/common.scss");

.contact-list-wrap {
  height: 100%;
  background: #f9fafa;
}

.contact-list {
  height: 100%;
}

.block {
  height: calc(52px + var(--status-bar-height));
}

.wx-block {
  height: calc(76px + var(--status-bar-height));
}
</style>
