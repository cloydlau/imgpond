# imgpond / 图片上传池


![图片](./preview-filepond.png)

<hr/>

![图片](./preview-element.png)

<hr/>

![图片](./preview-crop.png)


### Features

- √ v-model双绑
- √ 支持上传前裁剪图片 可以固定裁剪比例、限定比例范围
- √ 支持限制图片大小、限制上传数量
- √ 支持多选
- √ 支持拖拉拽改变排序（响应式）
- √ 灵活的数据类型：支持String/Array
- √ 支持上传后预览/禁用时预览
- √ 全局安装 通用参数支持全局配置

### Installation
![NPM](https://nodei.co/npm/imgpond.png)
``` bash
$ yarn add imgpond
```

**Dependencies**：vue element-ui pic-viewer plain-kit

<hr/>

**Globally:**
```js
import Imgpond from 'imgpond'
Vue.use(Imgpond, { url: '接口地址' })
```

### Quick Start

```html
<Imgpond v-model=""/>
```

| 参数 | 说明 | 配置方式 | 类型 | 可选值 | 默认值 |
| --- | --- | --- | --- | --- | --- |
| value / v-model | 双绑 | props | String / Array[String] | | |
| fixedRatio | 固定裁剪比例 | props | String（形如1/1） / Array（形如['1/1', '2/1']） | | undefined（不作限制） |
| fixedRatioDeviation | 固定裁剪比例误差范围（默认在＜±10%时不裁剪直接上传） | 全局 | Number | | 0.1 |
| valueType | 数据类型 | props | String | 'String' / 'Array'（不区分大小写） | undefined（自动，单张String多张Array） |
| request | axios实例 | 全局 | Axios | | |
| url | 上传接口地址 | 全局 | String | | |
| maxSize | 图片大小限制（单位MB） | 全局，props | Number | | 10 |
| count | 数量上限 | 全局，props | Number | | 50 |
| param | 上传接口参数补充 | 全局，props | Object | | { file: '二进制文件' } |
| edit | 是否开启裁剪功能 | 全局，props | Boolean | | true |
| disabled | 是否禁用 | props | Boolean | | false |
| poweredBy | 底层库 | 全局 | String | 'filepond', 'element' | 'filepond' |


### Notice
- 曾支持canvas图片压缩 但效果不理想 尤其对png不友好 图片压缩还是建议后端来做
- 图片格式目前写死支持jpg/jpeg/png 暂不提供配置
- poweredBy参数配置为filepond时 图片链接服务最好能够提供nginx跨域支持（推荐）
- 针对不支持跨域的情况 提供了localhost/线上的代理配置
