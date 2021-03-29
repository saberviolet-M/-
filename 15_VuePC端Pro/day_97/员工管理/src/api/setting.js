import request from '@/utils/request'
/**
 * 获取角色列表
 * ***/
export function reqGetRoleList(page, pagesize) {
  return request({
    method: 'get',
    url: '/sys/role',
    params: {
      page,
      pagesize
    }
  })
}

/**
 * 根据id删除角色
 * @param {number} id
 * @return request
 */
export function reqDeleteRoleById(id) {
  return request({
    method: 'delete',
    url: `/sys/role/${id}`
  })
}

/**
 * 添加角色
 */
export function reqAddRole(data) {
  return request({
    method: 'post',
    url: `/sys/role`,
    data
  })
}

/**
 * 根据id修改角色
 */
export function reqUpdateRoleById(data) {
  return request({
    method: 'put',
    url: `/sys/role/${data.id}`,
    data
  })
}

/**
 * 根据 id 获取角色详情, 用于回显
 * **/
export function reqGetRoleDetail(id) {
  return request({
    method: 'get',
    url: `/sys/role/${id}`
  })
}
