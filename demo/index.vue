<template>
  <el-dialog visible :close-on-click-modal="false" :show-close="false" title="Imgpond">
    <Imgpond v-model="value" v-bind="props"/>
    <PropsEditor v-model="props"/>
  </el-dialog>
</template>

<script>
import PropsEditor from './PropsEditor'

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
        param: {},
        maxSize: 10,
      }
    }
  },
}
</script>

<style lang="scss" scoped>

</style>
