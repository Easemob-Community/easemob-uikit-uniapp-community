# Vue2 ChatUIKit 集成文档

> 本文档介绍如何在 UniApp Vue2 项目中集成环信 ChatUIKit。

## 目录

- [概述](#概述)
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [项目配置](#项目配置)
- [SDK 集成](#sdk-集成)
- [组件使用](#组件使用)
- [Store 模块](#store-模块)
- [事件系统](#事件系统)
- [多平台适配](#多平台适配)
- [常见问题](#常见问题)

---

## 概述

Vue2 ChatUIKit 是环信即时通讯 UIKit 的 Vue2 版本，基于 Vuex 状态管理，支持 H5、App 和微信小程序等多平台。

### 核心特性

- ✅ 基于 Vue2 + Vuex 构建
- ✅ 支持 H5 / App / 微信小程序
- ✅ 内置国际化（i18n）支持
- ✅ 模块化 Store 设计
- ✅ 完整的 TypeScript 类型支持（源文件）
- ✅ 与 Vue3 版本 API 保持一致

### 项目结构

```
ChatUIKit-vue2/
├── assets/           # 静态资源（图标、图片）
├── components/       # 通用组件（Avatar、IndexedList 等）
├── const/           # 常量定义
├── locales/         # 国际化文件
├── modules/         # 业务模块（聊天、联系人、会话等）
├── stores/          # Vuex Store 模块
├── styles/          # 公共样式
├── utils/           # 工具函数
└── index.js         # ChatUIKit 主类
```

---

## 环境要求

| 依赖 | 版本 | 说明 |
|------|------|------|
| Vue | 2.x | 必须使用 Vue2 |
| uni-app | 3.x | 跨平台框架 |
| easemob-websdk | ^4.11.0 | 环信 SDK |
| vuex | ^3.6.2 | 状态管理 |
| pinyin-pro | ^3.28.0 | 拼音排序（可选） |

---

## 快速开始

### 1. 创建 UniApp Vue2 项目

在 HBuilderX 中创建项目，选择 **Vue2** 模板。

### 2. 安装依赖

```bash
npm install easemob-websdk vuex pinyin-pro easemob-uniapp-logger-plugin
```

### 3. 复制 ChatUIKit

将 `ChatUIKit-vue2` 目录复制到你的项目中，重命名为 `ChatUIKit`：

```bash
cp -r ChatUIKit-vue2 your-project/ChatUIKit
```

### 4. 配置 manifest.json

确保 `manifest.json` 中设置了 `"vueVersion": "2"`：

```json
{
  "vueVersion": "2",
  "mp-weixin": {
    "usingComponents": true
  }
}
```

### 5. 初始化 ChatUIKit

修改 `main.js`：

```javascript
import Vue from 'vue'
import App from './App'

// #ifdef MP-WEIXIN
// Polyfill for util module (微信小程序需要)
if (typeof global === 'undefined') {
  var global = Function('return this')() || (typeof window !== 'undefined' ? window : {})
}
if (!global.util) {
  global.util = {
    inherits: function(ctor, superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    },
    inspect: function(obj) {
      return JSON.stringify(obj)
    },
    isArray: function(obj) {
      return Array.isArray(obj)
    },
    isObject: function(obj) {
      return typeof obj === 'object' && obj !== null
    },
    toObject: function(obj) {
      if (obj === null || obj === undefined) return {}
      if (typeof obj === 'object') return obj
      try {
        return JSON.parse(obj)
      } catch (e) {
        return {}
      }
    }
  }
}
// #endif

// 引入 ChatUIKit
import ChatUIKit, { store } from './ChatUIKit'
import { t, i18n } from './ChatUIKit/locales'

// 初始化 i18n（登录页等需要提前使用）
i18n.init()

// 挂载到 Vue 原型
Vue.prototype.$ChatUIKit = ChatUIKit
Vue.prototype.$t = t

App.mpType = 'app'

const app = new Vue({
  store,  // 注入 Vuex Store
  ...App
})
app.$mount()
```

### 6. App.vue 初始化

```vue
<script>
import { EMClient, EMSDK } from './utils/IM'

export default {
  onLaunch() {
    console.log('App Launch')
    this.initChatUIKit()
  },
  
  onShow() {
    // 检测连接有效性
    if (this.$ChatUIKit && this.$ChatUIKit.onShow) {
      this.$ChatUIKit.onShow()
    }
  },
  
  methods: {
    initChatUIKit() {
      try {
        if (!EMClient) {
          console.error('EMClient SDK not found')
          return
        }
        
        // 初始化 ChatUIKit
        this.$ChatUIKit.init({
          chat: EMClient,
          sdk: EMSDK,
          config: {
            isDebug: true  // 开启调试日志
          }
        })
        
        console.log('ChatUIKit initialized')
      } catch (error) {
        console.error('Failed to initialize ChatUIKit:', error)
      }
    }
  }
}
</script>

<style>
/* 公共样式 */
@import url("./common.scss");

page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
```

### 7. 配置页面路由

修改 `pages.json`：

```json
{
  "pages": [
    {
      "path": "pages/login/index",
      "style": { "navigationStyle": "custom" }
    },
    {
      "path": "ChatUIKit/modules/Conversation/index",
      "style": { "navigationStyle": "custom" }
    },
    {
      "path": "ChatUIKit/modules/ContactList/index",
      "style": { "navigationStyle": "custom" }
    },
    {
      "path": "pages/chat/index",
      "style": { "navigationStyle": "custom" }
    }
  ],
  "tabBar": {
    "list": [
      {
        "text": "消息",
        "pagePath": "ChatUIKit/modules/Conversation/index"
      },
      {
        "text": "联系人",
        "pagePath": "ChatUIKit/modules/ContactList/index"
      }
    ]
  }
}
```

---

## 项目配置

### 创建 SDK 初始化文件

创建 `utils/IM.js`：

```javascript
// 环信 SDK 初始化配置（UniApp 专用）
import SDK from 'easemob-websdk/uniApp/Easemob-chat'

// 将 SDK 挂载到全局
const WebIM = uni.WebIM = SDK

// 你的应用配置（注意 "K" 需大写）
const APP_KEY = 'your-appKey'

// 创建连接实例
const EMClient = new WebIM.connection({
  appKey: APP_KEY,
  url: 'wss://im-api-wechat.easemob.com/websocket', // WebSocket 连接地址
  apiUrl: 'https://a1.easemob.com', // REST API 连接地址
  useOwnUploadFun: true, // 是否使用自己的上传方式
  isHttpDNS: false, // 在小程序上需设置为 false，其他平台建议设置为 true
  isAutoLogin: false // 是否启用自动登录（uniapp SDK 4.19.0+ 支持）
})

export { EMClient, SDK as EMSDK }
```

**配置参数说明：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| appKey | String | 是 | 应用 App Key（注意 "K" 大写） |
| url | String | 是 | WebSocket 连接地址，`wss://im-api-wechat.easemob.com/websocket` |
| apiUrl | String | 是 | REST API 地址，`https://a1.easemob.com` |
| useOwnUploadFun | Boolean | 否 | 是否使用自己的上传方式，默认 `true` |
| isHttpDNS | Boolean | 否 | 是否启用 HttpDNS，**小程序必须设为 false** |
| isAutoLogin | Boolean | 否 | 是否启用自动登录，SDK 4.19.0+ 支持 |

---

## SDK 集成

### ChatUIKit API

ChatUIKit 初始化后，会暴露以下 API：

#### 初始化方法

```javascript
this.$ChatUIKit.init({
  chat: EMClient,      // 必需：环信 SDK 连接实例
  sdk: EMSDK,          // 可选：环信 SDK 本身
  config: {
    isDebug: true,     // 是否开启调试
    language: 'zh-Hans' // 默认语言
  }
})
```

#### 常用方法

```javascript
// 获取 Store
const store = this.$ChatUIKit.getStore()

// 检查登录状态
const isLoggedIn = this.$ChatUIKit.isLoggedIn()

// 获取 SDK 连接实例
const conn = this.$ChatUIKit.getChatConn()

// App 进入前台时调用（用于重连检测）
this.$ChatUIKit.onShow()
```

---

## 组件使用

### 会话列表 (Conversation)

直接使用 ChatUIKit 内置模块作为页面：

```json
// pages.json
{
  "path": "ChatUIKit/modules/Conversation/index",
  "style": { "navigationStyle": "custom" }
}
```

或在页面中引用：

```vue
<template>
  <view class="conversation-page">
    <Conversation />
  </view>
</template>

<script>
import Conversation from '../../ChatUIKit/modules/Conversation/index.vue'

export default {
  components: { Conversation }
}
</script>
```

### 联系人列表 (ContactList)

```vue
<template>
  <ContactList />
</template>

<script>
import ContactList from '../../ChatUIKit/modules/ContactList/index.vue'

export default {
  components: { ContactList }
}
</script>
```

### 聊天页面 (Chat)

聊天页面需要包装以接收路由参数：

```vue
<template>
  <view class="chat-page">
    <Chat 
      :conversation-id="conversationId" 
      :conversation-type="conversationType" 
    />
  </view>
</template>

<script>
import Chat from '../../ChatUIKit/modules/Chat/index.vue'

export default {
  components: { Chat },
  
  data() {
    return {
      conversationId: '',
      conversationType: ''
    }
  },
  
  onLoad(options) {
    this.conversationType = options.type
    this.conversationId = options.id
    
    // 设置当前会话到 Store
    if (this.conversationId) {
      this.$store.commit('conversation/SET_CURRENT_CONVERSATION', {
        conversationId: this.conversationId,
        conversationType: this.conversationType
      })
      
      // 获取用户/群组信息用于标题
      if (this.conversationType === 'singleChat') {
        this.$store.dispatch('appUser/getUsersInfoFromServer', {
          userIdList: [this.conversationId]
        })
      }
    }
  },
  
  onUnload() {
    // 清理当前会话
    this.$store.dispatch('message/setQuoteMessage', null)
    this.$store.dispatch('message/setEditingMessage', null)
    this.$store.commit('conversation/SET_CURRENT_CONVERSATION', null)
  }
}
</script>
```

### 群组列表 (GroupList)

```vue
<template>
  <GroupList />
</template>

<script>
import GroupList from '../../ChatUIKit/modules/GroupList/index.vue'

export default {
  components: { GroupList }
}
</script>
```

### 创建群组 (GroupCreate)

```vue
<template>
  <GroupCreate />
</template>

<script>
import GroupCreate from '../../ChatUIKit/modules/GroupCreate/index.vue'

export default {
  components: { GroupCreate }
}
</script>
```

### 好友申请列表 (ContactRequestList)

```vue
<template>
  <ContactRequestList />
</template>

<script>
import ContactRequestList from '../../ChatUIKit/modules/ContactRequestList/index.vue'

export default {
  components: { ContactRequestList }
}
</script>
```

---

## Store 模块

ChatUIKit 使用 Vuex 进行状态管理，包含以下模块：

| 模块 | 命名空间 | 说明 |
|------|---------|------|
| conn | conn | SDK 连接状态 |
| conversation | conversation | 会话管理 |
| message | message | 消息管理 |
| contact | contact | 联系人管理 |
| group | group | 群组管理 |
| appUser | appUser | 用户信息管理 |
| config | config | 配置中心 |

### 使用示例

```javascript
// 获取会话列表
this.$store.dispatch('conversation/getServerConversations')

// 获取联系人列表
this.$store.dispatch('contact/getContactsFromServer')

// 获取用户信息
const userInfo = this.$store.getters['appUser/getUserInfo'](userId)

// 发送消息
this.$store.dispatch('message/sendTextMessage', {
  to: userId,
  chatType: 'singleChat',
  msg: 'Hello'
})

// 获取群组列表
this.$store.dispatch('group/getJoinedGroupList')
```

---

## 事件系统

ChatUIKit 使用 `uni.$emit` 和 `uni.$on` 进行全局事件通信。

### 登录相关事件

```javascript
// 登录成功
uni.$on('chatLoginSuccess', () => {
  console.log('登录成功')
})

// 连接成功
uni.$on('chatConnected', () => {
  console.log('SDK 连接成功')
})

// 连接断开
uni.$on('chatDisconnected', () => {
  console.log('SDK 连接断开')
})

// 重连中
uni.$on('chatReconnecting', () => {
  console.log('SDK 重连中')
})
```

### 消息相关事件

```javascript
// 收到新消息
uni.$on('chatOnNewMessage', (msg) => {
  console.log('收到新消息:', msg)
})

// 消息被撤回
uni.$on('chatRecallMessage', (msg) => {
  console.log('消息被撤回:', msg)
})

// 消息被编辑
uni.$on('chatModifiedMessage', (msg) => {
  console.log('消息被编辑:', msg)
})

// 消息已读
uni.$on('chatReadMessage', (msg) => {
  console.log('消息已读:', msg)
})
```

### 联系人相关事件

```javascript
// 收到好友申请
uni.$on('chatContactInvited', (msg) => {
  console.log('收到好友申请:', msg)
})

// 好友申请被同意
uni.$on('chatContactAgreed', (msg) => {
  console.log('好友申请被同意:', msg)
})

// 好友申请被拒绝
uni.$on('chatContactRefuse', (msg) => {
  console.log('好友申请被拒绝:', msg)
})

// 被添加为好友
uni.$on('chatContactAdded', (msg) => {
  console.log('被添加为好友:', msg)
})

// 被删除好友
uni.$on('chatContactDeleted', (msg) => {
  console.log('被删除好友:', msg)
})
```

---

## 多平台适配

> ⚠️ **注意**：当前版本仅确保 **H5**、**UniApp App (Android/iOS)** 和 **微信小程序** 的兼容性，其他平台不做特别兼容测试。

### 支持的平台

| 平台 | 支持情况 | 说明 |
|------|:--------:|------|
| H5 | ✅ | 推荐使用 Chrome 浏览器 |
| UniApp App (Android/iOS) | ✅ | 完整支持 |
| 微信小程序 | ✅ | 需注意 slot 限制 |
| 支付宝/百度/字节小程序 | ⚠️ | 未测试 |

### H5 / App

使用标准的 Vue2 组件和插槽机制：

```vue
<IndexedList :options="contactList">
  <template v-slot:indexedItem="slotProps">
    <UserItem :user="slotProps.item" />
  </template>
</IndexedList>
```

### 微信小程序

微信小程序对 Vue2 的 scoped slot 支持有限，需要条件编译处理：

```vue
<template>
  <!-- #ifndef MP-WEIXIN -->
  <IndexedList :options="contactList">
    <template v-slot:indexedItem="slotProps">
      <UserItem :user="slotProps.item" />
    </template>
  </IndexedList>
  <!-- #endif -->
  
  <!-- #ifdef MP-WEIXIN -->
  <scroll-view scroll-y>
    <UserItem 
      v-for="item in contactList" 
      :key="item.userId"
      :user="item" 
    />
  </scroll-view>
  <!-- #endif -->
</template>
```

### 注意事项

1. **避免使用复杂表达式**：微信小程序对 computed 属性的支持有限
2. **空值保护**：所有 props 和计算属性都要做空值检查
3. **数组初始化**：确保数组类型数据有默认值 `[]`

---

## 常见问题

### Q: 微信小程序提示 "slot" 相关问题

A: 微信小程序 Vue2 对 scoped slot 支持不完善。ContactList 等组件已内置条件编译，直接使用即可。

### Q: 提示 "Cannot read property 'xxx' of null"

A: 这是数据未加载完成时的空值问题。确保在组件中使用安全访问：

```javascript
computed: {
  safeUser() {
    return this.user || {}
  }
}
```

### Q: 联系人/会话列表不显示

A: 确保：
1. 已正确初始化 ChatUIKit
2. 用户已登录
3. 页面生命周期中调用了数据加载方法

### Q: 如何自定义主题颜色

A: 修改 `ChatUIKit/styles/common.scss` 中的变量：

```scss
// 主题色
$primary-color: #00a4fd;
$primary-color-light: #e6f7ff;
```

### Q: 如何添加自定义消息类型

A: 参考 `ChatUIKit/stores/message.js` 中的消息处理逻辑，添加对应的消息类型处理器。

### Q: Vue2 和 Vue3 版本有什么差异？

| 特性 | Vue2 | Vue3 |
|------|------|------|
| 状态管理 | Vuex | Pinia |
| 响应式 | Object.defineProperty | Proxy |
| 组件 API | Options API | Options / Composition API |
| 构建工具 | Webpack | Vite |
| 性能 | 较低 | 较高 |

### Q: 如何调试 SDK？

A: 在初始化时开启调试模式：

```javascript
this.$ChatUIKit.init({
  chat: EMClient,
  sdk: EMSDK,
  config: {
    isDebug: true
  }
})
```

---

## 示例项目

参考 `vue2-demo` 目录下的完整示例项目，包含：

- 登录/注册页面
- 会话列表（TabBar 页面）
- 联系人列表（TabBar 页面）
- 聊天页面
- 群组列表、创建群组
- 个人中心

---

## 技术支持

- **官方文档**: https://docs.easemob.com/
- **GitHub**: https://github.com/Easemob-Community/easemob-uikit-uniapp-community
- **问题反馈**: 请在 GitHub Issues 中提交

---

*本文档适用于 ChatUIKit Vue2 版本，最后更新于 2026-03-16*
