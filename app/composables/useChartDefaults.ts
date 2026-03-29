import type { ChartOptions } from 'chart.js'

export function useChartDefaults() {
  const gridStyle = {
    color: '#e4e4e4',
    drawBorder: false,
    tickLength: 0,
  }

  function baseLineOptions(height = 300): ChartOptions<'line'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index' as const, intersect: false },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { font: { size: 14 }, maxTicksLimit: 8 },
        },
        y: {
          grid: gridStyle,
          border: { display: false },
          ticks: { font: { size: 14 } },
        },
      },
      plugins: {
        legend: { display: false },
      },
    }
  }

  function baseBarOptions(): ChartOptions<'bar'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index' as const, intersect: false },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { font: { size: 14 }, maxTicksLimit: 8 },
        },
        y: {
          grid: gridStyle,
          border: { display: false },
          ticks: { font: { size: 14 } },
        },
      },
      plugins: {
        legend: { display: false },
      },
    }
  }

  function baseDoughnutOptions(): ChartOptions<'doughnut'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '58%',
      plugins: {
        legend: { display: false },
      },
    }
  }

  return { baseLineOptions, baseBarOptions, baseDoughnutOptions, gridStyle }
}
