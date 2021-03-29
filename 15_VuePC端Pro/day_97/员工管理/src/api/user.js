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

export function reqGetUserDetailById(id) {
  return request({
    method: 'GET',
    url: `/sys/user/${id}`
  })
}

/** *
 * 保存员工的基本信息
 * **/
export function reqSaveUserDetailById(data) {
  return request({
    method: 'put',
    url: `/sys/user/${data.id}`,
    data
  })
}
