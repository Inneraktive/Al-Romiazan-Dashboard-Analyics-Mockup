import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Legend,
  Tooltip,
} from 'chart.js'

export default defineNuxtPlugin(() => {
  Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Filler,
    Legend,
    Tooltip
  )

  Chart.defaults.font.family = "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif"
  Chart.defaults.font.size = 14
  Chart.defaults.color = '#727272'
  Chart.defaults.plugins.legend.display = false
  Chart.defaults.plugins.tooltip.enabled = true
  Chart.defaults.plugins.tooltip.backgroundColor = '#fff'
  Chart.defaults.plugins.tooltip.titleColor = '#000'
  Chart.defaults.plugins.tooltip.bodyColor = '#000'
  Chart.defaults.plugins.tooltip.borderColor = '#e4e4e4'
  Chart.defaults.plugins.tooltip.borderWidth = 1
  Chart.defaults.plugins.tooltip.cornerRadius = 8
  Chart.defaults.plugins.tooltip.padding = 12
  Chart.defaults.plugins.tooltip.boxPadding = 4
  Chart.defaults.plugins.tooltip.titleFont = { weight: '600' } as any
})
