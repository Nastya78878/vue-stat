<!-- components/StatsVisualization.vue -->
<template>
  <AppHeader />

  <div class="charts-container">
    <h2 class="title">Data Visualization</h2>

    <div class="controls">
      <div class="date-selector">
        <label>
          Start
          <input type="date" v-model="startDate" />
        </label>
        <label>
          End
          <input type="date" v-model="endDate" />
        </label>
        <button class="btn" @click="reload" :disabled="loading">
          {{ loading ? 'Loading…' : 'Apply' }}
        </button>
      </div>

      <div class="filter-selector">
        <label>
          <input type="radio" value="all" v-model="filterType" />
          All
        </label>
        <label>
          <input type="radio" value="Пополнение" v-model="filterType" />
          Income
        </label>
        <label>
          <input type="radio" value="Трата" v-model="filterType" />
          Expense
        </label>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading charts…</div>
    <div v-else>
      <div class="chart-card">
        <h3>Category Share (Pie)</h3>
        <Pie :data="pieData" :options="pieOpts" />
      </div>

      <div class="chart-card">
        <h3>Amounts by Category (Bar)</h3>
        <Bar :data="barData" :options="barOpts" />
      </div>

      <div class="chart-card">
        <h3>Distribution (Histogram)</h3>
        <Bar :data="histData" :options="histOpts" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useStatsStore } from '../../stores/stats'
import { Pie, Bar } from 'vue-chartjs'
import AppHeader from '../AppHeader.vue'

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale)

const statsStore = useStatsStore()

const startDate = ref(new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10))
const endDate = ref(new Date().toISOString().slice(0, 10))
const filterType = ref<'all' | 'Пополнение' | 'Трата'>('all')
const loading = ref(false)

const palette = [
  '#2a9d8f',
  '#e76f51',
  '#f4a261',
  '#264653',
  '#e9c46a',
  '#8ab17d',
  '#219eBC',
  '#EF476F',
]
function getColor(i: number) {
  return palette[i % palette.length] + 'cc'
}

async function reload() {
  loading.value = true
  await statsStore.fetchSummary(startDate.value, endDate.value)
  loading.value = false
}

// initial load
reload()

// filter summary according to filterType
const filtered = computed(() => {
  if (filterType.value === 'all') return statsStore.summary
  return statsStore.summary.filter((i) => i.categoryType === filterType.value)
})

// Pie chart
const pieData = computed(() => ({
  labels: filtered.value.map((i) => i.categoryName),
  datasets: [
    {
      data: filtered.value.map((i) => i.totalAmount),
      backgroundColor: filtered.value.map((_, idx) => getColor(idx)),
      borderColor: filtered.value.map((_, idx) => palette[idx % palette.length]),
      borderWidth: 2,
    },
  ],
}))
const pieOpts = {
  responsive: true,
  plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16 } } },
}

// Bar chart
const barData = computed(() => ({
  labels: filtered.value.map((i) => i.categoryName),
  datasets: [
    {
      label: 'Amount',
      data: filtered.value.map((i) => i.totalAmount),
      backgroundColor: filtered.value.map((_, idx) => getColor(idx)),
      borderColor: filtered.value.map((_, idx) => palette[idx % palette.length]),
      borderWidth: 1,
      borderRadius: 4,
      barThickness: 24,
    },
  ],
}))
const barOpts = {
  responsive: true,
  scales: {
    x: { ticks: { maxRotation: 30, minRotation: 30 }, grid: { display: false } },
    y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
  },
  plugins: { legend: { display: false } },
}

// Histogram (as bar)
const histData = computed(() => {
  const vals = filtered.value.map((i) => i.totalAmount)
  if (!vals.length) return { labels: [], datasets: [] }
  const min = Math.min(...vals),
    max = Math.max(...vals)
  const bins = 5,
    size = (max - min) / bins
  const counts = Array(bins).fill(0)
  vals.forEach((v) => counts[Math.min(Math.floor((v - min) / size), bins - 1)]++)
  const labels = counts.map(
    (_, i) => `${Math.round(min + i * size)}–${Math.round(min + (i + 1) * size)}`,
  )
  return {
    labels,
    datasets: [
      {
        label: 'Count',
        data: counts,
        backgroundColor: palette[1] + '66',
        borderColor: palette[1],
        borderWidth: 1,
      },
    ],
  }
})
const histOpts = {
  responsive: true,
  scales: { y: { beginAtZero: true, grid: { color: '#f0f0f0' } } },
  plugins: { legend: { display: false } },
}
</script>

<style scoped>
.charts-container {
  max-width: 700px;
  margin: 2rem auto;
  font-family: sans-serif;
  color: #333;
}

.title {
  text-align: center;
  font-size: 2rem;
  border-bottom: 2px solid #ddd;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.date-selector {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
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
  justify-content: center;
  gap: 1.5rem;
}

.filter-selector label {
  font-size: 0.9rem;
}

.filter-selector input {
  margin-right: 0.25rem;
}

.btn {
  padding: 0.5rem 1rem;
  min-width: 80px;
  border: 1px solid #333;
  border-radius: 4px;
  background: transparent;
  font-size: 0.95rem;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn:hover:not(:disabled) {
  background: #333;
  color: #fff;
}

.loading {
  text-align: center;
  font-style: italic;
  color: #666;
  margin-bottom: 1rem;
}

.chart-card {
  background: #fff;
  padding: 1rem;
  border-left: 6px solid #2a9d8f;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 1rem;
}

.chart-card h3 {
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  color: #264653;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.25rem;
}
</style>
