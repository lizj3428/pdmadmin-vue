import { post } from '@/utils/request'

/**
 * 学生管理 API
 */
export const studentApi = {
  /** 分页查询学生（返回的密码字段为空，后端已脱敏） */
  queryPageList: (param: any, pageNum: any, pageSize: any) => {
    return post('/student/list?pageNum=' + pageNum + '&pageSize=' + pageSize, param)
  },

  /** 新增学生，学号唯一 */
  add: (param: any) => {
    return post('/student/add', param)
  },

  /** 修改学生，密码留空表示不修改 */
  update: (param: any) => {
    return post('/student/update', param)
  },

  /** 批量删除学生 */
  delete: (ids: any) => {
    return post('/student/del?ids=' + ids, {})
  },

  /** 学生登录（后端 @RequestParam 接收，所以走 URL 参数） */
  login: (param: any) => {
    return post(
      '/student/login?studentNo=' +
        encodeURIComponent(param.studentNo) +
        '&password=' +
        encodeURIComponent(param.password),
      {},
    )
  },

  /** 学生退出登录 */
  logout: () => {
    return post('/student/logout', {})
  },

  /** 设置/取消学生的管理端权限，adminFlag=1 授权（学生会），0 取消 */
  grantAdmin: (id: any, adminFlag: number) => {
    return post('/student/grantAdmin?id=' + id + '&adminFlag=' + adminFlag, {})
  },
}
