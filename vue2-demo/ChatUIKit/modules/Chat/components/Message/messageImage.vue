<template>
  <view class="msg-image">
    <image
      :mode="mode"
      :style="{ width: styles.width, height: styles.height }"
      @error="onError"
      @tap="previewImage"
      @load="onImgLoad"
      class="image"
      :src="isError ? ImageNotFound : (msg.thumb || msg.url)"
    />
  </view>
</template>

<script>
import { ASSETS_URL } from '../../../../const/index.js'

const ImageNotFound = ASSETS_URL + 'img404.png'
const IMAGE_MAX_SIZE = 225

export default {
  name: 'ImageMessage',

  props: {
    msg: {
      type: Object,
      required: true
    },
    mode: {
      type: String,
      default: 'aspectFit'
    },
    width: {
      type: Number,
      default: 0
    },
    height: {
      type: Number,
      default: 0
    },
    disabledPreview: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      ImageNotFound,
      isError: false,
      styles: {
        width: this.width ? `${this.width}px` : 'auto',
        height: this.height ? `${this.height}px` : `${IMAGE_MAX_SIZE}px`
      }
    }
  },

  methods: {
    onError() {
      this.isError = true
    },

    previewImage() {
      if (this.isError || this.disabledPreview) {
        return
      }
      uni.previewImage({
        urls: [this.msg.url || '']
      })
    },

    genImageStyles({ width, height }) {
      if (width === 0 || height === 0) {
        return
      }
      let imageWidth = 0
      let imageHeight = 0
      if (width > height) {
        imageWidth = IMAGE_MAX_SIZE
        imageHeight = (IMAGE_MAX_SIZE * height) / width
      } else {
        imageWidth = (IMAGE_MAX_SIZE * width) / height
        imageHeight = IMAGE_MAX_SIZE
      }
      this.styles.width = imageWidth + 'px'
      this.styles.height = imageHeight + 'px'
    },

    onImgLoad(e) {
      if (this.width || this.height) {
        return
      }
      this.genImageStyles(e.detail)
    }
  }
}
</script>

<style lang="scss" scoped>
.image {
  border-radius: 4px;
}
</style>
