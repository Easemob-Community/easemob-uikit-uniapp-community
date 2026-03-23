# 环信 ChatUIKit for UniApp - Vue2 版本

<p align="center">
  基于 Vue2 + Vuex 的环信即时通讯 UIKit，支持 H5、App、微信小程序
</p>


---

## 📖 文档导航

| 文档 | 说明 | 适合人群 |
|:------|:------|:----------|
| **[VUE2_QUICK_START.md](./VUE2_QUICK_START.md)** | 15 分钟快速上手指南 | ⭐ 初次使用 |
| **[VUE2_INTEGRATION_GUIDE.md](./VUE2_INTEGRATION_GUIDE.md)** | 完整集成指南 | 项目开发者 |
| **[VUE2_API_REFERENCE.md](./VUE2_API_REFERENCE.md)** | 详细 API 参考 | 进阶开发者 |
| **[VUE2_ARCHITECTURE.md](./VUE2_ARCHITECTURE.md)** | 架构设计说明 | 架构师/贡献者 |

---

## ✨ 特性

- ✅ **开箱即用**: 提供完整的聊天界面组件，一行代码集成
- ✅ **多平台支持**: 一套代码，同时支持 H5、App、微信小程序
- ✅ **功能丰富**: 单聊、群聊、消息类型（文本/图片/语音/视频/文件）
- ✅ **状态管理**: 基于 Vuex 的模块化状态管理
- ✅ **国际化**: 内置中英文语言包

---

## 🚀 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) 16+
- [HBuilderX](https://www.dcloud.io/hbuilderx.html) 3.6+
- 环信应用 App Key ([免费注册](https://www.easemob.com/))

### 安装依赖

```bash
npm install easemob-websdk vuex pinyin-pro
```

### 复制 ChatUIKit

```bash
# 注意：请确保在 UniApp 项目根目录（与 pages 同级）执行

# 如果 ChatUIKit 目录已存在，先删除旧版本
rm -rf your-project/ChatUIKit

# 复制 UIKit
cp -r ChatUIKit-vue2 your-project/ChatUIKit
```

### 初始化

```javascript
// main.js
import Vue from 'vue'
import ChatUIKit, { store } from './ChatUIKit'
import { t, i18n } from './ChatUIKit/locales'

i18n.init()
Vue.prototype.$ChatUIKit = ChatUIKit
Vue.prototype.$t = t

new Vue({ store, ...App }).$mount()
```

详细步骤请查看 **[快速上手指南](./VUE2_QUICK_START.md)**。

---

## 📂 项目结构

```
├── ChatUIKit-vue2/          # ChatUIKit Vue2 源码
│   ├── components/          # 通用组件（Avatar、IndexedList 等）
│   ├── modules/             # 业务模块（Chat、Conversation、ContactList 等）
│   ├── stores/              # Vuex Store 模块
│   ├── locales/             # 国际化
│   └── index.js             # ChatUIKit 主类
│
├── vue2-demo/               # 完整示例项目
│   ├── pages/               # 页面
│   ├── ChatUIKit/           # 复制的 ChatUIKit（通过脚本同步）
│   └── manifest.json        # 应用配置
│
├── VUE2_QUICK_START.md      # 快速上手指南
├── VUE2_INTEGRATION_GUIDE.md # 完整集成指南
├── VUE2_API_REFERENCE.md    # API 参考手册
├── VUE2_ARCHITECTURE.md     # 架构设计说明
└── copy-chat-uikit-vue2.js  # 同步脚本
```

---

## 🎯 核心功能

| 功能 | 说明 |
|------|------|
| 💬 **即时消息** | 文本、图片、语音、视频、文件、自定义消息 |
| 📋 **会话管理** | 置顶、删除、免打扰、未读数、草稿 |
| 👥 **联系人** | 添加、删除、黑名单、好友申请处理 |
| 🏘️ **群组** | 群组列表、创建群组 |
| 👤 **用户属性** | 头像、昵称、在线状态（Presence）|
| 🔧 **消息操作** | 撤回、编辑、引用 |

---

## 💻 示例项目

位于 `vue2-demo/` 目录，包含完整功能：

- ✅ 登录/注册页面
- ✅ TabBar 导航（会话、联系人、我的）
- ✅ 聊天页面（单聊/群聊）
- ✅ 群组管理（列表、创建）
- ✅ 联系人管理（列表、添加、申请列表）
- ✅ 个人中心（资料编辑、设置）

**运行示例：**

```bash
cd vue2-demo
npm install
# 在 HBuilderX 中运行到浏览器或小程序
```

---

## 📘 常用 API

### 发送消息

```javascript
// 发送文本消息
this.$store.dispatch('message/sendTextMessage', {
  to: 'userId',
  chatType: 'singleChat',
  msg: 'Hello World'
})
```

### 获取数据

```javascript
// 获取联系人列表
this.$store.dispatch('contact/getContactsFromServer')

// 获取用户信息
const userInfo = this.$store.getters['appUser/getUserInfo'](userId)
```

### 监听事件

```javascript
// 监听新消息
uni.$on('chatOnNewMessage', (msg) => {
  console.log('新消息:', msg)
})
```

更多 API 请查看 **[API 参考手册](./VUE2_API_REFERENCE.md)**。

---

## 🛠️ 开发指南

### 同步 ChatUIKit 到 demo

当修改了 `ChatUIKit-vue2/` 源码后，运行同步脚本：

```bash
node copy-chat-uikit-vue2.js
```

### 自定义主题

修改 `ChatUIKit-vue2/styles/common.scss`：

```scss
$primary-color: #00a4fd;      // 主题色
$text-color: #171a1c;         // 文字颜色
$bg-color: #f9fafa;           // 背景色
```

### 添加新语言

1. 在 `ChatUIKit-vue2/locales/lang/` 创建语言文件
2. 在 `ChatUIKit-vue2/locales/index.js` 中注册

---

## 📱 平台兼容性

> ⚠️ **注意**：当前版本仅确保以下平台兼容性，其他平台（如支付宝小程序、百度小程序、字节跳动小程序等）不做特别兼容测试。

| 平台 | 支持情况 | 说明 |
|------|:--------:|------|
| H5 | ✅ | 推荐使用 Chrome 浏览器 |
| UniApp App (Android/iOS) | ✅ | 完整支持 |
| 微信小程序 | ✅ | 需注意 Vue2 slot 限制 |
| 支付宝小程序 | ⚠️ | 未测试 |
| 百度小程序 | ⚠️ | 未测试 |
| 字节跳动小程序 | ⚠️ | 未测试 |

**小程序注意事项：**
Vue2 在小程序中对 scoped slot 支持有限，相关组件已内置条件编译处理（`#ifdef MP-WEIXIN`），直接使用即可。

---

## 🐛 常见问题

**Q: 微信小程序提示 "util is not defined"**

A: 确保在 `main.js` 中添加了 Polyfill，详见 [集成指南](./VUE2_INTEGRATION_GUIDE.md)。

**Q: 联系人列表不显示**

A: 检查：1) ChatUIKit 是否初始化 2) 用户是否登录 3) 生命周期是否正确调用

**Q: 如何调试 SDK？**

A: 初始化时开启调试模式：
```javascript
this.$ChatUIKit.init({
  chat: EMClient,
  config: { isDebug: true }
})
```

更多问题请查看 [集成指南 - 常见问题](./VUE2_INTEGRATION_GUIDE.md#常见问题)。

---

## 🤝 贡献

欢迎提交 Issue 和 PR！

1. Fork 本仓库
2. 创建分支 (`git checkout -b feature/xxx`)
3. 提交更改 (`git commit -am 'Add xxx'`)
4. 推送分支 (`git push origin feature/xxx`)
5. 创建 Pull Request

---

## 📞 技术支持

- 📖 **官方文档**: https://doc.easemob.com/document/applet/uniapp.html
- 🐙 **GitHub**: https://github.com/Easemob-Community/easemob-uikit-uniapp-community
- 🐛 **问题反馈**: [GitHub Issues](https://github.com/Easemob-Community/easemob-uikit-uniapp-community/issues)

---

## 📄 许可证

[MIT License](./LICENSE)

---

<p align="center">
  Copyright © 2026 环信. All rights reserved.
</p>
