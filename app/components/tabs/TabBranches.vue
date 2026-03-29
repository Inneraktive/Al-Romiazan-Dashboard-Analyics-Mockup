<script setup lang="ts">
import { Line, Bar } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { useFiltersStore } from '~/stores/filters'
import {
  branchData, branchTrendByMetric, heatmapData, heatmapMonthData, prodMixData,
} from '~/utils/mockData'
import { COLORS, months, days, C } from '~/utils/constants'

const filters = useFiltersStore()
const { baseLineOptions, baseBarOptions } = useChartDefaults()
const { formatK, formatK1 } = useFormatters()

// Branch Ranking Table
const sortedBranches = computed(() => {
  return [...(branchData[filters.branchTableYear] || [])]
    .map(b => ({ ...b, retCust: Math.floor(b.invoices * 0.6), newCust: Math.floor(b.invoices * 0.4) }))
    .sort((a, b) => {
      const key = filters.branchSort
      if (key === 'ATV') return b.atv - a.atv
      if (key === 'Growth') return b.growth - a.growth
      if (key === 'Invoices') return b.invoices - a.invoices
      if (key === 'SPs') return b.sp - a.sp
      if (key === 'Rev/SP') return b.revPerSP - a.revPerSP
      if (key === 'RetCust') return b.retCust - a.retCust
      if (key === 'NewCust') return b.newCust - a.newCust
      if (key === 'Retention') return (b.retCust / (b.retCust + b.newCust)) - (a.retCust / (a.retCust + a.newCust))
      return b.revenue - a.revenue
    })
})

const tableHeaders = [
  { label: 'Branch', key: null },
  { label: 'Revenue', key: 'Revenue' },
  { label: 'Invoices', key: 'Invoices' },
  { label: 'ATV', key: 'ATV' },
  { label: 'SPs', key: 'SPs' },
  { label: 'Rev/SP', key: 'Rev/SP' },
  { label: 'Ret Cust', key: 'RetCust' },
  { label: 'New Cust', key: 'NewCust' },
  { label: 'Retention %', key: 'Retention' },
  { label: 'MoM Growth', key: 'Growth' },
]

// Branch Comparison Chart
const useBarChart = computed(() => filters.branchLines.length <= 2)

const branchCompChartData = computed<ChartData<'bar' | 'line'>>(() => {
  const data = branchTrendByMetric[filters.branchMetric]?.[filters.branchTrendYear] || []
  const labels = data.map((d: any) => d.month)

  if (useBarChart.value) {
    return {
      labels,
      datasets: filters.branchLines.map((name, idx) => ({
        label: name,
        data: data.map((d: any) => d[name] ?? 0),
        backgroundColor: idx === 0 ? '#000' : '#d8d8d8',
        borderRadius: 4,
        maxBarThickness: 24,
      })),
    } as any
  }

  return {
    labels,
    datasets: (branchData['2026'] || []).filter(b => filters.branchLines.includes(b.name)).map((b, i) => ({
      label: b.name,
      data: data.map((d: any) => d[b.name] ?? 0),
      borderColor: COLORS[(branchData['2026'] || []).findIndex(x => x.name === b.name)],
      borderWidth: 2,
      pointRadius: 3,
      fill: false,
      tension: 0.3,
    })),
  } as any
})

const branchCompOptions = computed(() => {
  const yFmt = filters.branchMetric === 'Revenue' ? formatK : filters.branchMetric === 'ATV' ? formatK1 : (v: number) => String(v)
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: { legend: { display: !useBarChart.value, position: 'bottom' as const, labels: { padding: 20, usePointStyle: true } } },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 14 }, color: C.textMuted, maxTicksLimit: 8 } },
      y: { grid: { color: C.border }, border: { display: false }, ticks: { font: { size: 14 }, color: C.textMuted, callback: (v: any) => yFmt(v) } },
    },
  }
})

// Heatmap
const heatData = computed(() => filters.heatView === 'Day' ? heatmapData : heatmapMonthData)
const heatRows = computed(() => filters.heatView === 'Day' ? days : months)
const heatRowKey = computed(() => filters.heatView === 'Day' ? 'day' : 'month')
const maxHeatVal = computed(() => Math.max(...heatData.value.map(d => d.value)))
const minHeatVal = computed(() => Math.min(...heatData.value.map(d => d.value)))
const bestIdx = computed(() => heatData.value.findIndex(d => d.value === maxHeatVal.value))
const worstIdx = computed(() => heatData.value.findIndex(d => d.value === minHeatVal.value))

function getHeatCellIdx(row: string, colIdx: number): number {
  const rowIdx = heatRows.value.indexOf(row)
  return rowIdx * 14 + colIdx
}

// Product Mix stacked bar
const prodMixShown = computed(() => {
  return (prodMixData[filters.prodMixYear] || []).filter(d => filters.prodMixBranches.includes(d.fullName))
})
const productKeys = ['24K', '22K', '21K', '18K', '14K', '8K'] as const
const prodMixColors = ['#F4B400', '#E67700', '#4285F4', '#7C3AED', '#0891B2', '#DB2777']

const prodMixChartData = computed<ChartData<'bar'>>(() => ({
  labels: prodMixShown.value.map(d => d.branch),
  datasets: productKeys.map((key, i) => ({
    label: key,
    data: prodMixShown.value.map(d => d[key]),
    backgroundColor: prodMixColors[i],
    borderRadius: i === productKeys.length - 1 ? 4 : 0,
  })),
}))

const prodMixOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: { legend: { display: true, position: 'bottom' as const, labels: { padding: 20, usePointStyle: true } } },
  scales: {
    x: { stacked: true, grid: { display: false }, border: { display: false }, ticks: { font: { size: 13 }, color: C.textMuted, maxTicksLimit: 8 } },
    y: { stacked: true, grid: { color: C.border }, border: { display: false }, ticks: { font: { size: 13 }, color: C.textMuted, stepSize: 20, callback: (v: any) => `${v}%` } },
  },
}))
</script>

<template>
  <!-- Branch Ranking Table -->
  <UiSectionCard title="Branch Ranking Table" explanation="Click any column header to sort. Tracks revenue, invoices, ATV, staff, and growth per branch.">
    <UiCtrlBar>
      <UiAppDropdown :options="['2026', '2025', '2024']" v-model="filters.branchTableYear" label="Year" />
    </UiCtrlBar>
    <div style="overflow-x: auto;">
      <table class="data-table" style="min-width: 800px;">
        <thead>
          <tr class="data-table__header">
            <th
              v-for="h in tableHeaders"
              :key="h.label"
              :class="['data-table__th', h.key ? 'data-table__th--sortable' : '', filters.branchSort === h.key ? 'data-table__th--active' : 'data-table__th--inactive']"
              @click="h.key && (filters.branchSort = h.key)"
            >
              {{ h.label }}<span v-if="h.key" style="margin-left: 4px; font-size: 10px;">{{ filters.branchSort === h.key ? '▼' : '↕' }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in sortedBranches" :key="b.name" class="data-table__row">
            <td class="data-table__td data-table__td--bold">{{ b.name }}</td>
            <td class="data-table__td">AED {{ b.revenue.toLocaleString() }}</td>
            <td class="data-table__td">{{ b.invoices }}</td>
            <td class="data-table__td">AED {{ b.atv.toLocaleString() }}</td>
            <td class="data-table__td">{{ b.sp }}</td>
            <td class="data-table__td data-table__td--bold">AED {{ b.revPerSP.toLocaleString() }}</td>
            <td class="data-table__td">{{ b.retCust }}</td>
            <td class="data-table__td">{{ b.newCust }}</td>
            <td class="data-table__td" style="font-weight: 600;">{{ ((b.retCust / (b.retCust + b.newCust)) * 100).toFixed(0) }}%</td>
            <td :class="['data-table__td', b.growth > 0 ? 'data-table__td--green' : 'data-table__td--red']">
              {{ b.growth > 0 ? '+' : '' }}{{ b.growth }}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </UiSectionCard>

  <!-- Branch Comparison Chart -->
  <UiSectionCard title="Branch Comparison Chart" explanation="Select up to 6 branches to compare on the same chart. Switch metric and year.">
    <UiCtrlBar>
      <UiAppDropdown :options="['Revenue', 'Invoices', 'ATV']" v-model="filters.branchMetric" />
      <UiAppDropdown :options="['2026', '2025', '2024']" v-model="filters.branchTrendYear" label="Year" />
      <UiAppMultiDropdown
        :options="(branchData['2026'] || []).map(b => b.name)"
        v-model="filters.branchLines"
        label="Select branches"
        :max="6"
      />
    </UiCtrlBar>
    <div style="height: 280px;">
      <Bar v-if="useBarChart" :data="branchCompChartData as any" :options="branchCompOptions as any" />
      <Line v-else :data="branchCompChartData as any" :options="branchCompOptions as any" />
    </div>
    <div v-if="useBarChart" style="display: flex; gap: 24px; justify-content: center; padding-top: 12px;">
      <div v-for="(name, idx) in filters.branchLines" :key="name" style="display: flex; align-items: center; gap: 8px;">
        <div :style="{ width: '12px', height: '12px', borderRadius: '2px', background: idx === 0 ? '#000' : '#d8d8d8' }" />
        <span style="font-size: 14px;">{{ name }}</span>
      </div>
    </div>
  </UiSectionCard>

  <!-- Heatmap -->
  <UiSectionCard title="Branch Revenue Heatmap" explanation="Color intensity = invoice count by hour and time period. Day view for staff scheduling, Month view for seasonal patterns.">
    <UiCtrlBar>
      <UiAppDropdown :options="['Day', 'Month']" v-model="filters.heatView" label="View" />
      <UiAppDropdown :options="['All Branches', ...(branchData['2026'] || []).map(b => b.name)]" v-model="filters.heatBranch" label="Branch" />
    </UiCtrlBar>
    <div style="overflow-x: auto;">
      <div style="display: flex; gap: 2px; margin-bottom: 4px; padding-left: 40px;">
        <div v-for="h in Array.from({ length: 14 }, (_, i) => i + 9)" :key="h" style="width: 44px; text-align: center; font-size: 11px; color: #727272;">
          {{ h > 12 ? `${h - 12}PM` : `${h}AM` }}
        </div>
      </div>
      <div v-for="row in heatRows" :key="row" style="display: flex; gap: 2px; align-items: center; margin-bottom: 2px;">
        <div style="width: 36px; font-size: 12px; color: #727272; text-align: right; padding-right: 4px;">{{ row }}</div>
        <UiHeatmapCell
          v-for="(cell, i) in heatData.filter(d => d[heatRowKey] === row)"
          :key="i"
          :value="cell.value"
          :highlight="getHeatCellIdx(row, i) === bestIdx ? 'best' : getHeatCellIdx(row, i) === worstIdx ? 'worst' : undefined"
        />
      </div>
      <div style="display: flex; gap: 16px; margin-top: 10px; padding-left: 40px; align-items: center; flex-wrap: wrap;">
        <div style="font-size: 12px; color: #727272; display: flex; align-items: center; gap: 6px;">
          <span>Low</span>
          <div v-for="v in [0.1, 0.3, 0.5, 0.7, 0.9]" :key="v" :style="{ width: '20px', height: '12px', borderRadius: '2px', background: `rgba(0,0,0,${v})` }" />
          <span>High</span>
        </div>
        <div style="display: flex; gap: 12px; font-size: 12px;">
          <span style="display: flex; align-items: center; gap: 4px;"><div :style="{ width: '14px', height: '10px', borderRadius: '2px', background: C.green }" /> Best ({{ maxHeatVal }})</span>
          <span style="display: flex; align-items: center; gap: 4px;"><div :style="{ width: '14px', height: '10px', borderRadius: '2px', background: C.red }" /> Worst ({{ minHeatVal }})</span>
        </div>
      </div>
    </div>
  </UiSectionCard>

  <!-- Product Mix by Branch -->
  <UiSectionCard title="Product Mix by Branch" explanation="Shows which product categories sell best at selected branches.">
    <UiCtrlBar>
      <UiAppDropdown :options="['2026', '2025', '2024']" v-model="filters.prodMixYear" label="Year" />
      <UiAppMultiDropdown
        :options="(branchData[filters.prodMixYear] || []).map(b => b.name)"
        v-model="filters.prodMixBranches"
        label="Select branches"
        :max="4"
      />
    </UiCtrlBar>
    <UiChipsBar
      :items="filters.prodMixBranches"
      @remove="(n: string) => { if (filters.prodMixBranches.length > 1) filters.prodMixBranches = filters.prodMixBranches.filter(x => x !== n) }"
    />
    <div :style="{ height: prodMixShown.length === 1 ? '180px' : '280px' }">
      <Bar :data="prodMixChartData" :options="prodMixOptions" />
    </div>
  </UiSectionCard>
</template>
