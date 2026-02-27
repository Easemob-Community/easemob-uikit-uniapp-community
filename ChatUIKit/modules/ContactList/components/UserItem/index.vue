<template>
  <view class="user-item-wrap" @tap="onTap">
    <Avatar :src="userInfo.avatar" :placeholder="USER_AVATAR_URL" />
    <view class="user-info">
      <view class="user-name">{{ userInfo.name }}</view>
      <view v-if="showPresence && userInfo.presenceExt" class="presence-text"
        >{{ userInfo.presenceExt }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Avatar from "../../../../components/Avatar/index.vue";
import { computed } from "vue";
import { useConfigStore } from "../../../../stores";
import { USER_AVATAR_URL } from "../../../../const/index";

interface Props {
  user: {
    userId: string;
    name?: string;
    avatar?: string;
    presenceExt?: string;
  };
}

const props = defineProps<Props>();

const configStore = useConfigStore();

const userInfo = computed(() => ({
  name: props.user.name || props.user.userId,
  avatar: props.user.avatar,
  presenceExt: props.user.presenceExt
}));
const showPresence = computed(() => configStore.getFeatureConfig.usePresence);

const emits = defineEmits(["onTap"]);

const onTap = () => {
  emits("onTap", props.user.userId);
};
</script>
<style lang="scss" scoped>
.user-item-wrap {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #fff;
  border-bottom: 0.5px solid #e3e6e8;
}

.user-info {
  margin-left: 12px;
  flex: 1;
}

.user-name {
  font-size: 16px;
  color: #171a1c;
}

.presence-text {
  font-size: 12px;
  color: #75828a;
  margin-top: 2px;
}
</style>
