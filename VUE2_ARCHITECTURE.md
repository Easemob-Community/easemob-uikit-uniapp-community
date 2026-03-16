# Vue2 ChatUIKit 架构说明

> 本文档介绍 Vue2 ChatUIKit 的架构设计、目录结构和核心概念。

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                    Vue2 ChatUIKit                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  UI 组件层   │  │  业务模块层  │  │    Store 状态层      │ │
│  ├─────────────┤  ├─────────────┤  ├─────────────────────┤ │
│  │ - Avatar    │  │ - Chat      │  │ - conn             │ │
│  │ - UserItem  │  │ - Conversation│ │ - conversation     │ │
│  │ - IndexedList│ │ - ContactList│  │ - message          │ │
│  │ - ...       │  │ - GroupList │  │ - contact          │ │
│  │             │  │ - ...       │  │ - group            │ │
│  │             │  │             │  │ - appUser          │ │
│  │             │  │             │  │ - config           │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   工具层    │  │   国际化层   │  │    SDK 适配层       │ │
│  ├─────────────┤  ├─────────────┤  ├─────────────────────┤ │
│  │ - utils     │  │ - locales   │  │ - index.js (主类)  │ │
│  │ - const     │  │ - i18n      │  │ - conn store       │ │
│  │ - styles    │  │             │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 目录结构

```
ChatUIKit-vue2/
├── index.js                 # ChatUIKit 主类，SDK 事件处理中心
├── assets/                  # 静态资源
│   └── icon/               # 图标文件
│       ├── createGroup.png
│       └── ...
├── components/             # 通用 UI 组件
│   ├── Avatar/            # 头像组件（支持在线状态）
│   │   └── index.vue
│   ├── IndexedList/       # 字母索引列表
│   │   └── index.vue
│   └── ...
├── const/                 # 常量定义
│   └── index.js          # 默认头像 URL 等常量
├── locales/              # 国际化
│   ├── index.js         # i18n 主文件
│   └── lang/            # 语言文件
│       ├── zh-Hans.js   # 简体中文
│       └── en.js        # 英文
├── modules/             # 业务模块（页面级组件）
│   ├── Chat/           # 聊天模块
│   │   ├── index.vue
│   │   └── components/ # 聊天相关子组件
│   ├── Conversation/   # 会话列表模块
│   │   ├── index.vue
│   │   └── components/
│   ├── ContactList/    # 联系人列表模块
│   │   ├── index.vue
│   │   └── components/
│   ├── GroupList/      # 群组列表模块
│   ├── GroupCreate/    # 创建群组模块
│   ├── ContactAdd/     # 添加联系人模块
│   └── ...
├── stores/             # Vuex Store 模块
│   ├── index.js       # Store 入口，自动注册模块
│   ├── conn.js        # SDK 连接状态
│   ├── conversation.js # 会话管理
│   ├── message.js     # 消息管理
│   ├── contact.js     # 联系人管理
│   ├── group.js       # 群组管理
│   ├── appUser.js     # 用户信息管理
│   └── config.js      # 配置中心
├── styles/            # 公共样式
│   └── common.scss   # 通用样式、变量
└── utils/            # 工具函数
    └── index.js     # 工具函数集合
```

## 核心概念

### 1. ChatUIKit 主类

`index.js` 中的 `ChatUIKit` 类是整个 UIKit 的核心，负责：

- **初始化管理**: 初始化 SDK、Store、i18n
- **事件转发**: 接收 SDK 事件，转发到 Store 和全局事件总线
- **消息处理**: 统一处理各类消息的接收和转换

```javascript
class ChatUIKit {
  init({ chat, sdk, config }) {
    // 1. 保存 SDK 实例
    // 2. 初始化 Store
    // 3. 初始化 i18n
    // 4. 注册 SDK 事件监听
  }
  
  _setupSDKListeners() {
    // 处理 onConnected、onTextMessage 等 SDK 事件
  }
}
```

### 2. Store 架构

采用 Vuex 模块化设计，每个模块独立管理一块业务状态：

#### 2.1 conn 模块
管理 SDK 连接状态，是其他模块的基础依赖。

```javascript
// 获取 SDK 实例
const conn = store.getters['conn/getChatConn']

// 检查登录状态
const isLoggedIn = store.getters['conn/isLoggedIn']
```

#### 2.2 conversation 模块
管理会话列表，支持本地和服务器数据同步。

```javascript
// 获取会话列表
store.dispatch('conversation/getServerConversations')

// 删除会话
store.dispatch('conversation/deleteConversation', conversationId)
```

#### 2.3 message 模块
管理消息的发送、接收、存储。

```javascript
// 发送文本消息
store.dispatch('message/sendTextMessage', { to, chatType, msg })

// 获取历史消息
store.dispatch('message/getRoamMessages', { conversationId, chatType })
```

#### 2.4 contact 模块
管理联系人列表和好友申请。

```javascript
// 获取联系人列表
store.dispatch('contact/getContactsFromServer')

// 处理好友申请
store.dispatch('contact/acceptContactInvite', userId)
```

#### 2.5 group 模块
管理群组信息、成员、操作。

```javascript
// 获取群组列表
store.dispatch('group/getJoinedGroupList')

// 创建群组
store.dispatch('group/createGroup', { name, members })
```

#### 2.6 appUser 模块
管理用户属性（头像、昵称、在线状态）。

```javascript
// 批量获取用户信息
store.dispatch('appUser/getUsersInfoFromServer', { userIdList })

// 获取单个用户信息
const userInfo = store.getters['appUser/getUserInfo'](userId)
```

#### 2.7 config 模块
管理功能配置（在线状态开关、调试模式等）。

```javascript
// 初始化配置
store.dispatch('config/initConfig')

// 更新配置
store.dispatch('config/updateConfig', { usePresence: true })
```

### 3. 事件系统

采用 `uni.$emit/uni.$on` 作为全局事件总线，实现：

- **跨组件通信**: 无需通过 props 层层传递
- **SDK 事件暴露**: 将 SDK 事件转发给业务层
- **解耦设计**: 模块间不直接依赖

#### 事件类型

```javascript
// 登录相关
uni.$on('chatLoginSuccess', callback)
uni.$on('chatConnected', callback)
uni.$on('chatDisconnected', callback)

// 消息相关
uni.$on('chatOnNewMessage', callback)
uni.$on('chatRecallMessage', callback)

// 联系人相关
uni.$on('chatContactInvited', callback)
uni.$on('chatContactAdded', callback)
```

### 4. 国际化 (i18n)

支持多语言切换，语言文件位于 `locales/lang/`：

```javascript
import { t, i18n } from './ChatUIKit/locales'

// 使用翻译
const text = t('chat.sendMessage')

// 切换语言
i18n.setLocale('en')
```

### 5. 多平台适配

通过条件编译支持不同平台：

```vue
<!-- #ifdef MP-WEIXIN -->
<!-- 微信小程序专用代码 -->
<scroll-view>
  <UserItem v-for="item in list" :key="item.id" />
</scroll-view>
<!-- #endif -->

<!-- #ifndef MP-WEIXIN -->
<!-- H5/App 代码 -->
<IndexedList :options="list">
  <template v-slot:indexedItem="{ item }">
    <UserItem :user="item" />
  </template>
</IndexedList>
<!-- #endif -->
```

## 数据流

### 消息接收流程

```
SDK 推送消息
    ↓
ChatUIKit._setupSDKListeners (onTextMessage/onImageMessage/...)
    ↓
ChatUIKit._handleReceivedMessage
    ↓
1. 转换消息格式 (toPlainMessage)
2. store.dispatch('message/onMessage', msg)
3. uni.$emit('chatOnNewMessage', msg)
    ↓
Store 更新状态 → 组件自动更新
```

### 消息发送流程

```
用户点击发送
    ↓
组件调用 store.dispatch('message/sendTextMessage', params)
    ↓
Store Action 调用 SDK
    ↓
SDK 返回成功
    ↓
Store Mutation 更新消息列表
    ↓
组件自动更新
```

### 联系人加载流程

```
页面加载
    ↓
组件调用 store.dispatch('contact/getContactsFromServer')
    ↓
SDK 返回联系人 ID 列表
    ↓
Store 更新联系人基础信息
    ↓
自动触发 store.dispatch('appUser/getUsersInfoFromServer')
    ↓
获取详细用户信息（头像、昵称）
    ↓
Store 更新用户映射
    ↓
组件自动更新显示
```

## 组件设计原则

### 1. 无状态组件（展示组件）

如 `Avatar`、`UserItem`，只接收 props，不直接操作 Store。

```vue
<template>
  <image :src="src" class="avatar" />
</template>

<script>
export default {
  props: {
    src: String,
    size: Number
  }
}
</script>
```

### 2. 有状态组件（容器组件）

如 `Conversation`、`ContactList`，直接连接 Store。

```vue
<script>
export default {
  computed: {
    conversationList() {
      return this.$store.getters['conversation/getConversationList']
    }
  },
  
  onShow() {
    this.$store.dispatch('conversation/getServerConversations')
  }
}
</script>
```

### 3. 页面包装器

聊天页面需要包装以接收路由参数：

```vue
<template>
  <Chat 
    :conversation-id="conversationId"
    :conversation-type="conversationType"
  />
</template>

<script>
export default {
  onLoad(options) {
    this.conversationId = options.id
    // 设置当前会话到 Store
    this.$store.commit('conversation/SET_CURRENT_CONVERSATION', {...})
  }
}
</script>
```

## 与 Vue3 版本的差异

| 方面 | Vue2 | Vue3 |
|------|------|------|
| 状态管理 | Vuex 3.x | Pinia |
| 响应式原理 | Object.defineProperty | Proxy |
| 组件 API | Options API | Options + Composition API |
| 构建工具 | Webpack | Vite |
| 生命周期 | 标准 Vue2 | 组合式 API |
| 性能 | 较低 | 更高 |

## 扩展指南

### 添加新模块

1. 创建 Store 模块 `stores/newModule.js`
2. 在 `stores/index.js` 中自动注册
3. 创建组件 `modules/NewModule/index.vue`
4. 添加路由到 `pages.json`

### 自定义主题

修改 `styles/common.scss`：

```scss
// 主题变量
$primary-color: #00a4fd;
$primary-color-light: #e6f7ff;
$text-color: #171a1c;
$bg-color: #f9fafa;
```

### 添加新消息类型

1. 在 `message.js` 中添加发送方法
2. 在 `ChatUIKit._setupSDKListeners` 中添加接收处理
3. 创建对应的渲染组件

---

## 最佳实践

1. **始终使用 Actions 修改数据**: 不要直接修改 Store state
2. **组件卸载时清理**: 取消事件监听、清理当前会话
3. **空值保护**: 所有 props 和计算属性都要做空值检查
4. **使用 safeUser/safeItem 模式**: 避免直接访问可能为 null 的对象属性
5. **平台适配**: 使用条件编译处理平台差异

---

*本文档适用于 ChatUIKit Vue2 版本，最后更新于 2026-03-16*
