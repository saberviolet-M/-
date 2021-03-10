// 以模块的方式导出 举报文章 时，后端接口约定的举报类型
const reports = [
  {
    value: 0,
    label: '其它问题'
  },
  {
    value: 1,
    label: '标题夸张'
  },
  {
    value: 2,
    label: '低俗色情'
  },
  {
    value: 3,
    label: '错别字多'
  },
  {
    value: 4,
    label: '旧闻重复'
  },
  {
    value: 6,
    label: '内容不实'
  },
  {
    value: 8,
    label: '侵权'
  },
  {
    value: 5,
    label: '广告软文'
  },
  {
    value: 7,
    label: '涉嫌违法犯罪'
  }
]

export default reports
