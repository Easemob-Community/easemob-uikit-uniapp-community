<template>
  <view class="tool-video-wrap tool-item" @tap="chooseVideo">
    <ItemContainer :title="title" :iconUrl="VideoIcon"> </ItemContainer>
  </view>
</template>

<script>
import ItemContainer from './itemContainer.vue'
import { ASSETS_URL } from '../../../../const/index.js'

const VideoIcon = ASSETS_URL + 'icon/videoButton.png'

export default {
  name: 'VideoUpload',

  components: {
    ItemContainer
  },

  data() {
    return {
      VideoIcon,
      title: '视频'
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
    chooseVideo() {
      uni.chooseVideo({
        sourceType: ['album', 'camera'],
        maxDuration: 60,
        success: (res) => {
          this.sendVideoMessage(res)
        }
      })
    },

    sendVideoMessage(res) {
      const tempFilePath = res.tempFilePath
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

      const uploadUrl = chatConn.apiUrl + '/' + chatConn.orgName + '/' + chatConn.appName + '/chatfiles'

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

      const videoMsg = chatSDK.message.create({
        type: 'video',
        to: this.currentConversation.conversationId,
        chatType: this.currentConversation.conversationType,
        body: {
          url: tempFilePath
        },
        ext: {
          ease_chat_uikit_user_info: {
            avatarURL: this.selfUserInfo.avatar,
            nickname: this.selfUserInfo.name
          }
        }
      })

      this.$store.dispatch('message/sendMessage', {
        msg: videoMsg,
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
