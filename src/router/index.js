// src/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Home2 from '@/views/Home2.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },

  {
    path: '/Home2',
    name: 'Home2',
    component: Home2,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
