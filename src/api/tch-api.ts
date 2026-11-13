import { post } from '@/utils/request'

/**
 * 教师投稿 API
 * 全部走 /tch/* 前缀，后端类上锁的是 teacher 角色，
 * 学生调不到，普通教师只能看到自己的稿子。
 */
export const tchApi = {
  /** 我的投稿列表（后端强制只返回当前教师的） */
  myList: (param: any, pageNum: any, pageSize: any) => {
    return post('/tch/news/list?pageNum=' + pageNum + '&pageSize=' + pageSize, param)
  },

  /** 新增投稿，状态由后端固定为待审核 */
  add: (param: any) => {
    return post('/tch/news/add', param)
  },

  /** 修改投稿，只能改未通过审核的；改完会回到待审核 */
  update: (param: any) => {
    return post('/tch/news/update', param)
  },

  /** 投稿详情（列表不返回正文和标签，编辑前必须先查这个） */
  detail: (id: any) => {
    return post('/tch/news/detail?id=' + id, {})
  },

  /** 分类下拉（管理端的 /category/list 只有管理员能调，这里另开了只读接口） */
  categories: () => {
    return post('/tch/category/list', {})
  },

  /** 标签下拉 */
  tags: () => {
    return post('/tch/tag/list', {})
  },

  /** 本人资料 */
  profile: () => {
    return post('/tch/profile', {})
  },

  /** 修改本人资料，只开放姓名与联系电话 */
  updateProfile: (realName: string, phone: string) => {
    return post(
      `/tch/profile/update?realName=${encodeURIComponent(realName)}&phone=${encodeURIComponent(phone)}`,
      {},
    )
  },

  /** 我的通知（审核结果），后端只返回发给当前教师的 */
  noticeList: (param: any, pageNum: any, pageSize: any) => {
    return post('/tch/notice/list?pageNum=' + pageNum + '&pageSize=' + pageSize, param)
  },

  /** 标记通知已读 */
  noticeRead: (id: any) => {
    return post('/tch/notice/read?id=' + id, {})
  },

  /** 未读通知数 */
  noticeUnread: () => {
    return post('/tch/notice/unread', {})
  },
}
