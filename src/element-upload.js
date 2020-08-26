import {
  api,
  paramKeyOfFile,
  responseKey
} from './config'
import { file2Base64, getObjValue } from './utils'

//submit()会触发http-request
//如果是多选 submit()会连续多次触发http-request

export default {
  methods: {
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
    element_onError (err, file, fileList) {
      this.$err(err)
      this.loaded()
    },
    element_httpRequest (item) {
      const promise = api({
        ...this.param,
        [paramKeyOfFile]: item.file
      })
      if (promise) {
        promise.then(res => {
          const source = res && typeof res === 'string' ?
            res :
            getObjValue(res, responseKey)
          if (source) {
            //item.onSuccess(source, item.file)
            this.element_onSuccess(source, item.file)
          }
        }).catch(e => {
          item.onError(e)
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
