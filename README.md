# imgpond / 图片上传池


![图片](./preview-filepond.png)

<br/>

![图片](./preview-crop.png)

<br/>

### Features

- √ v-model双绑
- √ 支持上传前裁剪图片 可以固定裁剪比例、限定比例范围
- √ 支持限制图片大小、限制上传数量
- √ 支持多选
- √ 支持拖拉拽排序（响应式）
- √ 灵活的数据类型：支持string/array
- √ 支持上传后预览/禁用时预览
- √ 全局安装/组件内引入 通用参数支持全局配置

element-ui集成说明：

- element-ui是以外置依赖的方式引入的 所以不必担心代码体积和版本不一致等问题
- 适配element-ui的el-form组件 支持el-form的全局disabled

<br/>

### Installation
![NPM](https://nodei.co/npm/imgpond.png)
``` bash
$ yarn add imgpond
```

**Dependencies**：vue element-ui pic-viewer

```js
import Imgpond from 'imgpond'

// 组件内引入
components: { Imgpond }

// 全局引入
Vue.use(Imgpond, { url: '接口地址' })
```

<br/>

### Quick Start

```html
<Imgpond v-model=""/>
```

| Attribute | Description | Configuration Mode | Type | Accepted Values | Default |
| --- | --- | --- | --- | --- | --- |
| v-model / value | 双绑 | props | string / array[string] | | |
| fixedRatio | 固定裁剪比例 | global, props | string（形如1/1） / array（形如['1/1', '2/1']） | | undefined（不作限制） |
| fixedRatioDeviation | 固定裁剪比例误差范围（默认在＜±10%时不裁剪直接上传） | global, props | number | | 0.1 |
| valueType | 数据类型 | global, props | string | 'string' / 'array'（不区分大小写） | undefined（自动，单张string多张array） |
| request | axios实例 | global, props | axios | | |
| requestConfig | axios配置 | global, props | object / function | | *see below* |
| url | 上传接口地址 | global, props | string | | |
| maxSize | 图片大小限制（单位MB） | global，props | number | | 10 |
| count | 数量上限 | global，props | number | | 50 |
| param | 上传接口参数补充 | global，props | object | | { file: '二进制文件' } |
| edit | 是否开启裁剪功能 | global，props | boolean | | true |
| disabled | 是否禁用 | props | boolean | | false |
| poweredBy | 底层库（如果存在跨域困扰 建议使用'element'） | global | string | 'filepond', 'element' | 'filepond' |
| normalizer | 接口参数/返回值格式配置 | global, props | object | | *see below* |
| localProxy | 本地代理（针对filepond） | global | object | | |
| proxy | 代理（针对filepond） | global | object | | |
| accept | 接受上传的[文件类型](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-accept) | global, props | string | http://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types | '.jpg,.jpeg,.png' |

<br/>

requestConfig

ajax请求配置

默认值：
```json
{
  "baseURL": "", //针对prod环境中baseApi为相对路径的情况
  "method": "POST",
  "timeout": 20000
}
```

比如你想将超时时间修改为10秒：

```js
Vue.use(Imgpond, {
  requestConfig: {
    timeout: 10000
  }
})
```

支持function 藉此拿到接口参数：

```js
Vue.use(Imgpond, {
  requestConfig(param) {
    const formData = new FormData()
    for (let k in param) {
      formData.append(k, param[k])
    }

    return {
      data: formData,
    }
  }
})
```

如果不需要拿到data 你也可以用这种方式来修改配置：

```js
Vue.use(Imgpond, {
  request: config => request({
    ...config,
    timeout: 10000
  }),
})
```

<br/>

normalizer

默认值：
```json
{
  "param": "file", //二进制文件的参数名
  "response": "data" //返回值（json）中文件链接所在的key路径
}
```

比如你的上传接口参数长这样子，其中origin是全局参数：

```json
{
  "img": "(binary)",
  "origin": true,
  "path": "img"
}
```

你可以这样配置：

```js
Vue.use(Imgpond, {
  normalizer: {
    param: 'img'
  },
  param: {
    origin: true
  }
})
```

```html
<Imgpond :param="{path:'img'}"/>
```

如果你的上传接口返回值格式为：

```json
{
  "data": {
    "url": "图片链接"
  }
}
```

配置如下：

```js
Vue.use(Imgpond, {
  normalizer: {
    response: 'data.url'
  },
})
```

normalizer.response支持function类型，这在接口返回值是相对路径需要进行拼接时会派上用场：

```js
Vue.use(Imgpond, {
  normalizer: {
    response: res => 'some-domain' + res.data.data
  },
})
```

<br/>

proxy / localProxy:

如果poweredBy配置为filepond 由于filepond的图片预览是用的canvas而非img元素 所以会存在跨域问题

1. 配置Imgpond 将跨域请求转为同域请求 并附上路径标识

  - 一种场景是项目本地调试时 由于localhost和图片链接域名不同导致跨域 需要配置代理 但上线后不再需要 此时使用localProxy
  
    > 仅 localhost / 127.0.0.1 生效

  - 另一种场景是图片链接域名属于第三方 无论是本地还是线上环境 都需要代理 此时使用proxy

```js
Vue.use(Imgpond, {
  proxy: {
    '/amap-img': 'store.is.autonavi.com'
  }
})
```

2. 在vue.config.js中配置代理 将标识过的请求转发到真实的地址

```js
module.exports = {
  devServer: {
    proxy: {
      '/amap-img': {
        target: `http://store.is.autonavi.com`,
        pathRewrite: {
          ['^/amap-img']: ''
        }
      }
    },
  },
}
```

<br/>

### Notice

- 不配置上传接口也可以使用 只是得到的不是图片链接而是base64
- 曾支持canvas图片压缩 但效果不理想 尤其对png不友好 图片压缩还是建议后端来做
- poweredBy参数配置为filepond时 图片链接服务最好能够提供nginx跨域支持（推荐）
- 针对不支持跨域的情况 提供了localhost/线上的代理配置
- 关于格式校验
  - element：原生input的accept属性+后缀名判断双重校验
  - filepond：仅后缀名判断 因为filepond的accepted-file-types属性仅支持mime 细粒度太粗 详见https://github.com/pqina/filepond/issues/43
