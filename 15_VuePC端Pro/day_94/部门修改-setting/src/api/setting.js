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
