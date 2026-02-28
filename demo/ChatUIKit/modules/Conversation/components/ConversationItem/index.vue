<template>
  <view
    class="swipe-menu-wrap"
    @touchmove="touchMoveHandler"
    @touchstart="touchStartHandler"
    :style="{ transform: `translateX(${props.showMenu ? -272 : 0}px)` }"
  >
    <view
      :class="[
        'conversation-item-wrap',
        { 'pin-conversation-item-wrap': props.conversation.isPinned }
      ]"
      @tap="toChatPage"
    >
      <view class="avatar-wrap">
        <Avatar
          :src="conversationInfo.avatar"
          :placeholder="getAvatarPlaceholder()"
        />
      </view>
      <view class="content-wrap">
        <view class="user-info-wrap">
          <view class="info-wrap">
            <view class="user-nick-name ellipsis"
              >{{ conversationInfo.name }}
            </view>
            <image
              v-if="isMute"
              style="width: 20px; height: 20px"
              src="../../../../assets/icon/mute.png"
            />
          </view>
          <view class="msg-wrap">
            <view
              v-if="conversation.atType && conversation.atType !== 'NONE'"
              class="mention-tag"
            >
              {{ conversation.atType === 'ALL' ? t("atAllTag") : t("atTag") }}
            </view>
            <view
              class="last-msg ellipsis"
              v-if="conversation.lastMessage?.type === 'txt'"
            >
              <span
                v-if="
                  conversation.conversationType === 'groupChat' &&
                  !conversation.lastMessage?.noticeInfo
                "
                >{{ getLastMsgFrom(conversation.lastMessage) }}:
              </span>
              <span
                :class="[{ 'emoji-wrap': item.type !== 'text' }]"
                v-for="(item, idx) in renderTxt(conversation.lastMessage.msg)"
                :key="idx"
              >
                <span v-if="item.type === 'text'"> {{ item.value }}</span>
                <!-- emoji -->
                <image v-else class="msg-emoji" :src="item.value" />
              </span>
            </view>
            <view v-else class="last-msg ellipsis">
              {{ formatLastMessage(conversation) }}
            </view>
          </view>
        </view>
        <view class="msg-right-wrap">
          <view class="time">{{
            getConversationTime(conversation.lastMessage)
          }}</view>
          <view v-if="conversation.unReadCount">
            <view v-if="isMute" class="unread-mute"></view>
            <view v-else class="unread-count">
              {{
                conversation.unReadCount > 99 ? "99+" : conversation.unReadCount
              }}
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="menu-wrap">
      <view
        :class="['menu', menu.class]"
        v-for="menu in currentMenuList"
        :key="menu.action"
        @click="handleMenuClick(menu.action)"
      >
        {{ menu.name }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Avatar from "../../../../components/Avatar/index.vue";
import { t } from "../../../../locales/index";
import { ref, computed } from "vue";
import { useConversationStore, useGroupStore, useAppUserStore, useConfigStore } from "../../../../stores";
import { renderTxt, formatMessage } from "../../../../utils/index";
import { USER_AVATAR_URL, GROUP_AVATAR_URL } from "../../../../const/index";
import type {
  MixedMessageBody,
  Chat,
  UIKITConversationItem
} from "../../../../types";

interface Props {
  conversation: UIKITConversationItem;
  showMenu: boolean;
}

const props = defineProps<Props>();
const emits = defineEmits(["mute", "pin", "delete", "leftSwipe"]);

let startX = 0;
const isTapDelete = ref(false);

// Pinia stores
const convStore = useConversationStore();
const groupStore = useGroupStore();
const appUserStore = useAppUserStore();
const configStore = useConfigStore();

const featureConfig = configStore.getFeatureConfig;

/**
 * 关键优化：使用 computed 替代 autorun
 * computed 自动追踪依赖，无需手动管理订阅
 */
const isMute = computed(() => {
  return convStore.getConversationMuteStatus(props.conversation.conversationId);
});

const conversationInfo = computed(() => {
  const convId = props.conversation.conversationId;
  if (props.conversation.conversationType === "groupChat") {
    return {
      name: groupStore.getGroupName(convId),
      avatar: groupStore.getGroupAvatar(convId)
    };
  } else {
    return appUserStore.getUserInfo(convId);
  }
});

const getLastMsgFrom = (msg: MixedMessageBody) => {
  if (props.conversation.conversationType === "groupChat") {
    const from = msg.from || useConnStore().getChatConn.user;
    return appUserStore.getUserInfo(from).nickname || from;
  }
  return "";
};

const menuList = computed(() => {
  let list: any[] = [];
  if (featureConfig.muteConversation) {
    list.push({
      name: isMute.value ? t("unmute") : t("mute"),
      action: "mute",
      class: "mute"
    });
  }
  if (featureConfig.pinConversation) {
    list.push({
      name: props.conversation.isPinned ? t("unpin") : t("pin"),
      action: "pin",
      class: "pin"
    });
  }

  if (featureConfig.deleteConversation) {
    list.push({
      name: t("deleteConv"),
      action: "delete",
      class: "delete"
    });
  }

  return list;
});

const confirmDeleteMenu = ref([
  {
    name: t("confirmDeleteConv"),
    action: "confirmDelete",
    class: "confirm-delete"
  }
]);

const currentMenuList = computed(() => {
  return isTapDelete.value ? confirmDeleteMenu.value : menuList.value;
});

const { getConversationTime } = convStore;

const getAvatarPlaceholder = () => {
  return props.conversation.conversationType === "groupChat"
    ? GROUP_AVATAR_URL
    : USER_AVATAR_URL;
};

const toChatPage = () => {
  if (props.showMenu) {
    isTapDelete.value = false;
    emits("leftSwipe", null);
    return;
  }
  uni.navigateTo({
    url: `/ChatUIKit/modules/Chat/index?type=${props.conversation.conversationType}&id=${props.conversation.conversationId}`
  });
};

const formatLastMessage = (conversation: Chat.ConversationItem) => {
  return formatMessage(conversation.lastMessage as MixedMessageBody);
};

const handleMenuClick = (action: string) => {
  if (action === "mute") {
    emits("mute", props.conversation);
  } else if (action === "pin") {
    emits("pin", props.conversation);
  } else if (action === "delete") {
    isTapDelete.value = true;
    return;
  } else if (action === "confirmDelete") {
    emits("delete", props.conversation);
  }
  emits("leftSwipe", null);
  isTapDelete.value = false;
};

// 滑动开始
const touchStartHandler = (e: any) => {
  startX = e.touches[0].pageX;
};

// 滑动事件处理
const touchMoveHandler = (e: any) => {
  if (menuList.value.length === 0) return;
  const pageX = e.touches[0].pageX;
  const moveX = pageX - startX;

  if (Math.abs(moveX) < 60) return;

  if (moveX > 0) {
    emits("leftSwipe", null);
    isTapDelete.value = false;
  } else {
    emits("leftSwipe", props.conversation.conversationId);
  }
};

// 需要导入 useConnStore
import { useConnStore } from "../../../../stores";
</script>

<style lang="scss" scoped>
@import "./style.scss";
</style>
