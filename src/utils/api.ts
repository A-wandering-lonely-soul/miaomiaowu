import axios from 'axios'
import { ElMessage } from 'element-plus'
import type { Router } from 'vue-router'

axios.defaults.withCredentials = true
const base = '/api'

let apiRouter: Router | null = null
export function setApiRouter(r: Router) {
  apiRouter = r
}

axios.interceptors.response.use(
  (success) => {
    const data = success.data
    if (success.status === 200 && data?.status === 500) {
      ElMessage.error({ message: data.msg || '错误' })
      return Promise.reject(new Error(data.msg))
    }
    if (data?.msg && !(success.config as { silent?: boolean }).silent) {
      ElMessage.success({ message: data.msg })
    }
    return data
  },
  (error) => {
    const status = error.response?.status
    const errorMsg = error.response?.data?.msg
    if (status === 504) ElMessage.error({ message: errorMsg || '找不到服务器' })
    else if (status === 403) ElMessage.error({ message: errorMsg || '权限不足，请联系管理员' })
    else if (status === 401) {
      ElMessage.error({ message: errorMsg || '尚未登录，请登录' })
      apiRouter?.replace('/')
    } else if (status === 404) ElMessage.error({ message: errorMsg || '资源不存在' })
    else if (status === 500) ElMessage.error({ message: errorMsg || '服务器内部错误' })
    else ElMessage.error({ message: errorMsg || '未知错误' })
    return Promise.reject(error)
  }
)

export function postKeyValueRequest(url: string, params: Record<string, string>) {
  return axios({
    method: 'post',
    url: `${base}${url}`,
    data: params,
    transformRequest: [
      (data: Record<string, string>) => {
        let ret = ''
        for (const i in data) {
          ret += encodeURIComponent(i) + '=' + encodeURIComponent(data[i]) + '&'
        }
        return ret
      },
    ],
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export function postRequest(url: string, params?: unknown, config?: object) {
  return axios({ method: 'post', url: `${base}${url}`, data: params, ...config })
}

export function getRequest(url: string, config?: object) {
  return axios({ method: 'get', url: `${base}${url}`, ...config })
}

export function putRequest(url: string, params?: unknown, config?: object) {
  return axios({ method: 'put', url: `${base}${url}`, data: params, ...config })
}

export function deleteRequest(url: string, config?: object) {
  return axios({ method: 'delete', url: `${base}${url}`, ...config })
}
