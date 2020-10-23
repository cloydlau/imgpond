import Vue from 'vue'
import App from './index.vue'

import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
Vue.use(ElementUI)

import Imgpond from '../src/main.js'
import axios from 'axios'
Vue.use(Imgpond, {
  request: () => new Promise(resolve => {
    /*resolve({
      data: {
        url: 'https://placem.at/people?random=1&txt=0&w=1000&h=500'
      }
    })*/
    reject()
  }),
  //request: axios,
  normalizer: {
    response: 'data.data.url'
  },
  param: {},
  count: 50,
  edit: true,
  maxSize: 10,
  fixedRatioDeviation: 0.1,
  localProxy: {},
  proxy: {},
  sizeExceededWarningHTML: ``,
  poweredBy: 'element'
})

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
