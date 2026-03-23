# Vue2 ChatUIKit 文档中心

> 欢迎使用环信 ChatUIKit Vue2 版本！这里包含了完整的集成文档、API 参考和示例代码。

## 📚 文档列表

| 文档 | 说明 | 适合人群 |
|------|------|----------|
| [VUE2_QUICK_START.md](./VUE2_QUICK_START.md) | 15 分钟快速上手 | 初次使用 |
| [VUE2_INTEGRATION_GUIDE.md](./VUE2_INTEGRATION_GUIDE.md) | 完整集成指南 | 项目开发者 |
| [VUE2_API_REFERENCE.md](./VUE2_API_REFERENCE.md) | 详细 API 文档 | 进阶开发者 |
| [VUE2_ARCHITECTURE.md](./VUE2_ARCHITECTURE.md) | 架构设计说明 | 架构师/贡献者 |

## 🚀 快速开始

### 1. 环境准备

- [Node.js](https://nodejs.org/) 16+
- [HBuilderX](https://www.dcloud.io/hbuilderx.html) 3.6+
- 环信应用 App Key ([注册](https://www.easemob.com/))

### 2. 安装依赖

```bash
npm install easemob-websdk vuex pinyin-pro
```

### 3. 复制 ChatUIKit

```bash
# 注意：请确保在 UniApp 项目根目录（与 pages 同级）执行

# 如果 ChatUIKit 目录已存在，先删除旧版本
rm -rf your-project/ChatUIKit

# 复制 UIKit
cp -r ChatUIKit-vue2 your-project/ChatUIKit
```

### 4. 初始化代码

```javascript
// main.js
import ChatUIKit, { store } from './ChatUIKit'
import { t, i18n } from './ChatUIKit/locales'

i18n.init()
Vue.prototype.$ChatUIKit = ChatUIKit
Vue.prototype.$t = t

new Vue({ store, ...App }).$mount()
```

### 5. 配置页面

```json
// pages.json
{
  "pages": [
    { "path": "pages/login/index" },
    { "path": "ChatUIKit/modules/Conversation/index" },
    { "path": "ChatUIKit/modules/ContactList/index" },
    { "path": "pages/chat/index" }
  ],
  "tabBar": {
    "list": [
      { "pagePath": "ChatUIKit/modules/Conversation/index" },
      { "pagePath": "ChatUIKit/modules/ContactList/index" }
    ]
  }
}
```

详细步骤请查看 [快速上手指南](./VUE2_QUICK_START.md)。

## 📦 项目结构

```
ChatUIKit-vue2/
├── index.js              # ChatUIKit 主类
├── components/           # 通用组件
├── modules/              # 业务模块
│   ├── Chat/            # 聊天
│   ├── Conversation/    # 会话列表
│   ├── ContactList/     # 联系人
│   └── ...
├── stores/               # Vuex Store
├── locales/              # 国际化
├── utils/                # 工具函数
└── styles/               # 公共样式
```

## 🎯 核心功能

- ✅ **即时消息**: 文本、图片、语音、视频、文件、自定义消息
- ✅ **会话管理**: 置顶、删除、免打扰、未读数
- ✅ **联系人**: 添加、删除、黑名单、好友申请
- ✅ **群组**: 群组列表、创建群组
- ✅ **用户属性**: 头像、昵称、在线状态
- ✅ **消息操作**: 撤回、编辑、引用、转发
- ✅ **多平台**: H5、App、微信小程序
- ✅ **国际化**: 中英文支持

## 📖 常用 API

### 发送消息

```javascript
// 发送文本
this.$store.dispatch('message/sendTextMessage', {
  to: 'userId',
  chatType: 'singleChat',
  msg: 'Hello'
})

// 发送图片
this.$store.dispatch('message/sendImageMessage', {
  to: 'userId',
  file: fileObject
})
```

### 获取数据

```javascript
// 获取联系人
this.$store.dispatch('contact/getContactsFromServer')

// 获取会话
this.$store.dispatch('conversation/getServerConversations')

// 获取用户信息
const userInfo = this.$store.getters['appUser/getUserInfo'](userId)
```

### 监听事件

```javascript
// 监听新消息
uni.$on('chatOnNewMessage', (msg) => {
  console.log('新消息:', msg)
})

// 监听登录成功
uni.$on('chatLoginSuccess', () => {
  uni.switchTab({ url: '/ChatUIKit/modules/Conversation/index' })
})
```

完整 API 列表请查看 [API 参考手册](./VUE2_API_REFERENCE.md)。

## 🔧 多平台适配

### H5 / App

```vue
<IndexedList :options="list">
  <template v-slot:indexedItem="{ item }">
    <UserItem :user="item" />
  </template>
</IndexedList>
```

### 微信小程序

```vue
<!-- #ifdef MP-WEIXIN -->
<scroll-view scroll-y>
  <UserItem v-for="item in list" :key="item.id" :user="item" />
</scroll-view>
<!-- #endif -->
```

## 🐛 常见问题

**Q: 微信小程序提示 "util is not defined"**

A: 确保在 `main.js` 中添加了 Polyfill，详见 [集成指南](./VUE2_INTEGRATION_GUIDE.md) 的 "项目配置" 章节。

**Q: 联系人列表不显示**

A: 检查：
1. ChatUIKit 是否已初始化
2. 用户是否已登录
3. 是否有正确的页面生命周期调用

**Q: 如何自定义主题颜色？**

A: 修改 `ChatUIKit/styles/common.scss` 中的变量。

更多问题请查看 [集成指南 - 常见问题](./VUE2_INTEGRATION_GUIDE.md#常见问题)。

## 📁 示例项目

参考 `vue2-demo` 目录下的完整示例，包含：

- 登录/注册页面
- TabBar 导航（会话、联系人）
- 聊天页面
- 群组列表、创建群组
- 个人中心

## 🔄 从 Vue3 迁移

| Vue3 (Pinia) | Vue2 (Vuex) |
|--------------|-------------|
| `useConversationStore()` | `this.$store` |
| `conversationStore.getConversationList` | `this.$store.getters['conversation/getConversationList']` |
| `conversationStore.getServerConversations()` | `this.$store.dispatch('conversation/getServerConversations')` |

## 🤝 贡献指南

欢迎提交 Issue 和 PR！

1. Fork 本仓库
2. 创建你的分支 (`git checkout -b feature/xxx`)
3. 提交更改 (`git commit -am 'Add xxx'`)
4. 推送到分支 (`git push origin feature/xxx`)
5. 创建 Pull Request

## 📞 技术支持

- **官方文档**: https://docs.easemob.com/
- **GitHub**: https://github.com/Easemob-Community/easemob-uikit-uniapp-community
- **问题反馈**: [GitHub Issues](https://github.com/Easemob-Community/easemob-uikit-uniapp-community/issues)

## 📄 许可证

[MIT License](./LICENSE)

---

*本文档适用于 ChatUIKit Vue2 版本，最后更新于 2026-03-16*
