import { post } from '@/utils/request'

/**
 * 推送管理 API
 */
export const pushApi = {
  /** 新建推送任务；pushType=1 立即执行，2 定时（需带 planTime） */
  add: (param: any) => {
    return post('/push/add', param)
  },

  /** 分页查询推送任务 */
  queryPageList: (param: any, pageNum: any, pageSize: any) => {
    return post('/push/list?pageNum=' + pageNum + '&pageSize=' + pageSize, param)
  },

  /** 手动执行某个任务 */
  run: (taskId: any) => {
    return post('/push/run?taskId=' + taskId, {})
  },

  /** 批量删除任务（连带删除推送记录） */
  delete: (ids: any) => {
    return post('/push/del?ids=' + ids, {})
  },

  /** 查询某个任务的推送记录明细 */
  records: (taskId: any, pageNum: any, pageSize: any) => {
    return post(
      '/push/records?taskId=' + taskId + '&pageNum=' + pageNum + '&pageSize=' + pageSize,
      {},
    )
  },

  /** 预估目标人数，只算不执行 */
  preview: (targetType: any, targetValue?: string) => {
    let url = '/push/preview?targetType=' + targetType
    if (targetValue) {
      url += '&targetValue=' + encodeURIComponent(targetValue)
    }
    return post(url, {})
  },
}
