// src/router/index.js или src/index.js, в зависимости от структуры вашего проекта

import { createRouter, createWebHistory } from 'vue-router'

import Tool from '@/modules/tabs/components/Tabs.vue'
import Login from '@/views/Login.vue'
import Error404 from '@/views/404.vue'

export const Routes = {
  LOGIN: '/Login',
}

const routes = [
  {
    path: '/',
    redirect: '/Tool', // Добавление перенаправления с главной страницы на /Tool
  },
  {
    path: Routes.LOGIN,
    name: 'Login',
    component: Login,
  },
  {
    path: '/Tool',
    name: 'Tool',
    component: Tool,
  },
  {
    path: '/:catchAll(.*)',
    name: 'Error404',
    component: Error404,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Добавление глобального охранника маршрутов
router.beforeEach((to, from, next) => {
  const isAuthorized = !!localStorage.getItem('token')
  if (!isAuthorized && to.path !== Routes.LOGIN) {
    next({ path: Routes.LOGIN })
  } else if (isAuthorized && to.path === Routes.LOGIN) {
    next({ path: '/' }) // Если пользователь уже авторизован и пытается перейти на страницу входа, перенаправляем на главную
  } else {
    next() // Во всех остальных случаях выполняем переход на запрашиваемый маршрут
  }
})

export default router
