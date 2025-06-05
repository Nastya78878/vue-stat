<template>
  <AppHeader />

  <div class="charts-container">
    <h2 class="title">Визуализация данных</h2>

    <div class="controls">
      <div class="date-selector">
        <label>
          Начало
          <input type="date" v-model="startDate" />
        </label>
        <label>
          Конец
          <input type="date" v-model="endDate" />
        </label>
        <button class="btn" @click="reload" :disabled="loading">
          {{ loading ? 'Загрузка…' : 'Применить' }}
        </button>
      </div>

      <div class="filter-selector">
        <label>
          <input type="radio" value="all" v-model="filterType" />
          Все
        </label>
        <label>
          <input type="radio" value="Пополнение" v-model="filterType" />
          Пополнение
        </label>
        <label>
          <input type="radio" value="Трата" v-model="filterType" />
          Траты
        </label>
      </div>
    </div>

    <div v-if="loading" class="loading">Загрузка диаграмм…</div>
    <div v-else class="charts-grid">
      <!-- График общей суммы транзакций по выбранному типу -->
      <div v-if="filterType !== 'all'" class="chart-card line-chart">
        <h3>Динамика общей суммы транзакций ({{ filterType }})</h3>
        <Line :data="lineAmountData" :options="lineAmountOpts as any" />
      </div>

      <!-- График количества транзакций за каждый день -->
      <div class="chart-card line-chart">
        <h3>Динамика количества транзакций по дням</h3>
        <Line :data="lineData" :options="lineOpts as any" />
      </div>

      <!-- Круговая диаграмма: распределение сумм по категориям -->
      <div class="chart-card">
        <h3>Распределение сумм по категориям (круговая диаграмма)</h3>
        <Pie :data="pieData" :options="pieOpts" />
      </div>

      <!-- Столбчатая диаграмма: сравнение общих сумм по категориям -->
      <div class="chart-card">
        <h3>Сравнение общих сумм по категориям (столбчатая диаграмма)</h3>
        <Bar :data="barData" :options="barOpts as any" />
      </div>

      <!-- Гистограмма: частотное распределение транзакций по суммам -->
    <div class="chart-card">
      <h3>Гистограмма распределения транзакций по диапазонам сумм</h3>
      <Bar :data="histData" :options="histOpts as any" />
      <div v-if="modalInterval.value" class="histogram-info">
        <p><strong>Модальный интервал:</strong> {{ modalInterval.label }}</p>
        <p><strong>Среднее модальное значение:</strong> {{ modalAverage.toLocaleString('ru-RU') }} ₽</p>
      </div>
    </div>

      <!-- Полярная диаграмма: визуализация сумм по категориям -->
      <div class="chart-card">
        <h3>Полярная диаграмма сумм по категориям</h3>
        <PolarArea :data="polarData" :options="polarOpts" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useStatsStore } from '../../stores/stats'
import { Pie, Bar, PolarArea, Line } from 'vue-chartjs'
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
  RadialLinearScale,
  LineElement,
  PointElement,
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom' // Добавляем zoom plugin

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  LineElement,
  PointElement,
  zoomPlugin, // Регистрируем zoom plugin
)

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

// фильтрация данных по типу
const filtered = computed(() => {
  if (filterType.value === 'all') return statsStore.summary
  return statsStore.summary.filter((i) => i.categoryType === filterType.value)
})

// Обновленная логика агрегирования дат для линейного графика
const aggregatedDates = computed(() => {
  const counts: Record<string, number> = {}

  // Создаем все даты в диапазоне
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  const dates: string[] = []

  // Этот цикл создает все даты в диапазоне
  for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10)
    counts[dateStr] = 0 // Инициализируем нулем каждую дату
    dates.push(dateStr)
  }

  // Фильтруем данные согласно выбранному типу
  const filteredData =
    filterType.value === 'all'
      ? statsStore.summary
      : statsStore.summary.filter((i) => i.categoryType === filterType.value)

  // Подсчитываем транзакции
  filteredData.forEach((category) => {
    category.dates.forEach((dateTime) => {
      const date = dateTime.slice(0, 10)
      if (counts[date] !== undefined) {
        counts[date]++
      }
    })
  })

  return {
    labels: dates,
    data: dates.map((date) => counts[date]),
  }
})

// Линейный график с агрегированными данными
const lineData = computed(() => ({
  labels: aggregatedDates.value.labels,
  datasets: [
    {
      label: 'Количество транзакций',
      data: aggregatedDates.value.data,
      fill: false,
      borderColor: '#2a9d8f',
      tension: 0.1,
    },
  ],
}))

const lineOpts = {
  responsive: true,
  scales: {
    x: { grid: { display: false } },
    y: {
      beginAtZero: true,
      grid: { color: '#f0f0f0' },
      min: 0, // Запрещаем значения ниже нуля
    },
  },
  plugins: {
    legend: { display: true },
    zoom: {
      zoom: {
        wheel: { enabled: true },
        pinch: { enabled: true },
        mode: 'xy',
        // Добавляем ограничения для зума
        limits: {
          y: { min: 0 },
        },
      },
      pan: {
        enabled: true,
        mode: 'xy',
        // Добавляем ограничения для перемещения
        limits: {
          y: { min: 0 },
        },
      },
    },
  },
}

// Добавляем новую логику для агрегирования сумм по датам
const aggregatedAmounts = computed(() => {
  const amounts: Record<string, number> = {}

  // Создаем все даты в диапазоне
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  const dates: string[] = []

  for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10)
    amounts[dateStr] = 0
    dates.push(dateStr)
  }

  // Фильтруем данные по выбранному типу (работает только для Пополнение или Трата)
  const filteredData = statsStore.summary.filter((i) => i.categoryType === filterType.value)

  // Суммируем транзакции по датам
  filteredData.forEach((category) => {
    const amountPerTransaction = category.totalAmount / category.dates.length
    category.dates.forEach((dateTime) => {
      const date = dateTime.slice(0, 10)
      if (amounts[date] !== undefined) {
        amounts[date] += amountPerTransaction
      }
    })
  })

  return {
    labels: dates,
    data: dates.map((date) => amounts[date]),
  }
})

// Новый график для сумм
const lineAmountData = computed(() => ({
  labels: aggregatedAmounts.value.labels,
  datasets: [
    {
      label: 'Сумма транзакций',
      data: aggregatedAmounts.value.data,
      fill: true,
      borderColor: filterType.value === 'Пополнение' ? '#2a9d8f' : '#e76f51',
      backgroundColor: filterType.value === 'Пополнение' ? '#2a9d8f33' : '#e76f5133',
      tension: 0.1,
    },
  ],
}))
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: игнорируем несовместимость типа для plugins.zoom.pan.mode
const lineAmountOpts = {
  responsive: true,
  scales: {
    x: { grid: { display: false } },
    y: {
      beginAtZero: true,
      grid: { color: '#f0f0f0' },
      ticks: {
        callback: (value: number) => `${value.toLocaleString('ru-RU')} ₽`,
      },
    },
  },
  plugins: {
    legend: { display: true },
    zoom: {
      zoom: {
        wheel: { enabled: true },
        pinch: { enabled: true },
        mode: 'xy',
      },
      pan: {
        enabled: true,
        mode: 'xy',
      },
    },
  },
}

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
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { boxWidth: 12, padding: 16 },
    },
  },
}

// Bar chart
const barData = computed(() => ({
  labels: filtered.value.map((i) => i.categoryName),
  datasets: [
    {
      label: 'Сумма',
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
  plugins: {
    legend: { display: false },
    zoom: {
      zoom: {
        wheel: { enabled: true },
        pinch: { enabled: true },
        mode: 'y',
      },
      pan: { enabled: true, mode: 'y' },
    },
  },
}

// Histogram (as bar)
const histData = computed(() => {
  const vals = filtered.value.map((i) => i.totalAmount)
  if (!vals.length) return { labels: [], datasets: [] }
  
  const min = Math.min(...vals),
    max = Math.max(...vals)
  const N = vals.length
  const bins = Math.max(1, Math.ceil(1 + Math.log10(N) * 3.322))
  const size = (max - min) / bins
  
  const counts = Array(bins).fill(0)
  vals.forEach((v) => counts[Math.min(Math.floor((v - min) / size), bins - 1)]++)
  
  const labels = counts.map(
    (_, i) => `${Math.round(min + i * size)}–${Math.round(min + (i + 1) * size)}`,
  )
  
  return {
    labels,
    datasets: [
      {
        label: 'Количество',
        data: counts,
        backgroundColor: palette[1] + '66',
        borderColor: palette[1],
        borderWidth: 1,
      },
    ],
  }
})

// Вычисляем модальный интервал (интервал с наибольшим количеством значений)
const modalInterval = computed(() => {
  if (!histData.value.labels.length) return { label: '', value: 0 }
  
  const maxCount = Math.max(...histData.value.datasets[0].data)
  const maxIndex = histData.value.datasets[0].data.indexOf(maxCount)
  
  return {
    label: histData.value.labels[maxIndex],
    value: maxCount
  }
})

// Вычисляем среднее модальное значение (середина модального интервала)
const modalAverage = computed(() => {
  if (!modalInterval.value.label) return 0
  
  const [min, max] = modalInterval.value.label.split('–').map(Number)
  return (min + max) / 2
})

const histOpts = {
  responsive: true,
  scales: { 
    y: { 
      beginAtZero: true, 
      grid: { color: '#f0f0f0' },
      title: {
        display: true,
        text: 'Количество транзакций'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Диапазон сумм (₽)'
      }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.dataset.label || ''
          return `${label}: ${context.raw} транзакций`
        }
      }
    },
    zoom: {
      zoom: {
        wheel: { enabled: true },
        pinch: { enabled: true },
        mode: 'y',
      },
      pan: { enabled: true, mode: 'y' },
    },
  },
}
// Polar Area chart
const polarData = computed(() => ({
  labels: filtered.value.map((i) => i.categoryName),
  datasets: [
    {
      data: filtered.value.map((i) => i.totalAmount),
      backgroundColor: filtered.value.map((_, idx) => getColor(idx)),
      borderColor: filtered.value.map((_, idx) => palette[idx % palette.length]),
      borderWidth: 1,
    },
  ],
}))
const polarOpts = {
  responsive: true,
  scales: { r: { beginAtZero: true } },
  plugins: {
    legend: {
      position: 'right' as const,
    },
  },
}
</script>

<style scoped>
.charts-container {
  max-width: 900px;
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

.filter-selector {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
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
.histogram-info {
  margin-top: 1rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 0.9rem;
}

.histogram-info p {
  margin: 0.25rem 0;
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

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.charts-grid::before {
  content: '🔍 Используйте колесико мыши для приближения графиков';
  display: block;
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
  font-style: italic;
}

.chart-card {
  background: #fff;
  padding: 1rem;
  border-left: 6px solid #2a9d8f;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease-in-out;
}

.chart-card:hover {
  transform: scale(1.2);
  z-index: 2;
}

.chart-card h3 {
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  color: #264653;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.25rem;
}

.line-chart {
  grid-column: 1 / -1; /* Занимает всю ширину сетки */
  height: 400px; /* Увеличиваем высоту */
  margin-bottom: 2rem; /* Отступ снизу */
}

.line-chart:hover {
  transform: scale(1.05); /* Уменьшаем масштаб при наведении для большого графика */
}

.chart-card::after {
  content: none; /* Убираем подсказку у каждой карточки */
}
</style>
