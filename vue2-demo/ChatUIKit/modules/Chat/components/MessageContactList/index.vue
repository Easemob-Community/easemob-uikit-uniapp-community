<template>
  <view v-if="visible" class="contact-popup">
    <view class="contact-mask" @tap="hidePopup"></view>
    <view class="contact-content">
      <view class="contact-header">
        <text class="contact-title">{{ $t('nav.selectContact') }}</text>
        <view class="close-btn" @tap="hidePopup">
          <text class="close-icon">×</text>
        </view>
      </view>
      <scroll-view class="contact-list" scroll-y>
        <view
          class="contact-item"
          v-for="contact in contacts"
          :key="contact.userId"
          @tap="selectContact(contact)"
        >
          <Avatar
            :size="40"
            :src="contact.avatar"
            :placeholder="USER_AVATAR_URL"
          />
          <view class="contact-info">
            <text class="contact-name">{{ contact.name || contact.userId }}</text>
          </view>
          <view class="checkbox" :class="{ checked: selectedIds.includes(contact.userId) }">
            <text v-if="selectedIds.includes(contact.userId)" class="check-icon">✓</text>
          </view>
        </view>
      </scroll-view>
      <view class="contact-footer">
        <button class="confirm-btn" @tap="confirmSelect">{{ $t('common.confirm') }}({{ selectedIds.length }})</button>
      </view>
    </view>
  </view>
</template>

<script>
import Avatar from '../../../../components/Avatar/index.vue'
import { USER_AVATAR_URL } from '../../../../const/index.js'

export default {
  name: 'MessageContactList',

  components: {
    Avatar
  },

  data() {
    return {
      visible: false,
      USER_AVATAR_URL,
      selectedIds: []
    }
  },

  computed: {
    contacts() {
      // 简化处理，实际应该从 store 获取联系人列表
      return []
    }
  },

  methods: {
    showPopup() {
      this.visible = true
      this.selectedIds = []
    },

    hidePopup() {
      this.visible = false
      this.selectedIds = []
    },

    selectContact(contact) {
      const index = this.selectedIds.indexOf(contact.userId)
      if (index > -1) {
        this.selectedIds.splice(index, 1)
      } else {
        this.selectedIds.push(contact.userId)
      }
    },

    confirmSelect() {
      if (this.selectedIds.length === 0) {
        uni.showToast({ title: $t('contact.selectContact'), icon: 'none' })
        return
      }
      this.$emit('onSelect', this.selectedIds)
      this.hidePopup()
    }
  }
}
</script>

<style lang="scss" scoped>
.contact-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.contact-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.contact-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 12px 12px 0 0;
  max-height: 70%;
  display: flex;
  flex-direction: column;
}

.contact-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.contact-title {
  font-size: 16px;
  font-weight: 500;
  color: #171a1c;
}

.close-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon {
  font-size: 24px;
  color: #999;
}

.contact-list {
  flex: 1;
  max-height: 400px;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.contact-info {
  flex: 1;
  margin-left: 12px;
}

.contact-name {
  font-size: 15px;
  color: #171a1c;
}

.checkbox {
  width: 22px;
  height: 22px;
  border: 2px solid #ccc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox.checked {
  background: #009dff;
  border-color: #009dff;
}

.check-icon {
  color: #fff;
  font-size: 14px;
}

.contact-footer {
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
}

.confirm-btn {
  background: #009dff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
}
</style>
