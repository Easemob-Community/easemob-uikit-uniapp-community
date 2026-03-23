# Vue2 ChatUIKit 存量项目集成指南

> 本文档专为已有 UniApp Vue2 项目集成 ChatUIKit 提供指导，重点解决 Store、i18n 等冲突问题。

## 目录

- [概述](#概述)
- [Store 融合方案](#store-融合方案)
- [多语言集成方案](#多语言集成方案)
- [路由集成](#路由集成)
- [样式冲突处理](#样式冲突处理)
- [完整示例](#完整示例)

---

## 概述

如果你的项目已经存在以下情况，本文档将帮助你顺利集成 ChatUIKit：

- ✅ 已有 Vuex Store
- ✅ 已有 i18n 国际化方案
- ✅ 已有登录、用户体系
- ✅ 已有自定义路由配置

### 核心挑战

| 挑战 | 说明 |
|------|------|
| Store 冲突 | 项目已有 Vuex Store，与 UIKit Store 需要合并 |
| i18n 冲突 | 项目已有国际化方案，需要与 UIKit i18n 共存 |
| 路由冲突 | 需要整合 UIKit 页面到现有路由体系 |
| 样式冲突 | 避免 UIKit 样式影响项目其他页面 |

---

## Store 融合方案

### 方案一：将 UIKit Store 合并到项目 Store（推荐）

适用于：项目已有 Store，希望统一管理

**1. 修改项目 store/index.js**

```javascript
import Vue from 'vue'
import Vuex from 'vuex'

// 你现有的 modules
import user from './modules/user'
import settings from './modules/settings'

// 引入 UIKit 的 store modules
import {
  conn,
  conversation,
  group,
  appUser,
  message,
  contact,
  config
} from './ChatUIKit/stores'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    // 你现有的模块
    user,
    settings,
    
    // UIKit 模块（建议添加命名空间前缀避免冲突）
    'chat-conn': conn,
    'chat-conversation': conversation,
    'chat-group': group,
    'chat-appUser': appUser,
    'chat-message': message,
    'chat-contact': contact,
    'chat-config': config
  }
})
```

**注意：** 如果修改了模块名（如添加 `chat-` 前缀），需要同步修改 UIKit 组件中的 getter 路径。

### 方案二：使用多个 Store 实例（简单但不推荐）

```javascript
// main.js
import Vue from 'vue'
import App from './App'

// 你项目的 store
import projectStore from './store'

// UIKit 的 store
import { store as chatStore } from './ChatUIKit'

// 合并 store（简单但可能有状态同步问题）
const mergedStore = {
  ...projectStore,
  modules: {
    ...projectStore.modules,
    ...chatStore.modules
  }
}

new Vue({
  store: mergedStore,
  ...App
}).$mount()
```

### 方案三：保持独立 Store（兼容性最好）

```javascript
// main.js
import Vue from 'vue'
import App from './App'
import projectStore from './store'  // 你的 store
import { store as chatStore } from './ChatUIKit'  // UIKit store

// 创建两个独立的 store 实例
Vue.prototype.$projectStore = projectStore
Vue.prototype.$chatStore = chatStore

new Vue({
  store: projectStore,  // 主 store 使用项目的
  ...App
}).$mount()
```

**然后在 UIKit 初始化时注入 store：**

```javascript
// App.vue
import { EMClient, EMSDK } from './utils/IM'
import chatStore from './ChatUIKit/stores'

export default {
  onLaunch() {
    this.$ChatUIKit.init({
      chat: EMClient,
      sdk: EMSDK,
      store: chatStore  // 显式传入 UIKit store
    })
  }
}
```

---

## 多语言集成方案

### 场景一：项目已有 i18n，需要与 UIKit 共存

**1. 修改 main.js，禁用 UIKit 自带 i18n 初始化**

```javascript
import Vue from 'vue'
import App from './App'
import store from './store'

// 引入 UIKit，但不使用其 i18n
import ChatUIKit from './ChatUIKit'

// 引入项目自己的 i18n
import { i18n as projectI18n } from './locales'

// 初始化项目 i18n
projectI18n.init()

// 合并 UIKit 的语言包到项目 i18n
import { mergeChatUIKitLocales } from './utils/i18n-helper'
mergeChatUIKitLocales(projectI18n)

Vue.prototype.$ChatUIKit = ChatUIKit
Vue.prototype.$t = projectI18n.t  // 使用项目的 t 函数

new Vue({
  store,
  ...App
}).$mount()
```

**2. 创建 utils/i18n-helper.js**

```javascript
// 合并 UIKit 语言包到项目 i18n
import zhCN from './ChatUIKit/locales/zh-CN'
import enUS from './ChatUIKit/locales/en-US'

export function mergeChatUIKitLocales(projectI18n) {
  // 假设项目 i18n 支持添加/合并语言包
  const chatLocales = {
    'zh-CN': zhCN,
    'en-US': enUS
  }
  
  // 根据项目 i18n 的 API 进行合并
  // 示例（具体根据你的 i18n 库调整）：
  Object.keys(chatLocales).forEach(locale => {
    const existingMessages = projectI18n.getMessages(locale) || {}
    projectI18n.setMessages(locale, {
      ...existingMessages,
      chat: chatLocales[locale]  // 将 UIKit 语言包放到 chat 命名空间下
    })
  })
}
```

**3. 修改 UIKit 组件的翻译函数（如果需要）**

如果 UIKit 组件内部使用 `$t`，而你项目使用其他命名空间，可能需要包装组件或修改源码。

### 场景二：使用 UIKit 的 i18n，项目放弃原有方案

```javascript
// main.js
import Vue from 'vue'
import App from './App'
import store from './store'
import ChatUIKit from './ChatUIKit'
import { t, i18n, setLocale as setChatLocale } from './ChatUIKit/locales'

// 初始化 UIKit i18n
i18n.init()

// 将项目语言设置同步到 UIKit
import { getLocale as getProjectLocale } from './your-locales'
const projectLocale = getProjectLocale()
if (projectLocale) {
  setChatLocale(projectLocale)
}

Vue.prototype.$ChatUIKit = ChatUIKit
Vue.prototype.$t = t

new Vue({
  store,
  ...App
}).$mount()
```

### 场景三：完全隔离（最稳妥）

项目和 UIKit 各自使用独立的 i18n，互不干扰。

```javascript
// main.js
import Vue from 'vue'
import App from './App'
import store from './store'

// 项目 i18n
import { i18n as projectI18n, t as projectT } from './locales'
projectI18n.init()

// UIKit i18n
import { i18n as chatI18n, t as chatT } from './ChatUIKit/locales'
chatI18n.init()

// 分别挂载
Vue.prototype.$t = projectT
Vue.prototype.$chatT = chatT

import ChatUIKit from './ChatUIKit'
Vue.prototype.$ChatUIKit = ChatUIKit

new Vue({
  store,
  ...App
}).$mount()
```

---

## 路由集成

### 整合 UIKit 页面到现有路由

**pages.json 配置示例：**

```json
{
  "pages": [
    // 你现有的页面
    {
      "path": "pages/index/index",
      "style": { "navigationBarTitleText": "首页" }
    },
    {
      "path": "pages/login/index",
      "style": { "navigationStyle": "custom" }
    },
    
    // UIKit 页面
    {
      "path": "ChatUIKit/modules/Chat/page",
      "style": { "navigationStyle": "custom" }
    },
    {
      "path": "ChatUIKit/modules/Conversation/index",
      "style": { "navigationStyle": "custom" }
    },
    {
      "path": "ChatUIKit/modules/ContactList/index",
      "style": { "navigationStyle": "custom" }
    }
    // ... 其他 UIKit 页面
  ],
  "tabBar": {
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页"
      },
      {
        "pagePath": "ChatUIKit/modules/Conversation/index",
        "text": "消息"
      }
    ]
  }
}
```

### 路由跳转适配

如果项目已有路由跳转封装，需要适配 UIKit 页面路径：

```javascript
// utils/router.js
const CHAT_PAGE = '/ChatUIKit/modules/Chat/page'
const CONVERSATION_PAGE = '/ChatUIKit/modules/Conversation/index'
const CONTACT_PAGE = '/ChatUIKit/modules/ContactList/index'

export function navigateToChat(options) {
  const { type, id } = options
  uni.navigateTo({
    url: `${CHAT_PAGE}?type=${type}&id=${id}`
  })
}

export function navigateToConversation() {
  uni.switchTab({
    url: CONVERSATION_PAGE
  })
}
```

---

## 样式冲突处理

### 1. 样式隔离

在 App.vue 中使用 scoped 或特定类名包裹 UIKit 页面：

```vue
<template>
  <view class="app">
    <router-view />
  </view>
</template>

<style>
/* 项目全局样式 */

/* UIKit 样式隔离 */
page:has(.chat-wrap) {
  /* 仅对 UIKit 聊天页面生效的样式 */
}
</style>
```

### 2. CSS 变量覆盖

UIKit 使用 CSS 变量，你可以覆盖以适应项目主题：

```css
/* App.vue 或全局样式 */
page {
  /* 覆盖 UIKit 主题色 */
  --chat-primary-color: #007aff;
  --chat-background-color: #f5f5f5;
}
```

### 3. common.scss 调整

如果项目已有 common.scss，需要合并或重命名：

```scss
/* 项目原有的 common.scss 重命名为 project-common.scss */
@import "./project-common.scss";

/* UIKit 需要的样式 */
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hidden {
  opacity: 0;
}

.msg-emoji {
  width: 20px;
  height: 20px;
}
```

---

## 完整示例

### 存量项目集成完整代码

**store/index.js：**

```javascript
import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import {
  conn,
  conversation,
  group,
  appUser,
  message,
  contact,
  config
} from './ChatUIKit/stores'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user,
    conn,
    conversation,
    group,
    appUser,
    message,
    contact,
    config
  }
})
```

**main.js：**

```javascript
import Vue from 'vue'
import App from './App'
import store from './store'
import ChatUIKit from './ChatUIKit'

// 项目 i18n（假设使用 vue-i18n）
import VueI18n from 'vue-i18n'
import projectZh from './locales/zh.json'
import projectEn from './locales/en.json'

// UIKit i18n 语言包
import chatZh from './ChatUIKit/locales/zh-CN'
import chatEn from './ChatUIKit/locales/en-US'

Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      ...projectZh,
      chat: chatZh  // UIKit 语言包放在 chat 命名空间
    },
    'en-US': {
      ...projectEn,
      chat: chatEn
    }
  }
})

Vue.prototype.$ChatUIKit = ChatUIKit

App.mpType = 'app'

new Vue({
  i18n,
  store,
  ...App
}).$mount()
```

**App.vue：**

```vue
<script>
import { EMClient, EMSDK } from './utils/IM'
import store from './store'

export default {
  onLaunch() {
    // 初始化 UIKit
    if (EMClient) {
      this.$ChatUIKit.init({
        chat: EMClient,
        sdk: EMSDK,
        config: { isDebug: true }
      })
    }
  },
  
  onShow() {
    if (this.$ChatUIKit?.onShow) {
      this.$ChatUIKit.onShow()
    }
  }
}
</script>

<style>
@import "./common.css";
</style>
```

---

## 常见问题

### Q: Store 合并后找不到 UIKit 的 state？

A: 检查 getter 路径是否正确。如果使用了命名空间，需要通过 `this.$store.state['chat-conn']` 访问。

### Q: i18n 切换语言时 UIKit 没有同步？

A: 在语言切换时手动同步：

```javascript
import { setLocale as setChatLocale } from './ChatUIKit/locales'

function switchLanguage(lang) {
  // 切换项目语言
  this.$i18n.locale = lang
  // 同步 UIKit 语言
  setChatLocale(lang)
}
```

### Q: UIKit 组件样式影响项目其他页面？

A: 检查是否引入了全局样式，使用 scoped 样式或 CSS 隔离方案。

---

*本文档适用于 ChatUIKit Vue2 版本，最后更新于 2026-03-23*
