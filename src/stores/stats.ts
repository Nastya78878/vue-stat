// stores/stats.ts
import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'

interface SummaryItem {
  categoryName: string
  categoryType: string
  totalAmount: number
  dates: string[]
}

interface ModeItem {
  amount: number
  categoryType: string
}

interface GeneralStats {
  averageIncome: number
  averageExpense: number
  medianAmount: number
  modeStats: ModeItem[]
}

export const useStatsStore = defineStore('stats', () => {
  const summary = ref<SummaryItem[]>([])
  const stats = ref<GeneralStats | null>(null)

  async function fetchSummary(startDate: string, endDate: string) {
    const res = await axios.get<SummaryItem[]>(
      `/transactions/summary?startDate=${startDate}&endDate=${endDate}`,
    )
    console.log('API /summary data:', res.data)
    summary.value = res.data
  }

  async function fetchStats(startDate: string, endDate: string) {
    const res = await axios.get<GeneralStats>(
      `/transactions/stats?startDate=${startDate}&endDate=${endDate}`,
    )
    stats.value = res.data
  }

  return { summary, stats, fetchSummary, fetchStats }
})
