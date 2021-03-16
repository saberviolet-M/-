import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import router from '@/router'
// 创建一个axios的实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  timeout: 5000 // request timeout
})

service.interceptors.request.use(config => {
  if (store.getters.token) {
    config.headers.Authorization = `Bearer ${store.getters.token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

service.interceptors.response.use(value => {
  const res = value.data
  const { message, success } = res
  if (!success) {
    Message.error(message)
    return Promise.reject(new Error(message))
  }
  return res
}, reason => {
  console.dir(reason)
  if (reason.response.status === 401 && reason.response.data.code === 10002) {
    Message.error('登录会话过期，请重新登录')
    store.dispatch('user/logout')
    router.push('/')
  } else {
    Message.error(reason.message)
  }
  return Promise.reject(reason)
})

export default service // 导出axios实例
