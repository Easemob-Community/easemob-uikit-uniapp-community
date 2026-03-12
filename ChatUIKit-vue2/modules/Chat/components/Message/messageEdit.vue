<template>
  <view style="width: 100%; position: relative; z-index: 9999;" v-if="editingMsg">
    <view class="mask" @tap.stop="onMaskTap" @click.stop="onMaskClick"></view>
    <view class="msg-edit-wrap" :style="{ bottom: keyboardHeight + 'px' }">
      <view class="title">{{ $t('message.messageEditing') }}</view>
      <view class="content">
        <textarea
          v-model="txt"
          class="edit-input"
          cursor-spacing="20"
          :auto-height="true"
          :focus="isFocus"
          :confirm-type="'send'"
          :show-confirm-bar="false"
          :adjust-position="false"
          @keyboardheightchange="onKeyboardHeightChange"
        />

        <view
          @tap="onEditButtonTap"
          :class="editAble ? 'edit' : 'edit-disabled'"
        ></view>
      </view>
    </view>
  </view>
</template>

<script>
import { formatTextMessage } from '../../../../utils/index'

export default {
  name: 'MessageEdit',

  data() {
    return {
      txt: '',
      isFocus: true,
      keyboardHeight: 0,
      isSubmitting: false
    }
  },

  computed: {
    editingMsg() {
      return this.$store.state.message.editingMessage
    },

    editAble() {
      return (
        this.txt !== this.editingMsg?.msg && formatTextMessage(this.txt).trim()
      )
    }
  },

  watch: {
    editingMsg: {
      immediate: true,
      handler(newMsg) {
        this.txt = newMsg?.msg || ''
      }
    }
  },

  methods: {
    cancelEdit(e) {
      console.log('[MessageEdit] cancelEdit called')
      if (e) e.stopPropagation()
      this.$store.dispatch('message/setEditingMessage', null)
    },

    onEditButtonTap(e) {
      console.log('[MessageEdit] onEditButtonTap called')
      this.isSubmitting = true
      this.editMessage()
      // 延迟重置标志
      setTimeout(() => {
        this.isSubmitting = false
      }, 300)
    },

    editMessage() {
      if (this.editAble && this.editingMsg) {
        this.$store.dispatch('message/modifyServerMessage', {
          oldMsg: this.editingMsg,
          newMsgText: this.txt.trim()
        })
        this.$store.dispatch('message/setEditingMessage', null)
      }
    },

    onKeyboardHeightChange(e) {
      const height = e.detail?.height || 0
      this.keyboardHeight = height
      // 键盘收起时关闭编辑框（提交中不关闭）
      if (height === 0 && this.editingMsg && !this.isSubmitting) {
        this.$store.dispatch('message/setEditingMessage', null)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 9998;
}
.msg-edit-wrap {
  width: 100vw;
  position: fixed;
  z-index: 9999;
  bottom: 0;
  left: 0;
  background: #f9fafa;
}

.title {
  display: flex;
  padding: 7px 12px;
  color: #5270ad;
  background: #f1f2f3;
  font-size: 12px;
  line-height: 16px;
}

.title::before {
  content: "";
  display: inline-block;
  width: 16px;
  height: 16px;
  background: url("../../../../assets/icon/msg-edit.png") no-repeat;
  background-size: 100% 100%;
  margin-right: 2px;
}

.content {
  display: flex;
  padding: 8px 12px;
  align-items: flex-end;
}

.edit-input {
  flex: 1;
  width: 100%;
  background: #f1f2f3;
  padding: 8px;
  margin-right: 12px;
  border-radius: 4px;
  max-height: 60px;
}

.edit {
  width: 30px;
  height: 30px;
  background: url("../../../../assets/icon/checked.png") no-repeat;
  background-size: 100% 100%;
}

.edit-disabled {
  width: 30px;
  height: 30px;
  background: url("../../../../assets/icon/unchecked.png") no-repeat;
  background-size: 100% 100%;
}
</style>
