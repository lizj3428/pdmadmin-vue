import { createRouter, createWebHistory } from 'vue-router'
import { useAdminStore } from '@/stores/admin.ts'; 

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
