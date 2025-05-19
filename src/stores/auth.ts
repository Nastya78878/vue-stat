// stores/auth.ts
import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'

// Глобальные настройки Axios
axios.defaults.baseURL = 'http://localhost:3000'
axios.defaults.withCredentials = true

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ id: string; name: string } | null>(null)
  const loading = ref(false)

  // Fetch current user based on existing cookie
  async function fetchUser(): Promise<void> {
    loading.value = true
    try {
      const res = await axios.get('/auth/profile')
      console.log('fetchUser response data:', res.data)
      user.value = res.data.id
        ? {
            id: res.data.id,
            name: res.data.name,
          }
        : null
      console.log('fetchUser resolved user:', user.value)
    } catch (err) {
      console.error('fetchUser error:', err)
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function login(name: string, password: string) {
    loading.value = true
    try {
      await axios.post('/auth/login', { name, password })
      await fetchUser()
    } finally {
      loading.value = false
    }
  }

  async function register(name: string, password: string) {
    loading.value = true
    try {
      await axios.post('/auth/register', { name, password })
      await fetchUser()
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      await axios.post('/auth/logout')
      user.value = null
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      loading.value = false
    }
  }

  return { user, loading, fetchUser, login, register, logout }
})
