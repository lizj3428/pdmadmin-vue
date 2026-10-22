import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
        { path: 'welcome', name: 'Welcome', component: () => import('../views/WelcomeVue.vue') },
        { path: 'admin', name: 'Admin', component: () => import('../views/admin/List.vue') },
      
      ],
    },
  ],
})

export default router
