import { createRouter, createWebHistory } from 'vue-router'
import { useAdminStore } from '@/stores/admin.ts'; 

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 根路径重定向到登录页，避免直接访问 localhost:5173 时白屏
    { path: '/', redirect: '/login' },
    {
       path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/index',
      name: 'Index',
      component: () => import('../views/Index.vue'),
      // 去掉 welcome 前面的 /
      children: [
        // 访问 /index 时默认展示 welcome，避免内容区空白
        { path: '', redirect: { name: 'Welcome' } },

        // ---------- 数据看板 ----------
        { path: 'welcome', name: 'Welcome', component: () => import('../views/WelcomeVue.vue') },

        // ---------- 资讯管理 ----------
        { path: 'news', name: 'News', component: () => import('../views/news/List.vue') },
        { path: 'news-audit', name: 'NewsAudit', component: () => import('../views/news/Audit.vue') },
        { path: 'category', name: 'Category', component: () => import('../views/category/List.vue') },
        { path: 'tag', name: 'Tag', component: () => import('../views/tag/List.vue') },

        // ---------- 用户管理 ----------
        { path: 'admin', name: 'Admin', component: () => import('../views/admin/List.vue') },
        { path: 'student', name: 'Student', component: () => import('../views/student/List.vue') },
        { path: 'teacher', name: 'Teacher', component: () => import('../views/teacher/List.vue') },

        // ---------- 推送管理 ----------
        { path: 'push-task', name: 'PushTask', component: () => import('../views/push/Task.vue') },
        { path: 'push-record', name: 'PushRecord', component: () => import('../views/push/Record.vue') },

        // ---------- 数据统计 ----------
        { path: 'stat', name: 'Stat', component: () => import('../views/stat/Index.vue') },
      ],
    },
    // ---------- 教师端（普通教师投稿，和被授权进管理端的教师是两个入口）----------
    {
      path: '/tch',
      name: 'Tch',
      component: () => import('../views/tch/Index.vue'),
      children: [
        { path: '', redirect: { name: 'TchNews' } },
        { path: 'news', name: 'TchNews', component: () => import('../views/tch/NewsList.vue') },
      ],
    },
    // ---------- 学生端（普通学生看资讯、收消息、订阅）----------
    {
      path: '/stu',
      name: 'Stu',
      component: () => import('../views/stu/Index.vue'),
      children: [
        { path: '', redirect: { name: 'StuHome' } },
        { path: 'home', name: 'StuHome', component: () => import('../views/stu/Home.vue') },
        {
          path: 'news/:id',
          name: 'StuNewsDetail',
          component: () => import('../views/stu/NewsDetail.vue'),
        },
        { path: 'message', name: 'StuMessage', component: () => import('../views/stu/Message.vue') },
        { path: 'profile', name: 'StuProfile', component: () => import('../views/stu/Profile.vue') },
      ],
    },
    // 兜底：任何未匹配路径都回首页，避免白屏
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})


router.beforeEach((to, from) => {
  const adminStore = useAdminStore()
  // 登录页永远放行，否则登录页自己都进不去
  if (to.path === '/login') {
    return true
  }
  if (!adminStore.getToken) {
    return { path: '/login' }
  }
  /*
   * 有管理端权限的（管理员、被授权的教师/学生会）可以访问任何页面；
   * 没有管理端权限的：普通教师只能待在 /tch，普通学生只能待在 /stu，
   * 直接敲 /index 会被弹回各自的入口。
   * 后端那边本来就会 403，这里拦一道是为了不让用户看到满屏报错。
   */
  if (!adminStore.canManage) {
    if (adminStore.identity === 'student') {
      if (!to.path.startsWith('/stu')) {
        return { path: '/stu/home' }
      }
    } else if (!to.path.startsWith('/tch')) {
      return { path: '/tch' }
    }
  }
  return true
})

export default router
