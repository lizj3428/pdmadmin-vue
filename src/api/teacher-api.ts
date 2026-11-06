import { post } from '@/utils/request'

/**
 * 教师管理 API
 */
export const teacherApi = {
  /** 分页查询教师（返回的密码字段为空，后端已脱敏） */
  queryPageList: (param: any, pageNum: any, pageSize: any) => {
    return post('/teacher/list?pageNum=' + pageNum + '&pageSize=' + pageSize, param)
  },

  /** 新增教师，教工号唯一 */
  add: (param: any) => {
    return post('/teacher/add', param)
  },

  /** 修改教师，密码留空表示不修改 */
  update: (param: any) => {
    return post('/teacher/update', param)
  },

  /** 批量删除教师 */
  delete: (ids: any) => {
    return post('/teacher/del?ids=' + ids, {})
  },

  /** 教师登录（后端 @RequestParam 接收，所以走 URL 参数） */
  login: (param: any) => {
    return post(
      '/teacher/login?teacherNo=' +
        encodeURIComponent(param.teacherNo) +
        '&password=' +
        encodeURIComponent(param.password),
      {},
    )
  },

  /** 教师退出登录 */
  logout: () => {
    return post('/teacher/logout', {})
  },

  /** 设置/取消教师的管理端权限，adminFlag=1 授权，0 取消 */
  grantAdmin: (id: any, adminFlag: number) => {
    return post('/teacher/grantAdmin?id=' + id + '&adminFlag=' + adminFlag, {})
  },
}
