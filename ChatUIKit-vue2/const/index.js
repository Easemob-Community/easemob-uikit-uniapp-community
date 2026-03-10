// 常量定义

// 获取群组成员列表的每页数量
export const GET_GROUP_MEMBERS_PAGESIZE = 100

// @所有人
export const AT_ALL = 'ALL'

// 资源 URL - 使用 static 目录绝对路径
export const ASSETS_URL = '/static/'

// 默认用户头像
export const USER_AVATAR_URL = ASSETS_URL + 'user.png'

// 默认群组头像
export const GROUP_AVATAR_URL = ASSETS_URL + 'group.png'

// 会话中消息的最大数量
export const MAX_MESSAGES_PER_CONVERSATION = 100

// UIKIT 中支持的用户状态
export const PRESENCE_STATUS_LIST = [
  'Online',
  'Offline',
  'Away',
  'Busy',
  'Do Not Disturb',
  'Custom'
]

// 群组事件来源ID集合
export const GroupEventFromIds = new Set()
