<template>
  <view class="tool-file-wrap tool-item" @tap="chooseFile">
    <ItemContainer :title="title" :iconUrl="FileIcon"> </ItemContainer>
  </view>
</template>

<script>
import ItemContainer from './itemContainer.vue'
import { ASSETS_URL } from '../../../../const/index.js'

const FileIcon = ASSETS_URL + 'icon/file.png'

export default {
  name: 'FileUpload',

  components: {
    ItemContainer
  },

  data() {
    return {
      FileIcon,
      title: '文件'
    }
  },

  computed: {
    currentConversation() {
      return this.$store.state.conversation.currentConversation
    },

    chatConn() {
      // 使用 getter 获取 SDK，避免访问被 Vue 观察的 state
      return this.$store.getters['conn/getChatSDK']
    },

    selfUserInfo() {
      const info = this.$store.getters['appUser/getSelfUserInfo']
      return info ? info() : { name: '', avatar: '' }
    }
  },

  methods: {
    chooseFile() {
      // #ifdef H5
      const input = document.createElement('input')
      input.type = 'file'
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (file) {
          this.sendFileMessage(file)
        }
      }
      input.click()
      // #endif

      // #ifdef MP-WEIXIN
      wx.chooseMessageFile({
        count: 1,
        type: 'file',
        success: (res) => {
          const file = res.tempFiles[0]
          this.sendFileMessage(file)
        }
      })
      // #endif
    },

    sendFileMessage(file) {
      // 使用 getter 获取 SDK，避免访问被 Vue 观察的 state
      const chatSDK = this.$store.getters['conn/getChatSDK']
      const chatConn = this.$store.getters['conn/getChatConn']

      if (!chatSDK || !chatSDK.message) {
        console.error('SDK not initialized')
        return
      }

      if (!chatConn) {
        console.error('Connection not initialized')
        return
      }

      const uploadUrl = chatConn.apiUrl + '/' + chatConn.orgName + '/' + chatConn.appName + '/chatfiles'

      const token = chatConn.token
      const requestParams = {
        url: uploadUrl,
        filePath: file.path || file,
        name: 'file',
        header: {
          Authorization: 'Bearer ' + token
        }
      }

      const fileMsg = chatSDK.message.create({
        type: 'file',
        to: this.currentConversation.conversationId,
        chatType: this.currentConversation.conversationType,
        body: {
          url: file.path || file,
          filename: file.name,
          file_length: file.size
        },
        ext: {
          ease_chat_uikit_user_info: {
            avatarURL: this.selfUserInfo.avatar,
            nickname: this.selfUserInfo.name
          }
        }
      })

      this.$store.dispatch('message/sendMessage', {
        msg: fileMsg,
        uploadFileFunc: () => {
          return uni.uploadFile(requestParams)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.tool-item {
  display: flex;
  justify-content: center;
}
</style>
