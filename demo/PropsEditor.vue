<template>
  <div>
    <h2>props</h2>

    <el-form>
      <el-form-item label="valueType">
        <el-radio v-model="value.valueType" :label="undefined">自动</el-radio>
        <el-radio v-model="value.valueType" label="String">String</el-radio>
        <el-radio v-model="value.valueType" label="Array">Array</el-radio>
      </el-form-item>
      <el-form-item label="maxSize">
        <el-input-number v-model="value.maxSize" clearable :min="0"/>
      </el-form-item>
      <el-form-item label="count">
        <el-input-number v-model="value.count" clearable :min="1"/>
      </el-form-item>
      <el-form-item label="param">
        <json-editor-vue v-model="value.param"/>
      </el-form-item>
      <el-form-item label="edit">
        <el-switch v-model="value.edit"
                   active-color="#13ce66"
                   :active-value="true"
                   :inactive-value="false"
        />
      </el-form-item>
      <el-form-item label="fixedRatio">
        <el-radio v-model="fixedRatioType__" label="String">String</el-radio>
        <el-radio v-model="fixedRatioType__" label="Array">Array</el-radio>
        <el-input v-if="fixedRatioType__==='String'" v-model="value.fixedRatio" clearable
                  style="display:inline-block"/>
        <template v-else-if="value.fixedRatio">
          <el-input placeholder="下限"
                    v-model="value.fixedRatio[0]"
                    clearable
                    style="display:inline-block; margin-right:1rem"
          />
          <el-input placeholder="上限"
                    v-model="value.fixedRatio[1]"
                    clearable
                    style="display:inline-block"/>
        </template>
      </el-form-item>
      <el-form-item label="disabled">
        <el-switch v-model="value.disabled"
                   active-color="#13ce66"
                   :active-value="true"
                   :inactive-value="false"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { JsonEditorVue } from 'json-editor-vue'

export default {
  props: {
    value: Object
  },
  components: { JsonEditorVue },
  data () {
    return {
      fixedRatioType__: 'Number',
    }
  },
  watch: {
    fixedRatioType__ (newVal) {
      if (newVal === 'Array' && !(this.value.fixedRatio instanceof Array)) {
        this.value.fixedRatio = []
      } else if (newVal === 'String') {
        this.value.fixedRatio = ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
h2 {
  margin-top: 50px;
}

.el-tag ~ .el-tag {
  margin-left: 16px;
}

.title {
  margin-right: 16px;
}
</style>
