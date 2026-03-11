<template>
  <view class="message-edit-wrap">
    <view class="edit-header">
      <text class="edit-title">{{ $t('message.editTitle') }}</text>
      <view class="close-btn" @tap="closeEdit">
        <text class="close-icon">×</text>
      </view>
    </view>
    <view class="edit-content">
      <textarea
        class="edit-textarea"
        v-model="editText"
        auto-height
        :focus="isFocus"
        :show-confirm-bar="false"
      />
    </view>
    <view class="edit-footer">
      <button class="send-btn" @tap="sendEdit">{{ $t('common.send') }}</button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MessageEdit',

  data() {
    return {
      editText: '',
      isFocus: true
    }
  },

  computed: {
    editingMessage() {
      return this.$store.state.message.editingMessage
    }
  },

  watch: {
    editingMessage: {
      immediate: true,
      handler(msg) {
        if (msg) {
          this.editText = msg.msg || ''
        }
      }
    }
  },

  methods: {
    closeEdit() {
      this.$store.dispatch('message/setEditingMessage', null)
    },

    sendEdit() {
      const text = this.editText.trim()
      if (!text) {
        uni.showToast({ title: this.$t('message.inputPlaceholder'), icon: 'none' })
        return
      }

      const oldMsg = this.editingMessage
      if (!oldMsg) return

      const chatSDK = this.$store.state.conn.chatSDK

      if (!chatSDK || !chatSDK.message) {
        console.error('SDK not initialized')
        uni.showToast({ title: this.$t('errors.sdkNotInit') || 'SDK未初始化', icon: 'none' })
        return
      }

      // 调用修改消息接口 - 直接传递新的消息文本
      this.$store.dispatch('message/modifyServerMessage', { oldMsg, newMsgText: text })
        .then(() => {
          uni.showToast({ title: '修改成功', icon: 'success' })
          this.closeEdit()
        })
        .catch(error => {
          console.error('修改消息失败:', error)
          uni.showToast({ title: this.$t('errors.sendFailed') || '修改失败', icon: 'none' })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.message-edit-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.edit-title {
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

.edit-content {
  flex: 1;
  padding: 16px;
}

.edit-textarea {
  width: 100%;
  font-size: 16px;
  line-height: 1.5;
  color: #171a1c;
}

.edit-footer {
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
}

.send-btn {
  background: #009dff;
  color: #fff;
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  border: none;
}
</style>
