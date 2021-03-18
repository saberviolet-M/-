import request from '@/utils/request'

export function reqGetDepartments() {
  return request({
    url: '/company/department',
    method: 'get'
  })
}
