import { post } from '@/utils/request'

/**
 * 资讯管理 API
 * 后端全部为 POST，分页参数走 query，查询条件走 body
 */
export const newsApi = {
  /** 分页查询资讯列表 */
  queryPageList: (param: any, pageNum: any, pageSize: any) => {
    return post('/news/list?pageNum=' + pageNum + '&pageSize=' + pageSize, param)
  },

  /** 热点资讯（后端走 Redis 缓存，key: news:hot:top10，TTL 5 分钟） */
  hot: () => {
    return post('/news/hot', {})
  },

  /** 新增资讯，body 里的 tagNames 是标签名数组，库里没有的会被自动创建 */
  add: (param: any) => {
    return post('/news/add', param)
  },

  /** 修改资讯 */
  update: (param: any) => {
    return post('/news/update', param)
  },

  /** 批量删除资讯，ids 用逗号分隔 */
  delete: (ids: any) => {
    return post('/news/del?ids=' + ids, {})
  },

  /** 查询资讯详情（含标签） */
  detail: (id: any) => {
    return post('/news/detail?id=' + id, {})
  },

  /** 审核资讯：auditStatus 1 通过 2 驳回 */
  audit: (id: any, auditStatus: any, auditOpinion?: string) => {
    let url = '/news/audit?id=' + id + '&auditStatus=' + auditStatus
    if (auditOpinion) {
      url += '&auditOpinion=' + encodeURIComponent(auditOpinion)
    }
    return post(url, {})
  },
}
