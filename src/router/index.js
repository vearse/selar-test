import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CalendarView from '../views/CalendarView.vue'
import GoogleCallbackView from '../views/GoogleCallbackView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: CalendarView,
      meta: { requiresAuth: true }
    },
    {
      path: '/google/callback',
      name: 'google-callback',
      component: GoogleCallbackView
    }
  ]
})

// Simple navigation guard to check if user is authenticated
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token') !== null
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router