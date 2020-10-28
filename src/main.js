import Imgpond from './index.vue'
import {init} from './config'

const install = function (Vue, opts = {}) {
  if (install.installed) {
    return
  }
  init(opts)
  Vue.component(Imgpond.name, Imgpond)
}

// 判断是否为直接引入文件
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

// @ts-ignore
Imgpond.install = install

export default Imgpond

// todo: deprecated
export {
  Imgpond
}
