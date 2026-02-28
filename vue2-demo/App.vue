<script>
import { EMClient } from '@/utils/IM'

export default {
  onLaunch: function() {
    console.log('App Launch')
    
    // 初始化 ChatUIKit
    this.initChatUIKit()
  },
  
  onShow: function() {
    console.log('App Show')
    // 检测连接有效性
    this.$ChatUIKit.onShow && this.$ChatUIKit.onShow()
  },
  
  onHide: function() {
    console.log('App Hide')
  },
  
  methods: {
    initChatUIKit() {
      if (!EMClient) {
        console.error('EMClient SDK not found')
        return
      }
      
      console.log('Initializing ChatUIKit with EMClient...')
      
      // 初始化 ChatUIKit
      this.$ChatUIKit.init({
        chat: EMClient,
        config: {
          isDebug: true
        }
      })
    }
  }
}
</script>

<style>
/* 每个页面公共css */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
