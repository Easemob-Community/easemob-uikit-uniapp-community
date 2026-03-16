# Vue2 ChatUIKit API 参考手册

> 本文档详细介绍 Vue2 ChatUIKit 的 API 使用方法和参数说明。

## 目录

- [ChatUIKit 主类](#chatuikit-主类)
- [Store 模块 API](#store-模块-api)
- [组件 Props](#组件-props)
- [工具函数](#工具函数)
- [常量定义](#常量定义)

---

## ChatUIKit 主类

### 初始化配置

```javascript
this.$ChatUIKit.init(params)
```

**参数说明：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| chat | Object | 是 | 环信 SDK connection 实例 |
| sdk | Object | 否 | 环信 SDK 本身，用于创建消息对象 |
| config | Object | 否 | 配置项 |
| config.isDebug | Boolean | 否 | 是否开启调试日志，默认 false |
| config.language | String | 否 | 默认语言，如 'zh-Hans'、'en' |

**示例：**

```javascript
this.$ChatUIKit.init({
  chat: EMClient,
  sdk: EMSDK,
  config: {
    isDebug: true,
    language: 'zh-Hans'
  }
})
```

### 实例方法

#### isLoggedIn()

检查当前是否已登录。

```javascript
const isLoggedIn = this.$ChatUIKit.isLoggedIn()
// 返回: Boolean
```

#### getChatConn()

获取 SDK 连接实例。

```javascript
const conn = this.$ChatUIKit.getChatConn()
// 返回: SDK connection 实例
```

#### getStore()

获取 Vuex Store 实例。

```javascript
const store = this.$ChatUIKit.getStore()
// 返回: Vuex Store
```

#### onShow()

App 进入前台时调用，用于检测连接有效性。

```javascript
// 在 App.vue 的 onShow 中调用
onShow() {
  this.$ChatUIKit.onShow()
}
```

---

## Store 模块 API

### 1. conn 模块 - 连接管理

**命名空间：** `conn`

#### State

| 属性 | 类型 | 说明 |
|------|------|------|
| chatConn | Object | SDK 连接实例 |
| chatSDK | Object | SDK 本身 |
| isConnected | Boolean | 是否已连接 |
| isLoggedIn | Boolean | 是否已登录 |

#### Getters

```javascript
// 获取连接状态
this.$store.getters['conn/isConnected']

// 获取登录状态
this.$store.getters['conn/isLoggedIn']

// 获取 SDK 实例
this.$store.getters['conn/getChatConn']

// 获取当前用户 ID
this.$store.getters['conn/getCurrentUserId']
```

#### Actions

```javascript
// 设置连接状态
this.$store.commit('conn/SET_CONNECTED', true)

// 设置登录状态
this.$store.commit('conn/SET_LOGIN_STATUS', true)

// 设置 SDK 实例
this.$store.commit('conn/SET_CHAT_CONN', EMClient)
```

---

### 2. conversation 模块 - 会话管理

**命名空间：** `conversation`

#### State

| 属性 | 类型 | 说明 |
|------|------|------|
| conversationList | Array | 会话列表 |
| currentConversation | Object | 当前会话 |

#### Getters

```javascript
// 获取会话列表（按最后消息时间排序）
this.$store.getters['conversation/getConversationList']

// 获取总未读数
this.$store.getters['conversation/getTotalUnreadCount']
```

#### Actions

```javascript
// 从服务器获取会话列表
this.$store.dispatch('conversation/getServerConversations')

// 删除会话
this.$store.dispatch('conversation/deleteConversation', conversationId)

// 标记会话已读
this.$store.dispatch('conversation/markConversationAsRead', conversationId)

// 置顶/取消置顶会话
this.$store.dispatch('conversation/pinConversation', { 
  conversationId, 
  isPinned 
})

// 清空会话消息
this.$store.dispatch('conversation/clearConversationMessages', conversationId)
```

#### Mutations

```javascript
// 设置当前会话
this.$store.commit('conversation/SET_CURRENT_CONVERSATION', {
  conversationId: 'user123',
  conversationType: 'singleChat'
})

// 更新会话
this.$store.commit('conversation/UPDATE_CONVERSATION', {
  conversationId: 'user123',
  updates: { unReadCount: 0 }
})

// 移除会话
this.$store.commit('conversation/REMOVE_CONVERSATION', conversationId)
```

---

### 3. message 模块 - 消息管理

**命名空间：** `message`

#### State

| 属性 | 类型 | 说明 |
|------|------|------|
| messageList | Array | 当前会话的消息列表 |
| quoteMessage | Object | 被引用的消息 |
| editingMessage | Object | 正在编辑的消息 |

#### Getters

```javascript
// 获取消息列表
this.$store.getters['message/getMessageList']
```

#### Actions - 发送消息

```javascript
// 发送文本消息
this.$store.dispatch('message/sendTextMessage', {
  to: 'userId',
  chatType: 'singleChat', // 或 'groupChat'
  msg: '消息内容',
  ext: {} // 可选，扩展字段
})

// 发送图片消息
this.$store.dispatch('message/sendImageMessage', {
  to: 'userId',
  chatType: 'singleChat',
  file: fileObject, // 文件对象
  width: 300,
  height: 400
})

// 发送语音消息
this.$store.dispatch('message/sendAudioMessage', {
  to: 'userId',
  chatType: 'singleChat',
  file: fileObject,
  length: 10 // 时长（秒）
})

// 发送视频消息
this.$store.dispatch('message/sendVideoMessage', {
  to: 'userId',
  chatType: 'singleChat',
  file: fileObject
})

// 发送文件消息
this.$store.dispatch('message/sendFileMessage', {
  to: 'userId',
  chatType: 'singleChat',
  file: fileObject
})

// 发送自定义消息
this.$store.dispatch('message/sendCustomMessage', {
  to: 'userId',
  chatType: 'singleChat',
  customEvent: 'eventName',
  customExts: {},
  params: {}
})
```

#### Actions - 消息操作

```javascript
// 撤回消息
this.$store.dispatch('message/recallMessage', {
  mid: 'messageId',
  to: 'userId',
  chatType: 'singleChat'
})

// 删除消息
this.$store.dispatch('message/deleteMessage', messageId)

// 编辑消息
this.$store.dispatch('message/modifyMessage', {
  mid: 'messageId',
  msg: '新内容',
  to: 'userId',
  chatType: 'singleChat'
})

// 上报消息已读
this.$store.dispatch('message/reportMessageRead', {
  messageId: 'msgId',
  from: 'senderId'
})

// 引用消息
this.$store.dispatch('message/setQuoteMessage', messageObject)

// 设置编辑消息
this.$store.dispatch('message/setEditingMessage', messageObject)

// 清空编辑/引用状态
this.$store.dispatch('message/setQuoteMessage', null)
this.$store.dispatch('message/setEditingMessage', null)
```

#### Actions - 获取历史消息

```javascript
// 获取漫游消息（服务器历史消息）
this.$store.dispatch('message/getRoamMessages', {
  conversationId: 'userId',
  chatType: 'singleChat',
  cursor: '', // 分页游标，首次为空
  limit: 20
})

// 获取本地消息
this.$store.dispatch('message/getLocalMessages', {
  conversationId: 'userId',
  chatType: 'singleChat',
  page: 1,
  limit: 20
})
```

---

### 4. contact 模块 - 联系人管理

**命名空间：** `contact`

#### State

| 属性 | 类型 | 说明 |
|------|------|------|
| contacts | Array | 联系人列表 |
| contactsNoticeInfo | Object | 好友申请通知信息 |
| viewedUserInfo | Object | 当前查看的用户信息 |

#### Getters

```javascript
// 获取联系人列表
this.$store.getters['contact/getContacts']

// 获取好友申请列表
this.$store.getters['contact/getContactsNoticeList']

// 获取好友申请未读数
this.$store.getters['contact/getContactsNoticeUnreadCount']

// 根据 ID 获取联系人
this.$store.getters['contact/getContactById']('userId')

// 检查是否已是好友
this.$store.getters['contact/isContact']('userId')
```

#### Actions

```javascript
// 从服务器获取联系人列表
this.$store.dispatch('contact/getContactsFromServer')

// 添加联系人
this.$store.dispatch('contact/addContact', 'userId')

// 删除联系人
this.$store.dispatch('contact/deleteContact', 'userId')

// 接受好友申请
this.$store.dispatch('contact/acceptContactInvite', 'userId')

// 拒绝好友申请
this.$store.dispatch('contact/declineContactInvite', 'userId')

// 添加好友申请通知
this.$store.dispatch('contact/addContactNotice', {
  from: 'userId',
  to: 'myUserId',
  status: 'pending',
  ext: 'invited',
  time: Date.now()
})

// 移除好友申请通知
this.$store.dispatch('contact/removeContactNotice', 'userId')

// 清空好友申请未读数
this.$store.dispatch('contact/clearContactNoticeUnread')
```

---

### 5. group 模块 - 群组管理

**命名空间：** `group`

#### State

| 属性 | 类型 | 说明 |
|------|------|------|
| groupList | Array | 加入的群组列表 |
| currentGroup | Object | 当前群组信息 |
| groupMembers | Array | 当前群组成员 |

#### Getters

```javascript
// 获取群组列表
this.$store.getters['group/getGroupList']

// 根据 ID 获取群组
this.$store.getters['group/getGroupById']('groupId')
```

#### Actions

```javascript
// 获取加入的群组列表
this.$store.dispatch('group/getJoinedGroupList')

// 从服务器获取群组详情
this.$store.dispatch('group/getGroupInfoFromServer', { groupId: 'groupId' })

// 创建群组
this.$store.dispatch('group/createGroup', {
  name: '群组名称',
  description: '群组描述',
  members: ['user1', 'user2'], // 初始成员
  isPublic: true,
  allowInvite: true
})

// 解散群组
this.$store.dispatch('group/destroyGroup', 'groupId')

// 退出群组
this.$store.dispatch('group/leaveGroup', 'groupId')

// 获取群成员列表
this.$store.dispatch('group/getGroupMembers', {
  groupId: 'groupId',
  page: 1,
  limit: 20
})

// 邀请用户入群
this.$store.dispatch('group/inviteUserToGroup', {
  groupId: 'groupId',
  users: ['user1', 'user2']
})

// 移除群成员
this.$store.dispatch('group/removeGroupMember', {
  groupId: 'groupId',
  userId: 'userId'
})
```

---

### 6. appUser 模块 - 用户信息管理

**命名空间：** `appUser`

#### State

| 属性 | 类型 | 说明 |
|------|------|------|
| userMap | Object | 用户 ID -> 用户信息的映射 |
| userPresenceMap | Object | 用户在线状态映射 |
| selfUserInfo | Object | 当前用户信息 |

#### Getters

```javascript
// 获取用户信息
this.$store.getters['appUser/getUserInfo']('userId')
// 返回: { name, nickname, avatar, sign, presenceExt, isOnline }

// 获取当前用户信息
this.$store.getters['appUser/getSelfUserInfo']()
```

#### Actions

```javascript
// 获取当前用户信息
this.$store.dispatch('appUser/getSelfUserInfoFromServer')

// 批量获取用户信息
this.$store.dispatch('appUser/getUsersInfoFromServer', {
  userIdList: ['user1', 'user2', 'user3']
})

// 更新用户信息
this.$store.dispatch('appUser/updateUserInfo', {
  nickname: '新昵称',
  avatar: 'avatarUrl'
})

// 发布在线状态
this.$store.dispatch('appUser/publishPresence', {
  presenceExt: '忙碌'
})
```

---

### 7. config 模块 - 配置中心

**命名空间：** `config`

#### State

| 属性 | 类型 | 说明 |
|------|------|------|
| config | Object | 配置项 |
| config.usePresence | Boolean | 是否启用在线状态 |
| config.isDebug | Boolean | 是否开启调试 |
| config.language | String | 当前语言 |

#### Getters

```javascript
// 获取功能配置
this.$store.getters['config/getFeatureConfig']

// 获取单个配置项
this.$store.getters['config/getConfig']('usePresence')
```

#### Actions

```javascript
// 初始化配置
this.$store.dispatch('config/initConfig')

// 更新配置
this.$store.dispatch('config/updateConfig', {
  usePresence: true,
  isDebug: false
})
```

---

## 组件 Props

### Conversation 组件

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| 无 | - | - | 该组件无外部 Props，数据从 Store 获取 |

### ContactList 组件

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| 无 | - | - | 该组件无外部 Props，数据从 Store 获取 |

### Chat 组件

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| conversationId | String | 是 | 会话 ID（用户 ID 或群组 ID） |
| conversationType | String | 是 | 会话类型：'singleChat' 或 'groupChat' |

**示例：**

```vue
<Chat 
  conversation-id="user123" 
  conversation-type="singleChat" 
/>
```

### Avatar 组件

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| src | String | '' | 头像 URL |
| placeholder | String | '' | 占位图 URL |
| size | Number | 40 | 头像尺寸（px） |
| withPresence | Boolean | false | 是否显示在线状态指示器 |
| userId | String | '' | 用户 ID（用于获取在线状态） |

**示例：**

```vue
<Avatar 
  :src="userInfo.avatar" 
  :placeholder="defaultAvatar"
  :size="40"
  :withPresence="true"
  :userId="userInfo.userId"
/>
```

### UserItem 组件

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| user | Object | {} | 用户对象，包含 userId、name、avatar 等 |
| showMenu | Boolean | false | 是否显示操作菜单 |

**事件：**

| 事件名 | 参数 | 说明 |
|--------|------|------|
| onTap | userId | 点击用户项 |
| onDelete | userId | 删除联系人 |
| onSwipe | userId | 滑动展开菜单 |

---

## 工具函数

### 国际化 (i18n)

```javascript
import { t, i18n } from './ChatUIKit/locales'

// 翻译
const text = t('chat.sendMessage')

// 切换语言
i18n.setLocale('en')

// 获取当前语言
const lang = i18n.getLocale()

// 初始化
i18n.init()
```

### 消息转换工具

```javascript
import { toPlainMessage } from './ChatUIKit/utils/index.js'

// 将 SDK 消息对象转换为纯对象（处理 Long 类型）
const plainMsg = toPlainMessage(sdkMessage)
```

### 拼音分组

```javascript
import { groupByName } from './ChatUIKit/utils/index'

// 获取名称首字母（用于索引列表）
const letter = groupByName('张三') // 返回 'Z'
const letter2 = groupByName('123') // 返回 '#'
```

---

## 常量定义

### 用户默认头像

```javascript
import { USER_AVATAR_URL } from './ChatUIKit/const'
// 默认用户头像 URL
```

### 群组默认头像

```javascript
import { GROUP_AVATAR_URL } from './ChatUIKit/const'
// 默认群组头像 URL
```

---

*本文档适用于 ChatUIKit Vue2 版本，最后更新于 2026-03-16*
