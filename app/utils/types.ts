export interface RevenueTrendPoint {
  month: string
  monthly: number
  invoices: number
  atv: number
  y2025: number
  y2025inv: number
  y2025atv: number
  y2024: number
  y2024inv: number
  y2024atv: number
  y2023: number
  y2023inv: number
  y2023atv: number
}

export interface ForecastDataPoint {
  month: string
  isForecasted: boolean
  monthly?: number
  invoices?: number
  atv?: number
  fcMonthly?: number
  fcMonthlyUpper?: number
  fcMonthlyLower?: number
  fcInvoices?: number
  fcInvoicesUpper?: number
  fcInvoicesLower?: number
  fcAtv?: number
  fcAtvUpper?: number
  fcAtvLower?: number
  y2025?: number
  y2025inv?: number
  y2025atv?: number
  y2024?: number
  y2024inv?: number
  y2024atv?: number
  y2023?: number
  y2023inv?: number
  y2023atv?: number
}

export interface PaymentMethod {
  name: string
  pct: number
  revenue: number
}

export interface PaymentTrendPoint {
  month: string
  Stripe: number
  Tabby: number
  Amazon: number
}

export interface HeatmapPoint {
  day?: string
  month?: string
  hour: number
  value: number
}

export interface InvoiceBucket {
  range: string
  count: number
  cumPct: number
}

export interface BranchRecord {
  name: string
  revenue: number
  invoices: number
  atv: number
  growth: number
  cancel: number
  sp: number
  revPerSP: number
}

export interface BranchTrendPoint {
  month: string
  [branchName: string]: string | number
}

export interface SalespersonRecord {
  name: string
  revenue: number
  invoices: number
  atv: number
  customers: number
  retention: number
}

export interface H2hDataPoint {
  month: string
  [key: string]: string | number
}

export interface ProductMixItem {
  name: string
  value: number
}

export interface PricePerGramPoint {
  month: string
  sellingPrice: number
  spotPrice: number
}

export interface ProductByBranch {
  branch: string
  fullName: string
  '24K': number
  '22K': number
  '21K': number
  '18K': number
  '14K': number
  '8K': number
}

export interface WeightTrendPoint {
  month: string
  grams: number
}

export interface CustomerAcqPoint {
  month: string
  newCustomers: number
  cumulative: number
}

export interface TierDataItem {
  name: string
  value: number
  count: number
}

export interface ClvBucket {
  range: string
  count: number
}

export interface RetentionPoint {
  month: string
  all: number
  gold: number
  silver: number
  bronze: number
}

export interface CancelTrendPoint {
  month: string
  rate: string
  value: number
}

export interface CampaignRecord {
  name: string
  lift: number
  newCust: number
  roi: number
  cpa: number
}

export interface YoyDataPoint {
  month: string
  '2025': number
  '2024': number
}

export interface ProductTrendPoint {
  month: string
  '24K': number
  '22K': number
  '21K': number
  '18K': number
  '14K': number
  '8K': number
}

export interface ProductRevItem {
  name: string
  revenue: number
  pct: number
}

export interface RevPerSpRecord extends BranchRecord {
  revPerSP: number
}

export interface CustSplitRecord {
  branch: string
  newPct: number
  retPct: number
}
