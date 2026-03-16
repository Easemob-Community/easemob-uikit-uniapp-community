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
npm install easemob-websdk vuex pinyin-pro easemob-uniapp-logger-plugin
```

---

## 第三步：集成 ChatUIKit

### 3.1 复制 UIKit 文件

将 `ChatUIKit-vue2` 目录复制到你的项目中：

```bash
# 假设你的项目目录是 my-uniapp-project
cp -r ChatUIKit-vue2 my-uniapp-project/ChatUIKit
```

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
import SDK from 'easemob-websdk'

// 替换为你的 App Key
const APP_KEY = 'your-app-key@your-org'

// 创建连接实例
const EMClient = new SDK.connection({
  appKey: APP_KEY,
  url: 'https://a1.easemob.com',
  apiUrl: 'https://a1.easemob.com',
  useOwnUploadFun: false,
  debug: true
})

export { EMClient, SDK as EMSDK }
```

### 3.4 修改 main.js

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
@import url("./common.scss");
</style>
```

---

## 第四步：创建登录页面

创建 `pages/login/index.vue`：

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
        v-model="password" 
        placeholder="密码" 
        password 
        class="input"
      />
      <button @click="login" class="btn">登录</button>
      <button @click="register" class="btn btn-register">注册</button>
    </view>
  </view>
</template>

<script>
import { EMClient } from '../../utils/IM'

export default {
  data() {
    return {
      username: '',
      password: ''
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
          pwd: this.password
        })
        uni.showToast({ title: '登录成功', icon: 'success' })
      } catch (error) {
        uni.showToast({ title: '登录失败', icon: 'none' })
      }
    },
    
    async register() {
      try {
        await EMClient.registerUser({
          username: this.username,
          password: this.password
        })
        uni.showToast({ title: '注册成功', icon: 'success' })
      } catch (error) {
        uni.showToast({ title: '注册失败', icon: 'none' })
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
.btn-register {
  background: #f0f0f0;
  color: #333;
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

---

## 第六步：创建聊天页面

创建 `pages/chat/index.vue`：

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
    
    if (this.conversationId) {
      this.$store.commit('conversation/SET_CURRENT_CONVERSATION', {
        conversationId: this.conversationId,
        conversationType: this.conversationType
      })
    }
  },
  
  onUnload() {
    this.$store.dispatch('message/setQuoteMessage', null)
    this.$store.dispatch('message/setEditingMessage', null)
    this.$store.commit('conversation/SET_CURRENT_CONVERSATION', null)
  }
}
</script>
```

---

## 第七步：运行项目

> ⚠️ **平台兼容性说明**：当前版本仅确保 **H5**、**UniApp App (Android/iOS)** 和 **微信小程序** 的兼容性，其他平台（如支付宝小程序、百度小程序等）不做特别兼容测试。

### 运行到浏览器 (H5)

```bash
npm run dev:h5
```

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
