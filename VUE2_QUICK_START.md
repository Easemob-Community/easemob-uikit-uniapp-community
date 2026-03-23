# Vue2 ChatUIKit 快速上手指南

> 本文档帮助你快速在 UniApp Vue2 项目中集成环信 ChatUIKit。

## 第一步：准备工作

### 1.1 创建 UniApp 项目

在 HBuilderX 中：
1. 点击「文件」→「新建」→「项目」
2. 选择「UniApp」
3. 模板选择「默认模板（Vue2）」
4. 填写项目名称，点击创建

### 1.2 注册环信账号

1. 访问 [环信即时通讯云](https://www.easemob.com/)
2. 注册账号并创建应用
3. 获取 **App Key**

---

## 第二步：安装依赖

在项目根目录执行：

```bash
npm install easemob-websdk vuex pinyin-pro
```

---

## 第三步：集成 ChatUIKit

### 3.1 复制 UIKit 文件

将 `ChatUIKit-vue2` 目录复制到你的项目中：

```bash
# 假设你的项目目录是 my-uniapp-project
# 注意：请确保你已在项目根目录（即与 pages 同级目录）执行以下命令

# 复制 UIKit 目录
# 如果 ChatUIKit 目录已存在，先删除旧版本
rm -rf my-uniapp-project/ChatUIKit

# 复制新版本
cp -r ChatUIKit-vue2 my-uniapp-project/ChatUIKit
```

同时复制静态资源到项目的 `static` 目录（用于头像、表情等）：

```bash
# 先删除旧的 static 目录（如果存在）避免冲突
rm -rf my-uniapp-project/static

# 创建新的 static 目录
mkdir -p my-uniapp-project/static

# 复制静态资源
cp -r ChatUIKit-vue2/assets/* my-uniapp-project/static/
```

> **说明：**
> - 静态资源包括默认头像（`user.png`、`group.png`）、表情图片（`emojis/`）、图标（`icon/`）等，这些资源通过 `/static/xxx` 路径被组件引用
> - 如果提示 `Not a directory`，说明 `static` 是一个文件而非目录，请先删除该文件再创建目录
> - 如果提示 `No such file or directory`，请检查你的项目路径是否正确

### 3.2 配置 manifest.json

确保使用 Vue2：

```json
{
  "vueVersion": "2",
  "mp-weixin": {
    "usingComponents": true
  },
  "app-plus": {
    "usingComponents": true
  }
}
```

### 3.3 创建 SDK 配置文件

创建 `utils/IM.js`：

```javascript
// 环信 SDK 初始化配置（UniApp 专用）
import SDK from 'easemob-websdk/uniApp/Easemob-chat'

// 将 SDK 挂载到全局
const WebIM = uni.WebIM = SDK

// 替换为你的 App Key（注意 "K" 需大写）
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

> **配置说明：**
> - `url`: WebSocket 连接地址，用于实时消息传输
> - `apiUrl`: REST API 连接地址，用于数据获取
> - `useOwnUploadFun`: 是否使用自己的上传方式（如将图片上传到自有服务器）
> - `isHttpDNS`: 是否启用 HttpDNS，**小程序上必须设置为 false**
> - `isAutoLogin`: 是否启用自动登录，SDK 4.19.0+ 支持

### 3.4 修改 main.js

#### 方式一：使用 UIKit 提供的 store（推荐，新项目使用）

如果你的项目没有使用 Vuex，或愿意使用 UIKit 的 store 作为主 store：

```javascript
import Vue from 'vue'
import App from './App'

// 微信小程序 Polyfill（必须）
// #ifdef MP-WEIXIN
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
    inspect: function(obj) { return JSON.stringify(obj) },
    isArray: function(obj) { return Array.isArray(obj) },
    isObject: function(obj) { return typeof obj === 'object' && obj !== null },
    toObject: function(obj) {
      if (obj === null || obj === undefined) return {}
      if (typeof obj === 'object') return obj
      try { return JSON.parse(obj) } catch (e) { return {} }
    }
  }
}
// #endif

// 引入 ChatUIKit
// 注意：如果复制后的目录名是 ChatUIKit-vue2，请将路径改为 './ChatUIKit-vue2'
import ChatUIKit, { store } from './ChatUIKit'
import { t, i18n } from './ChatUIKit/locales'

// 初始化国际化
i18n.init()

// 挂载到 Vue
Vue.prototype.$ChatUIKit = ChatUIKit
Vue.prototype.$t = t

App.mpType = 'app'

const app = new Vue({
  store,
  ...App
})
app.$mount()
```

#### 方式二：合并到你的现有 store（已有 Vuex 项目使用）

如果你的项目已经有 Vuex store，需要将 UIKit 的 modules 合并进去：

```javascript
// store/index.js
import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'  // 你现有的模块

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
    // 你的现有模块
    user,
    // UIKit 的模块
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

然后在 `main.js` 中使用你自己的 store：

```javascript
import Vue from 'vue'
import App from './App'
import ChatUIKit from './ChatUIKit'
import { t, i18n } from './ChatUIKit/locales'
import store from './store'  // 引入你自己的 store

// 初始化国际化
i18n.init()

// 挂载到 Vue
Vue.prototype.$ChatUIKit = ChatUIKit
Vue.prototype.$t = t

const app = new Vue({
  store,  // 使用你自己的 store（已包含 UIKit 的 modules）
  ...App
})
app.$mount()
```

> **常见问题：** 如果出现 `Cannot read properties of undefined (reading 'init')` 错误，请检查：
> 1. `ChatUIKit/locales/index.js` 文件是否存在
> 2. 目录名是否与导入路径一致（`ChatUIKit` vs `ChatUIKit-vue2`）

### 3.5 修改 App.vue

```vue
<script>
import { EMClient, EMSDK } from './utils/IM'

export default {
  onLaunch() {
    console.log('App Launch')
    this.initChatUIKit()
  },
  
  onShow() {
    if (this.$ChatUIKit && this.$ChatUIKit.onShow) {
      this.$ChatUIKit.onShow()
    }
  },
  
  methods: {
    initChatUIKit() {
      if (!EMClient) {
        console.error('EMClient not found')
        return
      }
      
      this.$ChatUIKit.init({
        chat: EMClient,
        sdk: EMSDK,
        config: { isDebug: true }
      })
    }
  }
}
</script>

<style>
@import url("./common.css");
</style>
```

### 3.6 创建 common.css 文件

在项目根目录创建 `common.css` 文件：

```css
.ellipsis {
  white-space: nowrap;
  /* 禁止换行 */
  overflow: hidden;
  /* 超出部分隐藏 */
  text-overflow: ellipsis;
  /* 使用省略号替代超出部分 */
}

.hidden {
  opacity: 0;
}

.msg-emoji {
  width: 20px;
  height: 20px;
}
```

然后修改 `App.vue` 中的导入语句：

```vue
<style>
@import url("./common.css");
</style>
```

> **注意：** 如果使用 SCSS，也可以创建 `common.scss` 文件，并将导入语句改为 `@import url("./common.scss");`

---

## 第四步：创建登录页面

创建 `pages/login/index.vue`：

> **登录方式说明：** 环信 IM 推荐使用 **user + accessToken** 方式登录，而非 user + password。accessToken 需要从你的服务端获取，或者通过环信管理后台生成。详见：[环信用户 Token 鉴权文档](https://doc.easemob.com/document/server-side/easemob_user_token.html)

```vue
<template>
  <view class="login-page">
    <view class="login-form">
      <input 
        v-model="username" 
        placeholder="用户名" 
        class="input"
      />
      <input 
        v-model="accessToken" 
        placeholder="AccessToken" 
        password 
        class="input"
      />
      <button @click="login" class="btn">登录</button>
    </view>
  </view>
</template>

<script>
import { EMClient } from '../../utils/IM'

export default {
  data() {
    return {
      username: '',
      accessToken: ''
    }
  },
  
  onLoad() {
    // 监听登录成功事件
    uni.$on('chatLoginSuccess', this.onLoginSuccess)
  },
  
  onUnload() {
    uni.$off('chatLoginSuccess', this.onLoginSuccess)
  },
  
  methods: {
    async login() {
      try {
        await EMClient.open({
          user: this.username,
          accessToken: this.accessToken
        })
        uni.showToast({ title: '登录成功', icon: 'success' })
      } catch (error) {
        uni.showToast({ title: '登录失败', icon: 'none' })
      }
    },
    
    onLoginSuccess() {
      // 跳转会话列表
      uni.switchTab({
        url: '/ChatUIKit/modules/Conversation/index'
      })
    }
  }
}
</script>

<style scoped>
.login-page {
  padding: 40px 20px;
}
.input {
  height: 44px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0 12px;
  margin-bottom: 16px;
}
.btn {
  margin-top: 16px;
}
</style>
```

---

## 第五步：配置页面路由

修改 `pages.json`：

```json
{
  "pages": [
    {
      "path": "pages/login/index",
      "style": { "navigationStyle": "custom" }
    },
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
  ],
  "tabBar": {
    "backgroundColor": "#F6F8FA",
    "color": "#999999",
    "selectedColor": "#00a4fd",
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

> **注意：** 以上配置使用内置聊天页面 `ChatUIKit/modules/Chat/page`。如果你选择使用自定义聊天页面，请将 `ChatUIKit/modules/Chat/page` 替换为 `pages/chat/index`。

---

## 第六步：配置聊天页面

ChatUIKit 提供两种集成聊天页面的方式，你可以根据需求选择：

### 方式一：使用内置页面（推荐，零配置）

UIKit 提供了内置的聊天页面，无需手动创建页面文件，只需在 `pages.json` 中配置路径即可。

修改 `pages.json`：

```json
{
  "pages": [
    {
      "path": "pages/login/index",
      "style": { "navigationStyle": "custom" }
    },
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
  ],
  "tabBar": {
    "backgroundColor": "#F6F8FA",
    "color": "#999999",
    "selectedColor": "#00a4fd",
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

> **说明：** 使用内置页面时，会话列表和联系人列表点击后会自动跳转到 `ChatUIKit/modules/Chat/page`，无需额外处理。

#### 路由跳转与返回机制

使用内置页面时，UIKit 已经为你处理好了所有路由逻辑：

| 入口 | 跳转方式 | 跳转目标 | 返回行为 |
|------|----------|----------|----------|
| **会话列表** | `navigateTo` | `ChatUIKit/modules/Chat/page?conversationType=xxx&conversationId=xxx` | `navigateBack` 返回会话列表 |
| **会话搜索列表** | `navigateTo` | `ChatUIKit/modules/Chat/page?id=xxx&type=xxx` | `navigateBack` 返回搜索列表 |
| **联系人列表** | `navigateTo` | `ChatUIKit/modules/Chat/page?type=singleChat&id=xxx` | `navigateBack` 返回联系人列表 |
| **联系人搜索列表** | `redirectTo` | `ChatUIKit/modules/Chat/page?id=xxx&type=singleChat` | 返回联系人列表（关闭搜索页） |
| **群列表** | `navigateTo` | `ChatUIKit/modules/Chat/page?type=groupChat&id=xxx` | `navigateBack` 返回群列表 |
| **创建群组** | `redirectTo` | `ChatUIKit/modules/Chat/page?type=groupChat&id=xxx` | 返回群列表（关闭创建页） |
| **新建会话** | `redirectTo` | `ChatUIKit/modules/Chat/page?type=singleChat&id=xxx` | 返回上一级 |

**关键说明：**
- 大部分跳转使用 `uni.navigateTo`，返回时使用 `uni.navigateBack` 可以正确返回上一级页面
- 搜索、创建群组等临时页面使用 `redirectTo`（关闭当前页跳转），返回时直接回到列表页
- 聊天页面顶部的返回按钮已内置 `navigateBack` 逻辑
- 无需手动处理返回逻辑，UIKit 已完整实现

---

### 方式二：自定义聊天页面

如果你需要自定义页面逻辑或样式，可以手动创建聊天页面。

#### 1. 创建页面文件

创建 `pages/chat/index.vue`：

> **重要说明：** 聊天组件依赖 `currentConversation` 状态来发送消息。必须在 `onLoad` 中调用 `SET_CURRENT_CONVERSATION` mutation 设置当前会话，否则会导致发送消息失败。

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
    // 支持两种参数格式：
    // 1. 从联系人/群组列表进入：?type=singleChat&id=xxx
    // 2. 从会话列表进入：?conversationType=singleChat&conversationId=xxx
    this.conversationType = options.type || options.conversationType
    this.conversationId = options.id || options.conversationId
    
    // 必须设置 currentConversation，否则发送消息时会报错
    if (this.conversationId) {
      this.$store.commit('conversation/SET_CURRENT_CONVERSATION', {
        conversationId: this.conversationId,
        conversationType: this.conversationType
      })
    } else {
      console.error('[ChatPage] conversationId is empty!')
      uni.showToast({ title: '会话ID不能为空', icon: 'none' })
    }
  },
  
  onUnload() {
    // 清理状态
    this.$store.dispatch('message/setQuoteMessage', null)
    this.$store.dispatch('message/setEditingMessage', null)
    this.$store.commit('conversation/SET_CURRENT_CONVERSATION', null)
  }
}
</script>

<style scoped>
.chat-page {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
```

#### 2. 配置页面路由

```json
{
  "pages": [
    {
      "path": "pages/chat/index",
      "style": { "navigationStyle": "custom" }
    }
  ]
}
```

#### 参数说明

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `type` / `conversationType` | string | 会话类型：`singleChat`（单聊）或 `groupChat`（群聊）|
| `id` / `conversationId` | string | 会话ID：单聊为用户ID，群聊为群组ID |

#### 路由跳转与返回机制

使用自定义页面时，你需要确保从各个入口正确跳转到聊天页面：

**从会话列表跳转：**
```javascript
uni.navigateTo({
  url: `/pages/chat/index?conversationType=${conversationType}&conversationId=${conversationId}`
})
```

**从联系人列表跳转：**
```javascript
uni.navigateTo({
  url: `/pages/chat/index?type=singleChat&id=${userId}`
})
```

**从群列表跳转：**
```javascript
uni.navigateTo({
  url: `/pages/chat/index?type=groupChat&id=${groupId}`
})
```

**返回处理：**
聊天页面顶部返回按钮应调用 `uni.navigateBack()` 返回上一级：
```javascript
methods: {
  onBack() {
    uni.navigateBack()
  }
}
```

#### 常见问题

**问题1：进入聊天页面后发送消息报错 `Cannot read properties of null (reading 'conversationId')`**

**原因**：`onLoad` 中没有正确设置 `currentConversation`，或者 `conversationId` 参数为空。

**解决方案**：
1. 检查跳转 URL 是否正确传递了 `type`/`id` 或 `conversationType`/`conversationId` 参数
2. 确保在 `onLoad` 中调用了 `SET_CURRENT_CONVERSATION` mutation
3. 添加调试日志检查参数是否正确接收

**问题2：从聊天页面返回时无法正确返回上一级**

**原因**：可能使用了 `redirectTo` 或 `switchTab` 跳转，或者页面栈已清空。

**解决方案**：
1. 确保使用 `uni.navigateTo` 跳转到聊天页面（保留页面栈）
2. 确保聊天页面的返回按钮调用 `uni.navigateBack()`
3. 避免在跳转到聊天页面前使用 `redirectTo` 或 `reLaunch`

---

## 第七步：运行项目

> ⚠️ **平台兼容性说明**：当前版本仅确保 **H5**、**UniApp App (Android/iOS)** 和 **微信小程序** 的兼容性，其他平台（如支付宝小程序、百度小程序等）不做特别兼容测试。

### 运行到浏览器 (H5)

1. 在 HBuilderX 中点击「运行」→「运行到浏览器」→「Chrome」或其他浏览器
2. 等待编译完成后，浏览器会自动打开预览

### 运行到微信小程序

1. 在 HBuilderX 中点击「运行」→「运行到小程序模拟器」→「微信开发者工具」
2. 在微信开发者工具中预览

### 运行到手机 App

1. 连接手机或启动模拟器
2. 在 HBuilderX 中点击「运行」→「运行到手机或模拟器」

---

## 常见问题

### 1. 提示 "util is not defined"

确保在 `main.js` 中添加了微信小程序的 Polyfill（见步骤 3.4）。

### 2. 联系人/会话列表为空

- 检查是否正确初始化 SDK
- 检查是否已登录
- 查看控制台是否有错误信息

### 3. 微信小程序编译报错

确保：
- `manifest.json` 中设置了 `"vueVersion": "2"`
- `manifest.json` 中设置了 `"usingComponents": true`

### 4. 头像显示异常

检查是否配置了正确的默认头像 URL，可在 `ChatUIKit/const/index.js` 中修改。

---

## 下一步

- 查看 [API 参考手册](./VUE2_API_REFERENCE.md) 了解详细的 API 使用
- 查看 [集成文档](./VUE2_INTEGRATION_GUIDE.md) 了解高级配置
- 参考 `vue2-demo` 目录下的完整示例

---

*本文档适用于 ChatUIKit Vue2 版本，最后更新于 2026-03-16*
