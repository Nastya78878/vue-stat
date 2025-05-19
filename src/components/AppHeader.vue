<template>
  <header class="app-header">
    <div class="header-left">
      <h1 class="logo" @click="goHome">Аналитика</h1>
      <div class="greeting">
        <div class="avatar">{{ userInitials }}</div>
        <span>Привет, {{ userName }}</span>
      </div>
    </div>
    <nav class="nav-buttons">
      <button class="btn" @click="goHome">Главная</button>
      <button class="btn" @click="logout">Выход</button>
    </nav>
  </header>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Имя пользователя из стора, по умолчанию 'гость'
const userName = computed(() => authStore.user?.name || 'гость')
// Инициалы пользователя
const userInitials = computed(() => {
  const name = authStore.user?.name || ''
  return (
    name
      .split(' ')
      .map((n) => n.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2) || 'Г'
  )
})

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
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  /* Добавлен легкий диагональный узор */
  background-image: repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.03) 0,
    rgba(0, 0, 0, 0.03) 1px,
    transparent 1px,
    transparent 5px
  );
  padding: 0.75rem 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border-bottom: 2px solid #eee;
  transition:
    background 0.3s ease,
    color 0.3s ease;
}

.app-header:hover {
  background: rgba(51, 51, 51, 0.9);
  backdrop-filter: blur(4px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  position: relative;
  font-size: 1.25rem;
  font-weight: bold;
  color: #264653;
  cursor: pointer;
  user-select: none;
  transition: color 0.3s ease;
}

/* Анимация подчеркивания логотипа */
.logo::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: #2a9d8f;
  transition: width 0.3s ease;
}

.logo:hover::after {
  width: 100%;
}

.app-header:hover .logo {
  color: #fafafa;
}

.greeting {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: #264653;
  animation: wave 3s infinite ease-in-out;
}

/* Аватар пользователя */
.avatar {
  width: 32px;
  height: 32px;
  background: #2a9d8f;
  color: #fafafa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: 0 0 0 rgba(42, 157, 143, 0.7);
  animation: pulse 2s infinite ease-in-out;
}

/* Анимация волны для приветствия */
@keyframes wave {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* Пульсация аватара */
@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 rgba(42, 157, 143, 0.7);
  }
  50% {
    box-shadow: 0 0 10px rgba(42, 157, 143, 0.7);
  }
}

.app-header:hover .greeting,
.app-header:hover .avatar {
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
    color 0.2s,
    transform 0.2s,
    box-shadow 0.2s;
  color: #333;
}

.btn:hover {
  background: #333;
  color: #fff;
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.app-header:hover .btn {
  color: #fafafa;
  border-color: #fafafa;
}
</style>
