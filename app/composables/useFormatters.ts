export function useFormatters() {
  function formatAed(value: number): string {
    return `AED ${value.toLocaleString()}`
  }

  function formatK(value: number): string {
    if (value === 0) return '0'
    if (Math.abs(value) >= 1000) return `${Math.round(value / 1000)}K`
    return String(value)
  }

  function formatK1(value: number): string {
    if (value === 0) return '0'
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}K`
    return String(value)
  }

  function formatPct(value: number): string {
    return `${value}%`
  }

  function formatNumber(value: number): string {
    return value.toLocaleString()
  }

  return { formatAed, formatK, formatK1, formatPct, formatNumber }
}
