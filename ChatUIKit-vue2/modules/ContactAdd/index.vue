<template>
  <view>
    <NavBar @onLeftTap="onBack">
      <template v-slot:left>
        <view class="title">添加联系人</view>
      </template>
    </NavBar>
    <view class="content">
      <view class="input-wrap">
        <input
          class="input"
          focus="true"
          v-model="userId"
          placeholder="请输入用户ID"
        />
      </view>
      <view class="btn-wrap">
        <UIKITButton :disabled="!userId.length" @tap="addContact">
          添加
        </UIKITButton>
      </view>
    </view>
  </view>
</template>

<script>
import NavBar from '../../components/NavBar'
import UIKITButton from '../../components/Button'

export default {
  name: 'ContactAdd',
  
  components: {
    NavBar,
    UIKITButton
  },
  
  data() {
  return {
      userId: ''
    }
  },
  
  methods: {
    onBack() {
      uni.navigateBack()
    },
    
    async addContact() {
      if (!this.userId.length) {
        return
      }
      try {
        await this.$store.dispatch('contact/addContact', this.userId)
        uni.showToast({
          title: '添加成功',
          icon: 'none'
        })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } catch (error) {
        uni.showToast({
          title: '添加失败',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  color: #171a1c;
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
}

.content {
  margin: 30px;
}

.input-wrap {
  display: flex;
  padding: 13px 16px;
  align-items: center;
  border-radius: 4px;
  background: #f1f2f3;
}

.input {
  width: 100%;
  font-size: 16px;
}

.btn-wrap {
  margin-top: 24px;
}
</style>
