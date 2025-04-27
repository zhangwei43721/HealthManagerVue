import Vue from 'vue';
import Router from 'vue-router';
import Layout from '@/layout';

Vue.use(Router);

/**
 * constantRoutes
 * Base routes accessible to all users
 */
export const constantRoutes = [

  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      { 
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index'),
        meta: { title: '首页', icon: 'el-icon-house', affix: true }
      },
      {
        path: 'ai-qa',
        name: 'AiHealthQA',
        component: () => import('@/views/health/ai-qa'),
        meta: { title: 'AI健康问答', icon: 'dashboard' }
      }
    ]
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/register/register'),
    hidden: true,
    meta: { requiresAuth: false }
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: () => import('@/views/Change_Password/Change_Password'),
    hidden: true,
    meta: { requiresAuth: false }
  },
  {
    path: '/change-avatar',
    name: 'ChangeAvatar',
    component: () => import('@/views/Change_Avatar/Change_Avatar'),
    hidden: true,
    meta: { requiresAuth: false }
  },
];

const createRouter = () => new Router({
  // mode: 'history', // Enable if your server supports it
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
});

const router = createRouter();

// Reset the router
export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher;
}

export default router;
