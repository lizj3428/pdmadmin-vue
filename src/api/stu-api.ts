import { post } from '@/utils/request'

/**
 * 学生端 API
 * 全部走 /stu/* 前缀，后端类上锁的是 student 角色，
 * 管理员和教师调会 403，普通学生只能看到发给自己、已发布的内容。
 */
export const stuApi = {
  /** 已发布资讯列表，可按标题、分类、标签筛选 */
  newsList: (param: any, pageNum: any, pageSize: any, tagId?: any) => {
    let url = `/stu/news/list?pageNum=${pageNum}&pageSize=${pageSize}`
    if (tagId) {
      url += `&tagId=${tagId}`
    }
    return post(url, param)
  },

  /** 资讯详情，同一学生首次阅读计数 */
  newsDetail: (id: any) => {
    return post('/stu/news/detail?id=' + id, {})
  },

  /** 分类下拉（只有启用中的分类） */
  categories: () => {
    return post('/stu/category/list', {})
  },

  /** 标签下拉 */
  tags: () => {
    return post('/stu/tag/list', {})
  },

  /** 我的消息，readFlag 传 0 只看未读、传 1 只看已读、不传看全部 */
  messageList: (param: any, pageNum: any, pageSize: any) => {
    return post(`/stu/message/list?pageNum=${pageNum}&pageSize=${pageSize}`, param)
  },

  /** 标记单条已读 */
  readMessage: (id: any) => {
    return post('/stu/message/read?id=' + id, {})
  },

  readMessagesByNews: (newsId: string) => {
    return post('/stu/message/readByNews?newsId=' + encodeURIComponent(newsId), {})
  },

  /** 全部标记已读 */
  readAll: () => {
    return post('/stu/message/readAll', {})
  },

  /** 未读条数，用于导航上的小红点 */
  unreadCount: () => {
    return post('/stu/message/unread', {})
  },

  /** 我的资料 */
  profile: () => {
    return post('/stu/profile', {})
  },

  /** 我的订阅（带分类/标签名称） */
  subscribeList: () => {
    return post('/stu/subscribe/list', {})
  },

  /** 保存订阅：整体覆盖，传空数组表示全部取消 */
  saveSubscribe: (targetType: number, targetIds: number[]) => {
    let url = `/stu/subscribe/save?targetType=${targetType}`
    if (targetIds.length > 0) {
      url += `&targetIds=${targetIds.join(',')}`
    }
    return post(url, {})
  },

  /** 收藏/取消收藏，返回 { collected: boolean } */
  toggleCollect: (newsId: any) => {
    return post('/stu/collect/toggle?newsId=' + newsId, {})
  },

  /** 当前学生是否已收藏该资讯 */
  collectStatus: (newsId: any) => {
    return post('/stu/collect/status?newsId=' + newsId, {})
  },

  /** 我的收藏列表 */
  collectList: () => {
    return post('/stu/collect/list', {})
  },

  /** 某篇资讯的评论列表 */
  commentList: (newsId: any) => {
    return post('/stu/comment/list?newsId=' + newsId, {})
  },

  /** 发表评论，内容不超过 300 字 */
  addComment: (newsId: any, content: string) => {
    return post(`/stu/comment/add?newsId=${newsId}&content=${encodeURIComponent(content)}`, {})
  },
}
