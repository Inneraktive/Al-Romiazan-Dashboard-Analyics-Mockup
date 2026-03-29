import { defineStore } from 'pinia'

export const useFiltersStore = defineStore('filters', {
  state: () => ({
    // Revenue tab
    revYears: ['2025'] as string[],
    revMetric: 'Revenue' as string,
    showForecast: 'Hide' as string,
    revTrendDateFrom: '2026-01-01',
    revTrendDateTo: '2026-12-31',
    payBrkDateFrom: '2026-01-01',
    payBrkDateTo: '2026-12-31',
    paretoDateFrom: '2026-01-01',
    paretoDateTo: '2026-12-31',
    prodRevDateFrom: '2026-01-01',
    prodRevDateTo: '2026-12-31',

    // Branch tab
    branchSort: 'Revenue' as string,
    branchTableYear: '2026' as string,
    branchMetric: 'Revenue' as string,
    branchLines: ['Mall of Emirates', 'Dubai Mall', 'Gold Souk', 'Abu Dhabi Mall'] as string[],
    branchTrendYear: '2026' as string,
    prodMixBranches: ['Mall of Emirates', 'Dubai Mall', 'Gold Souk', 'Abu Dhabi Mall'] as string[],
    prodMixYear: '2026' as string,
    heatBranch: 'All Branches' as string,
    heatView: 'Day' as string,

    // Salesperson tab
    spSort: 'Revenue' as string,
    spMetric: 'Revenue' as string,
    spLines: ['Ahmed K.', 'Fatima R.'] as string[],

    // Product tab
    prodView: 'Donut' as string,
    spotOverlay: 'Show' as string,
    weightUnit: 'Grams' as string,

    // Customer tab
    custView: 'New + Cumulative' as string,
    retTier: 'All Tiers' as string,

    // Operations tab
    cancelView: 'Rate + Value' as string,
  }),
})
