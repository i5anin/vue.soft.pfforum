// src/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Tool from '@/modules/tool/components/Tabs.vue'
import Login from '@/views/Login.vue'
import Error404 from '@/views/404.vue'

export const Routes = {
  LOGIN: '/Login',
}

// const authGuard = {
//   Home(to, from, next) {
//     if (localStorage.getItem('user')) {
//       next()
//     } else {
//       next('/Login')
//     }
//   },
// }

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    // beforeEnter: authGuard.Home
  },
  {
    path: Routes.LOGIN,
    name: 'Login',
    component: Login,
  },
  {
    path: '/Tool/:parentId',
    name: 'ToolWithParentId',
    component: Tool,
    props: true,
  },
  // Маршрут без параметра parentId
  {
    path: '/Tool',
    name: 'Tool',
    component: Tool,
    props: { parentId: 0 }, // Здесь мы устанавливаем parentId по умолчанию
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

export default router
