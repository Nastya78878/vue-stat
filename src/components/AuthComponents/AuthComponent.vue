<template>
  <div class="auth-container">
    <h2>{{ isLoginMode ? 'Login' : 'Register' }}</h2>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="name">Name</label>
        <input id="name" v-model="form.name" type="text" required />
      </div>
      <div>
        <label for="password">Password</label>
        <input id="password" v-model="form.password" type="password" required />
      </div>
      <button class="btn" type="submit" :disabled="authStore.loading">
        {{
          authStore.loading
            ? isLoginMode
              ? 'Logging in...'
              : 'Registering...'
            : isLoginMode
              ? 'Login'
              : 'Register'
        }}
      </button>
    </form>
    <p>
      <a href="#" @click.prevent="toggleMode">
        {{ isLoginMode ? 'Need to register?' : 'Already have an account?' }}
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
    console.error('Auth error:', err)
  }
}
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1rem;
  text-align: center;
}
.auth-container h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}
.auth-container form div {
  margin-bottom: 0.75rem;
}
.auth-container label {
  display: block;
  margin-bottom: 0.25rem;
}
.auth-container input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #aaa;
  border-radius: 4px;
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
