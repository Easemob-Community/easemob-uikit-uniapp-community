<script>
// 引入环信 SDK
import { EMClient } from '@/utils/IM' // 假设有这个路径，需要确认或创建

export default {
  onLaunch: function() {
    console.log('App Launch')
    
    // 初始化 ChatUIKit
    this.initChatUIKit()
  },
  
  onShow: function() {
    console.log('App Show')
  },
  
  onHide: function() {
    console.log('App Hide')
  },
  
  methods: {
    initChatUIKit() {
      // 检查 SDK 是否已加载
      if (typeof EMClient === 'undefined') {
        console.warn('EMClient SDK not found, please check SDK import')
        return
      }
      
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
