<template>
  <view class="msg-file" @tap="downloadFile">
    <view class="file-info">
      <view class="file-name">{{ fileName }}</view>
      <view class="file-size">{{ fileSize }}</view>
    </view>
    <view class="file-icon">
      <image class="icon-img" :src="FileIcon" />
    </view>
  </view>
</template>

<script>
import { ASSETS_URL } from '../../../../const/index.js'

const FileIcon = ASSETS_URL + 'icon/file.png'

export default {
  name: 'FileMessage',

  props: {
    msg: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      FileIcon
    }
  },

  computed: {
    fileName() {
      return this.msg.filename || (this.msg.body && this.msg.body.filename) || '未知文件'
    },

    fileSize() {
      const size = this.msg.file_length || (this.msg.body && this.msg.body.file_length) || 0
      if (size < 1024) {
        return size + ' B'
      } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(2) + ' KB'
      } else {
        return (size / (1024 * 1024)).toFixed(2) + ' MB'
      }
    },

    fileUrl() {
      return this.msg.url || (this.msg.body && this.msg.body.url)
    }
  },

  methods: {
    downloadFile() {
      const url = this.fileUrl
      if (!url) {
        uni.showToast({ title: '文件链接无效', icon: 'none' })
        return
      }

      // #ifdef H5
      window.open(url, '_blank')
      // #endif

      // #ifndef H5
      uni.downloadFile({
        url: url,
        success: (res) => {
          if (res.statusCode === 200) {
            uni.openDocument({
              filePath: res.tempFilePath,
              success: () => {
                console.log('打开文档成功')
              },
              fail: () => {
                uni.showToast({ title: '无法打开文件', icon: 'none' })
              }
            })
          }
        },
        fail: () => {
          uni.showToast({ title: '下载失败', icon: 'none' })
        }
      })
      // #endif
    }
  }
}
</script>

<style lang="scss" scoped>
.msg-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 220px;
  padding: 10px;
  background: #fff;
  border-radius: 4px;
}

.file-info {
  flex: 1;
  min-width: 0;
  margin-right: 10px;
}

.file-name {
  font-size: 14px;
  color: #171a1c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.file-size {
  font-size: 12px;
  color: #999;
}

.file-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-img {
  width: 48px;
  height: 48px;
}
</style>
