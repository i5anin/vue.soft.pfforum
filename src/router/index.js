// src/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Tool from '@/views/Tools/ToolTab.vue'
import Login from '@/views/Login.vue'
import Error404 from '@/views/404.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/Login',
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

export default router
