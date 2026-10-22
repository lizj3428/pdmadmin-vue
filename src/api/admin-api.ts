import { get, post } from '@/utils/request'
/**
 * 管理员API接口
 */
export const adminApi = {
  /**
   * 添加管理员
   */
  add: (param: any) => {
    return post('/admin/add', param)
  },
  /**
   * 更新管理员信息
   */
  update: (param: any) => {
    return post('/admin/update', param)
  },
  /**
   * 删除管理员
   * @param i 管理员ID
   */
  delete: (ids: any) => {
    return post('/admin/del?ids=' + ids, {})
  },
  /**
   * 查询管理员列表（分页）
   * @param param 查询参数
   * @param pageNum 页码
   * @param pageSize 每页条数
   */
  queryPageList: (param: any, pageNum: any, pageSize: any) => {
    return post('/admin/list?pageNum=' + pageNum + '&pageSize=' + pageSize, param)
  },
}
