let request, url, globalParam, globalCount, globalEdit, globalMaxSize, localProxy, proxy, sizeExceededWarningHTML,
  fixedRatioDeviation, poweredBy, normalizer, requestConfig, valueType, fixedRatio, accept

export const init = (opts = {}) => {
  request = opts.request
  requestConfig = opts.requestConfig
  url = opts.url
  accept = opts.accept
  globalParam = opts.param
  globalCount = opts.count
  globalEdit = opts.edit
  globalMaxSize = opts.maxSize
  localProxy = opts.localProxy
  proxy = opts.proxy
  valueType = opts.valueType
  sizeExceededWarningHTML = opts.sizeExceededWarningHTML
  fixedRatio = opts.fixedRatio
  fixedRatioDeviation = opts.fixedRatioDeviation
  poweredBy = opts.poweredBy || 'filepond'
  normalizer = opts.normalizer || opts.key // todo: deprecated
}

export function api ({
  url, param, request, requestConfig
}) {
  const formData = new FormData()
  for (let k in param) {
    formData.append(k, param[k])
  }

  return url && (typeof request === 'function' ? request({
    baseURL: '', // 针对prod环境中baseApi为相对路径的情况
    url,
    method: 'POST',
    data: formData,
    timeout: 20000,
    ...typeof requestConfig === 'function' ? requestConfig(param) : requestConfig
  }) : fetch(url, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers: {},
    body: formData,
    ...typeof requestConfig === 'function' ? requestConfig(param) : requestConfig
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
  url,
  accept,
  request,
  requestConfig,
  localProxy,
  proxy,
  sizeExceededWarningHTML,
  globalCount,
  globalEdit,
  globalMaxSize,
  fixedRatio,
  fixedRatioDeviation,
  poweredBy,
  normalizer,
  globalParam,
  valueType
}
