import { srand } from './seedRandom'
import { months, days } from './constants'
import type {
  RevenueTrendPoint, PaymentMethod, PaymentTrendPoint,
  HeatmapPoint, InvoiceBucket, BranchRecord, BranchTrendPoint,
  SalespersonRecord, H2hDataPoint, ProductMixItem, PricePerGramPoint,
  ProductByBranch, WeightTrendPoint, CustomerAcqPoint, TierDataItem,
  ClvBucket, RetentionPoint, CancelTrendPoint, CampaignRecord,
  YoyDataPoint, ProductTrendPoint, ProductRevItem, CustSplitRecord,
} from './types'

// Revenue Trend (12 months)
export const revenueTrend: RevenueTrendPoint[] = months.map((m, i) => ({
  month: m,
  monthly: 180000 + Math.sin(i * 0.8) * 40000 + srand() * 20000,
  invoices: 140 + Math.sin(i * 0.8) * 30 + Math.floor(srand() * 20),
  atv: 1200 + Math.sin(i * 0.6) * 200 + Math.floor(srand() * 100),
  y2025: 150000 + Math.sin(i * 0.6) * 30000 + srand() * 15000,
  y2025inv: 125 + Math.sin(i * 0.6) * 25 + Math.floor(srand() * 18),
  y2025atv: 1150 + Math.sin(i * 0.5) * 180 + Math.floor(srand() * 90),
  y2024: 125000 + Math.sin(i * 0.7) * 25000 + srand() * 12000,
  y2024inv: 110 + Math.sin(i * 0.7) * 22 + Math.floor(srand() * 15),
  y2024atv: 1080 + Math.sin(i * 0.4) * 160 + Math.floor(srand() * 80),
  y2023: 105000 + Math.sin(i * 0.5) * 20000 + srand() * 10000,
  y2023inv: 95 + Math.sin(i * 0.5) * 18 + Math.floor(srand() * 12),
  y2023atv: 1020 + Math.sin(i * 0.3) * 140 + Math.floor(srand() * 70),
}))

// Payment Data
export const paymentData: Record<string, PaymentMethod[]> = {
  '2026': [
    { name: 'Stripe', pct: 48, revenue: 1071360 },
    { name: 'Tabby', pct: 32, revenue: 714240 },
    { name: 'Amazon', pct: 20, revenue: 446400 },
  ],
  '2025': [
    { name: 'Stripe', pct: 52, revenue: 918560 },
    { name: 'Tabby', pct: 28, revenue: 494800 },
    { name: 'Amazon', pct: 20, revenue: 353200 },
  ],
  '2024': [
    { name: 'Stripe', pct: 58, revenue: 783000 },
    { name: 'Tabby', pct: 24, revenue: 324000 },
    { name: 'Amazon', pct: 18, revenue: 243000 },
  ],
}

// Payment Trend (percentage)
function generatePaymentTrendPct(): PaymentTrendPoint[] {
  return months.map((m, idx) => {
    const stripe = 60000 + srand() * 25000 - idx * 800
    const tabby = 40000 + srand() * 20000 + idx * 1500
    const amazon = 25000 + srand() * 15000
    const total = stripe + tabby + amazon
    return {
      month: m,
      Stripe: Math.round(stripe / total * 100),
      Tabby: Math.round(tabby / total * 100),
      Amazon: Math.round(amazon / total * 100),
    }
  })
}
export const paymentTrendPct = generatePaymentTrendPct()
export const paymentTrendPct2025 = (() => {
  return months.map((m, idx) => {
    const stripe = 65000 + srand() * 22000 - idx * 500
    const tabby = 40000 + srand() * 18000 + idx * 1200
    const amazon = 23000 + srand() * 13000
    const total = stripe + tabby + amazon
    return { month: m, Stripe: Math.round(stripe / total * 100), Tabby: Math.round(tabby / total * 100), Amazon: Math.round(amazon / total * 100) }
  })
})()
export const paymentTrendPct2024 = (() => {
  return months.map((m, idx) => {
    const stripe = 72000 + srand() * 20000 - idx * 300
    const tabby = 35000 + srand() * 16000 + idx * 900
    const amazon = 20000 + srand() * 11000
    const total = stripe + tabby + amazon
    return { month: m, Stripe: Math.round(stripe / total * 100), Tabby: Math.round(tabby / total * 100), Amazon: Math.round(amazon / total * 100) }
  })
})()

// Payment Trend (absolute)
export const paymentTrendAbs: PaymentTrendPoint[] = months.map((m, idx) => ({
  month: m,
  Stripe: Math.floor(60000 + srand() * 25000 - idx * 800),
  Tabby: Math.floor(40000 + srand() * 20000 + idx * 1500),
  Amazon: Math.floor(25000 + srand() * 15000),
}))
export const paymentTrendAbs2025: PaymentTrendPoint[] = months.map((m, idx) => ({
  month: m,
  Stripe: Math.floor(55000 + srand() * 22000 - idx * 500),
  Tabby: Math.floor(40000 + srand() * 18000 + idx * 1200),
  Amazon: Math.floor(23000 + srand() * 13000),
}))
export const paymentTrendAbs2024: PaymentTrendPoint[] = months.map((m, idx) => ({
  month: m,
  Stripe: Math.floor(50000 + srand() * 20000 - idx * 300),
  Tabby: Math.floor(35000 + srand() * 16000 + idx * 900),
  Amazon: Math.floor(20000 + srand() * 11000),
}))

// Heatmap Data
export const heatmapData: HeatmapPoint[] = (() => {
  const data: HeatmapPoint[] = []
  for (let d = 0; d < 7; d++)
    for (let h = 9; h <= 22; h++)
      data.push({ day: days[d], hour: h, value: Math.floor(srand() * 100 + (h > 16 && h < 21 ? 80 : 10) + (d >= 4 ? 40 : 0)) })
  return data
})()

export const heatmapMonthData: HeatmapPoint[] = (() => {
  const data: HeatmapPoint[] = []
  for (let m = 0; m < 12; m++)
    for (let h = 9; h <= 22; h++)
      data.push({ month: months[m], hour: h, value: Math.floor(srand() * 100 + (h > 16 && h < 21 ? 80 : 10) + (m >= 9 || m <= 1 ? 50 : 0)) })
  return data
})()

// Invoice Distribution
export const invoiceDistribution: Record<string, InvoiceBucket[]> = {
  '2026': [
    { range: '0-500', count: 45, cumPct: 5 }, { range: '500-1K', count: 120, cumPct: 18 },
    { range: '1K-2K', count: 210, cumPct: 40 }, { range: '2K-5K', count: 310, cumPct: 72 },
    { range: '5K-10K', count: 140, cumPct: 87 }, { range: '10K-25K', count: 80, cumPct: 95 },
    { range: '25K-50K', count: 30, cumPct: 99 }, { range: '50K+', count: 10, cumPct: 100 },
  ],
  '2025': [
    { range: '0-500', count: 55, cumPct: 6 }, { range: '500-1K', count: 135, cumPct: 20 },
    { range: '1K-2K', count: 195, cumPct: 40 }, { range: '2K-5K', count: 285, cumPct: 70 },
    { range: '5K-10K', count: 150, cumPct: 86 }, { range: '10K-25K', count: 85, cumPct: 95 },
    { range: '25K-50K', count: 35, cumPct: 99 }, { range: '50K+', count: 8, cumPct: 100 },
  ],
  '2024': [
    { range: '0-500', count: 60, cumPct: 7 }, { range: '500-1K', count: 145, cumPct: 22 },
    { range: '1K-2K', count: 180, cumPct: 41 }, { range: '2K-5K', count: 260, cumPct: 68 },
    { range: '5K-10K', count: 155, cumPct: 85 }, { range: '10K-25K', count: 90, cumPct: 95 },
    { range: '25K-50K', count: 32, cumPct: 98 }, { range: '50K+', count: 12, cumPct: 100 },
  ],
}

// Branch Data
export const branchData: Record<string, BranchRecord[]> = {
  '2026': [
    { name: 'Mall of Emirates', revenue: 520000, invoices: 340, atv: 1529, growth: 12.4, cancel: 2.1, sp: 4, revPerSP: 130000 },
    { name: 'Dubai Mall', revenue: 480000, invoices: 290, atv: 1655, growth: 8.2, cancel: 1.8, sp: 4, revPerSP: 120000 },
    { name: 'Gold Souk', revenue: 410000, invoices: 420, atv: 976, growth: -3.1, cancel: 4.2, sp: 6, revPerSP: 68333 },
    { name: 'Abu Dhabi Mall', revenue: 350000, invoices: 230, atv: 1522, growth: 15.7, cancel: 1.5, sp: 3, revPerSP: 116667 },
    { name: 'Sharjah City', revenue: 280000, invoices: 310, atv: 903, growth: 5.3, cancel: 3.0, sp: 4, revPerSP: 70000 },
    { name: 'Ajman Branch', revenue: 190000, invoices: 180, atv: 1056, growth: -1.2, cancel: 5.1, sp: 2, revPerSP: 95000 },
  ],
  '2025': [
    { name: 'Mall of Emirates', revenue: 465000, invoices: 310, atv: 1500, growth: 9.1, cancel: 2.5, sp: 4, revPerSP: 116250 },
    { name: 'Dubai Mall', revenue: 440000, invoices: 270, atv: 1630, growth: 6.5, cancel: 2.0, sp: 4, revPerSP: 110000 },
    { name: 'Gold Souk', revenue: 425000, invoices: 450, atv: 944, growth: 1.2, cancel: 3.8, sp: 6, revPerSP: 70833 },
    { name: 'Abu Dhabi Mall', revenue: 305000, invoices: 210, atv: 1452, growth: 11.3, cancel: 1.8, sp: 3, revPerSP: 101667 },
    { name: 'Sharjah City', revenue: 265000, invoices: 290, atv: 914, growth: 4.0, cancel: 3.4, sp: 4, revPerSP: 66250 },
    { name: 'Ajman Branch', revenue: 195000, invoices: 190, atv: 1026, growth: 2.1, cancel: 4.6, sp: 2, revPerSP: 97500 },
  ],
  '2024': [
    { name: 'Mall of Emirates', revenue: 420000, invoices: 285, atv: 1474, growth: 7.8, cancel: 2.9, sp: 3, revPerSP: 140000 },
    { name: 'Dubai Mall', revenue: 410000, invoices: 260, atv: 1577, growth: 5.2, cancel: 2.3, sp: 4, revPerSP: 102500 },
    { name: 'Gold Souk', revenue: 418000, invoices: 470, atv: 889, growth: -0.5, cancel: 4.5, sp: 5, revPerSP: 83600 },
    { name: 'Abu Dhabi Mall', revenue: 270000, invoices: 195, atv: 1385, growth: 8.6, cancel: 2.2, sp: 3, revPerSP: 90000 },
    { name: 'Sharjah City', revenue: 252000, invoices: 280, atv: 900, growth: 3.1, cancel: 3.8, sp: 3, revPerSP: 84000 },
    { name: 'Ajman Branch', revenue: 188000, invoices: 185, atv: 1016, growth: 0.8, cancel: 5.3, sp: 2, revPerSP: 94000 },
  ],
}

// Branch Trend by Metric
export const branchTrendByMetric: Record<string, Record<string, BranchTrendPoint[]>> = {
  Revenue: {
    '2026': months.map(m => ({ month: m, 'Mall of Emirates': 40000 + srand() * 15000, 'Dubai Mall': 35000 + srand() * 15000, 'Gold Souk': 30000 + srand() * 12000, 'Abu Dhabi Mall': 25000 + srand() * 12000, 'Sharjah City': 22000 + srand() * 10000, 'Ajman Branch': 15000 + srand() * 8000 })),
    '2025': months.map(m => ({ month: m, 'Mall of Emirates': 36000 + srand() * 13000, 'Dubai Mall': 33000 + srand() * 13000, 'Gold Souk': 29000 + srand() * 11000, 'Abu Dhabi Mall': 22000 + srand() * 10000, 'Sharjah City': 20000 + srand() * 9000, 'Ajman Branch': 14000 + srand() * 7000 })),
    '2024': months.map(m => ({ month: m, 'Mall of Emirates': 32000 + srand() * 11000, 'Dubai Mall': 30000 + srand() * 11000, 'Gold Souk': 27000 + srand() * 10000, 'Abu Dhabi Mall': 19000 + srand() * 9000, 'Sharjah City': 18000 + srand() * 8000, 'Ajman Branch': 12000 + srand() * 6000 })),
  },
  Invoices: {
    '2026': months.map(m => ({ month: m, 'Mall of Emirates': Math.floor(25 + srand() * 15), 'Dubai Mall': Math.floor(20 + srand() * 14), 'Gold Souk': Math.floor(30 + srand() * 18), 'Abu Dhabi Mall': Math.floor(16 + srand() * 10), 'Sharjah City': Math.floor(22 + srand() * 12), 'Ajman Branch': Math.floor(12 + srand() * 8) })),
    '2025': months.map(m => ({ month: m, 'Mall of Emirates': Math.floor(22 + srand() * 13), 'Dubai Mall': Math.floor(18 + srand() * 12), 'Gold Souk': Math.floor(32 + srand() * 16), 'Abu Dhabi Mall': Math.floor(14 + srand() * 9), 'Sharjah City': Math.floor(20 + srand() * 10), 'Ajman Branch': Math.floor(13 + srand() * 7) })),
    '2024': months.map(m => ({ month: m, 'Mall of Emirates': Math.floor(20 + srand() * 11), 'Dubai Mall': Math.floor(17 + srand() * 10), 'Gold Souk': Math.floor(34 + srand() * 15), 'Abu Dhabi Mall': Math.floor(13 + srand() * 8), 'Sharjah City': Math.floor(19 + srand() * 9), 'Ajman Branch': Math.floor(12 + srand() * 6) })),
  },
  ATV: {
    '2026': months.map(m => ({ month: m, 'Mall of Emirates': Math.floor(1400 + srand() * 300), 'Dubai Mall': Math.floor(1500 + srand() * 350), 'Gold Souk': Math.floor(850 + srand() * 250), 'Abu Dhabi Mall': Math.floor(1350 + srand() * 300), 'Sharjah City': Math.floor(800 + srand() * 200), 'Ajman Branch': Math.floor(950 + srand() * 200) })),
    '2025': months.map(m => ({ month: m, 'Mall of Emirates': Math.floor(1350 + srand() * 280), 'Dubai Mall': Math.floor(1450 + srand() * 320), 'Gold Souk': Math.floor(820 + srand() * 230), 'Abu Dhabi Mall': Math.floor(1300 + srand() * 280), 'Sharjah City': Math.floor(780 + srand() * 190), 'Ajman Branch': Math.floor(920 + srand() * 180) })),
    '2024': months.map(m => ({ month: m, 'Mall of Emirates': Math.floor(1300 + srand() * 250), 'Dubai Mall': Math.floor(1400 + srand() * 300), 'Gold Souk': Math.floor(780 + srand() * 210), 'Abu Dhabi Mall': Math.floor(1250 + srand() * 250), 'Sharjah City': Math.floor(750 + srand() * 180), 'Ajman Branch': Math.floor(900 + srand() * 170) })),
  },
}

// Salesperson Data
export const spData: SalespersonRecord[] = [
  { name: 'Ahmed K.', revenue: 185000, invoices: 120, atv: 1542, customers: 89, retention: 42 },
  { name: 'Fatima R.', revenue: 172000, invoices: 105, atv: 1638, customers: 78, retention: 51 },
  { name: 'Omar S.', revenue: 158000, invoices: 140, atv: 1129, customers: 110, retention: 38 },
  { name: 'Sara M.', revenue: 143000, invoices: 98, atv: 1459, customers: 72, retention: 45 },
  { name: 'Khalid A.', revenue: 128000, invoices: 115, atv: 1113, customers: 95, retention: 33 },
]

// Product Mix
export const productMix: ProductMixItem[] = [
  { name: '24K', value: 32 }, { name: '22K', value: 25 }, { name: '21K', value: 18 },
  { name: '18K', value: 12 }, { name: '14K', value: 8 }, { name: '8K', value: 5 },
]

// Price Per Gram
export const pricePerGram: PricePerGramPoint[] = months.map((m, i) => ({
  month: m,
  sellingPrice: 245 + Math.sin(i * 0.5) * 20 + srand() * 10,
  spotPrice: 210 + Math.sin(i * 0.5) * 15 + srand() * 8,
}))

// Product by Branch
export const productByBranch: ProductByBranch[] = branchData['2026']!.slice(0, 4).map(b => ({
  branch: b.name.split(' ')[0]!,
  fullName: b.name,
  '24K': Math.floor(srand() * 30 + 25),
  '22K': Math.floor(srand() * 25 + 18),
  '21K': Math.floor(srand() * 18 + 10),
  '18K': Math.floor(srand() * 12 + 5),
  '14K': Math.floor(srand() * 8 + 3),
  '8K': Math.floor(srand() * 5 + 2),
}))

// Weight Trend
export const weightTrend: WeightTrendPoint[] = months.map(m => ({
  month: m,
  grams: Math.floor(800 + srand() * 400),
}))

// Customer Acquisition
export const customerAcq: CustomerAcqPoint[] = months.map((m, i) => ({
  month: m,
  newCustomers: Math.floor(40 + srand() * 30),
  cumulative: 200 + i * 45,
}))

// Tier Data
export const tierData: TierDataItem[] = [
  { name: 'Bronze', value: 45, count: 2250 },
  { name: 'Silver', value: 30, count: 1500 },
  { name: 'Gold', value: 18, count: 900 },
  { name: 'Platinum', value: 7, count: 350 },
]

// CLV Distribution
export const clvDistribution: ClvBucket[] = [
  { range: '0-5K', count: 1200 }, { range: '5K-15K', count: 800 },
  { range: '15K-30K', count: 450 }, { range: '30K-60K', count: 200 },
  { range: '60K-100K', count: 80 }, { range: '100K+', count: 30 },
]

// Retention Curve
export const retentionCurve: RetentionPoint[] = [
  { month: 'M0', all: 100, gold: 100, silver: 100, bronze: 100 },
  { month: 'M3', all: 62, gold: 78, silver: 65, bronze: 48 },
  { month: 'M6', all: 45, gold: 68, silver: 48, bronze: 28 },
  { month: 'M9', all: 35, gold: 60, silver: 38, bronze: 18 },
  { month: 'M12', all: 28, gold: 52, silver: 30, bronze: 12 },
]

// Cancel Trend
export const cancelTrend: CancelTrendPoint[] = months.map(m => ({
  month: m,
  rate: (srand() * 4 + 1).toFixed(1),
  value: Math.floor(srand() * 30000 + 5000),
}))

// Campaign Data
export const campaignData: CampaignRecord[] = [
  { name: 'Diwali Sale', lift: 28, newCust: 85, roi: 340, cpa: 120 },
  { name: 'Eid Collection', lift: 22, newCust: 62, roi: 280, cpa: 145 },
  { name: 'Summer Promo', lift: 15, newCust: 44, roi: 190, cpa: 180 },
  { name: 'New Year', lift: 18, newCust: 55, roi: 220, cpa: 160 },
]

// YoY Data
export const yoyData: YoyDataPoint[] = months.map(m => ({
  month: m,
  '2025': Math.floor(160000 + srand() * 60000),
  '2024': Math.floor(140000 + srand() * 50000),
}))

// Product Trend
export const productTrend: ProductTrendPoint[] = months.map(m => ({
  month: m,
  '24K': 30 + srand() * 8,
  '22K': 23 + srand() * 6,
  '21K': 16 + srand() * 5,
  '18K': 12 + srand() * 4,
  '14K': 8 + srand() * 3,
  '8K': 4 + srand() * 3,
}))

// Revenue Per Salesperson (branch)
export const revPerSpData = branchData['2026']!.map(b => {
  const sp = Math.floor(srand() * 5 + 2)
  return { ...b, sp, revPerSP: Math.floor(b.revenue / sp) }
}).sort((a, b) => b.revPerSP - a.revPerSP)

// Customer Split
export const custSplitData: CustSplitRecord[] = branchData['2026']!.map(b => {
  const n = Math.floor(srand() * 45 + 15)
  return { branch: b.name, newPct: n, retPct: 100 - n }
})

// Product Mix by Branch (per year)
export const prodMixData: Record<string, ProductByBranch[]> = ['2026', '2025', '2024'].reduce((acc, year) => {
  acc[year] = branchData[year]!.map(b => {
    const v1 = Math.floor(srand() * 18 + 24)
    const v2 = Math.floor(srand() * 15 + 18)
    const v3 = Math.floor(srand() * 12 + 12)
    const v4 = Math.floor(srand() * 10 + 8)
    const v5 = Math.floor(srand() * 8 + 4)
    const v6 = Math.floor(srand() * 5 + 2)
    const total = v1 + v2 + v3 + v4 + v5 + v6
    const p1 = Math.round((v1 / total) * 100)
    const p2 = Math.round((v2 / total) * 100)
    const p3 = Math.round((v3 / total) * 100)
    const p4 = Math.round((v4 / total) * 100)
    const p5 = Math.round((v5 / total) * 100)
    const p6 = 100 - (p1 + p2 + p3 + p4 + p5)
    return {
      branch: b.name.length > 14 ? b.name.slice(0, 12) + '…' : b.name,
      fullName: b.name,
      '24K': p1, '22K': p2, '21K': p3, '18K': p4, '14K': p5, '8K': p6,
    }
  })
  return acc
}, {} as Record<string, ProductByBranch[]>)

// Head-to-Head comparison data
export const computedH2hData: H2hDataPoint[] = months.map((m, i) => {
  const row: H2hDataPoint = { month: m }
  spData.forEach((sp, idx) => {
    const revBase = sp.revenue / 12
    const invBase = sp.invoices / 12
    const atvBase = sp.atv
    row[`${sp.name}_Revenue`] = Math.floor(revBase + Math.sin(i * 0.7 + idx) * 0.2 * revBase + srand() * 0.1 * revBase)
    row[`${sp.name}_Invoices`] = Math.floor(invBase + Math.sin(i * 0.8 + idx) * 0.15 * invBase + srand() * 0.1 * invBase)
    row[`${sp.name}_ATV`] = Math.floor(atvBase + Math.sin(i * 0.5 + idx) * 0.05 * atvBase + srand() * 0.05 * atvBase)
  })
  return row
})

// Product Revenue Data
export const prodRevData: Record<string, ProductRevItem[]> = {
  '2026': [
    { name: '24K', revenue: 714880, pct: 32 }, { name: '22K', revenue: 558500, pct: 25 },
    { name: '21K', revenue: 402480, pct: 18 }, { name: '18K', revenue: 268080, pct: 12 },
    { name: '14K', revenue: 178720, pct: 8 }, { name: '8K', revenue: 111700, pct: 5 },
  ],
  '2025': [
    { name: '24K', revenue: 602280, pct: 34 }, { name: '22K', revenue: 443520, pct: 25 },
    { name: '21K', revenue: 319680, pct: 18 }, { name: '18K', revenue: 195360, pct: 11 },
    { name: '14K', revenue: 124320, pct: 7 }, { name: '8K', revenue: 88440, pct: 5 },
  ],
  '2024': [
    { name: '24K', revenue: 486000, pct: 36 }, { name: '22K', revenue: 337500, pct: 25 },
    { name: '21K', revenue: 229500, pct: 17 }, { name: '18K', revenue: 148500, pct: 11 },
    { name: '14K', revenue: 94500, pct: 7 }, { name: '8K', revenue: 54000, pct: 4 },
  ],
}
