/**
 * 应用常量配置
 * 包含系统中使用的各种常量值
 */
export default {
  /** 用户令牌存储键名 */
  USER_TOKEN: 'admin_token',
  /** API 基础请求地址 */
  BASE_URL: import.meta.env.VITE_APP_API_URL,
  /** 默认分页大小 */
  PAGE_SIZE: 10,
  /** 管理员登录页面路径 */
  PAGE_ADMIN_LOGIN: '/login',
}
