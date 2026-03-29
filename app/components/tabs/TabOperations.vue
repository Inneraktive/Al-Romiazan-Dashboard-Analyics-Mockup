<script setup lang="ts">
import { Chart } from 'vue-chartjs'
import type { ChartOptions } from 'chart.js'
import { useFiltersStore } from '~/stores/filters'
import { cancelTrend } from '~/utils/mockData'
import { C } from '~/utils/constants'

const filters = useFiltersStore()

// Cancellation chart
const cancelChartData = computed(() => {
  const datasets: any[] = []

  if (filters.cancelView === 'Rate + Value' || filters.cancelView === 'Rate Only') {
    datasets.push({
      type: 'line' as const,
      label: 'Cancel Rate %',
      data: cancelTrend.map(d => parseFloat(d.rate)),
      borderColor: C.red,
      borderWidth: 2,
      pointRadius: 3,
      pointBackgroundColor: C.red,
      fill: false,
      tension: 0.3,
      yAxisID: 'y',
    })
  }

  if (filters.cancelView === 'Rate + Value' || filters.cancelView === 'Value Only') {
    datasets.push({
      type: 'bar' as const,
      label: 'Cancel Value (AED)',
      data: cancelTrend.map(d => d.value),
      backgroundColor: '#fecaca',
      borderColor: C.red,
      borderWidth: 1,
      borderRadius: 4,
      yAxisID: filters.cancelView === 'Value Only' ? 'y' : 'y1',
    })
  }

  return { labels: cancelTrend.map(d => d.month), datasets }
})

const cancelOptions = computed(() => {
  const showRate = filters.cancelView === 'Rate + Value' || filters.cancelView === 'Rate Only'
  const showValue = filters.cancelView === 'Rate + Value' || filters.cancelView === 'Value Only'

  const scales: any = {
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 14 }, color: C.textMuted, maxTicksLimit: 8 } },
  }

  if (showRate) {
    scales.y = {
      grid: { color: C.border }, border: { display: false },
      ticks: { font: { size: 14 }, color: C.red, callback: (v: any) => `${v}%` },
    }
  }

  if (showValue && filters.cancelView !== 'Value Only') {
    scales.y1 = {
      position: 'right', grid: { display: false }, border: { display: false },
      ticks: { font: { size: 14 }, color: C.textMuted, callback: (v: any) => `${Math.round(v / 1000)}K` },
    }
  } else if (filters.cancelView === 'Value Only') {
    scales.y = {
      grid: { color: C.border }, border: { display: false },
      ticks: { font: { size: 14 }, color: C.textMuted, callback: (v: any) => `${Math.round(v / 1000)}K` },
    }
  }

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: { legend: { display: true, position: 'bottom' as const, labels: { padding: 20, usePointStyle: true } } },
    scales,
  }
})

// Alerts
const alerts = [
  { type: 'critical', msg: 'Revenue anomaly: Gold Souk dropped 35% vs 7-day average', time: '2h ago' },
  { type: 'warning', msg: 'Inactive branch: Ajman — no invoices in 48 hours', time: '6h ago' },
  { type: 'warning', msg: 'Churn risk: 23 Gold-tier customers exceeded avg interval by 2x', time: '1d ago' },
  { type: 'critical', msg: 'Points anomaly: Negative redemption balance (-91 pts)', time: '3d ago' },
]

// Data validity
const dataMetrics = [
  { label: 'Data Completeness', value: '87%', color: C.green },
  { label: 'Missing Customer', value: '4.2%', color: C.orange },
  { label: 'Missing Payment', value: '2.8%', color: C.orange },
  { label: 'Invalid Entries', value: '1.3%', color: C.red },
]
</script>

<template>
  <!-- Cancellation Analysis -->
  <UiSectionCard title="Cancellation Analysis" explanation="View cancellation rate, lost revenue, or both together.">
    <UiCtrlBar>
      <UiAppDropdown :options="['Rate + Value', 'Rate Only', 'Value Only']" v-model="filters.cancelView" label="View" />
    </UiCtrlBar>
    <div style="height: 300px;">
      <Chart type="bar" :data="cancelChartData as any" :options="cancelOptions as any" />
    </div>
  </UiSectionCard>

  <!-- Data Validity -->
  <UiSectionCard title="Data Validity Tracking" explanation="Key data quality metrics. Analytics are only as good as the underlying data.">
    <div class="data-validity">
      <div v-for="m in dataMetrics" :key="m.label" class="data-validity__item">
        <div class="data-validity__value" :style="{ color: m.color }">{{ m.value }}</div>
        <div class="data-validity__label">{{ m.label }}</div>
      </div>
    </div>
  </UiSectionCard>

  <!-- Alerts -->
  <UiSectionCard title="Alerts & Anomaly Detection" explanation="Backend job runs daily to detect anomalies and surface them on the dashboard.">
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div
        v-for="(a, i) in alerts"
        :key="i"
        :class="['alert-item', a.type === 'critical' ? 'alert-item--critical' : 'alert-item--warning']"
      >
        <div class="alert-item__msg">{{ a.msg }}</div>
        <div class="alert-item__time">{{ a.time }}</div>
      </div>
    </div>
  </UiSectionCard>
</template>
