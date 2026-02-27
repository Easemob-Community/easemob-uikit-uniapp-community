<template>
  <view class="group-item-wrap" @tap="onTap">
    <Avatar :src="groupAvatar" :placeholder="GROUP_AVATAR_URL" />
    <view class="group-name">{{ groupName }}</view>
  </view>
</template>

<script setup lang="ts">
import Avatar from "../../../../components/Avatar/index.vue";
import { computed } from "vue";
import { useGroupStore } from "../../../../../stores";
import { GROUP_AVATAR_URL } from "../../../../const/index";

interface Props {
  groupId: string;
}

const props = defineProps<Props>();

const groupStore = useGroupStore();

const groupName = computed(() => groupStore.getGroupName(props.groupId));
const groupAvatar = computed(() => groupStore.getGroupAvatar(props.groupId));

const emits = defineEmits(["onTap"]);

const onTap = () => {
  emits("onTap", props.groupId);
};
</script>
<style lang="scss" scoped>
.group-item-wrap {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #fff;
  border-bottom: 0.5px solid #e3e6e8;
}

.group-name {
  margin-left: 12px;
  font-size: 16px;
  color: #171a1c;
}
</style>
