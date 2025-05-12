<!-- components/AppHeader.vue -->
<template>
  <header class="app-header">
    <h1 class="logo" @click="goHome">Стата</h1>
    <nav class="nav-buttons">
      <button class="btn" @click="goHome">Главная</button>
      <button class="btn" @click="logout">Выход</button>
    </nav>
  </header>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function goHome() {
  router.push({ name: 'home' })
}

async function logout() {
  await authStore.logout()
  router.push({ name: 'auth' })
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 0.75rem 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border-bottom: 2px solid #eee;
  transition:
    background 0.3s ease,
    color 0.3s ease;
}

.app-header:hover {
  background: #333;
}

.logo {
  font-size: 1.25rem;
  font-weight: bold;
  color: #264653;
  cursor: pointer;
  user-select: none;
  transition: color 0.3s ease;
}

.app-header:hover .logo {
  color: #fafafa;
}

.nav-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid #333;
  border-radius: 4px;
  background: transparent;
  font-size: 0.9rem;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
  color: #333;
}

.app-header:hover .btn {
  color: #fafafa;
  border-color: #fafafa;
}

.btn:hover {
  background: #333;
  color: #fff;
}
</style>
