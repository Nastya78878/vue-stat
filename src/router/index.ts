// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '../components/ProfileComponents/ProfileComponent.vue'
import AuthComponent from '../components/AuthComponents/AuthComponent.vue'
import { useAuthStore } from '../stores/auth'

const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'auth', component: AuthComponent },
  { path: '/home', name: 'home', component: HomeView, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  console.log('Guard start: target=', to.name)
  console.log('Cookies:', document.cookie)

  // Всегда проверяем актуальное состояние пользователя
  await authStore.fetchUser()
  const isLogged = Boolean(authStore.user)
  console.log('After fetchUser: loggedIn=', isLogged)

  if (to.meta.requiresAuth && !isLogged) {
    console.log('Redirect to auth: not authenticated')
    return next({ name: 'auth' })
  }
  if (to.name === 'auth' && isLogged) {
    console.log('Redirect to home: already authenticated')
    return next({ name: 'home' })
  }

  next()
})

export default router
