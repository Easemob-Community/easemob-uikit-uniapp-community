<template>
  <view
    class="swipe-menu-wrap"
    @touchmove="touchMoveHandler"
    @touchstart="touchStartHandler"
    :style="{ transform: `translateX(${showDeleteMenu ? -80 : 0}px)` }"
  >
    <view class="user-item-wrap" @tap="onTap">
      <Avatar :src="userInfo.avatar" :placeholder="USER_AVATAR_URL" />
      <view class="user-info">
        <view class="user-name">{{ userInfo.name }}</view>
        <view v-if="showPresence && userInfo.presenceExt" class="presence-text"
          >{{ userInfo.presenceExt }}
        </view>
      </view>
    </view>
    <view class="menu-wrap">
      <view class="menu delete" @click.stop="onDelete">{{ t('deleteFriend') }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Avatar from "../../../../components/Avatar/index.vue";
import { useConfigStore } from "../../../../stores";
import { USER_AVATAR_URL } from "../../../../const/index";
import { t } from "../../../../locales";

interface Props {
  user: {
    userId: string;
    name?: string;
    avatar?: string;
    presenceExt?: string;
  };
  showMenu?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showMenu: false
});

const configStore = useConfigStore();

const userInfo = computed(() => ({
  name: props.user.name || props.user.userId,
  avatar: props.user.avatar || '',
  presenceExt: props.user.presenceExt
}));
const showPresence = computed(() => configStore.getFeatureConfig.usePresence);

const emits = defineEmits(["onTap", "onDelete", "onSwipe"]);

let startX = 0;
const showDeleteMenu = ref(false);

const onTap = () => {
  if (showDeleteMenu.value) {
    showDeleteMenu.value = false;
    emits("onSwipe", null);
    return;
  }
  emits("onTap", props.user.userId);
};

const onDelete = () => {
  uni.showModal({
    title: t('deleteFriend'),
    content: `${t('deleteFriend')} "${userInfo.value.name}"?`,
    confirmColor: '#FF002B',
    success: (res) => {
      if (res.confirm) {
        emits("onDelete", props.user.userId);
      }
      showDeleteMenu.value = false;
      emits("onSwipe", null);
    }
  });
};

// 滑动开始
const touchStartHandler = (e: any) => {
  startX = e.touches[0].pageX;
};

// 滑动事件处理
const touchMoveHandler = (e: any) => {
  const pageX = e.touches[0].pageX;
  const moveX = pageX - startX;

  if (Math.abs(moveX) < 60) return;

  if (moveX > 0) {
    showDeleteMenu.value = false;
    emits("onSwipe", null);
  } else {
    showDeleteMenu.value = true;
    emits("onSwipe", props.user.userId);
  }
};

// 暴露给父组件控制
const setShowMenu = (show: boolean) => {
  showDeleteMenu.value = show;
};

defineExpose({ setShowMenu });
</script>
<style lang="scss" scoped>
.swipe-menu-wrap {
  display: flex;
  position: relative;
  transition: transform 0.2s ease;
}

.user-item-wrap {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #fff;
  border-bottom: 0.5px solid #e3e6e8;
  width: 100%;
  flex-shrink: 0;
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

.menu-wrap {
  display: flex;
  position: absolute;
  right: -80px;
  top: 0;
  bottom: 0;
  width: 80px;
}

.menu {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
}

.delete {
  background-color: #ff002b;
}
</style>
