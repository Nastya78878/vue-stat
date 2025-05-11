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
        {{ showForm ? 'Close' : 'Add Transaction' }}
      </button>
    </div>

    <transition name="fade-slide">
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
            <label><input type="radio" value="INCOME" v-model="form.categoryType" /> Income</label>
            <label
              ><input type="radio" value="EXPENSE" v-model="form.categoryType" /> Expense</label
            >
          </div>
          <button class="btn submit-btn" type="submit" :disabled="adding">
            {{ adding ? 'Adding…' : 'Submit' }}
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
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (!['xls', 'xlsx'].includes(ext!)) {
      alert('Excel only')
      return
    }
    const fd = new FormData()
    fd.append('file', f)
    await axios
      .post('/transactions/import', fd, { withCredentials: true })
      .catch(() => alert('Import failed'))
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
    .catch(() => alert('Add failed'))
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
</style>
