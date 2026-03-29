<script setup lang="ts">
import { Line, Bar, Doughnut, Chart } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { useFiltersStore } from '~/stores/filters'
import { customerAcq, tierData, clvDistribution, retentionCurve } from '~/utils/mockData'
import { C } from '~/utils/constants'

const filters = useFiltersStore()
const { baseLineOptions, baseBarOptions, baseDoughnutOptions } = useChartDefaults()

// Customer Acquisition
const acqChartData = computed(() => ({
  labels: customerAcq.map(d => d.month),
  datasets: [
    {
      type: 'bar' as const,
      label: 'New Customers',
      data: customerAcq.map(d => d.newCustomers),
      backgroundColor: '#000',
      borderRadius: 4,
      yAxisID: 'y',
    },
    ...(filters.custView === 'New + Cumulative' ? [{
      type: 'line' as const,
      label: 'Cumulative Total',
      data: customerAcq.map(d => d.cumulative),
      borderColor: C.orange,
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
      tension: 0.3,
      yAxisID: 'y1',
    }] : []),
  ],
}))

const acqOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: { legend: { display: true, position: 'bottom' as const, labels: { padding: 20, usePointStyle: true } } },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 14 }, color: C.textMuted, maxTicksLimit: 8 } },
    y: { grid: { color: C.border }, border: { display: false }, ticks: { font: { size: 14 }, color: C.textMuted } },
    ...(filters.custView === 'New + Cumulative' ? {
      y1: { position: 'right' as const, grid: { display: false }, border: { display: false }, ticks: { font: { size: 14 }, color: C.orange } },
    } : {}),
  },
}))

// Tier Distribution
const tierChartData = computed<ChartData<'doughnut'>>(() => ({
  labels: tierData.map(t => `${t.name} (${t.count})`),
  datasets: [{
    data: tierData.map(t => t.value),
    backgroundColor: ['#333', '#a0a0a0', '#000', C.purple],
    borderWidth: 0,
  }],
}))

const tierNearUp = [
  { tier: 'Bronze → Silver', count: 340, pct: 15 },
  { tier: 'Silver → Gold', count: 180, pct: 12 },
  { tier: 'Gold → Platinum', count: 65, pct: 7 },
]

// CLV Distribution
const clvChartData = computed<ChartData<'bar'>>(() => ({
  labels: clvDistribution.map(d => d.range),
  datasets: [{
    label: 'Customer Count',
    data: clvDistribution.map(d => d.count),
    backgroundColor: '#000',
    borderRadius: 4,
  }],
}))

const clvOptions = computed<ChartOptions<'bar'>>(() => ({
  ...baseBarOptions(),
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 13 }, color: C.textMuted, maxTicksLimit: 8 } },
    y: { grid: { color: C.border }, border: { display: false }, ticks: { font: { size: 13 }, color: C.textMuted } },
  },
}))

// Retention Curve
const retChartData = computed<ChartData<'line'>>(() => {
  const datasets: any[] = []
  if (filters.retTier === 'All Tiers' || filters.retTier === 'Gold') {
    datasets.push({ label: 'Gold Tier', data: retentionCurve.map(d => d.gold), borderColor: '#000', borderWidth: 2, pointRadius: 3, fill: false, tension: 0.3 })
  }
  if (filters.retTier === 'All Tiers' || filters.retTier === 'Silver') {
    datasets.push({ label: 'Silver Tier', data: retentionCurve.map(d => d.silver), borderColor: '#a0a0a0', borderWidth: 2, pointRadius: 3, fill: false, tension: 0.3 })
  }
  if (filters.retTier === 'All Tiers' || filters.retTier === 'Bronze') {
    datasets.push({ label: 'Bronze Tier', data: retentionCurve.map(d => d.bronze), borderColor: '#555', borderWidth: 2, pointRadius: 3, fill: false, tension: 0.3 })
  }
  if (filters.retTier === 'All Tiers') {
    datasets.push({ label: 'All Customers', data: retentionCurve.map(d => d.all), borderColor: C.textMuted, borderWidth: 1.5, borderDash: [5, 3], pointRadius: 0, fill: false, tension: 0.3 })
  }

  return {
    labels: retentionCurve.map(d => d.month),
    datasets,
  }
})

const retOptions = computed<ChartOptions<'line'>>(() => ({
  ...baseLineOptions(),
  plugins: { legend: { display: true, position: 'bottom' as const, labels: { padding: 20, usePointStyle: true } } },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 14 }, color: C.textMuted, maxTicksLimit: 8 } },
    y: {
      grid: { color: C.border }, border: { display: false },
      ticks: { font: { size: 14 }, color: C.textMuted, callback: (v: any) => `${v}%` },
    },
  },
}))
</script>

<template>
  <!-- Customer Acquisition -->
  <UiSectionCard title="Customer Acquisition Trend" explanation="View new customers with cumulative total, or just new customers for cleaner analysis.">
    <UiCtrlBar>
      <UiAppDropdown :options="['New + Cumulative', 'New Only']" v-model="filters.custView" label="View" />
    </UiCtrlBar>
    <div style="height: 300px;">
      <Chart type="bar" :data="acqChartData as any" :options="acqOptions as any" />
    </div>
  </UiSectionCard>

  <!-- Tier Distribution -->
  <UiSectionCard title="Tier Distribution & Movement" explanation="Customer distribution across loyalty tiers. Near tier-up section highlights campaign targets.">
    <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center;">
      <div style="width: 45%; height: 220px;">
        <Doughnut :data="tierChartData" :options="{ ...baseDoughnutOptions(), plugins: { legend: { display: true, position: 'right', labels: { padding: 12, usePointStyle: true, font: { size: 13 } } } } } as any" />
      </div>
      <div style="flex: 1; min-width: 200px;">
        <div style="font-size: 14px; color: #727272; font-weight: 600; margin-bottom: 10px;">Near Tier-Up (Campaign Targets)</div>
        <div v-for="t in tierNearUp" :key="t.tier" class="tier-progress">
          <div class="tier-progress__header">
            <span>{{ t.tier }}</span>
            <span class="tier-progress__count">{{ t.count }} customers</span>
          </div>
          <div class="tier-progress__bar">
            <div class="tier-progress__bar-fill" :style="{ width: `${t.pct * 5}%` }" />
          </div>
        </div>
      </div>
    </div>
  </UiSectionCard>

  <!-- CLV Distribution -->
  <UiSectionCard title="Customer Lifetime Value (CLV)" explanation="CLV distribution — the long tail of high-CLV customers drives disproportionate revenue.">
    <div style="height: 300px;">
      <Bar :data="clvChartData" :options="clvOptions" />
    </div>
  </UiSectionCard>

  <!-- Retention Curve -->
  <UiSectionCard title="Repeat Purchase / Retention Curve" explanation="Filter by tier to focus on specific customer segments or view all together.">
    <UiCtrlBar>
      <UiAppDropdown :options="['All Tiers', 'Gold', 'Silver', 'Bronze']" v-model="filters.retTier" label="Tier" />
    </UiCtrlBar>
    <div style="height: 300px;">
      <Line :data="retChartData" :options="retOptions" />
    </div>
  </UiSectionCard>
</template>
