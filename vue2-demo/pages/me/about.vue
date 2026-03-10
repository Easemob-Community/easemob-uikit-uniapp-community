<template>
  <view class="about-wrap">
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="title">关于</view>
      </template>
    </NavBar>
    <view class="about-info-wrap">
      <Avatar
        class="about-avatar"
        src="https://uikit-demo.oss-cn-beijing.aliyuncs.com/demo-assets/app.png"
        :size="72"
      />
      <view class="name">环信 UIKIT</view>
      <view class="version">Version 1.0.0</view>
      <view class="version">SDK Version 4.11.0</view>
    </view>
    <view class="content">
      <view class="menu-wrap">
        <MenuItem
          class="about-menu"
          v-for="item in menus"
          :key="item.title"
          :title="item.title"
          @tap="onMenuTap(item)"
        >
          <template v-slot:left>
            <view class="left-content">
              <view class="sub-title">{{ item.title }}</view>
              <view class="link">{{ item.link }}</view>
            </view>
          </template>
        </MenuItem>
      </view>
    </view>
  </view>
</template>

<script>
import NavBar from '../../ChatUIKit/components/NavBar/index.vue'
import Avatar from '../../ChatUIKit/components/Avatar/index.vue'
import MenuItem from '../../ChatUIKit/components/MenuItem/index.vue'

export default {
  components: {
    NavBar,
    Avatar,
    MenuItem
  },
  
  data() {
    return {
      menus: [
        {
          title: '官方网站',
          link: 'www.easemob.com'
        },
        {
          title: '服务热线',
          link: '400-622-1776'
        },
        {
          title: '商务合作',
          link: 'bd@easemob.com'
        },
        {
          title: '渠道合作',
          link: 'qudao@easemob.com'
        },
        {
          title: '问题反馈',
          link: 'issue@easemob.com'
        }
      ]
    }
  },
  
  methods: {
    onBack() {
      uni.navigateBack()
    },
    
    onMenuTap(menu) {
      if (menu.title === '官方网站') {
        const url = 'https://www.easemob.com'
        // #ifdef APP-PLUS
        plus.runtime.openURL(url)
        // #endif
        // #ifdef H5
        window.open(url)
        // #endif
        // #ifdef MP-WEIXIN
        uni.showModal({
          title: '提示',
          content: '请复制链接在浏览器中打开：' + url,
          showCancel: false
        })
        // #endif
      } else {
        uni.setClipboardData({
          data: menu.link,
          success: () => {
            uni.showToast({ title: '已复制', icon: 'success' })
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.about-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #F9FAFA;
}

.title {
  font-size: 18px;
  font-weight: 500;
  color: #171A1C;
}

.about-info-wrap {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #F9FAFA;
  margin-top: 20px;
}

.content {
  margin-top: 54px;
}

.name {
  color: #171A1C;
  text-align: center;
  font-size: 16px;
  font-weight: 590;
  margin-top: 12px;
  margin-bottom: 5px;
}

.version {
  margin-top: 4px;
  display: flex;
  align-items: center;
  color: #ACB4B9;
  text-align: center;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
}

.menu-wrap {
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.about-menu {
  padding: 0 16px;
}

.left-content {
  display: flex;
  flex-direction: column;
}

.sub-title {
  color: #171A1C;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
}

.link {
  color: #009DFF;
  font-size: 14px;
  font-style: normal;
  font-weight: 510;
  margin-top: 2px;
}
</style>
