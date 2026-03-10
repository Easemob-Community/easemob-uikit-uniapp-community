<template>
  <view class="tool-image-wrap tool-item" @tap="chooseImage">
    <ItemContainer :title="title" :iconUrl="ImageIcon"> </ItemContainer>
  </view>
</template>

<script>
import ItemContainer from './itemContainer.vue'
import { ASSETS_URL } from '../../../../const/index.js'

const ImageIcon = ASSETS_URL + 'icon/imgButton.png'

export default {
  name: 'ImageUpload',

  components: {
    ItemContainer
  },

  data() {
    return {
      ImageIcon,
      title: '相册'
    }
  },

  computed: {
    currentConversation() {
      return this.$store.state.conversation.currentConversation
    },

    chatConn() {
      return this.$store.state.conn.chatSDK
    },

    selfUserInfo() {
      const info = this.$store.getters['appUser/getSelfUserInfo']
      return info ? info() : { name: '', avatar: '' }
    }
  },

  methods: {
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sourceType: ['album'],
        success: (res) => {
          this.sendImageMessage(res)
        }
      })
    },

    sendImageMessage(res) {
      const tempFilePath = (res.tempFilePaths && res.tempFilePaths[0]) || (res.tempFiles && res.tempFiles[0] && res.tempFiles[0].tempFilePath)
      const chatSDK = this.$store.state.conn.chatSDK
      const chatConn = this.$store.state.conn.chatConn

      if (!chatSDK || !chatSDK.message) {
        console.error('SDK not initialized')
        return
      }

      if (!chatConn) {
        console.error('Connection not initialized')
        return
      }

      const uploadUrl = `${chatConn.apiUrl}/${chatConn.orgName}/${chatConn.appName}/chatfiles`

      if (!tempFilePath) {
        return
      }

      const token = chatConn.token
      const requestParams = {
        url: uploadUrl,
        filePath: tempFilePath,
        name: 'file',
        header: {
          Authorization: 'Bearer ' + token
        }
      }

      const imgMsg = chatSDK.message.create({
        type: 'img',
        to: this.currentConversation.conversationId,
        chatType: this.currentConversation.conversationType,
        url: tempFilePath,
        ext: {
          ease_chat_uikit_user_info: {
            avatarURL: this.selfUserInfo.avatar,
            nickname: this.selfUserInfo.name
          }
        }
      })

      this.$store.dispatch('message/sendMessage', {
        msg: imgMsg,
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
