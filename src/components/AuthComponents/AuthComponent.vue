<template>
  <div :class="['auth-container', { registration: !isLoginMode }]">
    <h2>{{ isLoginMode ? 'Вход' : 'Регистрация' }}</h2>
    <form @submit.prevent="handleSubmit">
      <!-- Имя -->
      <div class="field">
        <label for="name">Имя</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          :class="{ 'input-error': nameError }"
          required
        />
        <transition name="fade">
          <p v-if="nameError" class="error-box">
            <svg class="error-icon" viewBox="0 0 24 24">
              <path d="M11.001 10h2v5h-2zm0 7h2v2h-2z" />
              <path
                d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8z"
              />
            </svg>
            Логин минимум 3 символа
          </p>
        </transition>
      </div>

      <!-- Пароль -->
      <div class="field">
        <label for="password">Пароль</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          :class="{ 'input-error': passError }"
          required
        />
        <transition name="fade">
          <p v-if="passError" class="error-box">
            <svg class="error-icon" viewBox="0 0 24 24">
              <path d="M11.001 10h2v5h-2zm0 7h2v2h-2z" />
              <path
                d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8z"
              />
            </svg>
            Пароль минимум 3 символа
          </p>
        </transition>
      </div>

      <!-- Общее сообщение об ошибке -->
      <transition name="fade">
        <div v-if="errorMessage" class="error-banner">
          <svg class="banner-icon" viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm1 15h-2v-2h2zm0-4h-2V7h2z" />
          </svg>
          {{ errorMessage }}
        </div>
      </transition>

      <!-- Кнопка отправки -->
      <button
        class="btn"
        type="submit"
        :disabled="authStore.loading || (!isLoginMode && !isFormValid)"
      >
        {{
          authStore.loading
            ? isLoginMode
              ? 'Вход в системе...'
              : 'Регистрация...'
            : isLoginMode
              ? 'Войти'
              : 'Зарегистрироваться'
        }}
      </button>
    </form>

    <p>
      <button class="toggle-mode-btn" @click="toggleMode">
        {{ isLoginMode ? 'Еще нет аккаунта?' : 'Уже есть аккаунт?' }}
      </button>
    </p>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, computed } from 'vue'
import type { Ref } from 'vue'
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
const errorMessage = ref<string>('')

const isFormValid = computed(() => form.name.length >= 3 && form.password.length >= 3)

// Ошибки по полям
const nameError = computed(() => !isLoginMode.value && form.name.length > 0 && form.name.length < 3)
const passError = computed(
  () => !isLoginMode.value && form.password.length > 0 && form.password.length < 3,
)

function toggleMode(): void {
  isLoginMode.value = !isLoginMode.value
  form.name = ''
  form.password = ''
  errorMessage.value = ''
}

async function handleSubmit(): Promise<void> {
  errorMessage.value = ''

  if (!isLoginMode.value && !isFormValid.value) {
    errorMessage.value = 'Пожалуйста, исправьте поля'
    return
  }

  try {
    if (isLoginMode.value) {
      await authStore.login(form.name, form.password)
    } else {
      await authStore.register(form.name, form.password)
    }
    router.push({ name: 'home' })
  } catch (err) {
    errorMessage.value = isLoginMode.value
      ? 'Неверный логин или пароль'
      : 'Не удалось зарегистрироваться'
    console.error(err)
  }
}
</script>

<style scoped>
/* Контейнер */
.auth-container {
  max-width: 500px; /* было 400px */
  margin: 3rem auto; /* было 2rem */
  padding: 2.5rem; /* было 1.5rem */
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}
.auth-container:hover {
  transform: translateY(-4px);
}

/* Заголовок */
.auth-container h2 {
  font-size: 1.75rem; /* чуть больше */
  margin-bottom: 1.5rem; /* добавлен отступ снизу */
  text-align: center; /* выравнивание по центру */
  color: #264653;
}

/* Поля */
.field {
  margin-bottom: 1.5rem; /* чуть больше */
  position: relative;
}
.field label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}
.field input {
  width: 100%;
  padding: 0.75rem 1rem; /* было 0.6rem 0.8rem */
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

/* Ошибочное поле */
.input-error {
  border-color: #e63946 !important;
  box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.2);
}

/* Подсказка у поля */
.error-box {
  display: flex;
  align-items: center;
  margin-top: 0.4rem;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #b91c1c;
}
.error-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.4rem;
  fill: #b91c1c;
}

/* Общее баннерное сообщение */
.error-banner {
  display: flex;
  align-items: center;
  background: #ffedd5;
  border: 1px solid #fcd34d;
  padding: 0.8rem 1rem; /* чуть больше */
  border-radius: 6px;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  color: #92400e;
}
.banner-icon {
  width: 1.2rem;
  height: 1.2rem;
  margin-right: 0.5rem;
  fill: #92400e;
}

/* Плавное появление */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Кнопка */
.btn {
  width: 100%;
  padding: 0.9rem; /* было 0.75rem */
  font-size: 1.125rem; /* чуть крупнее */
  border: none;
  border-radius: 6px;
  background: #264653;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}
.btn:disabled {
  background: #aaa;
  cursor: not-allowed;
}
.btn:not(:disabled):hover {
  background: #1b3a4b;
}

/* Кнопка переключения режима */
.toggle-mode-btn {
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem;
  background: transparent;
  border: 2px solid #264653;
  border-radius: 6px;
  color: #264653;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-mode-btn:hover {
  background: #264653;
  color: white;
  transform: translateY(-2px);
}

.toggle-mode-btn:active {
  transform: translateY(0);
}
</style>
