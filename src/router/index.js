// src/api.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Tool from '@/views/Tool.vue'
import Error404 from '@/views/404.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
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
