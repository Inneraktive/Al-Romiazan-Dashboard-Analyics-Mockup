import { defineStore } from 'pinia'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    activeTab: 'revenue' as string,
    dateFrom: '2026-01-01',
    dateTo: '2026-12-31',
  }),
  getters: {
    selectedYear: (state) => new Date(state.dateFrom).getFullYear(),
  },
  actions: {
    setTab(tab: string) {
      this.activeTab = tab
    },
    resetDates() {
      this.dateFrom = '2026-01-01'
      this.dateTo = '2026-12-31'
    },
  },
})
