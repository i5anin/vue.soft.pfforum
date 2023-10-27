// src/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Tool from '@/views/Tool.vue'

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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
