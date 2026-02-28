/**
 * 环信 SDK 适配文件
 * 
 * 说明：这里需要替换为真实的环信 SDK 实例
 * 
 * 使用方式：
 * 1. 安装环信 SDK: npm install easemob-websdk
 * 2. 或者下载 SDK 文件放到 static 目录引入
 * 
 * 示例（真实环境）：
 * import { EMClient } from 'easemob-websdk'
 * 
 * const conn = new EMClient({
 *   appKey: 'your-app-key'
 * })
 * 
 * export { conn as EMClient }
 */

// 模拟 SDK 用于演示
const mockSDK = {
  user: null,
  
  // 登录方法
  open(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.user = params.user
        resolve({ 
          accessToken: 'mock-token',
          user: params.user 
        })
      }, 500)
    })
  },
  
  // 关闭连接
  close() {
    this.user = null
    return Promise.resolve()
  },
  
  // 获取会话列表
  getConversationlist() {
    return Promise.resolve({
      data: {
        channels: [
          {
            channel_id: 'user1',
            channel_type: 'chat',
            name: '张三',
            unread_num: 2,
            lastMessage: {
              type: 'txt',
              msg: '你好，在吗？',
              time: Date.now() - 3600000,
              from: 'user1'
            }
          },
          {
            channel_id: 'group1',
            channel_type: 'group',
            name: '测试群组',
            unread_num: 0,
            lastMessage: {
              type: 'txt',
              msg: '大家早上好',
              time: Date.now() - 86400000,
              from: 'user2'
            }
          }
        ]
      }
    })
  },
  
  // 删除会话
  deleteConversation(params) {
    return Promise.resolve()
  },
  
  // 发送频道已读回执
  sendChannelAck(params) {
    return Promise.resolve()
  },
  
  // 添加事件监听
  addEventHandler(name, handler) {
    console.log('Add event handler:', name)
    // 模拟连接成功
    setTimeout(() => {
      if (handler.onConnected) handler.onConnected()
    }, 1000)
  }
}

export { mockSDK as EMClient }

// 默认导出
export default mockSDK
