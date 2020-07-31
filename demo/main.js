import Vue from 'vue'
import App from './index.vue'

import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
Vue.use(ElementUI)

/**
 * 全局参数会被组件props中的同名参数（如果有）的值覆盖
 */
import Imgpond from '../src/main.js' //dev
//import Imgpond from '../dist/imgpond.umd' //prod
//import Imgpond from 'imgpond' //todo
//import request from '@/utils/request'
Vue.use(Imgpond, {
  //上传接口地址
  url: '',

  /**
   * 可选参数
   */
  //axios实例
  request: () => new Promise(resolve => {
    resolve('https://placem.at/people?random=1&txt=0&w=1000&h=500')
  }),
  //上传接口参数（除二进制文件以外的其他参数 二进制文件默认会以file作为参数名）
  param: {},
  //上传数量限制 默认50
  count: 50,
  //是否开启裁剪 默认开启
  edit: true,
  //图片大小限制 单位MB 默认10
  maxSize: 10,
  //固定裁剪比例误差范围 默认在＜±10%时不裁剪直接上传
  fixedRatioDeviation: 0.1,
  //本地代理
  localProxy: {},
  //代理
  proxy: {},
  //压缩提示内容
  sizeExceededWarningHTML: ``,
  //基于filepond或element 默认filepond 如果你的图片服务器不支持跨域 则仅能使用element
  poweredBy: 'element',
})

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
