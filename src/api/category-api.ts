import { post } from '@/utils/request'

/**
 * 资讯分类管理 API
 */
export const categoryApi = {
  /** 分页查询分类 */
  queryPageList: (param: any, pageNum: any, pageSize: any) => {
    return post('/category/list?pageNum=' + pageNum + '&pageSize=' + pageSize, param)
  },

  /** 全部启用分类（下拉框用，不分页） */
  all: () => {
    return post('/category/all', {})
  },

  /** 新增分类 */
  add: (param: any) => {
    return post('/category/add', param)
  },

  /** 修改分类 */
  update: (param: any) => {
    return post('/category/update', param)
  },

  /** 批量删除分类 */
  delete: (ids: any) => {
    return post('/category/del?ids=' + ids, {})
  },
}
