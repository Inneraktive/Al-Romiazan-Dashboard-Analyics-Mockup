# Al Romaizan Analytics Project Brief

## Project Context

This analytics module will be integrated into an existing **Al Romaizan Management Dashboard** - a loyalty and sales management platform for a jewelry retail business. The analytics will consume data from the same REST API that powers the main dashboard.

The analytics project should be built as a **standalone Vue 3 / Nuxt application** that will later be integrated (embedded or merged) into the parent dashboard.

---

## Parent Dashboard Tech Stack

Match these technologies for seamless integration:

- **Framework:** Nuxt 4.3.0 / Vue 3.5.27
- **Language:** TypeScript 5.9.3
- **Charts:** Chart.js 4.5.1 + vue-chartjs 5.3.3
- **Styling:** SCSS (custom design system, no CSS framework)
- **State:** Pinia 3.0.4
- **Date Handling:** dayjs
- **Icons:** Iconify (remixicon set)
- **Date Picker:** @vuepic/vue-datepicker
- **HTTP Client:** ofetch (Nuxt built-in)
- **Auth:** Bearer token in `Authorization` header
- **Currency:** AED (UAE Dirhams)

---

## API Base URL & Authentication

All requests must include:

```
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json
X-Language: en-US
```

The API base URL is provided via environment variable `API_URL`.

---

## Available API Endpoints & Data Models

### 1. Dashboard Endpoints

#### `GET /dashboard` - All dashboard data at once
**Response:** `DashboardAllResponse`
```ts
interface DashboardAllResponse {
  kpis: KpiItem[]
  topBranchesByValue: TopListItem[]
  topBranchesByVolume: TopListItem[]
  topPerformers: TopListItem[]
  recentInvoices: RecentInvoice[]
}

interface KpiItem {
  label: string
  value: string
  changeText: string
  icon: string
  currency?: string
}

interface TopListItem {
  id: string | number
  name: string
  value: string
  valueRaw: number
  code?: string
}
```

#### `GET /dashboard/overview` - KPI overview
**Response:** `KpiItem[]`

#### `GET /dashboard/sales-revenue` - Sales revenue chart data
**Query params:**
```ts
interface SalesRevenueParams {
  start_date?: string  // ISO date
  end_date?: string    // ISO date
}
```
**Response:**
```ts
interface SalesRevenueResponse {
  summary: {
    total: string
    totalRaw: number
    currency: string
    change: string
    changeRaw: number
    changeClass: string
    comparisonText: string
  }
  chart: {
    labels: string[]
    data: number[]
  }
  filters: {
    startDate: string
    endDate: string
    groupBy: 'day' | 'month' | 'year'
  }
}
```

#### `GET /dashboard/top-branches/value` - Top branches by sales value
#### `GET /dashboard/top-branches/volume` - Top branches by invoice count
#### `GET /dashboard/top-performers` - Top salespersons
All accept: `{ limit?: number }` | Return: `TopListItem[]`

---

### 2. KPI Endpoints

| Endpoint | Description |
|---|---|
| `GET /kpi/users` | User-related KPIs |
| `GET /kpi/customers` | Customer-related KPIs |
| `GET /kpi/branches` | Branch-related KPIs |
| `GET /kpi/invoices` | Invoice-related KPIs |

All return `KpiItem[]`.

---

### 3. Branch Endpoints

#### `GET /branches` - List all branches (paginated)
**Query:** `{ page?, per_page?, search?, ...BranchFilters }`
```ts
interface BranchFilters {
  performance?: string
  sales_min?: number
  sales_max?: number
  invoice_count_min?: number
  invoice_count_max?: number
  city?: string
  status?: string
}
```

#### `GET /branches/:id` - Branch details
```ts
interface BranchDetail {
  id: string
  name: string
  code: string
  address: string
  phone: string | null
  whatsapp: string | null
  latitude: string | null
  longitude: string | null
  is_active: boolean
  created_at: string | null
  invoice_count: number
  total_sales: number
}
```

#### `GET /branches/:id/revenue` - Branch revenue chart
**Query:** `{ start_date?, end_date? }` | Returns: `SalesRevenueResponse`

#### `GET /branches/:id/product-sales` - Product breakdown
```ts
interface ProductSalesItem {
  name: string
  amount: number
  units: number
  percentage: number
}
```

#### `GET /branches/:id/top-salespersons` - Top performers at branch
```ts
interface BranchSalesperson {
  rank: number
  salesman_code: string
  total_sales: number
  invoice_count: number
}
```

#### `GET /branches/:id/monthly-performance` - Monthly performance
```ts
interface MonthlyPerformanceItem {
  label: string        // e.g. "Jan 2024"
  revenue: number
  invoice_count: number
  growth?: number | null  // percentage vs previous period
}
```

#### `GET /branches/:id/kpis` - Branch-specific KPIs
Returns: `KpiItem[]`

#### `GET /branches/:id/customers` - Customers at branch (paginated)

---

### 4. Invoice Endpoints

#### `GET /invoices` - List invoices (paginated, filterable)
**Query:** `{ page?, per_page?, search?, ...InvoiceFilters }`
```ts
interface InvoiceFilters {
  date_from?: string
  date_to?: string
  status?: string
  amount_min?: number
  amount_max?: number
  branch_id?: string | number
  source?: string
}
```

#### `GET /invoices/:id` - Invoice details
```ts
interface Invoice {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string
  salesperson_code: string | null
  created_at: string
  total_amount: string
  status: string
  source: string
  customer: Customer
  branch: Branch
}

interface InvoiceDetails extends Invoice {
  items: InvoiceItem[]
  prices: InvoicePrice[]
  transactions: InvoiceTransaction[]
}

interface InvoiceItem {
  item_code: string
  item_description: string
  gross_weight: string
  vat_amount: string
  vat_rate: string
  amount: string
  quantity?: number
  unit_price?: string
}

interface InvoicePrice {
  paid_in: string   // payment method
  amount: string
}

interface InvoiceTransaction {
  id: string
  title: string
  description: string
  transaction_type: string  // "earn", "redeem", "bonus", etc.
  points: string
  points_remaining: string
  monetary_value: string | null
  invoice_no: string | null
  branch_id: string | null
  branch_name?: string
  bonus_configuration_id: string | null
  bonus_configuration_name?: string
  created_at: string
  expires_at: string | null
}
```

---

### 5. Customer Endpoints

#### `GET /customers` - List customers (paginated)
**Query:** `{ page?, per_page?, search?, sort_by?, sort_order? }`

```ts
interface Customer {
  id: string
  name: string
  email: string | null
  phone: string
  source: string
  gender: string | null
  birthday: string | null
  created_at: string
  wallet: Wallet
  statistics: Statistics
}

interface Wallet {
  id: string
  points_balance: string
  available_points: number
  locked_points: number
  lifetime_points: string
  annual_points: string
  annual_points_reset_date: string | null
  current_tier: Tier
  next_tier: Tier
  points_locks: PointLock[]
}

interface Statistics {
  total_transactions: string
  total_earned: number
  total_redeemed: string
  total_invoices: string
}
```

#### `GET /customers/:id/overview` - Customer loyalty overview
```ts
type Overview = {
  tiers: Tier[]
  customer: Customer
  locked_points: number
}
```

#### `GET /customers/:id/transactions` - Transaction history
```ts
interface Transaction {
  id: string
  title: string
  description: number
  transaction_date: number
  transaction_type: string
  points: string
  monetary_value: string | null
  created_at: string
  expires_at: string | null
  is_redeemable: boolean
}
```

#### `GET /customers/:id/invoices` - Customer invoices (paginated)
Returns: `Invoice[]`

---

### 6. Campaign / Bonus Endpoints

#### `GET /bonus-configurations` - List campaigns
#### `GET /bonus-configurations/:id` - Campaign details
```ts
type TriggerType = 'BIRTHDAY' | 'DATE_RANGE' | 'SPECIAL_DAY' | 'CAMPAIGN'

interface Campaign {
  id: string
  name: string
  code: string
  description: string | null
  multiplier: string
  start_date: string | null
  end_date: string | null
  is_active: boolean
  is_currently_active: boolean
  trigger_type: TriggerType
  configuration: Record<string, any> | null
  created_at: string | null
  updated_at: string | null
}
```

#### `GET /bonus-configurations/:id/stats` - Campaign statistics
```ts
interface CampaignStats {
  total_transactions: number
  total_points: string
  unique_customers: number
  avg_points_per_transaction: string
}
```

#### `GET /bonus-configurations/:id/points-chart` - Points distribution chart
**Query:** `{ start_date?, end_date? }`
**Response:**
```ts
interface RevenueChartData {
  summary?: {
    total?: string
    currency?: string
    change?: string
    changeRaw?: number
    changeClass?: string
    comparisonText?: string
  }
  chart?: {
    labels?: string[]
    data?: number[]
  }
}
```

#### `GET /bonus-configurations/:id/transactions` - Campaign transactions (paginated)
```ts
interface CampaignTransaction {
  id: string
  title: string
  description: string
  transaction_type: string
  points: string
  points_remaining: string
  monetary_value: string
  invoice_no: string | null
  branch_id: string | null
  branch_name: string | null
  customer_name: string
  customer_email: string
  customer_id: string
  bonus_configuration_id: string
  bonus_configuration_name: string
  created_at: string
  expires_at: string | null
}
```

---

### 7. Tier Data

```ts
interface Tier {
  id: string
  name: string
  min_annual_points: string
  max_annual_points: string | null
  point_multiplier: string
  tier_color: string | null
  benefits?: TierBenefit[]
}

interface TierBenefit {
  id: string
  benefit: string
}
```

---

### 8. User Data

```ts
interface User {
  id: string
  name: string
  email: string
  roles: string[]
  branch: { id: string; name: string } | null
  is_active: boolean
  created_at: string
}
```

---

## Analytics Pages to Build

Build the following analytics views. Each should support date range filtering where applicable.

### Page 1: Sales Analytics Dashboard
- **Revenue over time** (line/bar chart, groupable by day/week/month/year)
- **Revenue comparison** (current period vs previous period)
- **Top branches by revenue** (horizontal bar chart)
- **Top branches by volume** (horizontal bar chart)
- **Top salespersons** (ranked list or bar chart)
- **Payment method distribution** (pie/donut chart from `InvoicePrice.paid_in`)
- **Average transaction value** over time
- **Invoice status breakdown** (pie chart)

### Page 2: Customer Analytics
- **Customer growth** over time (new registrations by month)
- **Tier distribution** (pie/donut chart showing customers per tier)
- **Points economy** (total earned vs redeemed over time)
- **Customer lifetime value** distribution
- **Top customers by spend** (ranked table)
- **Customer retention / repeat purchase rate**
- **Gender distribution** (if available)
- **Source distribution** (where customers came from)

### Page 3: Branch Performance
- **Branch comparison table** (revenue, invoice count, avg transaction value side by side)
- **Branch performance heatmap or ranking** over months
- **Product category breakdown** per branch (stacked bar)
- **Salesperson productivity** per branch
- **Branch growth trends** (month-over-month)

### Page 4: Campaign Analytics
- **Campaign performance comparison** (bar chart of transactions, points, unique customers)
- **Campaign ROI** (points distributed vs revenue generated)
- **Active vs inactive campaigns** summary
- **Points distributed over time** per campaign (line chart)
- **Campaign type breakdown** (by trigger_type)
- **Top campaigns by customer reach**

### Page 5: Loyalty Program Analytics
- **Points circulation** (earned vs redeemed vs locked over time)
- **Tier progression rates** (how fast customers move between tiers)
- **Points expiration tracking** (upcoming expirations)
- **Redemption patterns** (when and how points are redeemed)
- **Tier benefit utilization**

---

## Design Guidelines

- Use **Chart.js with vue-chartjs** for all charts (already used in parent project)
- Currency is **AED** - format numbers with commas and 2 decimal places
- Color palette: use a consistent, professional color scheme for charts
- All charts should be **responsive** and work on desktop screens (mobile is secondary)
- Include **loading states** for all data fetches
- Include **empty states** when no data is available
- Date range picker should use `@vuepic/vue-datepicker`
- Each page should have KPI summary cards at the top before the charts
- Charts should have tooltips showing exact values on hover

---

## API Response Wrapper

All API responses follow this structure:

```ts
interface FactoryResponse<T> {
  data: T
}
```

Paginated responses include:

```ts
interface PaginationPayload {
  page?: number
  per_page?: number
  search?: string
}
```

And paginated responses return metadata alongside the data (standard Laravel pagination format).

---

## Integration Notes

When this analytics project is complete, it will be integrated into the parent dashboard as:
- New pages under the existing routing structure
- Sharing the same authentication (Bearer token)
- Using the same API base URL
- Matching the existing SCSS design system and component patterns

Build components to be modular so they can be easily moved into the parent project's `app/components/` and `app/pages/` directories.
