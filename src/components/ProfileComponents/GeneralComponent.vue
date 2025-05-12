<!-- components/StatsComponent.vue -->
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
      <ul class="summary-list">
        <li v-for="item in statsStore.summary" :key="item.categoryName" class="summary-item">
          <span class="item-name">{{ item.categoryName }}</span>
          <span
            class="item-type"
            :class="item.categoryType === 'Пополнение' ? 'income' : 'expense'"
          >
            {{ item.categoryType }}
          </span>
          <span class="item-amount">{{ item.totalAmount }}</span>
        </li>
      </ul>
    </section>

    <section class="section general-section">
      <h3 class="section-title">Общая статистика</h3>
      <dl class="general-list">
        <div class="dl-row">
          <dt>Средний доход</dt>
          <dd>{{ statsStore.stats?.averageIncome }}</dd>
        </div>
        <div class="dl-row">
          <dt>Средние расходы</dt>
          <dd>{{ statsStore.stats?.averageExpense }}</dd>
        </div>
        <div class="dl-row">
          <dt>Медианная сумма</dt>
          <dd>{{ statsStore.stats?.medianAmount }}</dd>
        </div>
        <div class="dl-row">
          <dt>Мода(ы)</dt>
          <dd>{{ statsStore.stats?.modeAmount.join(', ') }}</dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useStatsStore } from '../../stores/stats'
import AppHeader from '../AppHeader.vue'

const statsStore = useStatsStore()

const today = new Date().toISOString().slice(0, 10)
const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

const startDate = ref(weekAgo)
const endDate = ref(today)
const loading = ref(false)

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
    const response = await axios.get(url, {
      responseType: 'blob',
      withCredentials: true,
    })
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
  max-width: 480px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: sans-serif;
  color: #333;
}

.title {
  font-size: 1.75rem;
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

.loading {
  text-align: center;
  font-style: italic;
}

.section {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.section-title {
  font-size: 1.25rem;
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

.general-list {
  display: grid;
  grid-template-columns: auto auto;
  gap: 0.5rem 1rem;
  margin: 0;
  padding: 0;
}

.dl-row {
  display: contents;
}

dt {
  font-weight: 500;
}

dd {
  text-align: right;
  margin: 0;
}

.btn {
  padding: 0.5rem 1rem;
  min-width: 110px;
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
</style>
