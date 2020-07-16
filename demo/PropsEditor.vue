<template>
  <div style="margin-bottom: 200px;">
    <h2>props</h2>
    <el-collapse>
      <el-collapse-item>
        <template slot="title">
          <span class="title">【valueType】数据类型</span>
          <el-tag>String</el-tag>
        </template>
        <el-card>
          <div slot="header">
            <el-radio v-model="value.valueType" :label="undefined">自动</el-radio>
            <el-radio v-model="value.valueType" label="String">String</el-radio>
            <el-radio v-model="value.valueType" label="Array">Array</el-radio>
          </div>
          <el-tag type="success">默认值：undefined（自动）</el-tag>
          <el-tag>默认单张String多张Array</el-tag>
          <el-tag>不区分大小写</el-tag>
        </el-card>
      </el-collapse-item>
      <el-collapse-item>
        <template slot="title">
          <span class="title">【maxSize】图片大小限制</span>
          <el-tag>Number</el-tag>
        </template>
        <el-card>
          <div slot="header">
            <el-input-number v-model="value.maxSize" clearable :min="0"/>
          </div>
          <el-tag type="success">默认值：10</el-tag>
          <el-tag>单位MB</el-tag>
        </el-card>
      </el-collapse-item>
      <el-collapse-item>
        <template slot="title">
          <span class="title">【count】图片数量限制</span>
          <el-tag>Number</el-tag>
        </template>
        <el-card>
          <div slot="header">
            <el-input-number v-model="value.count" clearable :min="1"/>
          </div>
          <el-tag type="success">默认值：50</el-tag>
          <el-tag>默认单张String多张Array</el-tag>
          <el-tag>不区分大小写</el-tag>
        </el-card>
      </el-collapse-item>
      <el-collapse-item>
        <template slot="title">
          <span class="title">【param】上传接口参数</span>
          <el-tag>Object</el-tag>
        </template>
        <el-card>
          <div slot="header">
            <json-editor-vue v-model="value.param"/>
          </div>
          <el-tag>会与全局注册时传入的param进行混入（同名的参数会被这里覆盖）</el-tag>
        </el-card>
      </el-collapse-item>
      <el-collapse-item>
        <template slot="title">
          <span class="title">【edit】是否开启裁剪功能</span>
          <el-tag>Boolean</el-tag>
        </template>
        <el-card>
          <div slot="header">
            <el-switch v-model="value.edit"
                       active-color="#13ce66"
                       :active-value="true"
                       :inactive-value="false">
            </el-switch>
          </div>
          <el-tag type="success">默认值：true</el-tag>
        </el-card>
      </el-collapse-item>
      <el-collapse-item>
        <template slot="title">
          <span class="title">【fixedRatio】固定裁剪比例</span>
          <el-radio v-model="fixedRatioType__" label="String">String</el-radio>
          <el-radio v-model="fixedRatioType__" label="Array">Array</el-radio>
        </template>
        <el-card>
          <div slot="header">
            <el-input v-if="fixedRatioType__==='String'" v-model="value.fixedRatio" clearable/>
            <template v-else-if="value.fixedRatio">
              <el-input placeholder="下限"
                        v-model="value.fixedRatio[0]"
                        clearable
                        style="width:50%"
              />
              <el-input placeholder="上限"
                        v-model="value.fixedRatio[1]"
                        clearable
                        style="width:50%"
              />
            </template>
          </div>
          <el-tag type="success">默认值：undefined（不作限制）</el-tag>
          <el-tag v-show="fixedRatioType__==='String'">形如1/1</el-tag>
          <el-tag v-show="fixedRatioType__==='Array'">形如['1/1', '2/1']</el-tag>
        </el-card>
      </el-collapse-item>
      <el-collapse-item>
        <template slot="title">
          <span class="title">【disabled】是否禁用</span>
          <el-tag>Boolean</el-tag>
        </template>
        <el-card>
          <div slot="header">
            <el-switch v-model="value.disabled"
                       active-color="#13ce66"
                       :active-value="true"
                       :inactive-value="false">
            </el-switch>
          </div>
          <el-tag type="success">默认值：false</el-tag>
        </el-card>
      </el-collapse-item>
    </el-collapse>
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
