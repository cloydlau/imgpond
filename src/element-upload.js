import { api } from './config'
import { file2Base64 } from './utils'

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
      this.emitChange(fileList)
      //fileList.splice(fileList.indexOf(file), 1)
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
      const promise = api({ ...this.param, file: item.file })
      if (promise) {
        promise.then(res => {
          const source = res && typeof res === 'string' ? res : res.data
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
