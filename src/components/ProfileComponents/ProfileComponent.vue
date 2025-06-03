<template>
  <div class="profile-container">
    <h1 class="profile-title">Профиль</h1>

    <div class="buttons">
      <button class="btn" @click="logout">Выйти</button>
      <button class="btn" @click="importStats">Импорт статистики</button>
      <button class="btn" @click="goToStats">Общая статистика</button>
      <button class="btn" @click="goToStatViz">Визуализация статистики</button>
      <button class="btn add-btn" @click="showForm = !showForm">
        {{ showForm ? 'Закрыть' : 'Добавить транзакцию' }}
      </button>
    </div>

    <transition name="fade-slide">
      <section v-if="showForm" class="manual-entry">
        <h2>Добавить транзакцию</h2>
        <form @submit.prevent="addTransaction">
          <div class="field">
            <label>Сумма</label>
            <input v-model.number="form.amount" type="number" min="0" step="0.01" required />
          </div>
          <div class="field">
            <label>Комментарий</label>
            <input v-model="form.comment" type="text" />
          </div>
          <div class="field">
            <label>Категория</label>
            <input v-model="form.categoryName" type="text" required />
          </div>
          <div class="field radio-group">
            <label> <input type="radio" value="INCOME" v-model="form.categoryType" /> Доход </label>
            <label>
              <input type="radio" value="EXPENSE" v-model="form.categoryType" /> Расход
            </label>
          </div>
          <button class="btn submit-btn" type="submit" :disabled="adding">
            {{ adding ? 'Добавление…' : 'Отправить' }}
          </button>
        </form>
      </section>
    </transition>

    <!-- Loading Indicator -->
    <transition name="fade">
      <div v-if="isLoading" class="loading-indicator">
        <div class="loader"></div>
        <span>Загрузка файла...</span>
      </div>
    </transition>

    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="toastMessage" class="toast">{{ toastMessage }}</div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import axios from 'axios'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const adding = ref(false)
const showForm = ref(false)
const toastMessage = ref('')
const isLoading = ref(false)

function showToast(msg: string) {
  toastMessage.value = msg
  setTimeout(() => (toastMessage.value = ''), 3000)
}

async function logout() {
  await axios.post('/auth/logout', {}, { withCredentials: true }).catch(() => {})
  router.push('/')
}

function importStats() {
  const inp = document.createElement('input')
  inp.type = 'file'
  inp.accept = '.xls,.xlsx'
  inp.onchange = async () => {
    const f = inp.files?.[0]
    if (!f) return

    // Проверяем MIME-тип файла
    const validTypes = [
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/excel',
      'application/x-excel',
      'application/x-msexcel',
    ]

    if (!validTypes.includes(f.type)) {
      showToast('Разрешены только файлы Excel (.xls, .xlsx)')
      return
    }

    // Дополнительная проверка расширения
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (!['xls', 'xlsx'].includes(ext!)) {
      showToast('Разрешены только файлы Excel (.xls, .xlsx)')
      return
    }

    isLoading.value = true
    const fd = new FormData()
    fd.append('file', f)
    await axios
      .post('/transactions/import', fd, { withCredentials: true })
      .then(() => showToast('Файл успешно загружен'))
      .catch(() => showToast('Ошибка импорта'))
      .finally(() => {
        isLoading.value = false
      })
  }
  inp.click()
}

function goToStats() {
  router.push('/stat')
}
function goToStatViz() {
  router.push('/statviz')
}

interface Tx {
  amount: number
  comment?: string
  categoryName: string
  categoryType: 'INCOME' | 'EXPENSE'
}
const form = reactive<Tx>({ amount: 0, comment: '', categoryName: '', categoryType: 'EXPENSE' })

async function addTransaction() {
  if (!form.amount || !form.categoryName.trim()) return
  adding.value = true
  await axios
    .post('/transactions', [form], { withCredentials: true })
    .then(() => showToast('Транзакция добавлена'))
    .catch(() => showToast('Ошибка добавления'))
  adding.value = false
  showForm.value = false
  Object.assign(form, { amount: 0, comment: '', categoryName: '', categoryType: 'EXPENSE' })
}
</script>

<style scoped>
.profile-container {
  max-width: 480px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: sans-serif;
  color: #333;
}

.profile-title {
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 1rem;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.btn {
  padding: 0.6rem 1.2rem;
  border: 1px solid #333;
  border-radius: 6px;
  background: transparent;
  color: #333;
  font-size: 1rem;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.1s;
}

.btn:hover {
  background: #333;
  color: #fafafa;
  transform: translateY(-2px);
}

.btn:active {
  transform: translateY(0);
}

.add-btn {
  font-weight: bold;
}

.manual-entry {
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 6px;
  background: #fafafa;
  margin-bottom: 1rem;
}

.manual-entry h2 {
  font-size: 1.2rem;
  margin-bottom: 0.75rem;
  color: #333;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.5rem;
}

.field {
  margin-bottom: 0.75rem;
}

.field label {
  display: block;
  margin-bottom: 0.3rem;
  font-size: 0.9rem;
}

.field input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.radio-group {
  display: flex;
  gap: 1rem;
}

.submit-btn {
  width: 100%;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Toast styles */
.toast {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-size: 0.95rem;
  z-index: 1000;
}
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}

/* Заменяем старые стили загрузки на новые */
.loading-indicator {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.loader {
  width: 24px;
  height: 24px;
  border: 3px solid #333;
  border-bottom-color: transparent;
  border-radius: 50%;
  animation: rotation 1s linear infinite;
}

.loading-indicator span {
  color: #333;
  font-size: 0.9rem;
  font-weight: 500;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
