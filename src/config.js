import { isEmpty } from 'plain-kit'

let request, url, globalParam, globalCount, globalEdit, globalMaxSize, localProxy, proxy, sizeExceededWarningHTML,
  fixedRatioDeviation, poweredBy, normalizer, requestConfig

export const init = (opts = {}) => {
  request = opts.request
  requestConfig = opts.requestConfig
  url = opts.url
  globalParam = opts.param || {}
  globalCount = opts.count
  globalEdit = opts.edit
  globalMaxSize = opts.maxSize
  fixedRatioDeviation = isEmpty(opts.fixedRatioDeviation) ? .1 : opts.fixedRatioDeviation
  localProxy = opts.localProxy || {}
  proxy = opts.proxy || {}
  sizeExceededWarningHTML = opts.sizeExceededWarningHTML || ''
  poweredBy = opts.poweredBy || 'filepond'
  normalizer = {
    response: 'data',
    param: 'file',
    ...opts.normalizer || opts.key
  }
}

export function api (param) {
  // 参数
  const data = {
    ...globalParam,
    ...param
  }

  const formData = new FormData()
  for (let k in data) {
    formData.append(k, data[k])
  }

  return url && (typeof request === 'function' ? request({
    baseURL: '', // 针对prod环境中baseApi为相对路径的情况
    url,
    method: 'POST',
    data: formData,
    timeout: 20000,
    ...typeof requestConfig === 'function' ? requestConfig(data) : requestConfig
  }) : fetch(url, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers: {},
    body: formData,
    ...typeof requestConfig === 'function' ? requestConfig(data) : requestConfig
  }).then(res => {
    if (res.ok) {
      return res.json()
    } else {
      return Promise.reject({
        status: res.status,
        statusText: res.statusText
      })
    }
  }))
}

export {
  request,
  localProxy,
  proxy,
  sizeExceededWarningHTML,
  globalCount,
  globalEdit,
  globalMaxSize,
  fixedRatioDeviation,
  poweredBy,
  normalizer,
}
