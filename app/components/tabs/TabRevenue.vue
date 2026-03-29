<script setup lang="ts">
import { Line, Bar, Chart } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { useFiltersStore } from '~/stores/filters'
import { revenueTrend, paymentData, invoiceDistribution, prodRevData } from '~/utils/mockData'
import { revForecastData } from '~/utils/forecast'
import { COLORS, months, C } from '~/utils/constants'

const filters = useFiltersStore()
const { baseLineOptions, baseBarOptions } = useChartDefaults()
const { formatK, formatK1 } = useFormatters()

// Revenue Overview (standalone card)
const overviewYear = computed(() => new Date(filters.revTrendDateFrom).getFullYear())
const fromMonth = computed(() => new Date(filters.revTrendDateFrom).getMonth())
const toMonth = computed(() => new Date(filters.revTrendDateTo).getMonth())

function generateRevenueData(year: number) {
  let seed = year * 13 + 77
  const rand = () => { seed = ((seed * 16807) % 2147483647); return (seed - 1) / 2147483646 }
  const baseMultiplier = 1 + (year - 2023) * 0.12
  return months.map((m, i) => ({
    month: m,
    sales: Math.floor((140000 + Math.sin(i * 0.7) * 50000 + rand() * 30000) * baseMultiplier),
  }))
}

const overviewData = computed(() => {
  const full = generateRevenueData(overviewYear.value)
  return full.filter((_, i) => i >= fromMonth.value && i <= toMonth.value)
})
const totalRevenue = computed(() => overviewData.value.reduce((sum, d) => sum + d.sales, 0))
const prevYearData = computed(() => {
  const full = generateRevenueData(overviewYear.value - 1)
  return full.filter((_, i) => i >= fromMonth.value && i <= toMonth.value)
})
const prevYearTotal = computed(() => prevYearData.value.reduce((sum, d) => sum + d.sales, 0))
const growthPct = computed(() => prevYearTotal.value ? Math.round(((totalRevenue.value - prevYearTotal.value) / prevYearTotal.value) * 100) : 0)
const isPositive = computed(() => growthPct.value >= 0)

const overviewChartData = computed<ChartData<'line'>>(() => ({
  labels: overviewData.value.map(d => d.month),
  datasets: [{
    data: overviewData.value.map(d => d.sales),
    borderColor: '#000',
    borderWidth: 2,
    fill: true,
    backgroundColor: 'rgba(0,0,0,0.05)',
    tension: 0,
    pointRadius: 0,
    pointHoverRadius: 6,
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: '#000',
    pointHoverBorderWidth: 2,
  }],
}))

function overviewExternalTooltip(context: any) {
  const { chart, tooltip } = context
  let el = chart.canvas.parentNode.querySelector('.rev-tooltip') as HTMLElement
  if (tooltip.opacity === 0) {
    if (el) el.style.opacity = '0'
    return
  }
  if (!el) {
    el = document.createElement('div')
    el.classList.add('rev-tooltip')
    chart.canvas.parentNode.appendChild(el)
  }
  const month = tooltip.title?.[0] ?? ''
  const value = tooltip.dataPoints?.[0]?.raw as number
  el.innerHTML = `
    <div class="rev-tooltip__header">
      <span class="rev-tooltip__icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
      <span class="rev-tooltip__label">${month} ${overviewYear.value}</span>
    </div>
    <div class="rev-tooltip__body">
      <span class="rev-tooltip__data-label">Sales</span>
      <span class="rev-tooltip__data-value">${value?.toLocaleString() ?? ''}</span>
      <span class="rev-tooltip__data-unit">AED</span>
    </div>`
  el.style.opacity = '1'
  el.style.position = 'absolute'
  el.style.left = tooltip.caretX + 'px'
  el.style.top = tooltip.caretY + 'px'
  el.style.transform = 'translate(-50%, 10px)'
  el.style.transition = 'all 0.15s ease'
  el.style.pointerEvents = 'none'
  el.style.zIndex = '10'
}

const overviewChartOptions = computed<ChartOptions<'line'>>(() => ({
  ...baseLineOptions(),
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: false,
      external: overviewExternalTooltip,
    },
  },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 13 }, color: '#999', maxTicksLimit: 8 } },
    y: {
      beginAtZero: false,
      grid: { color: '#e4e4e4', lineWidth: 1, drawBorder: false, borderDash: [6, 6] },
      border: { display: false },
      ticks: {
        font: { size: 13 },
        color: '#999',
        stepSize: 20000,
        callback: (v: any) => v === 0 ? '0K' : v >= 1000 ? `${Math.round(v / 1000)}K` : v,
      },
    },
  },
}))

// Revenue Trend
const revMetricKey = computed(() => {
  if (filters.revMetric === 'Revenue') return 'monthly'
  if (filters.revMetric === 'Invoices') return 'invoices'
  return 'atv'
})
const fcKey = computed(() => {
  if (filters.revMetric === 'Revenue') return 'fcMonthly'
  if (filters.revMetric === 'Invoices') return 'fcInvoices'
  return 'fcAtv'
})
const yearSuffix = computed(() => {
  if (filters.revMetric === 'Revenue') return ''
  if (filters.revMetric === 'Invoices') return 'inv'
  return 'atv'
})
const yFmt = computed(() => {
  if (filters.revMetric === 'Revenue') return formatK
  if (filters.revMetric === 'ATV') return formatK1
  return (v: number) => String(v)
})

const trendChartData = computed<ChartData<'line'>>(() => {
  const showFc = filters.showForecast === 'Show'
  const src = showFc ? revForecastData : revenueTrend
  const labels = src.map(d => d.month)

  const datasets: any[] = [{
    label: '2026 (Current)',
    data: src.map(d => (d as any)[revMetricKey.value] ?? null),
    borderColor: '#000',
    borderWidth: 2,
    fill: true,
    backgroundColor: 'rgba(0,0,0,0.06)',
    tension: 0.3,
    pointRadius: 0,
    spanGaps: false,
  }]

  if (showFc) {
    datasets.push({
      label: 'Forecast (ARIMA)',
      data: src.map(d => (d as any)[fcKey.value] ?? null),
      borderColor: C.cyan,
      borderWidth: 2,
      borderDash: [8, 4],
      pointRadius: 4,
      pointBackgroundColor: C.cyan,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      fill: false,
      tension: 0.3,
      spanGaps: false,
    })
    datasets.push({
      label: 'Upper CI',
      data: src.map(d => (d as any)[fcKey.value + 'Upper'] ?? null),
      borderColor: 'transparent',
      fill: '+1',
      backgroundColor: 'rgba(8,145,178,0.12)',
      pointRadius: 0,
      spanGaps: false,
    })
    datasets.push({
      label: 'Lower CI',
      data: src.map(d => (d as any)[fcKey.value + 'Lower'] ?? null),
      borderColor: 'transparent',
      fill: false,
      pointRadius: 0,
      spanGaps: false,
    })
  }

  if (filters.revYears.includes('2025')) {
    datasets.push({
      label: '2025',
      data: src.map(d => (d as any)[yearSuffix.value ? `y2025${yearSuffix.value}` : 'y2025'] ?? null),
      borderColor: '#E67700',
      borderWidth: 2,
      borderDash: [6, 3],
      pointRadius: 2,
      pointBackgroundColor: '#E67700',
      fill: false,
      tension: 0.3,
    })
  }
  if (filters.revYears.includes('2024')) {
    datasets.push({
      label: '2024',
      data: src.map(d => (d as any)[yearSuffix.value ? `y2024${yearSuffix.value}` : 'y2024'] ?? null),
      borderColor: '#4285F4',
      borderWidth: 2,
      borderDash: [6, 3],
      pointRadius: 2,
      pointBackgroundColor: '#4285F4',
      fill: false,
      tension: 0.3,
    })
  }
  if (filters.revYears.includes('2023')) {
    datasets.push({
      label: '2023',
      data: src.map(d => (d as any)[yearSuffix.value ? `y2023${yearSuffix.value}` : 'y2023'] ?? null),
      borderColor: '#34A853',
      borderWidth: 2,
      borderDash: [6, 3],
      pointRadius: 2,
      pointBackgroundColor: '#34A853',
      fill: false,
      tension: 0.3,
    })
  }

  return { labels, datasets }
})

const trendChartOptions = computed<ChartOptions<'line'>>(() => ({
  ...baseLineOptions(),
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      reverse: true,
      labels: {
        padding: 20,
        usePointStyle: true,
        pointStyleWidth: 10,
        filter: (item: any) => !['Upper CI', 'Lower CI'].includes(item.text),
        generateLabels: (chart: any) => {
          return chart.data.datasets
            .map((ds: any, i: number) => {
              if (['Upper CI', 'Lower CI'].includes(ds.label)) return null
              return {
                text: ds.label,
                strokeStyle: ds.borderColor,
                fillStyle: ds.borderColor,
                lineDash: ds.borderDash || [],
                lineWidth: ds.borderWidth || 2,
                pointStyle: 'circle',
                datasetIndex: i,
                hidden: !chart.isDatasetVisible(i),
              }
            })
            .filter(Boolean)
        },
      },
    },
    tooltip: {
      enabled: true,
      usePointStyle: true,
      filter: (item: any) => !['Upper CI', 'Lower CI'].includes(item.dataset.label),
      callbacks: {
        title: (items: any[]) => items[0]?.label ?? '',
        label: (ctx: any) => {
          const val = ctx.parsed.y
          if (val == null) return ''
          return ` ${ctx.dataset.label}: ${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}`
        },
        labelTextColor: (ctx: any) => ctx.dataset.borderColor || '#000',
      },
    },
    filler: {},
  },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 14 }, color: C.textMuted, maxTicksLimit: 8 } },
    y: {
      grid: { color: C.border }, border: { display: false },
      ticks: { font: { size: 14 }, color: C.textMuted, callback: (v: any) => yFmt.value(v) },
    },
  },
}))

// Pareto
const paretoYear = computed(() => new Date(filters.paretoDateFrom).getFullYear().toString())
const paretoData = computed(() => invoiceDistribution[paretoYear.value] ?? invoiceDistribution['2026'] ?? [])
const paretoTotal = computed(() => paretoData.value.reduce((s: number, d) => s + d.count, 0))

const paretoChartData = computed(() => ({
  labels: paretoData.value.map(d => d.range),
  datasets: [
    {
      type: 'bar' as const,
      label: 'Invoice Count',
      data: paretoData.value.map(d => d.count),
      backgroundColor: paretoData.value.map((_, i) => COLORS[i % COLORS.length]),
      borderRadius: 4,
      yAxisID: 'y',
    },
    {
      type: 'line' as const,
      label: 'Cumulative %',
      data: paretoData.value.map(d => d.cumPct),
      borderColor: C.orange,
      borderWidth: 2,
      pointRadius: 3,
      pointBackgroundColor: C.orange,
      fill: false,
      yAxisID: 'y1',
    },
  ],
}))

const paretoChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: { legend: { display: true, position: 'bottom' as const, labels: { padding: 20, usePointStyle: true } } },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 13 }, color: C.textMuted, maxTicksLimit: 8 } },
    y: { grid: { color: C.border }, border: { display: false }, ticks: { stepSize: 50, font: { size: 13 }, color: C.textMuted } },
    y1: { position: 'right' as const, grid: { display: false }, border: { display: false }, ticks: { stepSize: 25, font: { size: 13 }, color: C.orange, callback: (v: any) => `${v}%` } },
  },
}))

// Payment method
const payYear = computed(() => new Date(filters.payBrkDateFrom).getFullYear().toString())
const payMethods = computed(() => paymentData[payYear.value] ?? paymentData['2026'] ?? [])
const payTotal = computed(() => payMethods.value.reduce((s: number, p) => s + p.revenue, 0))
const payColors = ['#4285F4', '#E67700', '#34A853']

// Product revenue
const prodRevYear = computed(() => new Date(filters.prodRevDateFrom).getFullYear().toString())
const prodRevItems = computed(() => prodRevData[prodRevYear.value] ?? prodRevData['2026'] ?? [])
const prodRevTotal = computed(() => prodRevItems.value.reduce((s: number, p) => s + p.revenue, 0))
const prodColors = ['#4285F4', '#E67700', '#34A853', '#7C3AED', '#0891B2', '#DB2777']
</script>

<template>
  <!-- Revenue Overview Card -->
  <div class="card" style="margin-bottom: 20px;">
    <p class="section-card__title">Revenue Overview</p>
    <div class="revenue-overview__header">
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div class="revenue-overview__amount-wrap">
          <span>
            <span class="revenue-overview__currency">AED </span>
            <span class="revenue-overview__amount">{{ totalRevenue.toLocaleString() }}</span>
          </span>
          <div :class="['revenue-overview__badge', isPositive ? 'revenue-overview__badge--positive' : 'revenue-overview__badge--negative']">
            <UiTrendUpIcon :color="isPositive ? C.green : C.red" />
            <span class="revenue-overview__badge-text" :style="{ color: isPositive ? C.green : C.red }">{{ Math.abs(growthPct) }}%</span>
          </div>
        </div>
        <div class="revenue-overview__sub-text">
          <UiTrendUpIcon :color="isPositive ? C.green : C.red" />
          <span>
            <span :style="{ color: isPositive ? C.green : C.red }">{{ isPositive ? '+' : '' }}{{ growthPct }}%</span>
            from last year
          </span>
        </div>
      </div>
      <div class="revenue-overview__controls">
        <UiDateRangeInput
          :from="filters.revTrendDateFrom"
          :to="filters.revTrendDateTo"
          @update:from="filters.revTrendDateFrom = $event"
          @update:to="filters.revTrendDateTo = $event"
        />
      </div>
    </div>
    <div style="height: 280px; margin-top: 24px; position: relative;">
      <Line :data="overviewChartData" :options="overviewChartOptions" />
    </div>
  </div>

  <!-- Revenue Trend -->
  <UiSectionCard title="Revenue Trend" explanation="Track monthly performance across Revenue, Invoices, and ATV. Enable Forecast for a 3-month projection with confidence bands.">
    <UiCtrlBar>
      <UiAppDropdown :options="['Revenue', 'Invoices', 'ATV']" v-model="filters.revMetric" />
      <UiAppDropdown :options="['Hide', 'Show']" v-model="filters.showForecast" label="Forecast" />
      <UiAppMultiDropdown :options="['2025', '2024', '2023']" v-model="filters.revYears" label="Compare" :max="3" />
      <UiDateRangeInput
        :from="filters.revTrendDateFrom"
        :to="filters.revTrendDateTo"
        @update:from="filters.revTrendDateFrom = $event"
        @update:to="filters.revTrendDateTo = $event"
      />
    </UiCtrlBar>
    <div style="height: 300px;">
      <Line :data="trendChartData" :options="trendChartOptions" />
    </div>
    <div v-if="filters.showForecast === 'Show'" class="forecast-info">
      <div class="forecast-info__title">How to Read the Forecast</div>
      <div class="forecast-info__body">
        <div class="forecast-info__item"><strong>Dashed cyan line</strong> — the predicted value for each future month.</div>
        <div class="forecast-info__item"><strong>Shaded band</strong> — the confidence interval around the prediction.</div>
        <div class="forecast-info__item"><strong>Solid black line</strong> — actual recorded data for the current year (2026).</div>
        <div><strong>Tip:</strong> Compare the forecast against prior-year lines to judge whether projected growth is realistic.</div>
      </div>
    </div>
  </UiSectionCard>

  <!-- Revenue by Payment Method -->
  <UiSectionCard title="Revenue by Payment Method" explanation="Percentage share and actual revenue per method. Switch years to see how payment preferences shift.">
    <UiCtrlBar>
      <UiDateRangeInput
        :from="filters.payBrkDateFrom"
        :to="filters.payBrkDateTo"
        @update:from="filters.payBrkDateFrom = $event"
        @update:to="filters.payBrkDateTo = $event"
      />
    </UiCtrlBar>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <UiProgressRow
        v-for="(pm, i) in payMethods"
        :key="pm.name"
        :name="pm.name"
        :pct="pm.pct"
        :color="payColors[i] ?? '#000'"
        :amount="`AED ${(pm.revenue / 1000).toFixed(0)}K`"
        sublabel="Revenue"
      />
      <UiProgressRow
        name="Total"
        :pct="100"
        color="#000"
        :amount="`AED ${(payTotal / 1000).toFixed(0)}K`"
        sublabel="Revenue"
        :is-total="true"
      />
    </div>
  </UiSectionCard>

  <!-- Invoice Value Distribution (Pareto) -->
  <UiSectionCard title="Invoice Value Distribution (Pareto)" explanation="Groups invoices into value buckets. The bars show invoice count, the line shows cumulative percentage.">
    <UiCtrlBar>
      <UiDateRangeInput
        :from="filters.paretoDateFrom"
        :to="filters.paretoDateTo"
        @update:from="filters.paretoDateFrom = $event"
        @update:to="filters.paretoDateTo = $event"
      />
    </UiCtrlBar>
    <div style="font-size: 14px; font-weight: 500; margin-bottom: 8px;">
      Total Invoices: <span style="font-weight: 700;">{{ paretoTotal.toLocaleString() }}</span>
    </div>
    <div style="height: 280px;">
      <Chart type="bar" :data="paretoChartData as any" :options="paretoChartOptions as any" />
    </div>
  </UiSectionCard>

  <!-- Revenue by Product Mix -->
  <UiSectionCard title="Revenue by Product Mix" explanation="Revenue distribution across product categories with actual AED amounts.">
    <UiCtrlBar>
      <UiDateRangeInput
        :from="filters.prodRevDateFrom"
        :to="filters.prodRevDateTo"
        @update:from="filters.prodRevDateFrom = $event"
        @update:to="filters.prodRevDateTo = $event"
      />
    </UiCtrlBar>
    <div style="display: flex; flex-direction: column; gap: 10px;">
      <UiProgressRow
        v-for="(p, i) in prodRevItems"
        :key="p.name"
        :name="p.name"
        :pct="p.pct"
        :color="prodColors[i] ?? '#000'"
        :amount="`AED ${p.revenue.toLocaleString()}`"
      />
      <UiProgressRow
        name="Total"
        :pct="100"
        color="#000"
        :amount="`AED ${prodRevTotal.toLocaleString()}`"
        :is-total="true"
      />
    </div>
  </UiSectionCard>
</template>
