<template>
  <view
    v-if="showActions && menuItems.length"
    :class="['message-popup-box', popupClassName]"
    :style="
      elementPosition == 'overstep'
        ? computedRightMenuStyle
        : { '--arrowPosition': arrowPosition, right: isSelf ? '0' : 'auto' }
    "
  >
    <view class="message-operate">
      <view
        class="operate-item"
        v-for="(menuItem, idx) in menuItems"
        :key="idx"
        @click.stop="menuItem.action"
      >
        <image
          :src="menuItem.icon"
          mode="aspectFill"
          alt=""
          class="operate-item-icon"
        ></image>
        <view class="operate-item-txt">{{ menuItem.label }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import { ASSETS_URL } from '../../../../const/index.js'
import { renderTxt } from '../../../../utils/index.js'

const CopyIcon = ASSETS_URL + 'icon/copy.png'
const RecallIcon = ASSETS_URL + 'icon/recall.png'
const ReplyIcon = ASSETS_URL + 'icon/reply.png'
const EditIcon = ASSETS_URL + 'icon/edit.png'
const DeleteIcon = ASSETS_URL + 'icon/delete.png'

export default {
  name: 'MessageActions',

  props: {
    msg: {
      type: Object,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      showActions: false,
      elementPosition: '',
      elTop: 0,
      arrowPosition: '0px',
      menuItems: [],
      windowSize: {
        width: 0,
        height: 0
      },
      featureConfig: {
        copyMessage: true,
        editMessage: true,
        replyMessage: true,
        deleteMessage: true,
        recallMessage: true
      }
    }
  },

  computed: {
    isSelf() {
      return this.$store.getters['message/checkMessageFromIsSelf'](this.msg)
    },

    computedRightMenuStyle() {
      if (this.elementPosition === 'overstep') {
        return {
          top: `${this.elTop}px`,
          right: 0
        }
      }
      return ''
    },

    popupClassName() {
      if (this.elementPosition === 'nearTop') {
        return this.isSelf ? 'right-up-box' : 'left-up-box'
      } else if (this.elementPosition === 'nearBottom') {
        return this.isSelf ? 'right-down-box' : 'left-down-box'
      }
      return ''
    }
  },

  mounted() {
    uni.getSystemInfo({
      success: (res) => {
        this.windowSize = {
          width: res.windowWidth,
          height: res.windowHeight
        }
      }
    })
  },

  methods: {
    setMenuItems() {
      console.log('[MessageActions] Setting menu items for msg:', this.msg.id, 'type:', this.msg.type, 'status:', this.msg.status)
      const list = []
      const currentTime = Date.now()
      const msgTime = this.msg.time
      const recallLimit = 1000 * 60 * 2 // 撤回时间限制
      const isRecallAllowed =
        (this.msg.status === 'sent' || this.msg.status === 'read') &&
        currentTime - msgTime < recallLimit
      const isMsgEditable =
        this.isSelf &&
        this.msg.type === 'txt' &&
        this.msg.status !== 'failed' &&
        this.msg.status !== 'sending'
      const isMsgReplyable =
        this.msg.status !== 'failed' && this.msg.status !== 'sending'

      // 文本消息类型时显示 "复制"
      if (this.featureConfig.copyMessage && this.msg.type === 'txt') {
        list.push({
          label: '复制',
          icon: CopyIcon,
          action: this.copyMessage
        })
      }

      // 允许编辑的消息显示 "编辑"
      if (this.featureConfig.editMessage && isMsgEditable) {
        list.push({
          label: '编辑',
          icon: EditIcon,
          action: this.editMessage
        })
      }

      // 非发送中和失败状态的消息显示 "回复"
      if (this.featureConfig.replyMessage && isMsgReplyable) {
        list.push({
          label: '回复',
          icon: ReplyIcon,
          action: this.quoteMessage
        })
      }

      if (this.featureConfig.deleteMessage) {
        list.push({
          label: '删除',
          icon: DeleteIcon,
          action: this.deleteMessage
        })
      }

      // 自己的消息可以显示可撤回的显示 "撤回"
      if (this.isSelf) {
        if (this.featureConfig.recallMessage && isRecallAllowed) {
          list.push({
            label: '撤回',
            icon: RecallIcon,
            action: this.recallMessage
          })
        }
      }

      // 更新菜单项
      this.menuItems = list
      console.log('[MessageActions] Menu items set:', list.length, 'items:', list.map(i => i.label))
    },

    handleLongPress(e, instance) {
      console.log('[MessageActions] handleLongPress called')
      let currClientY = e.changedTouches[0].clientY
      const query = uni.createSelectorQuery().in(instance)
      query
        .select(`#msg-bubble-${this.msg.id}`)
        .boundingClientRect((res) => {
          this.arrowPosition = '8px'
          if (res.top > 180) {
            this.elementPosition = 'nearBottom'
          } else if (res.height > this.windowSize.height / 2) {
            if (res.top < 0) {
              this.elTop = -res.top + currClientY
            } else {
              this.elTop = currClientY - res.top
            }
            this.elementPosition = 'overstep'
          } else {
            this.elementPosition = 'nearTop'
          }
        })
        .exec()
      this.setMenuItems()
      console.log('[MessageActions] Showing actions, menuItems:', this.menuItems.length)
      setTimeout(() => {
        this.showActions = true
        console.log('[MessageActions] showActions set to true')
      }, 100)
    },

    copyMessage() {
      // 复制消息逻辑
      const text = renderTxt(this.msg.msg).reduce((prev, curr) => {
        return prev + (curr.type === 'text' ? curr.value : curr.alt)
      }, '')

      uni.setClipboardData({
        data: text,
        success: () => {
          this.showActions = false
          uni.showToast({ title: '已复制', icon: 'none' })
        }
      })
    },

    quoteMessage() {
      this.$store.dispatch('message/setQuoteMessage', this.msg)
      this.showActions = false
    },

    editMessage() {
      this.$store.dispatch('message/setEditingMessage', this.msg)
      this.showActions = false
    },

    deleteMessage() {
      const convId = this.msg.chatType === 'groupChat' ? this.msg.to : 
        (this.msg.from === this.$store.state.conn.chatConn?.user ? this.msg.to : this.msg.from)
      
      this.$store.dispatch('message/deleteMessage', {
        cvs: {
          conversationType: this.msg.chatType,
          conversationId: convId
        },
        msg: this.msg
      })
      this.showActions = false
    },

    recallMessage() {
      this.$store.dispatch('message/recallMessage', this.msg)
      this.showActions = false
    }
  }
}
</script>

<style lang="scss" scoped>
.message-popup-box {
  position: absolute;
  z-index: 99;
  background: #f9fafa;
  border-radius: 8px;
  box-shadow: 0px 4px 8px 0px rgba(26, 26, 26, 0.2),
    0px 1px 3px 0px rgba(77, 77, 77, 0.3);
  .message-operate {
    display: flex;
    flex-flow: row wrap;
    box-sizing: border-box;
    padding: 4px 0;
    max-width: 310px;

    .operate-item {
      padding: 0 10px;
      margin: 10px 0;
      .operate-item-icon {
        display: block;
        width: 32px;
        height: 32px;
        background-size: cover;
      }

      .operate-item-txt {
        font-size: 12px;
        line-height: 16px;
        text-align: center;
        color: #171a1c;
        margin-top: 2px;
      }
    }
  }
}

.right-up-box,
.left-up-box {
  bottom: -75px;
}

.right-down-box,
.left-down-box {
  top: -90px;
}

.left-up-box:before {
  content: "";
  position: absolute;
  bottom: 98%;
  left: var(--arrowPosition);
  border: 8px solid transparent;
  border-bottom: 8px solid #f9fafa;
}

.left-down-box::before {
  content: "";
  position: absolute;
  top: 98%;
  left: var(--arrowPosition);
  border: 8px solid transparent;
  border-top: 8px solid #f9fafa;
}

.right-up-box:before {
  content: "";
  position: absolute;
  bottom: 98%;
  right: var(--arrowPosition);
  border: 8px solid transparent;
  border-bottom: 8px solid #f9fafa;
}

.right-down-box::before {
  content: "";
  position: absolute;
  top: 98%;
  right: var(--arrowPosition);
  border: 8px solid transparent;
  border-top: 8px solid #f9fafa;
}
</style>
