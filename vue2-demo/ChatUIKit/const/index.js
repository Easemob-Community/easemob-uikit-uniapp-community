// 常量定义

// 消息类型
export const MESSAGE_TYPE = {
  TEXT: 'txt',
  IMAGE: 'img',
  AUDIO: 'audio',
  VIDEO: 'video',
  FILE: 'file',
  LOCATION: 'loc',
  CUSTOM: 'custom'
}

// 会话类型
export const CONVERSATION_TYPE = {
  SINGLE: 'singleChat',
  GROUP: 'groupChat',
  CHAT_ROOM: 'chatRoom'
}

// 消息状态
export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed'
}
