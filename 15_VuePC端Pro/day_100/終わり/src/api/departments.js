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

/** *
 * 获取部门详情
 * ***/
export function reqGetDepartDetail(id) {
  return request({
    url: `/company/department/${id}`
  })
}

/**
 * 编辑部门
 ***/
export function reqUpdateDepartments(data) {
  return request({
    url: `/company/department/${data.id}`,
    method: 'put',
    data
  })
}
