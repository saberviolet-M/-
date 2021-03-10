import axios from 'axios'
import store from '@/store/index'
import JSONbig from 'json-bigint'
import router from '@/router'
import { reqPutNewToken } from '@/api/user'

const http = axios.create({
  baseURL: 'http://toutiao-app.itheima.net',
  transformResponse: [
    data => {
      try {
        return JSONbig.parse(data)
      } catch (error) {
        return data
      }
    }
  ]
})

http.interceptors.request.use(
  config => {
    const token = store.state.user.tokenInfo.token
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)
http.interceptors.response.use(
  response => {
    return response
  },
  async error => {
    if (error.response.status === 401) {
      const refreshToken = store.state.user.tokenInfo.refresh_token
      if (refreshToken) {
        try {
          const {
            data: {
              data: { token }
            }
          } = await reqPutNewToken(refreshToken)
          const newToken = token
          store.commit('user/setTokenInfo', {
            token: newToken,
            refresh_token: refreshToken
          })
          error.config.headers.Authorization = `Bearer ${newToken}`
          return http(error.config)
        } catch (error) {
          store.commit('user/removeTokenInfo')
          router.push({
            path: '/login',
            query: {
              backTo: router.currentRoute.fullPath
            }
          })
        }
      } else {
        store.commit('user/removeTokenInfo')
        router.push({
          path: '/login',
          query: {
            backTo: router.currentRoute.fullPath
          }
        })
      }
    }
    return Promise.reject(error)
  }
)
export default http
