<template>
  <div>
    <PicViewer
      v-show="Disabled"
      :value="files"
      ref="PicViewer"
      objectKey="source"
    />

    <div v-if="!Disabled" :class="{'full': isFull}">
      <el-upload
        v-if="poweredBy==='element'"
        ref="element-upload"
        action="#"
        :auto-upload="false"
        list-type="picture-card"
        :file-list="files"
        :disabled="Disabled"
        :limit="Count"
        :multiple="Count!==1"
        :accept="Accept"
        :on-change="element_onChange"
        :on-preview="onActivatefile"
        :on-remove="element_onRemove"
        :on-exceed="onWarning"
        :on-success="element_onSuccess"
        :on-error="element_onError"
        :http-request="element_httpRequest"

        :before-upload="file=>{$emit('before-upload',file)}"
        :before-remove="(file, fileList)=>{$emit('before-remove',file, fileList)}"
        :on-progress="(e, file, fileList)=>{$emit('progress',e, file, fileList)}"
      >
        <i class="el-icon-plus"/>
        <div class="el-upload__text">{{ this.fixedRatioText ? '宽高比' + this.fixedRatioText : '' }}</div>
      </el-upload>

      <file-pond
        v-else
        ref="filePond"
        :label-idle="'点击上传'+(this.fixedRatioText?'（宽高比'+this.fixedRatioText+'）':'')"
        :allowDrop="false"
        :allowReorder="true"
        :allowMultiple="Count!==1"
        styleItemPanelAspectRatio="1"
        labelFileTypeNotAllowed="不支持的格式，请删除"
        fileValidateTypeLabelExpectedTypes="仅支持{allButLastType}和{lastType}"
        :server="server"
        :files="files"
        :max-files="Count||null"
        :beforeAddFile="beforeAddFile"
        :disabled="Disabled"
        :beforeRemoveFile="beforeRemoveFile"
        :onwarning="onWarning"
        @init="handleFilePondInit"
        @onaddfilestart="onAddFileStart"
        @updatefiles="onUpdateFiles"
        @reorderfiles="emitChange"
        @activatefile="onActivatefile"
        v-on="$listeners"
      />

      <el-dialog
        title='图片编辑'
        :visible.sync="cropper.show"
        :close-on-click-modal="false"
        :append-to-body="true"
        destroy-on-close
        @close="onCropperClose"
      >
        <Cropper
          ref="crop"
          :file="cropper.file"
          :aspectRatio="aspectRatio"
          :fixedRatioText="fixedRatioText"
          @stopCrop="stopCrop"
        />
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
import Cropper from './components/vue-cropperjs'
import {
  api,
  url,
  accept,
  request,
  requestConfig,
  localProxy,
  proxy,
  sizeExceededWarningHTML,
  globalCount,
  globalEdit,
  globalMaxSize,
  fixedRatio,
  fixedRatioDeviation,
  poweredBy,
  normalizer,
  globalParam,
  valueType
} from './config'
import { PicViewer } from 'pic-viewer'
import { isArrayJSON, getOrigin, getFinalProp } from './utils'
import ElementUpload from './element-upload'

import vueFilePond from 'vue-filepond'
import 'filepond/dist/filepond.min.css'

import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'

//import 'filepond-plugin-image-overlay/dist/filepond-plugin-image-overlay.css'
//import FilePondPluginImageOverlay from 'filepond-plugin-image-overlay'

import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'

import { isEmpty, getPropByPath, Swal, typeOf } from 'plain-kit'
const { warn, confirmation, err } = Swal

const FilePond = vueFilePond(
  //FilePondPluginImageOverlay,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
)

const MB = Math.pow(1024, 2)

export default {
  name: 'Imgpond',
  mixins: [ElementUpload],
  inject: {
    elForm: {
      default: ''
    },
  },
  components: { FilePond, Cropper, PicViewer },
  props: {
    accept: String,
    fixedRatioDeviation: Number,
    request: Function,
    requestConfig: Object,
    url: String,
    normalizer: Object,
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
    disabled: {
      validator: value => ['boolean'].includes(typeOf(value))
    },
    edit: {
      validator: value => ['boolean'].includes(typeOf(value))
    },
    value: {
      validator: value => ['string', 'null', 'array'].includes(typeOf(value)),
    },
    valueType: String,
    compress: {
      validator: value => ['boolean'].includes(typeOf(value))
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
    param: Object
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  computed: {
    Accept () {
      return getFinalProp(accept, this.accept, '.jpg,.jpeg,.png').replace(/[\s\f\n\r\t\v]/g, '')
    },
    acceptWarning () {
      if (this.Accept) {
        return '支持格式：' + this.Accept.replace(/\./g, ' ').trim()
      }
    },
    FixedRatio () {
      return getFinalProp(fixedRatio, this.fixedRatio)
    },
    FixedRatioDeviation () {
      return getFinalProp(fixedRatioDeviation, this.fixedRatioDeviation, 0.1)
    },
    Request () {
      return getFinalProp(request, this.request)
    },
    RequestConfig () {
      return getFinalProp(requestConfig, this.requestConfig)
    },
    Url () {
      return getFinalProp(url, this.url)
    },
    Normalizer () {
      return {
        response: 'data',
        param: 'file',
        ...getFinalProp(normalizer, this.normalizer)
      }
    },
    Disabled () {
      return this.disabled || this.elForm?.disabled
    },
    isFull () {
      return this.files.length >= this.Count
    },
    fixedRatioText () {
      if (this.FixedRatio) {
        if (this.FixedRatio instanceof Array) {
          return this.FixedRatio.map(v => v.replace('/', ':')).join(' ~ ')
        }
        return this.FixedRatio.replace('/', ':')
      }
    },
    ValueType () {
      return getFinalProp(valueType, this.valueType)?.toLowerCase()
    },
    Count () {
      return getFinalProp(globalCount, this.count, 50)
    },
    MaxSize () {
      return getFinalProp(globalMaxSize, this.maxSize, 10)
    },
    Edit () {
      return getFinalProp(globalEdit, this.edit, true)
    },
    Param () {
      return {
        ...globalParam,
        ...this.param
      }
    },
  },
  data () {
    return {
      poweredBy,
      need2Crop: true,
      aspectRatio: undefined,
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

          typeof this.Request === 'function' ?
            this.Request({
              url: source,
              responseType: 'blob',
            }).then(res => {
              load(res)
            }).catch(e => {
              this.loaded()
              error('图片加载失败')
              warn('图片加载失败')
              console.error(
                `[Imgpond] 图片加载失败 如果上方有跨域错误提示 说明由跨域造成
  如何解决跨域：
    方案1：在全局配置中将poweredBy配置为'element'；
    方案2：在全局配置中配置proxy/localProxy`)
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
    Disabled: {
      immediate: true,
      handler () {
        this.sort()
      }
    }
  },
  methods: {
    onWarning (files, fileList) {
      warn('超过数量上限，最多上传' + this.Count + '张')
      this.$emit('exceed', files, fileList)
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
        // fix: el-form-item深层嵌套时事件触发过早
        this.$parent.$nextTick(() => {
          this.$parent.$emit('el.form.blur')
        })
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
    onActivatefile (file) {
      const { source, url } = file
      for (let [i, v] of this.files.entries()) {
        if ([url, source].includes(v.source)) {
          this.$refs.PicViewer.preview(i)
          break
        }
      }
      this.$emit('preview', file)
    },
    handleFilePondInit () {
    },
    handleAspectRatio (file) {
      if (typeof this.FixedRatio === 'string') {
        const temp = this.FixedRatio.split('/')
        this.aspectRatio = temp[0] / temp[1]
      } else {
        this.aspectRatio = this.FixedRatio.map(v => {
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
              resolve(aspectRatio < this.aspectRatio * (1 - this.FixedRatioDeviation) || aspectRatio > this.aspectRatio * (1 + this.FixedRatioDeviation))
            }
          }
          image.src = e.target.result
        }
        fileReader.readAsDataURL(file)
      })
    },
    verifyExtension (fileName) {
      if (this.Accept) {
        const extension = fileName.replace(/.+\./, '.').toLowerCase()
        const result = this.Accept.includes(extension)
        if (!result) {
          warn(this.acceptWarning)
        }
        return result
      }
      return true
    },
    async beforeAddFile (item) {
      /**
       * 拖入时该回调会触发三次
       */
      if (item.file instanceof File) {
        if (!this.verifyExtension(item.file.name)) {
          item.fileList && item.fileList.splice(item.fileList.indexOf(item.file), 1)
          return false
        }
        if (item.file.size > this.MaxSize * MB) {
          warn({
            titleText: '图片大小不能超过' + this.MaxSize + 'MB',
            html: sizeExceededWarningHTML ?? '',
            timer: sizeExceededWarningHTML ? 5000 : 3000
          })
          item.fileList && item.fileList.splice(item.fileList.indexOf(item.file), 1)
          return false
        }
        //this.compression.on = this.compress && item.file.size >= .2 * MB
        console.log('[Imgpond] 裁剪前：', item.file)
        if (this.Edit) {
          if (this.FixedRatio) {
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

      //}

      const promise = api({
        url: this.Url,
        param: {
          ...this.Param,
          [this.Normalizer.param]: param.file
        },
        request: this.Request,
        requestConfig: this.RequestConfig
      })
      if (promise instanceof Promise) {
        promise.then(res => {
          const source = typeof this.Normalizer.response === 'function' ? this.Normalizer.response(res) :
            typeof res === 'string' ? res :
              getPropByPath(res, this.Normalizer.response)
          if (typeof source === 'string' && source) {
            this.$refs.filePond.addFile(source, { type: 'local' }).finally(file => {
              this.loaded()
            })
          } else {
            console.error('[Imgpond] 上传失败，如果接口正常返回，请检查normalizer.response配置')
            console.log(res)
            err('上传失败')
          }
        }).catch(e => {
          console.error(e)
          err('上传失败')
        }).finally(e => {
          this.loaded()
        })
      } else {
        let reader = new FileReader()
        reader.readAsDataURL(param.file)
        reader.onload = e => {
          this.$refs.filePond.addFile(e.target.result, { type: 'local' }).finally(file => {
            this.loaded()
          })
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
::v-deep .el-dialog {
  min-width: 650px;
}

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

/*.filepond--fullsize-overlay {
  z-index: 9999;
}*/
</style>
