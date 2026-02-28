// 工具函数

/**
 * 格式化时间显示
 * @param {number} timestamp - 时间戳
 * @returns {string} 格式化后的时间
 */
export function formatTime(timestamp) {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  
  if (isToday) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  
  const isYesterday = new Date(now - 86400000).toDateString() === date.toDateString()
  if (isYesterday) {
    return '昨天'
  }
  
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

/**
 * 格式化消息内容预览
 * @param {object} lastMessage - 最后一条消息
 * @returns {string} 预览文本
 */
export function formatMessagePreview(lastMessage) {
  if (!lastMessage) return ''
  
  const typeMap = {
    'txt': lastMessage.msg || '[文本]',
    'img': '[图片]',
    'audio': '[语音]',
    'video': '[视频]',
    'file': '[文件]',
    'loc': '[位置]',
    'custom': '[自定义消息]'
  }
  
  return typeMap[lastMessage.type] || '[未知消息]'
}

/**
 * 生成会话唯一ID
 * @param {string} conversationId - 会话ID
 * @param {string} conversationType - 会话类型
 * @returns {string} 唯一ID
 */
export function generateConversationKey(conversationId, conversationType) {
  return `${conversationType}_${conversationId}`
}
