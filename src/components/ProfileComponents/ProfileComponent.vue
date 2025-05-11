<!-- components/Profile.vue -->
<template>
  <div class="profile-container">
    <h1 class="profile-title">Profile</h1>
    <div class="buttons">
      <button class="btn" @click="logout">Logout</button>
      <button class="btn" @click="importStats">Import Statistics</button>
      <button class="btn" @click="showChart('daily')">Daily Chart</button>
      <button class="btn" @click="showChart('weekly')">Weekly Chart</button>
      <button class="btn" @click="showChart('monthly')">Monthly Chart</button>
      <button class="btn" @click="showGeneralStats">General Statistics</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

async function logout(): Promise<void> {
  try {
    await axios.post('/auth/logout', {}, { withCredentials: true })
    router.push('/')
  } catch (err) {
    console.error('Logout failed', err)
  }
}

function importStats() {
  // Открытие диалога выбора файла
  const input = document.createElement('input')
  input.type = 'file'
  // Разрешаем только файлы Excel
  input.accept =
    '.xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return

    // Дополнительно проверим расширение на «.xls» или «.xlsx»
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'xls' && ext !== 'xlsx') {
      alert('Пожалуйста, выберите файл Excel (.xls или .xlsx)')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    try {
      await axios.post('/transactions/import', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      alert('Statistics imported successfully')
    } catch (e) {
      console.error(e)
      alert('Failed to import statistics')
    }
  }
  input.click()
}

function showChart(type: string) {
  // Здесь логика показа графика, например, через событие или роутинг
  console.log(`Show ${type} chart`)
  router.push({ name: 'chart', query: { period: type } })
}

function showGeneralStats() {
  // Навигация на страницу общей статистики
  router.push({ name: 'general-stats' })
}
</script>

<style scoped>
.profile-container {
  max-width: 480px;
  margin: 2rem auto;
  padding: 1rem;
  text-align: center;
}
.profile-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}
.buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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
}
.btn:hover {
  background: #333;
  color: #fff;
}
</style>
