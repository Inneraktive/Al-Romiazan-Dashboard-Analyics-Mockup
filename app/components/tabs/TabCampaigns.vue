<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { campaignData } from '~/utils/mockData'
import { C } from '~/utils/constants'

const { baseBarOptions } = useChartDefaults()

// Before/After chart
const beforeAfterData = computed<ChartData<'bar'>>(() => ({
  labels: ['4 Weeks Before', 'During Campaign', '4 Weeks After'],
  datasets: [{
    label: 'Revenue (AED)',
    data: [180000, 245000, 165000],
    backgroundColor: ['#d8d8d8', '#000', '#a0a0a0'],
    borderRadius: 4,
  }],
}))

const beforeAfterOptions = computed<ChartOptions<'bar'>>(() => ({
  ...baseBarOptions(),
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 14 }, color: C.textMuted, maxTicksLimit: 8 } },
    y: {
      grid: { color: C.border }, border: { display: false },
      ticks: { font: { size: 14 }, color: C.textMuted, callback: (v: any) => `${Math.round(v / 1000)}K` },
    },
  },
}))
</script>

<template>
  <!-- Campaign Performance Summary -->
  <UiSectionCard title="Campaign Performance Summary" explanation="Key metrics for each campaign — Revenue Lift, New Customers, ROI, and Cost Per Acquisition.">
    <div style="overflow-x: auto;">
      <table class="data-table">
        <thead>
          <tr class="data-table__header">
            <th v-for="h in ['Campaign', 'Revenue Lift %', 'New Customers', 'ROI %', 'CPA (AED)']" :key="h" class="data-table__th data-table__th--inactive">
              {{ h }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in campaignData" :key="c.name" class="data-table__row">
            <td class="data-table__td data-table__td--bold">{{ c.name }}</td>
            <td class="data-table__td data-table__td--green">+{{ c.lift }}%</td>
            <td class="data-table__td">{{ c.newCust }}</td>
            <td class="data-table__td" :style="{ color: C.green }">{{ c.roi }}%</td>
            <td class="data-table__td">AED {{ c.cpa }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </UiSectionCard>

  <!-- Before/After -->
  <UiSectionCard title="Before / After Comparison" explanation="Revenue before, during, and after a campaign. A dip 'after' suggests demand was pulled forward.">
    <div style="height: 240px;">
      <Bar :data="beforeAfterData" :options="beforeAfterOptions" />
    </div>
  </UiSectionCard>

  <!-- Placeholder -->
  <UiSectionCard title="Campaign Reach & Customer Journey" explanation="Campaign Reach by Branch and Customer Journey tracking both require a campaign attribution system.">
    <div class="placeholder-card">
      <div>
        <div class="placeholder-card__title">Requires: Campaign Attribution System</div>
        <div class="placeholder-card__subtitle">Link campaigns &rarr; invoices &rarr; customers for long-term tracking</div>
      </div>
    </div>
  </UiSectionCard>
</template>
