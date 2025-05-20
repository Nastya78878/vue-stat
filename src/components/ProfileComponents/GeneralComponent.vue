<template>
  <AppHeader />

  <div class="stats-container">
    <h2 class="title">Статистика</h2>

    <div class="date-selector">
      <label>
        Начало
        <input type="date" v-model="startDate" />
      </label>
      <label>
        Конец
        <input type="date" v-model="endDate" />
      </label>
      <button class="btn" @click="loadStats" :disabled="loading">
        {{ loading ? 'Загрузка…' : 'Применить' }}
      </button>
      <button class="btn" @click="downloadPdf" :disabled="loading">Скачать PDF</button>
    </div>

    <div v-if="loading" class="loading">Загрузка…</div>

    <section v-else class="section summary-section">
      <h3 class="section-title">Сводка</h3>

      <div class="filter-selector">
        <label><input type="radio" value="all" v-model="filterType" /> Все</label>
        <label><input type="radio" value="Пополнение" v-model="filterType" /> Пополнения</label>
        <label><input type="radio" value="Расход" v-model="filterType" /> Траты</label>
      </div>

      <div v-if="filteredSummary.length === 0" class="empty-message">
        {{
          filterType === 'Пополнение'
            ? 'Пополнений нет'
            : filterType === 'Расход'
              ? 'Трат нет'
              : 'Операций нет'
        }}
      </div>

      <ul v-else class="summary-list">
        <li v-for="item in filteredSummary" :key="item.categoryName" class="summary-item">
          <span class="item-name">{{ item.categoryName }}</span>
          <span
            class="item-type"
            :class="item.categoryType === 'Пополнение' ? 'income' : 'expense'"
          >
            {{ item.categoryType }}
          </span>
          <span class="item-amount">{{ formatAmount(item.totalAmount) }}</span>
        </li>
      </ul>
    </section>

    <section class="section general-section">
      <h3 class="section-title">Общая статистика</h3>
      <div class="stats-cards animated-cards">
        <!-- Средний доход -->
        <div class="card average-card income-card">
          <h4
            class="card-title"
            title="Средний арифметический – сумма всех значений, делённая на их количество"
          >
            Средний доход
          </h4>
          <p class="card-value">{{ formatAmount(statsStore.stats?.averageIncome) }}</p>
        </div>
        <!-- Средние расходы -->
        <div class="card average-card expense-card">
          <h4
            class="card-title"
            title="Средний арифметический – сумма всех значений, делённая на их количество"
          >
            Средние расходы
          </h4>
          <p class="card-value">{{ formatAmount(statsStore.stats?.averageExpense) }}</p>
        </div>
        <!-- Медиана -->
        <div
          class="card median-card"
          title="Медианная сумма – значение, которое делит упорядоченный ряд чисел пополам"
        >
          <h4 class="card-title">Медианная сумма</h4>
          <p class="card-value">{{ formatAmount(statsStore.stats?.medianAmount) }}</p>
        </div>
        <!-- Мода -->
        <div class="card mode-card" title="Мода – значение(я), встречающиеся наиболее часто">
          <h4 class="card-title">Мода(ы)</h4>
          <p class="card-value">{{ firstModes }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useStatsStore } from '../../stores/stats'
import AppHeader from '../AppHeader.vue'

const statsStore = useStatsStore()

const today = new Date().toISOString().slice(0, 10)
const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

const startDate = ref(weekAgo)
const endDate = ref(today)
const loading = ref(false)
const filterType = ref<'all' | 'Пополнение' | 'Расход'>('all')

const filteredSummary = computed(() =>
  statsStore.summary.filter((item) =>
    filterType.value === 'all'
      ? true
      : filterType.value === 'Пополнение'
        ? item.categoryType === 'Пополнение'
        : item.categoryType !== 'Пополнение',
  ),
)

function formatAmount(value: number | undefined) {
  return value == null ? '0 ₽' : Math.floor(value) + ' ₽'
}

const firstModes = computed(() => {
  // @ts-expect-error: используем modeAmount, хотя его нет в типе Stats
  const modes = statsStore.stats?.modeAmount || []
  const sliced = modes.slice(0, 3)
  const formatted = sliced.map((m: number) => Math.floor(m)).join(', ')
  return formatted + (modes.length > 3 ? '...' : '') + ' ₽'
})

async function loadStats() {
  loading.value = true
  await statsStore.fetchSummary(startDate.value, endDate.value)
  await statsStore.fetchStats(startDate.value, endDate.value)
  loading.value = false
}

async function downloadPdf() {
  loading.value = true
  try {
    const url = `/transactions/report?startDate=${startDate.value}&endDate=${endDate.value}`
    const response = await axios.get(url, { responseType: 'blob', withCredentials: true })
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `report_${startDate.value}_to_${endDate.value}.pdf`
    link.click()
    URL.revokeObjectURL(link.href)
  } catch (err) {
    console.error('PDF download failed', err)
  } finally {
    loading.value = false
  }
}

onMounted(loadStats)
</script>

<style scoped>
.stats-container {
  max-width: 520px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: sans-serif;
  color: #333;
}

.title {
  font-size: 1.9rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid #ddd;
  display: inline-block;
}

.date-selector {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.date-selector label {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
}

.date-selector input {
  margin-top: 0.25rem;
  padding: 0.4rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.filter-selector {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-selector label {
  cursor: pointer;
  font-size: 0.9rem;
}

.section {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.section-title {
  font-size: 1.3rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid #eee;
  display: inline-block;
  padding-bottom: 0.25rem;
}

.summary-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.summary-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f5f5f5;
}

.summary-item:nth-child(odd) {
  background: #fafafa;
}

.item-name {
  font-weight: 600;
}

.item-type {
  font-size: 0.85rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.item-type.income {
  background: rgba(42, 157, 143, 0.1);
  color: #2a9d8f;
}

.item-type.expense {
  background: rgba(231, 111, 81, 0.1);
  color: #e76f51;
}

.item-amount {
  font-weight: 700;
}

.animated-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.card {
  flex: 1 1 45%;
  min-width: 200px;
  padding: 1rem;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: center;
  opacity: 0;
  transform: translateY(20px);
  animation: slideUpFade 0.6s forwards;
}

.card:nth-child(1) {
  animation-delay: 0.1s;
}

.card:nth-child(2) {
  animation-delay: 0.2s;
}

.card:nth-child(3) {
  animation-delay: 0.3s;
}

.card:nth-child(4) {
  animation-delay: 0.4s;
}

@keyframes slideUpFade {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.average-card {
  border-top: 4px solid;
}

.income-card {
  border-color: #2a9d8f;
}

.expense-card {
  border-color: #e76f51;
}

.median-card {
  border-top: 4px solid #4a90e2;
}

.mode-card {
  border-top: 4px solid #50e3c2;
}

.card-title {
  font-size: 1rem;
  color: #555;
  margin-bottom: 0.5rem;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid #333;
  border-radius: 4px;
  background: transparent;
  font-size: 0.95rem;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
  text-align: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn:hover:not(:disabled) {
  background: #333;
  color: #fff;
}

.empty-message {
  text-align: center;
  padding: 1rem;
  color: #666;
  font-style: italic;
}
</style>
