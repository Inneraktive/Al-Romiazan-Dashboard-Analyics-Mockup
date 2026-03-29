<script setup lang="ts">
import { Line } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { useFiltersStore } from '~/stores/filters'
import { pricePerGram, productTrend, weightTrend } from '~/utils/mockData'
import { COLORS, C } from '~/utils/constants'

const filters = useFiltersStore()
const { baseLineOptions } = useChartDefaults()

// Product Trend (100% stacked area)
const normalizedTrend = computed(() => {
  const keys = ['24K', '22K', '21K', '18K', '14K', '8K'] as const
  return productTrend.map(row => {
    const total = keys.reduce((s, k) => s + (row[k] as number), 0)
    const norm: Record<string, any> = { month: row.month }
    keys.forEach(k => { norm[k] = (row[k] as number) / total })
    return norm
  })
})

const trendAreaData = computed<ChartData<'line'>>(() => ({
  labels: normalizedTrend.value.map(d => d.month),
  datasets: ['24K', '22K', '21K', '18K', '14K', '8K'].map((key, i) => ({
    label: key,
    data: normalizedTrend.value.map(d => d[key]),
    backgroundColor: COLORS[i] + 'CC',
    borderColor: COLORS[i],
    borderWidth: 1,
    fill: true,
    pointRadius: 0,
    tension: 0.3,
  })),
}))

const trendAreaOptions = computed<ChartOptions<'line'>>(() => ({
  ...baseLineOptions(),
  plugins: { legend: { display: true, position: 'bottom' as const, labels: { padding: 20, usePointStyle: true } }, filler: {} },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 14 }, color: C.textMuted, maxTicksLimit: 8 }, stacked: true },
    y: {
      stacked: true, grid: { color: C.border }, border: { display: false },
      ticks: { font: { size: 14 }, color: C.textMuted, callback: (v: any) => `${Math.round(v * 100)}%`, stepSize: 0.2 },
      min: 0, max: 1,
    },
  },
}))

// Price Per Gram
const priceChartData = computed<ChartData<'line'>>(() => ({
  labels: pricePerGram.map(d => d.month),
  datasets: [
    {
      label: 'Your Price/g',
      data: pricePerGram.map(d => d.sellingPrice),
      borderColor: '#000',
      borderWidth: 2,
      pointRadius: 3,
      fill: false,
      tension: 0.3,
    },
    ...(filters.spotOverlay === 'Show' ? [{
      label: 'Spot Price/g',
      data: pricePerGram.map(d => d.spotPrice),
      borderColor: C.textMuted,
      borderWidth: 2,
      borderDash: [5, 3],
      pointRadius: 0,
      fill: false,
      tension: 0.3,
    }] : []),
  ],
}))

const priceOptions = computed<ChartOptions<'line'>>(() => ({
  ...baseLineOptions(),
  plugins: { legend: { display: true, position: 'bottom' as const, labels: { padding: 20, usePointStyle: true } } },
}))

// Weight Trend
const weightChartData = computed<ChartData<'line'>>(() => ({
  labels: weightTrend.map(d => d.month),
  datasets: [{
    label: `Weight (${filters.weightUnit})`,
    data: weightTrend.map(d => filters.weightUnit === 'Troy Oz' ? d.grams / 31.1 : d.grams),
    borderColor: C.green,
    borderWidth: 2,
    fill: true,
    backgroundColor: 'rgba(88,158,103,0.1)',
    tension: 0.3,
    pointRadius: 0,
  }],
}))

const weightOptions = computed<ChartOptions<'line'>>(() => ({
  ...baseLineOptions(),
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 14 }, color: C.textMuted, maxTicksLimit: 8 } },
    y: {
      grid: { color: C.border }, border: { display: false },
      ticks: {
        font: { size: 14 }, color: C.textMuted,
        callback: (v: any) => filters.weightUnit === 'Troy Oz' ? `${Math.round(v)} oz` : `${v}g`,
      },
    },
  },
}))
</script>

<template>
  <!-- Sales by Product Category -->
  <UiSectionCard title="Sales by Product Category" explanation="Product mix shift over time as a 100% stacked area chart.">
    <div style="height: 300px;">
      <Line :data="trendAreaData" :options="trendAreaOptions" />
    </div>
  </UiSectionCard>

  <!-- Avg Selling Price Per Gram -->
  <UiSectionCard title="Avg Selling Price Per Gram" explanation="Your selling price vs gold spot price. Toggle spot price overlay.">
    <UiCtrlBar>
      <UiAppDropdown :options="['Show', 'Hide']" v-model="filters.spotOverlay" label="Spot Price" />
    </UiCtrlBar>
    <div style="height: 300px;">
      <Line :data="priceChartData" :options="priceOptions" />
    </div>
  </UiSectionCard>

  <!-- Weight Sold -->
  <UiSectionCard title="Weight Sold Trends" explanation="Tracks gold weight sold separately from revenue.">
    <UiCtrlBar>
      <UiAppDropdown :options="['Grams', 'Troy Oz']" v-model="filters.weightUnit" label="Unit" />
    </UiCtrlBar>
    <div style="height: 300px;">
      <Line :data="weightChartData" :options="weightOptions" />
    </div>
  </UiSectionCard>
</template>
