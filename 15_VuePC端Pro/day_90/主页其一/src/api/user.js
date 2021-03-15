import request from '@/utils/request'

export function reqLogin(data) {
  return request({
    method: 'POST',
    url: '/sys/login',
    data
  })
}

export function reqGetInfo(token) {
  return request({
    method: 'POST',
    url: '/sys/profile'
  })
}

export function logout() {}
