import request from '@/utils/request'

/**
 * 获取员工的简单列表
 * **/
export function reqGetEmployeeSimple() {
  return request({
    url: '/sys/user/simple'
  })
}

/**
 * 获取员工的综合列表数据 (分页)
 * ***/
export function reqGetEmployeeList(page, size) {
  return request({
    methods: 'get',
    url: '/sys/user',
    params: {
      page,
      size
    }
  })
}
