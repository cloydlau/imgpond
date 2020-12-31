import {
  api,
  poweredBy,
} from './config'
import { file2Base64 } from './utils'
import Sortable from 'sortablejs'
import { Swal, getPropByPath } from 'plain-kit'
const { err } = Swal

//submit()会触发http-request
//如果是多选 submit()会连续多次触发http-request

export default {
  methods: {
    sort () {
      if (!this.Disabled && poweredBy === 'element') {
        this.$nextTick(() => {
          this.sortablejs = Sortable.create(this.$refs['element-upload'].$el.firstChild, {
            animation: 500,
            onEnd: ({ newIndex, oldIndex }) => {
              this.files.splice(newIndex, 0, this.files.splice(oldIndex, 1)[0])
              this.emitChange(this.files)
            }
          })
        })
      }
    },
    element_onChange (file, fileList) {
      if (file.status === 'ready') {
        this.beforeAddFile({
          ...file,
          file: file.raw,
          fileList
        })
      }
      //success/fail
      else {
        this.emitChange(fileList)
        this.loaded()
      }
    },
    element_onRemove (file, fileList) {
      this.files.splice(fileList.indexOf(file), 1)
      this.emitChange(fileList)
    },
    element_beforeUpload (file) {
      console.log('before-upload')
    },
    element_onSuccess (response, file, fileList) {
      file.progress = 100
      file.source = response
      file.url = response
      this.files.push(file)
      this.emitChange(this.files)
      this.loaded()
    },
    element_onError (e, file, fileList) {
      err(e)
      this.loaded()
    },
    element_httpRequest (item) {
      const promise = api({
        url: this.Url,
        param: {
          ...this.Param,
          [this.Normalizer.param]: item.file
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
            //item.onSuccess(source, item.file)
            this.element_onSuccess(source, item.file)
          } else {
            console.error('[Imgpond] 上传失败，如果接口正常返回，请检查normalizer.response配置')
            console.log(res)
            this.element_onError('上传失败')
          }
        }).catch(e => {
          console.error(e)
          this.element_onError('上传失败')
        })
      } else {
        file2Base64(item.file, base64 => {
          //item.onSuccess(base64) //多选时只触发一次
          this.element_onSuccess(base64, item.file)
        })
      }
    }
  }
}
