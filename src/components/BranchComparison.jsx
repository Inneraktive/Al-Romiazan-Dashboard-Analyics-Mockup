import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const branches = [
  "Downtown Dubai",
  "Dubai Festival City",
  "Mall of Emirates",
  "Dubai Mall",
  "Gold Souk",
  "Abu Dhabi Mall",
];

// Generate comparison data
const generateBranchData = (branch1, branch2) => {
  let seed = 55;
  const rand = () => { seed = ((seed * 16807) % 2147483647); return (seed - 1) / 2147483646; };
  return months.map((m, i) => ({
    month: m,
    [branch1]: Math.floor(50000 + Math.sin(i * 0.6) * 15000 + rand() * 10000),
    [branch2]: Math.floor(45000 + Math.sin(i * 0.8) * 12000 + rand() * 10000),
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
  subtitle: {
    fontSize: 14,
    fontWeight: 500,
    color: "#727272",
    margin: 0,
    lineHeight: 1.5,
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
  vs: {
    fontSize: 14,
    fontWeight: 500,
    color: "#000",
  },
  legendDot: (color) => ({
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: color,
  }),
  legendLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: "#000",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "4px 12px",
  },
};

const CaretDown = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 6L8 10L12 6" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff",
      borderRadius: 8,
      padding: 12,
      boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
      border: "1px solid #e4e4e4",
    }}>
      <div style={{ fontWeight: 500, marginBottom: 8, fontSize: 14 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.fill }} />
          <span style={{ fontSize: 13, color: "#727272" }}>{p.name}:</span>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{p.value.toLocaleString()} AED</span>
        </div>
      ))}
    </div>
  );
};

export default function BranchComparison() {
  const [branch1, setBranch1] = useState("Downtown Dubai");
  const [branch2, setBranch2] = useState("Dubai Festival City");
  const [period, setPeriod] = useState("All Months");

  const data = generateBranchData(branch1, branch2);

  return (
    <div style={S.card}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <p style={S.title}>Branch Comparison</p>
          <p style={S.subtitle}>
            Compare revenue between two branches for a specific month or all months
          </p>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <button style={S.dropdown}>
            {branch1}
            <CaretDown />
          </button>
          <span style={S.vs}>vs</span>
          <button style={S.dropdown}>
            {branch2}
            <CaretDown />
          </button>
          <button style={S.dropdown}>
            {period}
            <CaretDown />
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16, width: "100%" }}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={2} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="6 6" stroke="#e4e4e4" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 16, fill: "#000", fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 16, fill: "#727272", fontWeight: 500 }}
              tickFormatter={(v) => v === 0 ? "0" : `${Math.round(v / 1000)}k`}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
            <Bar dataKey={branch1} fill="#000" radius={[4, 4, 0, 0]} maxBarSize={24} />
            <Bar dataKey={branch2} fill="#d8d8d8" radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 24 }}>
        <div style={S.legendItem}>
          <div style={S.legendDot("#000")} />
          <span style={S.legendLabel}>{branch1}</span>
        </div>
        <div style={S.legendItem}>
          <div style={S.legendDot("#d8d8d8")} />
          <span style={S.legendLabel}>{branch2}</span>
        </div>
      </div>
    </div>
  );
}
