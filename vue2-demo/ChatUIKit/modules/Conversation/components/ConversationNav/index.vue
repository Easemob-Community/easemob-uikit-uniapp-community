<template>
  <view>
    <NavBar :showBackArrow="false">
      <template v-slot:left>
        <Avatar
          :size="32"
          :src="userInfo.avatar"
          :withPresence="true"
          :placeholder="USER_AVATAR_URL"
          :presenceExt="userInfo.presenceExt"
          :isOnline="userInfo.isOnline"
        />
      </template>
      <template v-slot:center>
        <view class="title"></view>
      </template>
      <template v-slot:right>
        <view class="btn-wrap">
          <!-- #ifndef MP-WEIXIN-->
          <view class="action-btn" @tap="isShowPopMenu = true"></view>
          <!-- #endif -->
        </view>
      </template>
    </NavBar>
    <!-- #ifdef MP-WEIXIN-->
    <view class="wx-btn-wrap">
      <view class="wx-btn" @tap="isShowPopMenu = true"></view>
    </view>
    <!-- #endif -->

    <PopMenu
      v-if="isShowPopMenu"
      :options="options"
      :popStyle="popMenuStyle"
      @menu-tap="handleMenuTap"
      @menu-close="isShowPopMenu = false"
    />
  </view>
</template>

<script>
import NavBar from '../../../../components/NavBar'
import Avatar from '../../../../components/Avatar'
import PopMenu from '../../../../components/PopMenu'

// 图标路径
// 静态资源路径（使用远程资源，和 Vue3 版本一致）
const ASSETS_URL = 'https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/'
const ChatMenuIcon = ASSETS_URL + 'icon/chat.png'
const AddContactMenuIcon = ASSETS_URL + 'icon/addContact.png'
const CreateGroupIcon = ASSETS_URL + 'icon/createGroup.png'
const USER_AVATAR_URL = ASSETS_URL + 'user.png'

export default {
  name: 'ConversationNav',
  
  components: {
    NavBar,
    Avatar,
    PopMenu
  },
  
  data() {
    return {
      isShowPopMenu: false,
      USER_AVATAR_URL,
      options: [
        {
          name: '新建会话',
          type: 'newConversation',
          icon: ChatMenuIcon
        },
        {
          name: '添加联系人',
          type: 'addContact',
          icon: AddContactMenuIcon
        },
        {
          name: '创建群组',
          type: 'createGroup',
          icon: CreateGroupIcon
        }
      ]
    }
  },
  
  computed: {
    isWXProgram() {
      try {
        return uni.getSystemInfoSync().uniPlatform === 'mp-weixin'
      } catch (e) {
        return false
      }
    },
    
    popMenuStyle() {
      if (this.isWXProgram) {
        return {
          right: '40px',
          bottom: 'calc(120px - var(--safe-area-inset-bottom))'
        }
      }
      return {
        right: '25px',
        top: 'calc(var(--status-bar-height) + 50px)'
      }
    },
    
    userInfo() {
      // 简化处理，从 store 获取
      return this.$store.state.appUser.selfUserInfo || {}
    }
  },
  
  methods: {
    handleMenuTap(params) {
      console.log('handleMenuTap called with type:', params.type)
      
      switch (params.type) {
        case 'newConversation':
          // 先关闭菜单再跳转
          this.isShowPopMenu = false
          this.$nextTick(() => {
            uni.navigateTo({
              url: '/ChatUIKit/modules/ChatNew/index',
              fail: (err) => {
                console.error('跳转到新建会话失败:', err)
                uni.showToast({ title: '页面跳转失败', icon: 'none' })
              }
            })
          })
          break
        case 'createGroup':
          console.log('开始跳转到创建群组页面')
          // 先关闭菜单再跳转
          this.isShowPopMenu = false
          this.$nextTick(() => {
            uni.navigateTo({
              url: '/ChatUIKit/modules/GroupCreate/index',
              success: () => {
                console.log('跳转到创建群组页面成功')
              },
              fail: (err) => {
                console.error('跳转到创建群组失败:', err)
                uni.showToast({ title: '页面跳转失败:' + err.errMsg, icon: 'none' })
              }
            })
          })
          break
        case 'addContact':
          // 先关闭菜单再跳转
          this.isShowPopMenu = false
          this.$nextTick(() => {
            uni.navigateTo({
              url: '/ChatUIKit/modules/ContactAdd/index',
              fail: (err) => {
                console.error('跳转到添加联系人失败:', err)
                uni.showToast({ title: '页面跳转失败', icon: 'none' })
              }
            })
          })
          break
        default:
          console.log('未知的菜单类型:', params.type)
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  width: 50px;
  height: 22px;
  background: url("https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/chat.png") no-repeat;
  background-size: 100% 100%;
}

.btn-wrap {
  display: flex;
  width: 32px;
  justify-content: flex-end;
}

.action-btn {
  width: 24px;
  height: 24px;
  background: url("https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/icon/plus.png") no-repeat;
  background-size: 100% 100%;
}

.wx-btn-wrap {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  bottom: 65px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(180deg, #009eff 0%, #334bff 100%);
  box-shadow: 8px 0px 24px 0px rgba(26, 26, 26, 0.1),
    0px 24px 36px 0px rgba(77, 77, 77, 0.15);
}

.wx-btn {
  width: 24px;
  height: 24px;
  background: url("https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/icon/wx_plus.png") no-repeat;
  background-size: 100% 100%;
}
</style>
