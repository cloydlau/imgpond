<template>
  <div>
    <PicViewer v-show="disabled"
               :value="files"
               ref="PicViewer"
               objectKey="source"
    />

    <div v-if="!disabled" :class="{'full': isFull}">
      <el-upload v-if="poweredBy==='element'"
                 ref="element-upload"
                 action="#"
                 :auto-upload="false"
                 list-type="picture-card"
                 :file-list="files"
                 :disabled="disabled"
                 :limit="Count"
                 :multiple="Count!==1"
                 :accept="formatList"
                 :on-change="element_onChange"
                 :on-preview="onActivatefile"
                 :on-remove="element_onRemove"
                 :on-exceed="onWarning"
                 :on-success="element_onSuccess"
                 :on-error="element_onError"
                 :http-request="element_httpRequest"
      >
        <i class="el-icon-plus"/>
        <div class="el-upload__text">{{ this.fixedRatioText ? '宽高比' + this.fixedRatioText : '' }}</div>
      </el-upload>

      <file-pond v-else
                 ref="filePond"
                 :label-idle="'点击上传'+(this.fixedRatioText?'（宽高比'+this.fixedRatioText+'）':'')"
                 :allowDrop="false"
                 :allowReorder="true"
                 :allowMultiple="Count!==1"
                 :accepted-file-types="Object.keys(format).join(', ')"
                 labelFileTypeNotAllowed="不支持的格式，请删除"
                 fileValidateTypeLabelExpectedTypes="仅支持{allButLastType}和{lastType}"
                 :fileValidateTypeLabelExpectedTypesMap="format"
                 :server="server"
                 :files="files"
                 :max-files="Count||null"
                 @init="handleFilePondInit"
                 :beforeAddFile="beforeAddFile"
                 :disabled="disabled"
                 @onaddfilestart="onAddFileStart"
                 styleItemPanelAspectRatio="1"
                 @updatefiles="onUpdateFiles"
                 :beforeRemoveFile="beforeRemoveFile"
                 :onwarning="onWarning"
                 @reorderfiles="emitChange"
                 @activatefile="onActivatefile"
      />

      <el-dialog title='图片编辑'
                 :visible.sync="cropper.show"
                 :close-on-click-modal="false"
                 :append-to-body="true"
                 destroy-on-close
                 @close="onCropperClose"
      >
        <Cropper ref="crop"
                 :file="cropper.file"
                 :aspectRatio="aspectRatio"
                 :fixedRatioText="fixedRatioText"
                 @stopCrop="stopCrop"/>
        <div slot="footer">
          <!--<el-switch
             v-model="compression.on"
             active-color="#13ce66"
             active-text="压缩"
             style="margin-right:1rem;">
          </el-switch>-->
          <el-button @click="closeCropper" v-text="'取 消'"/>
          <el-button type="primary" @click="confirm" v-text="'确 定'"/>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import Sortable from 'sortablejs'
import Cropper from './components/vue-cropperjs'
import {
  api,
  request,
  localProxy,
  proxy,
  sizeExceededWarningHTML,
  globalCount,
  globalEdit,
  globalMaxSize,
  fixedRatioDeviation,
  poweredBy,
  paramKeyOfFile,
  responseKey
} from './config'
import { PicViewer } from 'pic-viewer'
import { isEmpty, warn, confirmation } from 'plain-kit'
import { isArrayJSON, getOrigin, getObjValue } from './utils'
import ElementUpload from './element-upload'

import vueFilePond from 'vue-filepond'
import 'filepond/dist/filepond.min.css'

import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'

//import 'filepond-plugin-image-overlay/dist/filepond-plugin-image-overlay.css'
//import FilePondPluginImageOverlay from 'filepond-plugin-image-overlay'

import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'

const FilePond = vueFilePond(
  //FilePondPluginImageOverlay,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
)

const MB = Math.pow(1024, 2)

export default {
  name: 'Imgpond',
  mixins: [ElementUpload],
  components: { FilePond, Cropper, PicViewer },
  props: {
    fixedRatio: [Array, String],
    count: {
      validator: value => {
        if (!Number.isInteger(value)) {
          console.error('count必须为Number类型的正整数')
          return false
        } else if (value < 1) {
          console.error('count不能小于1')
          return false
        }
        return true
      }
    },
    disabled: Boolean,
    edit: {
      type: Boolean,
      default: true
    },
    value: {
      validator: value => ['String', 'Null', 'Array'].includes(({}).toString.call(value).slice(8, -1)),
    },
    valueType: String,
    compress: {
      type: Boolean,
      default: true
    },
    maxSize: {
      validator: value => {
        if (typeof value !== 'number') {
          console.error('maxSize必须为Number类型')
          return false
        } else if (value <= 0) {
          console.error('maxSize必须大于0')
          return false
        }
        return true
      }
    },
    param: {
      type: Object,
      default: () => {}
    }
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  computed: {
    isFull () {
      return this.files.length >= this.Count
    },
    fixedRatioText () {
      if (this.fixedRatio) {
        if (this.fixedRatio instanceof Array) {
          return this.fixedRatio.map(v => v.replace('/', ':')).join(' ~ ')
        }
        return this.fixedRatio.replace('/', ':')
      }
    },
    ValueType () {
      return this.valueType?.toLowerCase()
    },
    Count () {
      return this.count || globalCount || 50
    },
    MaxSize () {
      return this.maxSize || globalMaxSize || 10
    },
    Edit () {
      return !(!this.edit || typeof globalEdit === 'boolean' && !globalEdit)
    },
    formatList () {
      let str = ''
      for (let k in this.format) {
        str += (str ? ', ' : '') + this.format[k]
      }
      return str
    }
  },
  data () {
    return {
      poweredBy,
      need2Crop: true,
      aspectRatio: undefined,
      format: {
        'image/jpeg': '.jpg, .jpeg',
        'image/png': '.png'
      },
      cropper: {
        queue: [],
        show: false,
        file: '',
        loading: false,
        submitted: false
      },
      loadingCount: 0, //针对多选情况
      /*compression: {
        on: true,
        quality: 0.8
      },*/
      server: {
        load: (source, load, error, progress, abort, headers) => {
          if (!isEmpty(proxy) || !isEmpty(localProxy)) {
            let origin = ''
            try {
              origin = getOrigin(source)
            } catch (e) {
              console.error('非法的图片路径：' + source)
            }
            if (origin) {
              for (let k in proxy) {
                if (origin.includes(proxy[k])) {
                  source = source.replace(origin, window.location.origin + k)
                }
              }
              if (['localhost', '127.0.0.1'].includes(window.location.hostname)) {
                for (let k in localProxy) {
                  if (origin.includes(localProxy[k])) {
                    source = source.replace(origin, window.location.origin + k)
                  }
                }
              }
            }
          }

          typeof request === 'function' ?
            request({
              url: source,
              responseType: 'blob',
            }).then(res => {
              load(res)
            }).catch(e => {
              this.loaded()
              error('图片加载失败')
              warn('图片加载失败')
            }).finally(e => {
              load(null)
            }) :
            fetch(source, {
              mode: 'cors',
              credentials: 'include',
            }).then(res => {
              return res.blob()
            }).then(load)

          return {
            abort: () => {
              abort()
            }
          }
        }
      },
      files: [],
      sortablejs: null
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (newVal, oldVal) {
        if (newVal) {
          if (typeof newVal === 'string') {
            const arr = isArrayJSON(newVal)
            newVal = arr ? arr : [newVal]
          }
          if (newVal.length > 0 && newVal.length !== (oldVal ? oldVal?.length : 0)) {
            this.files = newVal.map(v => {
              return {
                url: v, //element
                source: v,
                options: {
                  type: 'local'
                }
              }
            })
          }
        } else {
          this.files = []
        }
      }
    },
    disabled: {
      immediate: true,
      handler () {
        this.sort()
      }
    }
  },
  methods: {
    onWarning () {
      warn('超过数量上限，最多上传' + this.Count + '张')
    },
    emitChange (files) {
      let tempList = files.map(v => v.source)
      if (this.ValueType === 'string') {
        tempList = this.Count === 1 ? tempList.toString() : JSON.stringify(tempList)
      }
      //auto模式
      else if (!this.ValueType && this.Count === 1) {
        tempList = tempList.toString()
      }
      this.$emit('change', tempList)
      //fix: 用于el表单中 且校验触发方式为blur时 没有生效
      if (this.$parent?.$options?._componentTag === ('el-form-item') && this.$parent.rules?.trigger === 'blur') {
        this.$parent.$emit('el.form.blur')
      }
    },
    onUpdateFiles (files) {
      //更新value
      if (files && files[0] && (files[0].source instanceof File || files[0].source.startsWith('{'))) { //防止腾讯文档粘贴触发
        return
      }
      if (files.length !== (this.value ? typeof this.value === 'string' ? (this.value.startsWith('[') && this.value.endsWith(']')) ? JSON.parse(this.value).length : 1 : this.value.length : 0)) {
        this.emitChange(files)
      }
    },
    onActivatefile ({ source, url }) {
      this.$refs.PicViewer.preview(this.value.indexOf(url || source))
    },
    handleFilePondInit () {
    },
    handleAspectRatio (file) {
      if (typeof this.fixedRatio === 'string') {
        const temp = this.fixedRatio.split('/')
        this.aspectRatio = temp[0] / temp[1]
      } else {
        this.aspectRatio = this.fixedRatio.map(v => {
          const temp = v.split('/')
          return temp[0] / temp[1]
        })
        this.aspectRatio = [Math.min(...this.aspectRatio), Math.max(...this.aspectRatio)]
      }
      return new Promise(resolve => {
        const fileReader = new FileReader()
        fileReader.onload = e => {
          const image = new Image()
          image.onload = () => {
            const aspectRatio = image.width / image.height
            if (this.aspectRatio instanceof Array) {
              resolve(aspectRatio < this.aspectRatio[0] || aspectRatio > this.aspectRatio[1])
            } else {
              resolve(aspectRatio < this.aspectRatio * (1 - fixedRatioDeviation) || aspectRatio > this.aspectRatio * (1 + fixedRatioDeviation))
            }
          }
          image.src = e.target.result
        }
        fileReader.readAsDataURL(file)
      })
    },
    async beforeAddFile (item) {
      /**
       * 拖入时该回调会触发三次
       */
      if (item.file instanceof File) {
        const format = item.file.name.replace(/.+\./, '').toLowerCase()
        if (!this.formatList.includes(format)) {
          warn('仅支持' + this.formatList)
          item.fileList && item.fileList.splice(item.fileList.indexOf(item.file), 1)
          return false
        }
        if (item.file.size > this.MaxSize * MB) {
          warn({
            titleText: '图片大小不能超过' + this.MaxSize + 'MB',
            html: sizeExceededWarningHTML,
            timer: sizeExceededWarningHTML ? 5000 : 3000
          })
          item.fileList && item.fileList.splice(item.fileList.indexOf(item.file), 1)
          return false
        }
        //this.compression.on = this.compress && item.file.size >= .2 * MB
        console.log('【裁剪前】', item.file)
        if (this.Edit) {
          if (this.fixedRatio) {
            this.need2Crop = await this.handleAspectRatio(item.file)
          } else {
            this.need2Crop = false
          }
          if (this.cropper.show) {
            this.cropper.queue.push(item.file)
          } else {
            this.cropper.file = item.file
            this.cropper.show = true
          }
        } else {
          this.load()
          if (poweredBy === 'filepond') {
            this.upload({ file: item.file })
          } else {
            this.$refs['element-upload'].submit()
            item.fileList && item.fileList.splice(item.fileList.indexOf(item.file), 1)
          }
        }
        return false
      } else {
        return true
      }
    },
    onAddFileStart (file) {
      console.log('onAddFileStart')
    },
    beforeRemoveFile (item) {
      return new Promise((resolve, reject) => {
        confirmation({
          title: '删除图片',
          icon: 'warning',
        }).then(() => {
          resolve(true)
        }).catch(() => {
          resolve(false)
        })
      })
    },
    upload (param) {
      /*if (this.compress) {
        const that = this
        new Compressor(param.file, {
          quality: this.compression.quality,
          convertSize: .2 * MB, //PNG files over this value will be converted to JPEGs. To disable this, just set the value to Infinity.
          success (result) {
            console.log('处理后：' + result.size)
            fn.call(that, new File([result], result.name, { type: result.type }))
          },
          error (err) {
            console.log(err.message)
          },
        })
      } else {*/
      fn.call(this, param.file)

      //}

      function fn (file) {
        const promise = api({
          ...this.param,
          [paramKeyOfFile]: file
        })
        if (promise) {
          promise.then(res => {
            const source = res && typeof res === 'string' ?
              res :
              getObjValue(res, responseKey)
            if (source) {
              this.$refs.filePond.addFile(source, { type: 'local' }).finally(file => {
                this.loaded()
              })
            }
          }).catch(e => {
            this.loaded()
          })
        } else {
          let reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = e => {
            this.$refs.filePond.addFile(e.target.result, { type: 'local' }).finally(file => {
              this.loaded()
            })
          }
        }
      }
    },
    load () {
      this.loadingCount++
      if (this.cropper.loading) {
        return
      }
      this.cropper.loading = this.$loading({
        lock: true,
      })
    },
    loaded () {
      //开启裁剪时load和loaded为多对一的关系 没开时一对一
      if (this.loadingCount > 0) {
        this.loadingCount--
      }
      if (this.cropper.loading && this.loadingCount === 0) {
        this.cropper.loading.close()
        this.cropper.loading = false
      }
    },
    onCropperClose () {
      if (poweredBy === 'element') {
        const uploadFiles = this.$refs['element-upload'].uploadFiles
        const deprecatedFiles = [this.cropper.file, ...this.cropper.queue]
        deprecatedFiles.map(v => {
          v && uploadFiles.splice(uploadFiles.indexOf(v), 1)
        })
        !this.cropper.submitted && this.$refs['element-upload'].submit()
      }
      this.cropper.queue.length = 0
      this.cropper.file = null
      this.cropper.submitted = false
    },
    closeCropper (isCancel = true) {
      if (this.cropper.queue.length > 0) {
        if (poweredBy === 'element' && isCancel) {
          const uploadFiles = this.$refs['element-upload'].uploadFiles
          for (let [i, v] of uploadFiles.entries()) {
            if (v.raw === this.cropper.file) {
              uploadFiles.splice(i, 1)
              break
            }
          }
        }
        this.cropper.file = this.cropper.queue.shift()
      } else {
        this.cropper.show = false
      }
    },
    confirm () {
      if (this.need2Crop || !this.$refs.crop.untouched) {
        this.save()
      } else {
        this.noCrop()
      }
    },
    save () {
      this.load()
      this.$refs.crop.cropImage()
    },
    stopCrop (blob) {
      if (blob) {
        let file = new File([blob], this.cropper.file.name, { type: blob.type })
        if (poweredBy === 'element') {
          let uploadFiles = this.$refs['element-upload'].uploadFiles[this.$refs['element-upload'].uploadFiles.length - this.cropper.queue.length - 1]
          file.uid = uploadFiles.raw.uid //uid影响progress等回调的判断
          uploadFiles.raw = file
          if (this.cropper.queue.length === 0) {
            this.$refs['element-upload'].submit()
            this.cropper.submitted = true
          } else {
            this.loaded()
          }
        } else {
          this.upload({ file })
        }
        this.closeCropper(false)
      } else {
        this.loaded()
      }
    },
    noCrop () {
      this.load()
      if (poweredBy === 'element') {
        if (this.cropper.queue.length === 0) {
          this.$refs['element-upload'].submit()
          this.cropper.submitted = true
        } else {
          this.loaded()
        }
      } else {
        this.upload({ file: this.cropper.file })
      }
      this.closeCropper(false)
    },
  }
}
</script>

<style lang="scss" scoped>
::v-deep .filepond--item {
  width: calc(33.33% - .5em);
}

::v-deep .filepond--file {
  cursor: pointer;
  transition-duration: 0.3s;
}

::v-deep .filepond--file:hover {
  box-shadow: 2px 2px 10px rgba(0, 0, 0, .9);
  filter: blur(1px);
  background: hsla(0, 0%, 100%, .3);
}

::v-deep .el-button-group {
  margin-left: 16px;
  margin-bottom: 1px;
}

::v-deep .el-upload-list__item {
  user-select: none;
  transition: none !important;

  .el-upload-list__item-thumbnail {
    object-fit: contain;
  }
}

.full ::v-deep .el-upload--picture-card {
  display: none;
}

::v-deep .el-upload--picture-card {
  position: relative;

  .el-upload__text {
    position: absolute;
    top: 25px;
    width: 100%;
    color: lightblue;
  }
}

.preview-img {
  background-color: rgba(0, 0, 0, .5); //针对png
}
</style>

<style lang="scss">
.filepond--fullsize-overlay {
  z-index: 9999;
}
</style>
