<template>
  <div :class="['auth-container', { registration: !isLoginMode }]">
    <h2>{{ isLoginMode ? 'Вход' : 'Регистрация' }}</h2>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="name">Имя</label>
        <input id="name" v-model="form.name" type="text" required />
      </div>
      <div>
        <label for="password">Пароль</label>
        <input id="password" v-model="form.password" type="password" required />
      </div>
      <button class="btn" type="submit" :disabled="authStore.loading">
        {{
          authStore.loading
            ? isLoginMode
              ? 'Вход в систему...'
              : 'Регистрация...'
            : isLoginMode
              ? 'Войти'
              : 'Зарегистрироваться'
        }}
      </button>
    </form>
    <p>
      <a href="#" @click.prevent="toggleMode">
        {{ isLoginMode ? 'Еще нет аккаунта?' : 'Уже есть аккаунт?' }}
      </a>
    </p>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

interface AuthForm {
  name: string
  password: string
}

const router = useRouter()
const authStore = useAuthStore()
const isLoginMode: Ref<boolean> = ref(true)
const form = reactive<AuthForm>({ name: '', password: '' })

function toggleMode(): void {
  isLoginMode.value = !isLoginMode.value
  form.name = ''
  form.password = ''
}

async function handleSubmit(): Promise<void> {
  try {
    if (isLoginMode.value) {
      await authStore.login(form.name, form.password)
    } else {
      await authStore.register(form.name, form.password)
    }
    router.push({ name: 'home' })
  } catch (err) {
    console.error('Ошибка аутентификации:', err)
  }
}
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1rem;
  text-align: center;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    background 0.3s ease,
    color 0.3s ease,
    transform 0.3s ease;
}

.auth-container:hover {
  transform: translateY(-5px);
}

.auth-container h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #264653;
}

.auth-container form div {
  margin-bottom: 0.75rem;
}

.auth-container label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.auth-container input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #aaa;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.btn {
  padding: 0.75rem 1rem;
  border: 1px solid #333;
  border-radius: 4px;
  background: transparent;
  font-size: 1rem;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
  width: 100%;
}

.btn:hover {
  background: #333;
  color: #fff;
}

.auth-container p {
  text-align: center;
  margin-top: 1rem;
}

.auth-container a {
  color: #42b983;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.3s ease;
}

/* Дополнительные стили для режима регистрации (регистрация имеет те же цвета и плавные анимации, что и футер) */
.auth-container.registration:hover {
  background: #333;
}

.auth-container.registration:hover h2,
.auth-container.registration:hover label,
.auth-container.registration:hover input,
.auth-container.registration:hover .btn,
.auth-container.registration:hover a {
  color: #fafafa;
  border-color: #fafafa;
}

@media (max-width: 480px) {
  .auth-container {
    margin: 1rem;
    padding: 0.5rem;
  }
  .btn {
    padding: 0.5rem;
  }
}
</style>
