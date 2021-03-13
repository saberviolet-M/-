import axios from 'axios'
import { Message } from 'element-ui'

// 创建一个axios的实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  timeout: 5000 // request timeout
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
  Message.error(reason.message)
  return Promise.reject(reason)
})

export default service // 导出axios实例
