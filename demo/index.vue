<template>
  <el-dialog visible :close-on-click-modal="false" :show-close="false" title="Imgpond">
    <Imgpond v-model="value" v-bind="props"/>
    <PropsEditor v-model="props"/>
  </el-dialog>
</template>

<script>
import PropsEditor from './PropsEditor'
import Imgpond from '../src/main.js'
import axios from 'axios'

export default {
  components: { PropsEditor },
  data () {
    return {
      value: [
        'https://placem.at/people?random=1&txt=0&w=500&h=500',
        'https://placem.at/people?random=1&txt=0&w=1000&h=500',
      ],
      props: {
        fixedRatio: undefined,
        count: 50,
        disabled: false,
        edit: true,
        valueType: undefined,
        param: {
          domainId: 1,
          dir: 'img'
        },
        maxSize: 10,
        url: '',
        request: axios,
        normalizer: {
          response: res => res.data.data
        },
        fixedRatioDeviation: 0.1,
      }
    }
  },
}
</script>

<style lang="scss" scoped>
::v-deep .el-dialog {
  min-width: 600px;
}
</style>
