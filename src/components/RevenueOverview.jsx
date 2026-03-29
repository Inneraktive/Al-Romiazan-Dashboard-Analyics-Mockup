import { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Generate sample revenue data based on year
const generateRevenueData = (year) => {
  let seed = year * 13 + 77;
  const rand = () => { seed = ((seed * 16807) % 2147483647); return (seed - 1) / 2147483646; };
  const baseMultiplier = 1 + (year - 2023) * 0.12;
  return months.map((m, i) => ({
    month: m,
    sales: Math.floor((140000 + Math.sin(i * 0.7) * 50000 + rand() * 30000) * baseMultiplier),
    expenses: Math.floor((80000 + Math.sin(i * 0.5) * 25000 + rand() * 15000) * baseMultiplier),
  }));
};

const S = {
  card: {
    background: "#fff",
    border: "1px solid #e4e4e4",
    borderRadius: 4,
    padding: 20,
    width: "100%",
    boxSizing: "border-box",
  },
  title: {
    fontSize: 20,
    fontWeight: 500,
    color: "#000",
    margin: 0,
    lineHeight: 1.2,
  },
  amountWrap: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  currency: {
    fontSize: 18,
    fontWeight: 500,
    color: "#000",
    letterSpacing: -0.36,
  },
  amount: {
    fontSize: 32,
    fontWeight: 500,
    color: "#000",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#eef5f0",
    borderRadius: 36,
    padding: "4px 8px",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 500,
    color: "#589e67",
  },
  subText: {
    fontSize: 14,
    fontWeight: 500,
    color: "#727272",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  greenText: {
    color: "#589e67",
  },
  dropdown: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.2)",
    borderRadius: 4,
    padding: "8px 12px",
    fontSize: 14,
    fontWeight: 500,
    color: "#000",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    width: "100%",
  },
  controls: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
  },
  dateInput: {
    padding: "6px 10px",
    fontSize: 13,
    fontFamily: "inherit",
    border: "1px solid #e4e4e4",
    borderRadius: 4,
    background: "#fff",
    color: "#000",
    outline: "none",
    cursor: "pointer",
  },
};

const TrendUpIcon = ({ color = "#589e67" }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M14 4.5L8.5 10L6 7.5L2 11.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.5 4.5H14V8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CustomTooltip = ({ active, payload, label, year }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff",
      borderRadius: 8,
      padding: 16,
      boxShadow: "0 20px 40px rgba(194,194,194,0.5)",
      minWidth: 140,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{
          background: "#000",
          borderRadius: 24,
          width: 20,
          height: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1.5" y="4" width="9" height="6.5" rx="1" stroke="#fff" strokeWidth="1"/>
            <path d="M3.5 4V2.5A2.5 2.5 0 0 1 8.5 2.5V4" stroke="#fff" strokeWidth="1"/>
          </svg>
        </div>
        <span style={{ fontSize: 14, fontWeight: 500, color: "#727272" }}>{label} {year}</span>
      </div>
      <div style={{
        background: "#f9f9f9",
        border: "1px solid #e4e4e4",
        borderRadius: 4,
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: "#727272" }}>Sales</span>
        <span style={{ fontSize: 16, fontWeight: 500, color: "#000" }}>
          {payload[0].value.toLocaleString()}
        </span>
        <span style={{ fontSize: 12, fontWeight: 500, color: "#000" }}>AED</span>
      </div>
    </div>
  );
};

export default function RevenueOverview() {
  const [dateFrom, setDateFrom] = useState("2026-01-01");
  const [dateTo, setDateTo] = useState("2026-12-31");

  const selectedYear = new Date(dateFrom).getFullYear();
  const fromMonth = new Date(dateFrom).getMonth();
  const toMonth = new Date(dateTo).getMonth();

  const revenueData = useMemo(() => {
    const full = generateRevenueData(selectedYear);
    return full.filter((_, i) => i >= fromMonth && i <= toMonth);
  }, [selectedYear, fromMonth, toMonth]);
  const totalRevenue = useMemo(() => revenueData.reduce((sum, d) => sum + d.sales, 0), [revenueData]);

  const prevYearData = useMemo(() => {
    const full = generateRevenueData(selectedYear - 1);
    return full.filter((_, i) => i >= fromMonth && i <= toMonth);
  }, [selectedYear, fromMonth, toMonth]);
  const prevYearTotal = useMemo(() => prevYearData.reduce((sum, d) => sum + d.sales, 0), [prevYearData]);
  const growthPct = prevYearTotal ? Math.round(((totalRevenue - prevYearTotal) / prevYearTotal) * 100) : 0;
  const isPositive = growthPct >= 0;

  return (
    <div style={S.card}>
      <p style={S.title}>Revenue Overview</p>

      <div style={{ ...S.header, marginTop: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={S.amountWrap}>
            <span>
              <span style={S.currency}>AED </span>
              <span style={S.amount}>{totalRevenue.toLocaleString()}</span>
            </span>
            <div style={{ ...S.badge, background: isPositive ? "#eef5f0" : "#fef2f2" }}>
              <TrendUpIcon color={isPositive ? "#589e67" : "#dc2626"} />
              <span style={{ ...S.badgeText, color: isPositive ? "#589e67" : "#dc2626" }}>{Math.abs(growthPct)}%</span>
            </div>
          </div>
          <div style={S.subText}>
            <TrendUpIcon color={isPositive ? "#589e67" : "#dc2626"} />
            <span>
              <span style={{ color: isPositive ? "#589e67" : "#dc2626" }}>{isPositive ? "+" : ""}{growthPct}%</span>
              {" from last year"}
            </span>
          </div>
        </div>

        <div style={{ ...S.controls, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 13, color: "#727272" }}>From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={S.dateInput} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 13, color: "#727272" }}>To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={S.dateInput} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, width: "100%" }}>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#000" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#000" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="6 6" stroke="#e4e4e4" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 13, fill: "#999", fontWeight: 400 }}
              dy={10}
              interval="preserveStartEnd"
              tickCount={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 13, fill: "#999", fontWeight: 400 }}
              tickFormatter={(v) => v === 0 ? "0K" : v >= 1000 ? `${Math.round(v / 1000)}K` : v}
              width={50}
            />
            <Tooltip content={<CustomTooltip year={selectedYear} />} cursor={{ stroke: "#727272", strokeDasharray: "4 4" }} />
            <Area
              type="linear"
              dataKey="sales"
              stroke="#000"
              strokeWidth={2}
              fill="url(#revFill)"
              dot={false}
              activeDot={{ r: 6, fill: "#fff", stroke: "#000", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
