<!-- components/Profile.vue -->
<template>
  <div class="profile-container">
    <h1 class="profile-title">Profile</h1>

    <div class="buttons">
      <button class="btn" @click="logout">Logout</button>
      <button class="btn" @click="importStats">Import Statistics</button>
      <button class="btn" @click="goToStats">General Statistics</button>
      <button class="btn" @click="goToStatViz">Visualization Statistics</button>
      <button class="btn add-btn" @click="showForm = !showForm">
        {{ showForm ? '✕ Close' : '+ Add Transaction' }}
      </button>
    </div>

    <transition name="slide-fade">
      <section v-if="showForm" class="manual-entry">
        <h2>Add Transaction</h2>
        <form @submit.prevent="addTransaction">
          <div class="field">
            <label>Amount</label>
            <input v-model.number="form.amount" type="number" step="0.01" required />
          </div>
          <div class="field">
            <label>Comment</label>
            <input v-model="form.comment" type="text" />
          </div>
          <div class="field">
            <label>Category</label>
            <input v-model="form.categoryName" type="text" required />
          </div>
          <div class="field radio-group">
            <label>
              <input type="radio" value="INCOME" v-model="form.categoryType" />
              Income
            </label>
            <label>
              <input type="radio" value="EXPENSE" v-model="form.categoryType" />
              Expense
            </label>
          </div>
          <button class="btn" type="submit" :disabled="adding">
            {{ adding ? 'Adding…' : 'Add Transaction' }}
          </button>
        </form>
      </section>
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

async function logout(): Promise<void> {
  try {
    await axios.post('/auth/logout', {}, { withCredentials: true })
    router.push('/')
  } catch (err) {
    console.error('Logout failed', err)
  }
}

function importStats() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept =
    '.xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'xls' && ext !== 'xlsx') {
      alert('Please select an Excel file (.xls or .xlsx)')
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

function goToStats() {
  router.push({ path: '/stat' })
}

function goToStatViz() {
  router.push({ path: '/statviz' })
}

interface ManualTx {
  amount: number
  comment?: string
  categoryName: string
  categoryType: 'INCOME' | 'EXPENSE'
}

const form = reactive<ManualTx>({
  amount: 0,
  comment: '',
  categoryName: '',
  categoryType: 'EXPENSE',
})

async function addTransaction() {
  if (!form.amount || !form.categoryName.trim()) return
  adding.value = true
  try {
    await axios.post(
      '/transactions',
      [
        {
          amount: form.amount,
          comment: form.comment || undefined,
          categoryName: form.categoryName.trim(),
          categoryType: form.categoryType,
        },
      ],
      { withCredentials: true },
    )
    alert('Transaction added')
    form.amount = 0
    form.comment = ''
    form.categoryName = ''
    form.categoryType = 'EXPENSE'
    showForm.value = false
  } catch (err) {
    console.error('Add transaction failed', err)
    alert('Failed to add transaction')
  } finally {
    adding.value = false
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 480px;
  margin: 2rem auto;
  padding: 1rem;
  text-align: center;
  font-family: sans-serif;
}

.profile-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
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

.add-btn {
  font-weight: bold;
  color: #2a9d8f;
}

.btn:hover:not(:disabled) {
  background: #333;
  color: #fff;
}

.manual-entry {
  background: #fafafa;
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 1rem;
  text-align: left;
}

.manual-entry h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #264653;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.field input[type='text'],
.field input[type='number'] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.radio-group {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.radio-group label {
  font-size: 0.9rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Transition */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
