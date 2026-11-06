import { post } from '@/utils/request'

/**
 * 资讯标签管理 API
 */
export const tagApi = {
  /** 分页查询标签，返回体里的 useCount 是该标签被多少条资讯引用 */
  queryPageList: (param: any, pageNum: any, pageSize: any) => {
    return post('/tag/list?pageNum=' + pageNum + '&pageSize=' + pageSize, param)
  },

  /** 新增标签 */
  add: (param: any) => {
    return post('/tag/add', param)
  },

  /** 修改标签 */
  update: (param: any) => {
    return post('/tag/update', param)
  },

  /** 批量删除标签 */
  delete: (ids: any) => {
    return post('/tag/del?ids=' + ids, {})
  },
}
