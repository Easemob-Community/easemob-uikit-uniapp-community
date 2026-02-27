<template>
  <view class="new-chat-wrap">
    <view>
      <NavBar @onLeftTap="onBack">
        <template v-slot:left>
          <view class="title" v-text="t('newChatTitle')"></view>
        </template>
      </NavBar>
      <view class="search-wrap" @tap="toContactSearch">
        <SearchButton :placeholder="t('searchContact')" />
      </view>
    </view>
    <IndexedList
      v-if="contactList.length"
      class="contact-indexed-list"
      :options="contactList"
    >
      <template v-slot:indexedItem="slotProps">
        <UserItem @tap="toChatPage(slotProps.item)" :user="slotProps.item" />
      </template>
    </IndexedList>
    <Empty v-else />
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import SearchButton from "../../components/SearchButton/index.vue";
import NavBar from "../../components/NavBar/index.vue";
import UserItem from "../ContactList/components/UserItem/index.vue";
import Empty from "../../components/Empty/index.vue";
import IndexedList from "../../components/IndexedList/index.vue";
import { useContactStore, useAppUserStore } from "../../stores";
import { t } from "../../locales";

// Pinia stores
const contactStore = useContactStore();
const appUserStore = useAppUserStore();

/** 使用 computed 替代 autorun */
const contactList = computed(() => {
  return contactStore.contacts.map((contact) => ({
    ...contact,
    ...appUserStore.getUserInfo(contact.userId),
    id: contact.userId
  }));
});

const toContactSearch = () => {
  uni.redirectTo({
    url: "/ChatUIKit/modules/ContactSearchList/index?url=/ChatUIKit/modules/ChatNew/index"
  });
};

const toChatPage = (item) => {
  uni.redirectTo({
    url: `/ChatUIKit/modules/Chat/index?type=singleChat&id=${item.userId}`
  });
};

const onBack = () => {
  uni.navigateBack();
};

// 无需手动卸载 computed
</script>

<style lang="scss" scoped>
.nav-tar-wrap {
  display: flex;
  width: 100%;
  height: 44px;
  align-items: center;
  justify-content: space-between;
}

.title {
  color: #171a1c;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
}

.search-wrap {
  flex-shrink: 0;
  padding: 7px 8px;
}

.new-chat-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.contact-indexed-list {
  flex: 1;
  overflow-y: scroll;
}
</style>
