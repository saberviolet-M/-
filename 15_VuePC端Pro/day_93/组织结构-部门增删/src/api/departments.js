import request from '@/utils/request'

/**
 * 获取部门数据
 **/
export function reqGetDepartments() {
  return request({
    url: '/company/department',
    method: 'get'
  })
}

/**
 * 删除部门
 **/
export function reqDelDepartments(id) {
  return request({
    url: `/company/department/${id}`,
    method: 'delete'
  })
}

/**
 * 新增部门
 **/
export function reqAddDepartments(data) {
  return request({
    url: '/company/department',
    method: 'post',
    data
  })
}
