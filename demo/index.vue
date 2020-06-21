<template>
  <el-dialog :visible.sync="showDialog" :close-on-click-modal="false" title="Imgpond">


    <Imgpond v-model="value"
             :fixedRatio="fixedRatio"
             :count="count"
             :valueType="valueType"
             :edit="edit"
             :param="param"
             :disabled="disabled"
             :maxSize="maxSize"
    />


    <el-form>
      <h2>props</h2>
      <el-form-item label="数据类型 默认单张String多张Array 不区分大小写">
        <el-radio v-model="valueType" :label="undefined">自动</el-radio>
        <el-radio v-model="valueType" label="String">String</el-radio>
        <el-radio v-model="valueType" label="Array">Array</el-radio>
      </el-form-item>
      <el-form-item label="图片大小限制 单位MB 默认10 会覆盖全局设置">
        <el-input-number v-model="maxSize" clearable :min="0"/>
      </el-form-item>
      <el-form-item label="上传数量限制 默认50 会覆盖全局设置">
        <el-input-number v-model="count" clearable :min="1"/>
      </el-form-item>
      <el-form-item label="上传接口参数 会与全局注册时传入的param进行混入（同名的参数会被这里覆盖）">
        <el-input :value="JSON.stringify(param)"/>
      </el-form-item>
      <el-form-item label="是否开启裁剪功能 会覆盖全局设置">
        <el-switch v-model="edit"
                   active-color="#13ce66"
                   :active-value="true"
                   :inactive-value="false">
        </el-switch>
      </el-form-item>
      <el-form-item label="固定裁剪比例 字符串（形如1/1） 也支持接收一个数组指定上下限">
        <el-input :value="fixedRatio&&fixedRatio.toString()" clearable/>
      </el-form-item>
      <el-form-item label="是否禁用">
        <el-switch v-model="disabled"
                   active-color="#13ce66"
                   :active-value="true"
                   :inactive-value="false">
        </el-switch>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
export default {
  data () {
    return {
      value: [
        'https://placem.at/people?random=1&txt=0&w=500&h=500',
        'https://placem.at/people?random=1&txt=0&w=1000&h=500',
      ],
      fixedRatio: undefined,
      count: 50,
      disabled: false,
      edit: true,
      valueType: undefined,
      param: {},
      maxSize: 10,

      showDialog: true
    }
  },
}
</script>

<style lang="scss" scoped>
.el-form {
  border: 2px solid lightblue;
  border-radius: 16px;
  padding: 16px;
  margin-top: 32px;
}
</style>
