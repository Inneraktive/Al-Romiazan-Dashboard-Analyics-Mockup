import { revenueTrend } from './mockData'
import type { ForecastDataPoint } from './types'

const forecastMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan+1', 'Feb+1', 'Mar+1']

interface ForecastResult {
  hist: number[]
  forecast: number[]
  stdDev: number
  lastSmoothed: number
  trend: number
}

export function buildForecast(histKey: keyof typeof revenueTrend[0], seasonalPeriod = 12): ForecastResult {
  const hist = revenueTrend.map(d => d[histKey] as number)
  const alpha = 0.3
  let level = hist[0]!
  let trend = hist[1]! - hist[0]!
  const smoothed = [level]

  for (let i = 1; i < hist.length; i++) {
    const prev = level
    level = alpha * hist[i]! + (1 - alpha) * (level + trend)
    trend = 0.3 * (level - prev) + 0.7 * trend
    smoothed.push(level)
  }

  const forecast: number[] = []
  for (let i = 0; i < 3; i++) {
    const seasonal = hist[hist.length - seasonalPeriod + hist.length % seasonalPeriod + i] || 0
    const base = level + trend * (i + 1)
    const seasonalAdj = seasonal ? (seasonal / (hist.reduce((a, b) => a + b, 0) / hist.length) - 1) * base * 0.15 : 0
    forecast.push(base + seasonalAdj)
  }

  const stdDev = Math.sqrt(
    hist.reduce((sum, v, i) => sum + Math.pow(v! - smoothed[Math.min(i, smoothed.length - 1)]!, 2), 0) / hist.length
  )

  return { hist, forecast, stdDev, lastSmoothed: level, trend }
}

export const revForecastData: ForecastDataPoint[] = (() => {
  const fc = buildForecast('monthly')
  const fcInv = buildForecast('invoices')
  const fcAtv = buildForecast('atv')

  return forecastMonths.map((m, i) => {
    const isHist = i < 12
    const fIdx = i - 12
    const base: ForecastDataPoint = { month: m, isForecasted: !isHist }

    if (isHist) {
      const row = revenueTrend[i]!
      base.monthly = row.monthly
      base.invoices = row.invoices
      base.atv = row.atv
      if (i === 11) {
        base.fcMonthly = row.monthly
        base.fcInvoices = row.invoices
        base.fcAtv = row.atv
        base.fcMonthlyUpper = row.monthly
        base.fcMonthlyLower = row.monthly
        base.fcInvoicesUpper = row.invoices
        base.fcInvoicesLower = row.invoices
        base.fcAtvUpper = row.atv
        base.fcAtvLower = row.atv
      }
    } else {
      const widening = (fIdx + 1) * 1.4
      base.fcMonthly = Math.round(fc.forecast[fIdx]!)
      base.fcMonthlyUpper = Math.round(fc.forecast[fIdx]! + fc.stdDev * widening)
      base.fcMonthlyLower = Math.round(fc.forecast[fIdx]! - fc.stdDev * widening)
      base.fcInvoices = Math.round(fcInv.forecast[fIdx]!)
      base.fcInvoicesUpper = Math.round(fcInv.forecast[fIdx]! + fcInv.stdDev * widening)
      base.fcInvoicesLower = Math.round(fcInv.forecast[fIdx]! - fcInv.stdDev * widening)
      base.fcAtv = Math.round(fcAtv.forecast[fIdx]!)
      base.fcAtvUpper = Math.round(fcAtv.forecast[fIdx]! + fcAtv.stdDev * widening)
      base.fcAtvLower = Math.round(fcAtv.forecast[fIdx]! - fcAtv.stdDev * widening)
    }

    if (isHist) {
      const row = revenueTrend[i]!
      base.y2025 = row.y2025
      base.y2025inv = row.y2025inv
      base.y2025atv = row.y2025atv
      base.y2024 = row.y2024
      base.y2024inv = row.y2024inv
      base.y2024atv = row.y2024atv
      base.y2023 = row.y2023
      base.y2023inv = row.y2023inv
      base.y2023atv = row.y2023atv
    }

    return base
  })
})()
