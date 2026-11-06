import { post } from '@/utils/request'

/**
 * 数据统计 API（全部为实时聚合查询）
 */
export const statApi = {
  /** 总览：资讯数、阅读量、用户数、推送量等 12 项指标 */
  overview: () => {
    return post('/stat/overview', {})
  },

  /** 各分类的资讯数量 */
  newsByCategory: () => {
    return post('/stat/newsByCategory', {})
  },

  /** 阅读量 Top N 资讯 */
  newsTop: (limit: any) => {
    return post('/stat/newsTop?limit=' + limit, {})
  },

  /** 近 N 天推送趋势（成功 / 失败） */
  pushDaily: (days: any) => {
    return post('/stat/pushDaily?days=' + days, {})
  },

  /** 推送状态分布 */
  pushStatus: () => {
    return post('/stat/pushStatus', {})
  },

  /** 近 N 天新增学生数 */
  studentDaily: (days: any) => {
    return post('/stat/studentDaily?days=' + days, {})
  },
}
