<script setup lang="ts">
import { Line, Bar } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { useFiltersStore } from '~/stores/filters'
import { spData, computedH2hData } from '~/utils/mockData'
import { COLORS, C } from '~/utils/constants'

const filters = useFiltersStore()
const { baseLineOptions, baseBarOptions } = useChartDefaults()
const { formatK } = useFormatters()

// Leaderboard
const sortedSp = computed(() => {
  return [...spData].sort((a, b) => {
    if (filters.spSort === 'ATV') return b.atv - a.atv
    if (filters.spSort === 'Invoices') return b.invoices - a.invoices
    if (filters.spSort === 'Customers') return b.customers - a.customers
    if (filters.spSort === 'Retention') return b.retention - a.retention
    return b.revenue - a.revenue
  })
})

const spHeaders = [
  { label: 'Salesperson', key: null },
  { label: 'Revenue', key: 'Revenue' },
  { label: 'ATV', key: 'ATV' },
  { label: 'Invoices', key: 'Invoices' },
  { label: 'Customers', key: 'Customers' },
  { label: 'Retention %', key: 'Retention' },
]

// H2H Chart
const useBarChart = computed(() => filters.spLines.length <= 2)

const h2hChartData = computed<ChartData<'bar' | 'line'>>(() => {
  const chartData = computedH2hData.map(row => {
    const newRow: Record<string, any> = { month: row.month }
    filters.spLines.forEach(name => {
      newRow[name] = row[`${name}_${filters.spMetric}`]
    })
    return newRow
  })

  if (useBarChart.value) {
    return {
      labels: chartData.map(d => d.month),
      datasets: filters.spLines.map((name, idx) => ({
        label: name,
        data: chartData.map(d => d[name] ?? 0),
        backgroundColor: idx === 0 ? '#000' : '#d8d8d8',
        borderRadius: 4,
        maxBarThickness: 24,
      })),
    } as any
  }

  return {
    labels: chartData.map(d => d.month),
    datasets: filters.spLines.map((name, i) => ({
      label: name,
      data: chartData.map(d => d[name] ?? 0),
      borderColor: COLORS[i],
      borderWidth: 2,
      pointRadius: 3,
      fill: false,
      tension: 0.3,
    })),
  } as any
})

const h2hOptions = computed(() => {
  const yFmt = filters.spMetric === 'Revenue' ? formatK : (v: number) => String(v)
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: { legend: { display: !useBarChart.value, position: 'bottom' as const, labels: { padding: 20, usePointStyle: true } } },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 14 }, color: C.textMuted, maxTicksLimit: 8 } },
      y: {
        grid: { color: C.border }, border: { display: false },
        ticks: {
          font: { size: 14 }, color: C.textMuted,
          callback: (v: any) => yFmt(v),
        },
      },
    },
  }
})
</script>

<template>
  <!-- Leaderboard -->
  <UiSectionCard title="Sales Leaderboard" explanation="Rank by different metrics — Revenue for raw output, ATV for upsell ability, Retention for relationship quality.">
    <div style="overflow-x: auto;">
      <table class="data-table">
        <thead>
          <tr class="data-table__header">
            <th
              v-for="h in spHeaders"
              :key="h.label"
              :class="['data-table__th', h.key ? 'data-table__th--sortable' : '', filters.spSort === h.key ? 'data-table__th--active' : 'data-table__th--inactive']"
              @click="h.key && (filters.spSort = h.key)"
            >
              {{ h.label }}<span v-if="h.key" style="margin-left: 4px; font-size: 10px;">{{ filters.spSort === h.key ? '▼' : '↕' }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sp in sortedSp" :key="sp.name" class="data-table__row">
            <td class="data-table__td data-table__td--bold">{{ sp.name }}</td>
            <td class="data-table__td">AED {{ sp.revenue.toLocaleString() }}</td>
            <td class="data-table__td">AED {{ sp.atv.toLocaleString() }}</td>
            <td class="data-table__td">{{ sp.invoices }}</td>
            <td class="data-table__td">{{ sp.customers }}</td>
            <td class="data-table__td" :style="{ color: sp.retention > 45 ? C.green : C.text }">{{ sp.retention }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </UiSectionCard>

  <!-- Head-to-Head -->
  <UiSectionCard title="Head-to-Head Comparison" explanation="Compare up to 5 salespersons over time. Switch metric to see Revenue, ATV, or Invoices.">
    <UiCtrlBar>
      <UiAppDropdown :options="['Revenue', 'ATV', 'Invoices']" v-model="filters.spMetric" />
      <UiAppMultiDropdown :options="spData.map(s => s.name)" v-model="filters.spLines" label="Select salesperson" :max="5" />
    </UiCtrlBar>
    <UiChipsBar
      :items="filters.spLines"
      @remove="(n: string) => filters.spLines = filters.spLines.filter(x => x !== n)"
      @clear="filters.spLines = []"
    />
    <div style="height: 300px;">
      <Bar v-if="useBarChart" :data="h2hChartData as any" :options="h2hOptions as any" />
      <Line v-else :data="h2hChartData as any" :options="h2hOptions as any" />
    </div>
    <div v-if="useBarChart" style="display: flex; gap: 24px; justify-content: center; padding-top: 12px;">
      <div v-for="(name, idx) in filters.spLines" :key="name" style="display: flex; align-items: center; gap: 8px;">
        <div :style="{ width: '12px', height: '12px', borderRadius: '2px', background: idx === 0 ? '#000' : '#d8d8d8' }" />
        <span style="font-size: 14px;">{{ name }}</span>
      </div>
    </div>
  </UiSectionCard>
</template>
