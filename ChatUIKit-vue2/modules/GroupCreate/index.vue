<template>
  <view class="group-create">
    <!-- 步骤1：选择成员 -->
    <view v-if="step === 1" class="step-container">
      <SearchList
        @onCreateGroup="onMembersSelected"
        @onCancel="onCancel"
      />
    </view>
    
    <!-- 步骤2：设置群信息 -->
    <view v-else-if="step === 2" class="step-container">
      <view class="group-form">
        <!-- 群头像 -->
        <view class="form-item avatar-item">
          <text class="label">{{ $t('groupCreate.avatar') }}</text>
          <view class="avatar-upload" @tap="chooseAvatar">
            <image 
              v-if="groupForm.avatar" 
              class="avatar-img" 
              :src="groupForm.avatar" 
              mode="aspectFill"
            />
            <text v-else class="upload-placeholder">+</text>
          </view>
        </view>
        
        <!-- 群名称 -->
        <view class="form-item">
          <text class="label">{{ $t('groupCreate.name') }}</text>
          <input 
            class="input"
            v-model="groupForm.name"
            :placeholder="$t('groupCreate.namePlaceholder')"
            maxlength="32"
          />
        </view>
        
        <!-- 群介绍 -->
        <view class="form-item">
          <text class="label">{{ $t('groupCreate.description') }}</text>
          <textarea 
            class="textarea"
            v-model="groupForm.description"
            :placeholder="$t('groupCreate.descPlaceholder')"
            maxlength="200"
          />
        </view>
        
        <!-- 群类型 -->
        <view class="form-item">
          <text class="label">{{ $t('groupCreate.type') }}</text>
          <view class="radio-group">
            <view 
              class="radio-item"
              :class="{ active: groupForm.type === 'public' }"
              @tap="groupForm.type = 'public'"
            >
              <text class="radio-circle">{{ groupForm.type === 'public' ? '●' : '○' }}</text>
              <text class="radio-label">{{ $t('groupCreate.public') }}</text>
            </view>
            <view 
              class="radio-item"
              :class="{ active: groupForm.type === 'private' }"
              @tap="groupForm.type = 'private'"
            >
              <text class="radio-circle">{{ groupForm.type === 'private' ? '●' : '○' }}</text>
              <text class="radio-label">{{ $t('groupCreate.private') }}</text>
            </view>
          </view>
        </view>
        
        <!-- 邀请确认 -->
        <view class="form-item switch-item">
          <text class="label">{{ $t('groupCreate.needConfirm') }}</text>
          <switch 
            :checked="groupForm.needConfirm"
            @change="e => groupForm.needConfirm = e.detail.value"
            color="#009dff"
          />
        </view>
        
        <!-- 已选成员 -->
        <view class="form-item members-item">
          <text class="label">{{ $t('groupCreate.members', { count: selectedMembers.length }) }}</text>
          <view class="members-preview">
            <view 
              v-for="member in selectedMembers.slice(0, 6)" 
              :key="member.userId"
              class="member-tag"
            >
              {{ member.nickname || member.userId }}
            </view>
            <text v-if="selectedMembers.length > 6" class="more-members">
              +{{ selectedMembers.length - 6 }}
            </text>
          </view>
        </view>
      </view>
      
      <!-- 底部按钮 -->
      <view class="form-actions">
        <button class="btn btn-secondary" @tap="step = 1">{{ $t('groupCreate.previous') }}</button>
        <button 
          class="btn btn-primary" 
          :disabled="!canSubmit"
          :loading="creating"
          @tap="createGroup"
        >
          {{ $t('groupCreate.create') }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import SearchList from './searchList.vue'
import { mapState } from 'vuex'

export default {
  name: 'GroupCreate',
  
  components: {
    SearchList
  },
  
  data() {
    return {
      step: 1,
      selectedMembers: [],
      groupForm: {
        name: '',
        description: '',
        avatar: '',
        type: 'public', // public | private
        needConfirm: true
      },
      creating: false
    }
  },
  
  computed: {
    ...mapState('appUser', {
      userInfo: state => state.userInfos
    }),
    
    canSubmit() {
      return this.groupForm.name.trim().length > 0 && !this.creating
    }
  },
  
  methods: {
    // 成员选择完成
    onMembersSelected(data) {
      this.selectedMembers = data.memberDetails || []
      // 默认群名
      if (!this.groupForm.name) {
        const myName = this.userInfo?.nickname || this.userInfo?.userId || '我'
        this.groupForm.name = `${myName}创建的群`
      }
      this.step = 2
    },
    
    // 选择头像
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0]
          // 上传头像
          this.uploadAvatar(tempFilePath)
        }
      })
    },
    
    // 上传头像
    uploadAvatar(filePath) {
      uni.showLoading({ title: $t('common.uploading') })
      
      // 这里应该调用 SDK 上传文件
      // 暂时使用本地路径作为演示
      setTimeout(() => {
        this.groupForm.avatar = filePath
        uni.hideLoading()
      }, 500)
    },
    
    // 创建群组
    createGroup() {
      if (!this.canSubmit) return
      
      this.creating = true
      uni.showLoading({ title: $t('common.creating') })
      
      const memberIds = this.selectedMembers.map(m => m.userId)
      
      const groupData = {
        name: this.groupForm.name.trim(),
        description: this.groupForm.description.trim(),
        avatar: this.groupForm.avatar,
        type: this.groupForm.type,
        needConfirm: this.groupForm.needConfirm,
        members: memberIds
      }
      
      this.$store.dispatch('group/createGroup', groupData)
        .then((group) => {
          uni.hideLoading()
          uni.showToast({
            title: $t('common.success'),
            icon: 'success'
          })
          
          // 跳转到群聊页面
          setTimeout(() => {
            uni.redirectTo({
              url: `/pages/chat/index?type=groupChat&id=${group.groupId}`
            })
          }, 1500)
        })
        .catch((error) => {
          uni.hideLoading()
          this.creating = false
          uni.showToast({
            title: error.message || $t('common.error'),
            icon: 'none'
          })
        })
    },
    
    // 取消创建
    onCancel() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.group-create {
  height: 100vh;
  background-color: #f5f5f5;
}

.step-container {
  height: 100%;
}

// 表单样式
.group-form {
  padding: 12px;
}

.form-item {
  display: flex;
  align-items: flex-start;
  background-color: #fff;
  padding: 12px 16px;
  margin-bottom: 1px;
  
  &.avatar-item {
    align-items: center;
  }
  
  &.switch-item {
    justify-content: space-between;
    align-items: center;
  }
  
  &.members-item {
    flex-direction: column;
    
    .label {
      margin-bottom: 10px;
    }
  }
}

.label {
  width: 80px;
  font-size: 14px;
  color: #333;
  flex-shrink: 0;
}

.avatar-upload {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.upload-placeholder {
  font-size: 24px;
  color: #999;
}

.input {
  flex: 1;
  font-size: 14px;
  color: #333;
  height: 24px;
}

.textarea {
  flex: 1;
  font-size: 14px;
  color: #333;
  height: 60px;
  line-height: 1.5;
}

.radio-group {
  display: flex;
  gap: 24px;
}

.radio-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  
  &.active {
    .radio-circle {
      color: #009dff;
    }
    .radio-label {
      color: #333;
    }
  }
}

.radio-circle {
  font-size: 16px;
  color: #999;
  margin-right: 6px;
}

.radio-label {
  font-size: 14px;
  color: #666;
}

.members-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.member-tag {
  background-color: #f0f0f0;
  color: #666;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.more-members {
  font-size: 12px;
  color: #999;
  padding: 4px 8px;
}

// 底部按钮
.form-actions {
  display: flex;
  gap: 12px;
  padding: 16px;
  margin-top: 20px;
}

.btn {
  flex: 1;
  height: 44px;
  border-radius: 6px;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #666;
  
  &:active {
    background-color: #e5e5e5;
  }
}

.btn-primary {
  background-color: #009dff;
  color: #fff;
  
  &[disabled] {
    background-color: #ccc;
    color: #fff;
  }
  
  &:active:not([disabled]) {
    opacity: 0.9;
  }
}
</style>
