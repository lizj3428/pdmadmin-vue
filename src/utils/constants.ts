/**
 * 应用常量配置
 * 包含系统中使用的各种常量值
 */
export default {
  /** 用户令牌存储键名 */
  USER_TOKEN: 'admin_token',
  /** 登录身份存储键名（admin / teacher / student），刷新后顶栏据此显示 */
  USER_IDENTITY: 'admin_identity',
  /** 是否有管理端权限（'1' / '0'），教师、学生登录后据此决定跳管理端还是教师端 */
  USER_ADMIN_FLAG: 'admin_flag',
  /** 当前登录用户在自己那张表里的主键，刷新后仍能判断"这条资讯是不是我发的" */
  USER_ID: 'admin_user_id',
  /** API 基础请求地址 */
  BASE_URL: import.meta.env.VITE_APP_API_URL,
  /** 默认分页大小 */
  PAGE_SIZE: 10,
  /** 管理员登录页面路径 */
  PAGE_ADMIN_LOGIN: '/login',
}
