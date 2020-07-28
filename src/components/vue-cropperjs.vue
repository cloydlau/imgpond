<template>
  <div>
    <div class="content">
      <section class="cropper-area">
        <div class="img-cropper">
          <vue-cropper ref="cropper"
                       :src="imgSrc"
                       :containerStyle="containerStyle"
                       preview=".preview"
                       :minContainerHeight="500"
                       background
                       :ready="onReady"
                       :cropmove="onCropmove"
          />
        </div>
        <div class="actions">
          <div style="height: 80px;display: flex;align-items: flex-end;justify-content: center;">
            <el-button-group>
              <el-button @click.prevent="zoom(0.2)" icon="el-icon-zoom-in"/>
              <el-button @click.prevent="zoom(-0.2)" icon="el-icon-zoom-out"/>
              <el-button @click.prevent="move(-10, 0)" icon="el-icon-arrow-left"/>
              <el-button @click.prevent="move(10, 0)" icon="el-icon-arrow-right"/>
              <el-button @click.prevent="move(0, -10)" icon="el-icon-arrow-up"/>
              <el-button @click.prevent="move(0, 10)" icon="el-icon-arrow-down"/>
              <el-button @click.prevent="rotate(90)" icon="el-icon-refresh-right"/>
              <el-button @click.prevent="rotate(-90)" icon="el-icon-refresh-left"/>
              <el-button ref="flipX" @click.prevent="flipX" class="flipX" icon="el-icon-sort"/>
              <el-button ref="flipY" @click.prevent="flipY" icon="el-icon-sort"/>
              <el-button type="info" @click.prevent="reset" icon="el-icon-refresh"/>
            </el-button-group>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import 'cropperjs/dist/cropper.css'
import VueCropper from 'vue-cropperjs'
import { warn } from 'plain-kit'
import { file2Base64 } from '../utils'

export default {
  props: {
    file: File,
    aspectRatio: {
      type: [Array, Number],
      default: NaN
    },
    fixedRatioText: String
  },
  components: {
    VueCropper,
  },
  data () {
    return {
      untouched: true,
      imgSrc: '',
      containerStyle: {
        height: '500px',
      }
    }
  },
  created () {
    this.fileToBase64()
  },
  watch: {
    file (newValue, oldValue) {
      this.fileToBase64()
    }
  },
  methods: {
    onCropmove () {
      this.untouched = false
    },
    onReady () {
      const { width, height, left, top } = this.$refs.cropper.getCanvasData()
      if (this.aspectRatio && typeof this.aspectRatio === 'number') {
        this.$refs.cropper.setAspectRatio(this.aspectRatio)

        //默认裁剪框在图片之内（避免裁剪出白边），也可以放大以完全框住图片（避免遗漏信息）
        const { width: containerWidth, height: containerHeight } = this.$refs.cropper.getContainerData()
        const { width: cropBoxWidth, height: cropBoxHeight } = this.$refs.cropper.getCropBoxData()
        const originalRatio = width / height
        if (this.aspectRatio > originalRatio) {
          this.$refs.cropper.setCropBoxData({ width, left })
          this.$refs.cropper.setCropBoxData({ top: (containerHeight - cropBoxHeight) / 2 })
        } else {
          this.$refs.cropper.setCropBoxData({ height, top })
          this.$refs.cropper.setCropBoxData({ left: (containerWidth - cropBoxWidth) / 2 })
        }
      } else {
        this.$refs.cropper.setCropBoxData({ width, height, left, top })
      }
    },
    fileToBase64 () {
      if (this.file) {
        file2Base64(this.file, base64 => {
          this.imgSrc = base64
          this.$refs.cropper.replace(base64)
        })
      } else {
        this.imgSrc = ''
      }
    },
    cropImage () {
      if (this.aspectRatio instanceof Array) {
        const { width, height } = this.$refs.cropper.getCropBoxData()
        const aspectRatio = width / height
        if (aspectRatio < this.aspectRatio[0] || aspectRatio > this.aspectRatio[1]) {
          warn('请将图片宽高比调整为' + this.fixedRatioText)
          this.$emit('stopCrop')
          return
        }
      }

      this.$refs.cropper.getCroppedCanvas().toBlob(blob => {
        console.log('【裁剪后】', blob)
        this.$emit('stopCrop', blob)
      }, this.file.type) //第三个参数为质量 默认＜1
    },
    flipX () {
      const dom = this.$refs.flipX.$el
      let scale = dom.getAttribute('data-scale')
      scale = scale ? -scale : -1
      this.$refs.cropper.scaleX(scale)
      dom.setAttribute('data-scale', scale)
    },
    flipY () {
      const dom = this.$refs.flipY.$el
      let scale = dom.getAttribute('data-scale')
      scale = scale ? -scale : -1
      this.$refs.cropper.scaleY(scale)
      dom.setAttribute('data-scale', scale)
    },
    getCropBoxData () {
      this.data = JSON.stringify(this.$refs.cropper.getCropBoxData(), null, 4)
    },
    getData () {
      this.data = JSON.stringify(this.$refs.cropper.getData(), null, 4)
    },
    move (offsetX, offsetY) {
      this.$refs.cropper.move(offsetX, offsetY)
    },
    reset () {
      this.$refs.cropper.reset()
      this.onReady()
      this.untouched = true
    },
    rotate (deg) {
      this.$refs.cropper.rotate(deg)
    },
    setCropBoxData () {
      if (!this.data) return
      this.$refs.cropper.setCropBoxData(JSON.parse(this.data))
    },
    setData () {
      if (!this.data) return
      this.$refs.cropper.setData(JSON.parse(this.data))
    },
    setImage (e) {
      const file = e.target.files[0]
      if (file.type.indexOf('image/') === -1) {
        alert('Please select an image file')
        return
      }
      if (typeof FileReader === 'function') {
        const reader = new FileReader()
        reader.onload = (event) => {
          this.imgSrc = event.target.result
          // rebuild cropperjs with the updated source
          this.$refs.cropper.replace(event.target.result)
        }
        reader.readAsDataURL(file)
      } else {
        alert('Sorry, FileReader API not supported')
      }
    },
    showFileChooser () {
      this.$refs.input.click()
    },
    zoom (percent) {
      this.$refs.cropper.relativeZoom(percent)
    },
  },
}
</script>

<style scoped>

</style>

<style>
.flipX > .el-icon-sort {
  transform: rotate(90deg);
}

.cropper-point {
  width: 8px !important;
  height: 8px !important;
  border-radius: 50%;
}
</style>
