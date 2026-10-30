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
        { path: 'welcome', name: 'Welcome', component: () => import('../views/WelcomeVue.vue') },
        { path: 'admin', name: 'Admin', component: () => import('../views/admin/List.vue') },

      ],
    },
    // 兜底：任何未匹配路径都回首页，避免白屏
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})


router.beforeEach(async(to,from) => {
  const adminStore = useAdminStore();
  if (to.path === '/login') {
    return true;
  } 
   const token = useAdminStore().getToken;
   if  (!token){
    return { path: '/login' }
   }
    
  
});

export default router
