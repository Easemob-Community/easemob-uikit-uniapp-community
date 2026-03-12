<template>
  <view style="width: 100%" v-if="editingMsg">
    <view class="mask" @tap="cancelEdit"></view>
    <view class="msg-edit-wrap">
      <view class="title">{{ $t('message.messageEditing') }}</view>
      <view class="content">
        <textarea
          v-model="txt"
          class="edit-input"
          cursor-spacing="20"
          :auto-height="true"
          :focus="isFocus"
          :confirm-type="'send'"
          :adjust-position="false"
          :show-confirm-bar="false"
        />
        <view
          @tap="editMessage"
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
      isFocus: true
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
    cancelEdit() {
      this.$store.dispatch('message/setEditingMessage', null)
    },

    editMessage() {
      if (this.editAble && this.editingMsg) {
        // 调用 store action 修改消息 - 只传递必要的文本，避免 Vue2 响应式警告
        this.$store.dispatch('message/modifyServerMessage', {
          oldMsg: this.editingMsg,
          newMsgText: this.txt.trim()
        })
        
        this.$store.dispatch('message/setEditingMessage', null)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.mask {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 999;
}
.msg-edit-wrap {
  width: 100vw;
  position: absolute;
  z-index: 999;
  bottom: 0;
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
