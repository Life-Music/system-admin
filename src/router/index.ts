import { createRouter, createWebHistory } from 'vue-router'
import routerNames from './routerNames'
import HomeView from '@/views/HomeView.vue'
import UserManagementView from '@/views/management/UserManagementView.vue'
import CategoryManagementView from '@/views/management/CategoryManagementView.vue'
import InvoiceManagementView from '@/views/management/InvoiceManagementView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth',
      children: [
        {
          name: routerNames.LOGIN,
          path: 'login',
          component: () => import('@/views/auth/LoginView.vue'),
          meta: {
            layout: "AuthLayout",
          }
        },
        {
          name: routerNames.LOGOUT,
          path: 'logout',
          component: () => import('@/views/auth/LogoutView.vue'),
          meta: {
            layout: "AuthLayout",
          }
        }
      ]
    },
    {
      path: '/',
      component: HomeView,
    },
    {
      path: '/management',
      children: [
        {
          name: routerNames.HOME,
          path: '',
          component: HomeView,
        },
        {
          name: routerNames.MANAGEMENT_USER,
          path: 'user',
          component: UserManagementView,
        },
        {
          name: routerNames.MANAGEMENT_CATEGORY,
          path: 'category',
          component: CategoryManagementView,
        },
        {
          name: routerNames.MANAGEMENT_INVOICE,
          path: 'invoice',
          component: InvoiceManagementView,
        }
      ]
    }
  ]
})

export default router
