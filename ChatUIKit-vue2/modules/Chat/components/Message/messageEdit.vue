<template>
  <view style="width: 100%; position: relative; z-index: 9999;" v-if="editingMsg">
    <view class="mask" @tap.stop="onMaskTap" @click.stop="onMaskClick"></view>
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
        <!-- 调试信息 -->
        <view style="font-size: 10px; color: red; position: absolute; top: -20px; right: 10px;">
          editAble: {{ editAble }}
        </view>
        <view
          @tap="onEditButtonTap"
          style="background: #009dff; color: #fff; padding: 8px 16px; border-radius: 4px; font-size: 14px; margin-left: 8px;"
        >
          发送
        </view>
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
      const msg = this.$store.state.message.editingMessage
      console.log('[MessageEdit] editingMsg computed, id:', msg?.id)
      return msg
    },

    editAble() {
      const result = this.txt !== this.editingMsg?.msg && !!formatTextMessage(this.txt).trim()
      console.log('[MessageEdit] editAble computed:', result)
      return result
    }
  },

  mounted() {
    console.log('[MessageEdit] mounted')
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

    onMaskTap(e) {
      console.log('[MessageEdit] mask tapped')
      this.cancelEdit(e)
    },
    
    onMaskClick(e) {
      console.log('[MessageEdit] mask clicked')
      this.cancelEdit(e)
    },

    onEditButtonTap(e) {
      console.log('=========================================')
      console.log('[MessageEdit] onEditButtonTap called')
      // 不阻止冒泡，只执行逻辑
      this.editMessage()
    },

    editMessage() {
      console.log('[MessageEdit] ===============================')
      console.log('[MessageEdit] editMessage called')
      console.log('[MessageEdit] editAble:', this.editAble)
      console.log('[MessageEdit] editingMsg:', JSON.stringify(this.editingMsg))
      
      // 强制执行，不检查 editAble
      if (this.editingMsg) {
        const params = {
          oldMsg: this.editingMsg,
          newMsgText: this.txt.trim()
        }
        console.log('[MessageEdit] Dispatching with params:', JSON.stringify(params))
        
        try {
          this.$store.dispatch('message/modifyServerMessage', params).then(() => {
            console.log('[MessageEdit] Message modified successfully')
          }).catch(err => {
            console.error('[MessageEdit] Failed to modify message:', err)
          })
        } catch (e) {
          console.error('[MessageEdit] Exception during dispatch:', e)
        }
        
        this.$store.dispatch('message/setEditingMessage', null)
      } else {
        console.log('[MessageEdit] Cannot edit - editingMsg is null')
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

.edit, .edit-disabled {
  width: 60px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit {
  background: #009dff;
}

.edit-disabled {
  background: #ccc;
}
</style>
