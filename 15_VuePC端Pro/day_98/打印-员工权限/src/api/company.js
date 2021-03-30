// 企业相关
import request from '@/utils/request'

// 根据 id 查询企业
export const reqGetCompanyById = (id) => {
  return request({
    method: 'get',
    url: `/company/${id}`
  })
}
