<script>
// 使用相对路径引入（避免 @ 别名问题）
import { EMClient, EMSDK } from './utils/IM'

export default {
  onLaunch: function() {
    console.log('App Launch')
    
    // 初始化 ChatUIKit
    this.initChatUIKit()
  },
  
  onShow: function() {
    console.log('App Show')
    // 检测连接有效性
    if (this.$ChatUIKit && this.$ChatUIKit.onShow) {
      this.$ChatUIKit.onShow()
    }
  },
  
  onHide: function() {
    console.log('App Hide')
  },
  
  methods: {
    initChatUIKit() {
      try {
        if (!EMClient) {
          console.error('EMClient SDK not found')
          return
        }
        
        console.log('Initializing ChatUIKit with EMClient...')
        
        // 初始化 ChatUIKit
        if (this.$ChatUIKit && this.$ChatUIKit.init) {
          this.$ChatUIKit.init({
            chat: EMClient,
            sdk: EMSDK,
            config: {
              isDebug: true
            }
          })
          console.log('ChatUIKit initialized successfully')
        } else {
          console.error('ChatUIKit not found on Vue prototype')
        }
      } catch (error) {
        console.error('Failed to initialize ChatUIKit:', error)
      }
    }
  }
}
</script>

<style>
/* 每个页面公共css */
@import url("./common.scss");

page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
