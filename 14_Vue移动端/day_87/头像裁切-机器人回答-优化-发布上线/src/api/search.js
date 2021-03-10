// 搜索相关的模块操作, 全都封装在这里
import http from '@/utils/http'

/**
 * 根据搜索关键字获取搜索建议
 * @param {*} keyword 关键字
 */
export const reqGetSuggestion = keyword => {
  return http({
    method: 'get',
    url: '/v1_0/suggestion',
    params: {
      q: keyword
    }
  })
}

/**
 * 搜索
 * @param {*} q 搜索关键字
 * @param {*} page 搜索页码
 */
export const reqGetSearch = (q, page) => {
  return http({
    method: 'get',
    url: '/v1_0/search',
    params: {
      q,
      page
    }
  })
}
