import {
  api,
  poweredBy,
  normalizer
} from './config'
import { file2Base64 } from './utils'
import Sortable from 'sortablejs'
import { SweetAlert, getPropByPath } from 'plain-kit'
const { err } = SweetAlert

//submit()会触发http-request
//如果是多选 submit()会连续多次触发http-request

export default {
  methods: {
    sort () {
      if (!this.disabled && !this.sortablejs && poweredBy === 'element') {
        this.$nextTick(() => {
          this.sortablejs = Sortable.create(document.querySelector('.el-upload-list'), {
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
        ...this.Param,
        [normalizer.param]: item.file
      })
      if (promise instanceof Promise) {
        promise.then(res => {
          const source = res && typeof res === 'string' ?
            res :
            getPropByPath(res, normalizer.response)
          if (typeof source === 'string') {
            //item.onSuccess(source, item.file)
            this.element_onSuccess(source, item.file)
          } else {
            console.error('如果接口正常返回，请根据下方request返回值配置正确的normalizer.response：')
            console.log(res)
            this.element_onError('上传失败')
          }
        }).catch(e => {
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
