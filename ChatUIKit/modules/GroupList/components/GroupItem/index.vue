<template>
  <view class="group-item-wrap" @tap="onTap">
    <Avatar :src="groupAvatar" :placeholder="GROUP_AVATAR_URL" />
    <view class="group-name">{{ groupName }}</view>
  </view>
</template>

<script setup lang="ts">
import Avatar from "../../../../components/Avatar/index.vue";
import { computed } from "vue";
import { useGroupStore } from "../../../../stores";
import { GROUP_AVATAR_URL } from "../../../../const/index";

interface Props {
  group: {
    groupId?: string;
    groupid?: string;
    groupName?: string;
    groupname?: string;
    avatar?: string;
    avatarurl?: string;
  };
}

const props = defineProps<Props>();

const groupStore = useGroupStore();

const groupId = computed(() => props.group.groupId || props.group.groupid || '');

const groupName = computed(() => {
  // 优先使用 group 对象的 name（兼容驼峰和小写）
  const name = props.group.groupName || props.group.groupname;
  if (name) return name;
  // 否则从 store 获取
  return groupStore.getGroupName(groupId.value);
});
const groupAvatar = computed(() => {
  // 优先使用 group 对象的 avatar（兼容驼峰和小写）
  const avatar = props.group.avatar || props.group.avatarurl;
  if (avatar) return avatar;
  // 否则从 store 获取
  return groupStore.getGroupAvatar(groupId.value);
});

const emits = defineEmits(["onTap"]);

const onTap = () => {
  emits("onTap", groupId.value);
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
