import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart
} from "recharts";

const C = {
  gold: "#9E7C2B", goldLight: "#C4A35A", goldDark: "#6B5520",
  navy: "#F5F0E8", navyLight: "#EDE6D8", bg: "#FAFAF7",
  card: "#FFFFFF", border: "#E2D9C8",
  text: "#2D2518", textMuted: "#7A7060", green: "#16A34A",
  red: "#DC2626", blue: "#2563EB", purple: "#7C3AED",
  orange: "#EA580C", cyan: "#0891B2", pink: "#DB2777",
};
let _seed = 42;
const srand = () => { _seed=((_seed*16807)%2147483647); return (_seed-1)/2147483646; };
const COLORS = [C.gold, C.blue, C.green, C.orange, C.purple, C.pink, C.cyan, C.red];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const revenueTrend = months.map((m,i) => ({
  month: m,
  monthly: 180000+Math.sin(i*0.8)*40000+srand()*20000,
  invoices: 140+Math.sin(i*0.8)*30+Math.floor(srand()*20),
  atv: 1200+Math.sin(i*0.6)*200+Math.floor(srand()*100),
  y2025: 150000+Math.sin(i*0.6)*30000+srand()*15000,
  y2025inv: 125+Math.sin(i*0.6)*25+Math.floor(srand()*18),
  y2025atv: 1150+Math.sin(i*0.5)*180+Math.floor(srand()*90),
  y2024: 125000+Math.sin(i*0.7)*25000+srand()*12000,
  y2024inv: 110+Math.sin(i*0.7)*22+Math.floor(srand()*15),
  y2024atv: 1080+Math.sin(i*0.4)*160+Math.floor(srand()*80),
  y2023: 105000+Math.sin(i*0.5)*20000+srand()*10000,
  y2023inv: 95+Math.sin(i*0.5)*18+Math.floor(srand()*12),
  y2023atv: 1020+Math.sin(i*0.3)*140+Math.floor(srand()*70),
}));

// ── ARIMA-style Revenue Forecast ──
// Simple exponential smoothing + seasonal decomposition to simulate ARIMA forecast
const forecastMonths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan+1","Feb+1","Mar+1"];
const buildForecast = (histKey, seasonalPeriod = 12) => {
  const hist = revenueTrend.map(d => d[histKey]);
  // Exponential smoothing (alpha=0.3)
  const alpha = 0.3;
  let level = hist[0], trend = (hist[1] - hist[0]);
  const smoothed = [level];
  for (let i = 1; i < hist.length; i++) {
    const prev = level;
    level = alpha * hist[i] + (1 - alpha) * (level + trend);
    trend = 0.3 * (level - prev) + 0.7 * trend;
    smoothed.push(level);
  }
  // Project 3 months ahead
  const forecast = [];
  for (let i = 0; i < 3; i++) {
    const seasonal = hist[hist.length - seasonalPeriod + hist.length % seasonalPeriod + i] || 0;
    const base = level + trend * (i + 1);
    const seasonalAdj = seasonal ? (seasonal / (hist.reduce((a, b) => a + b, 0) / hist.length) - 1) * base * 0.15 : 0;
    forecast.push(base + seasonalAdj);
  }
  // Confidence intervals widen over time
  const stdDev = Math.sqrt(hist.reduce((sum, v, i) => sum + Math.pow(v - smoothed[Math.min(i, smoothed.length - 1)], 2), 0) / hist.length);
  return { hist, forecast, stdDev, lastSmoothed: level, trend };
};

const revForecastData = (() => {
  const fc = buildForecast("monthly");
  const fcInv = buildForecast("invoices");
  const fcAtv = buildForecast("atv");
  return forecastMonths.map((m, i) => {
    const isHist = i < 12;
    const fIdx = i - 12;
    const base = {
      month: m,
      isForecasted: !isHist,
    };
    if (isHist) {
      base.monthly = revenueTrend[i].monthly;
      base.invoices = revenueTrend[i].invoices;
      base.atv = revenueTrend[i].atv;
      // For the last historical point, also set forecast to create a connected line
      if (i === 11) {
        base.fcMonthly = revenueTrend[i].monthly;
        base.fcInvoices = revenueTrend[i].invoices;
        base.fcAtv = revenueTrend[i].atv;
        base.fcMonthlyUpper = revenueTrend[i].monthly;
        base.fcMonthlyLower = revenueTrend[i].monthly;
        base.fcInvoicesUpper = revenueTrend[i].invoices;
        base.fcInvoicesLower = revenueTrend[i].invoices;
        base.fcAtvUpper = revenueTrend[i].atv;
        base.fcAtvLower = revenueTrend[i].atv;
      }
    } else {
      const widening = (fIdx + 1) * 1.4;
      base.fcMonthly = Math.round(fc.forecast[fIdx]);
      base.fcMonthlyUpper = Math.round(fc.forecast[fIdx] + fc.stdDev * widening);
      base.fcMonthlyLower = Math.round(fc.forecast[fIdx] - fc.stdDev * widening);
      base.fcInvoices = Math.round(fcInv.forecast[fIdx]);
      base.fcInvoicesUpper = Math.round(fcInv.forecast[fIdx] + fcInv.stdDev * widening);
      base.fcInvoicesLower = Math.round(fcInv.forecast[fIdx] - fcInv.stdDev * widening);
      base.fcAtv = Math.round(fcAtv.forecast[fIdx]);
      base.fcAtvUpper = Math.round(fcAtv.forecast[fIdx] + fcAtv.stdDev * widening);
      base.fcAtvLower = Math.round(fcAtv.forecast[fIdx] - fcAtv.stdDev * widening);
    }
    // Copy year-over-year data for historical months
    if (isHist) {
      base.y2025 = revenueTrend[i].y2025;
      base.y2025inv = revenueTrend[i].y2025inv;
      base.y2025atv = revenueTrend[i].y2025atv;
      base.y2024 = revenueTrend[i].y2024;
      base.y2024inv = revenueTrend[i].y2024inv;
      base.y2024atv = revenueTrend[i].y2024atv;
      base.y2023 = revenueTrend[i].y2023;
      base.y2023inv = revenueTrend[i].y2023inv;
      base.y2023atv = revenueTrend[i].y2023atv;
    }
    return base;
  });
})();

const paymentData = {
  "2026": [
    { name:"Cash", pct:42, revenue:937260 },
    { name:"Card", pct:31, revenue:691530 },
    { name:"Bank Transfer", pct:18, revenue:401580 },
    { name:"Online", pct:9, revenue:200790 },
  ],
  "2025": [
    { name:"Cash", pct:46, revenue:812400 },
    { name:"Card", pct:28, revenue:494800 },
    { name:"Bank Transfer", pct:19, revenue:335400 },
    { name:"Online", pct:7, revenue:123600 },
  ],
  "2024": [
    { name:"Cash", pct:52, revenue:702000 },
    { name:"Card", pct:24, revenue:324000 },
    { name:"Bank Transfer", pct:18, revenue:243000 },
    { name:"Online", pct:6, revenue:81000 },
  ],
};
const paymentTrendPct = months.map(m => {
  const idx=months.indexOf(m), cash=60000+srand()*25000-idx*800, card=45000+srand()*20000+idx*1500;
  const bank=25000+srand()*15000, online=10000+srand()*10000+idx*800, total=cash+card+bank+online;
  return { month:m, Cash:Math.round(cash/total*100), Card:Math.round(card/total*100), "Bank Transfer":Math.round(bank/total*100), Online:Math.round(online/total*100) };
});
const paymentTrendPct2025 = months.map(m => {
  const idx=months.indexOf(m), cash=65000+srand()*22000-idx*500, card=40000+srand()*18000+idx*1200;
  const bank=23000+srand()*13000, online=8000+srand()*8000+idx*600, total=cash+card+bank+online;
  return { month:m, Cash:Math.round(cash/total*100), Card:Math.round(card/total*100), "Bank Transfer":Math.round(bank/total*100), Online:Math.round(online/total*100) };
});
const paymentTrendPct2024 = months.map(m => {
  const idx=months.indexOf(m), cash=72000+srand()*20000-idx*300, card=35000+srand()*16000+idx*900;
  const bank=20000+srand()*11000, online=5000+srand()*6000+idx*400, total=cash+card+bank+online;
  return { month:m, Cash:Math.round(cash/total*100), Card:Math.round(card/total*100), "Bank Transfer":Math.round(bank/total*100), Online:Math.round(online/total*100) };
});
const paymentTrendAbs = months.map(m => {
  const idx=months.indexOf(m);
  return { month:m, Cash:Math.floor(60000+srand()*25000-idx*800), Card:Math.floor(45000+srand()*20000+idx*1500), "Bank Transfer":Math.floor(25000+srand()*15000), Online:Math.floor(10000+srand()*10000+idx*800) };
});
const paymentTrendAbs2025 = months.map(m => {
  const idx=months.indexOf(m);
  return { month:m, Cash:Math.floor(55000+srand()*22000-idx*500), Card:Math.floor(40000+srand()*18000+idx*1200), "Bank Transfer":Math.floor(23000+srand()*13000), Online:Math.floor(8000+srand()*8000+idx*600) };
});
const paymentTrendAbs2024 = months.map(m => {
  const idx=months.indexOf(m);
  return { month:m, Cash:Math.floor(50000+srand()*20000-idx*300), Card:Math.floor(35000+srand()*16000+idx*900), "Bank Transfer":Math.floor(20000+srand()*11000), Online:Math.floor(5000+srand()*6000+idx*400) };
});
const heatmapData = [];
for (let d=0;d<7;d++) for (let h=9;h<=22;h++) heatmapData.push({ day:days[d], hour:h, value:Math.floor(srand()*100+(h>16&&h<21?80:10)+(d>=4?40:0)) });
const heatmapMonthData = [];
for (let m=0;m<12;m++) for (let h=9;h<=22;h++) heatmapMonthData.push({ month:months[m], hour:h, value:Math.floor(srand()*100+(h>16&&h<21?80:10)+(m>=9||m<=1?50:0)) });
const invoiceDistribution = [
  {range:"0-500",count:45,cumPct:5},{range:"500-1K",count:120,cumPct:18},{range:"1K-2K",count:210,cumPct:40},
  {range:"2K-5K",count:310,cumPct:72},{range:"5K-10K",count:140,cumPct:87},{range:"10K-25K",count:80,cumPct:95},
  {range:"25K-50K",count:30,cumPct:99},{range:"50K+",count:10,cumPct:100},
];
const branchData = {
  "2026": [
    {name:"Mall of Emirates",revenue:520000,invoices:340,atv:1529,growth:12.4,cancel:2.1,sp:4,revPerSP:130000},
    {name:"Dubai Mall",revenue:480000,invoices:290,atv:1655,growth:8.2,cancel:1.8,sp:4,revPerSP:120000},
    {name:"Gold Souk",revenue:410000,invoices:420,atv:976,growth:-3.1,cancel:4.2,sp:6,revPerSP:68333},
    {name:"Abu Dhabi Mall",revenue:350000,invoices:230,atv:1522,growth:15.7,cancel:1.5,sp:3,revPerSP:116667},
    {name:"Sharjah City",revenue:280000,invoices:310,atv:903,growth:5.3,cancel:3.0,sp:4,revPerSP:70000},
    {name:"Ajman Branch",revenue:190000,invoices:180,atv:1056,growth:-1.2,cancel:5.1,sp:2,revPerSP:95000},
  ],
  "2025": [
    {name:"Mall of Emirates",revenue:465000,invoices:310,atv:1500,growth:9.1,cancel:2.5,sp:4,revPerSP:116250},
    {name:"Dubai Mall",revenue:440000,invoices:270,atv:1630,growth:6.5,cancel:2.0,sp:4,revPerSP:110000},
    {name:"Gold Souk",revenue:425000,invoices:450,atv:944,growth:1.2,cancel:3.8,sp:6,revPerSP:70833},
    {name:"Abu Dhabi Mall",revenue:305000,invoices:210,atv:1452,growth:11.3,cancel:1.8,sp:3,revPerSP:101667},
    {name:"Sharjah City",revenue:265000,invoices:290,atv:914,growth:4.0,cancel:3.4,sp:4,revPerSP:66250},
    {name:"Ajman Branch",revenue:195000,invoices:190,atv:1026,growth:2.1,cancel:4.6,sp:2,revPerSP:97500},
  ],
  "2024": [
    {name:"Mall of Emirates",revenue:420000,invoices:285,atv:1474,growth:7.8,cancel:2.9,sp:3,revPerSP:140000},
    {name:"Dubai Mall",revenue:410000,invoices:260,atv:1577,growth:5.2,cancel:2.3,sp:4,revPerSP:102500},
    {name:"Gold Souk",revenue:418000,invoices:470,atv:889,growth:-0.5,cancel:4.5,sp:5,revPerSP:83600},
    {name:"Abu Dhabi Mall",revenue:270000,invoices:195,atv:1385,growth:8.6,cancel:2.2,sp:3,revPerSP:90000},
    {name:"Sharjah City",revenue:252000,invoices:280,atv:900,growth:3.1,cancel:3.8,sp:3,revPerSP:84000},
    {name:"Ajman Branch",revenue:188000,invoices:185,atv:1016,growth:0.8,cancel:5.3,sp:2,revPerSP:94000},
  ],
};
const branchTrend = months.map(m => ({
  month:m,"Mall of Emirates":40000+srand()*15000,"Dubai Mall":35000+srand()*15000,
  "Gold Souk":30000+srand()*12000,"Abu Dhabi Mall":25000+srand()*12000,
  "Sharjah City":22000+srand()*10000,"Ajman Branch":15000+srand()*8000,
}));
const branchTrend2025 = months.map(m => ({
  month:m,"Mall of Emirates":36000+srand()*13000,"Dubai Mall":33000+srand()*13000,
  "Gold Souk":29000+srand()*11000,"Abu Dhabi Mall":22000+srand()*10000,
  "Sharjah City":20000+srand()*9000,"Ajman Branch":14000+srand()*7000,
}));
const branchTrend2024 = months.map(m => ({
  month:m,"Mall of Emirates":32000+srand()*11000,"Dubai Mall":30000+srand()*11000,
  "Gold Souk":27000+srand()*10000,"Abu Dhabi Mall":19000+srand()*9000,
  "Sharjah City":18000+srand()*8000,"Ajman Branch":12000+srand()*6000,
}));
const spData = [
  {name:"Ahmed K.",revenue:185000,invoices:120,atv:1542,customers:89,retention:42},
  {name:"Fatima R.",revenue:172000,invoices:105,atv:1638,customers:78,retention:51},
  {name:"Omar S.",revenue:158000,invoices:140,atv:1129,customers:110,retention:38},
  {name:"Sara M.",revenue:143000,invoices:98,atv:1459,customers:72,retention:45},
  {name:"Khalid A.",revenue:128000,invoices:115,atv:1113,customers:95,retention:33},
];
const productMix = [{name:"22K Gold",value:38},{name:"21K Gold",value:27},{name:"18K Gold",value:15},{name:"Diamonds",value:12},{name:"Silver",value:8}];
const pricePerGram = months.map((m,i) => ({month:m,sellingPrice:245+Math.sin(i*0.5)*20+srand()*10,spotPrice:210+Math.sin(i*0.5)*15+srand()*8}));
const productByBranch = branchData["2026"].slice(0,4).map(b => ({branch:b.name.split(" ")[0],"22K Gold":Math.floor(srand()*40+30),"21K Gold":Math.floor(srand()*25+15),"18K Gold":Math.floor(srand()*15+5),Diamonds:Math.floor(srand()*15+5)}));
const weightTrend = months.map(m => ({month:m,grams:Math.floor(800+srand()*400)}));
const customerAcq = months.map((m,i) => ({month:m,newCustomers:Math.floor(40+srand()*30),cumulative:200+i*45}));
const tierData = [{name:"Bronze",value:45,count:2250},{name:"Silver",value:30,count:1500},{name:"Gold",value:18,count:900},{name:"Platinum",value:7,count:350}];
const clvDistribution = [{range:"0-5K",count:1200},{range:"5K-15K",count:800},{range:"15K-30K",count:450},{range:"30K-60K",count:200},{range:"60K-100K",count:80},{range:"100K+",count:30}];
const retentionCurve = [
  {month:"M0",all:100,gold:100,silver:100,bronze:100},{month:"M3",all:62,gold:78,silver:65,bronze:48},
  {month:"M6",all:45,gold:68,silver:48,bronze:28},{month:"M9",all:35,gold:60,silver:38,bronze:18},
  {month:"M12",all:28,gold:52,silver:30,bronze:12},
];
const cancelTrend = months.map(m => ({month:m,rate:(srand()*4+1).toFixed(1),value:Math.floor(srand()*30000+5000)}));
const campaignData = [{name:"Diwali Sale",lift:28,newCust:85,roi:340,cpa:120},{name:"Eid Collection",lift:22,newCust:62,roi:280,cpa:145},{name:"Summer Promo",lift:15,newCust:44,roi:190,cpa:180},{name:"New Year",lift:18,newCust:55,roi:220,cpa:160}];
const yoyData = months.map(m => ({month:m,"2025":Math.floor(160000+srand()*60000),"2024":Math.floor(140000+srand()*50000)}));
const productTrend = months.map(m => ({month:m,"22K Gold":35+srand()*8,"21K Gold":24+srand()*6,"18K Gold":13+srand()*5,Diamonds:10+srand()*5,Silver:6+srand()*4}));

// Pre-computed branch analytics data (stable across re-renders)
const revPerSpData = branchData["2026"].map(b => {const sp=Math.floor(srand()*5+2);return {...b, sp, revPerSP:Math.floor(b.revenue/sp)};}).sort((a,b)=>b.revPerSP-a.revPerSP);
const custSplitData = branchData["2026"].map(b => {const n=Math.floor(srand()*45+15);return {branch:b.name,newPct:n,retPct:100-n};});
const prodMixData = ["2026","2025","2024"].reduce((acc, year) => {
  acc[year] = branchData[year].map(b => {
    const v1 = Math.floor(srand()*20+28);
    const v2 = Math.floor(srand()*12+18);
    const v3 = Math.floor(srand()*8+8);
    const v4 = Math.floor(srand()*18+5);
    const v5 = Math.floor(srand()*8+3);
    const total = v1+v2+v3+v4+v5;
    const p1 = Math.round((v1/total)*100);
    const p2 = Math.round((v2/total)*100);
    const p3 = Math.round((v3/total)*100);
    const p4 = Math.round((v4/total)*100);
    const p5 = 100 - (p1+p2+p3+p4);
    return {
      branch: b.name.length>14?b.name.slice(0,12)+"…":b.name, fullName:b.name,
      "22K Gold":p1,"21K Gold":p2,
      "18K Gold":p3,Diamonds:p4,Silver:p5,
    };
  });
  return acc;
}, {});
const computedH2hData = months.map((m,i) => {
  const row = { month: m };
  spData.forEach((sp, idx) => {
    const revBase = sp.revenue / 12;
    const invBase = sp.invoices / 12;
    const atvBase = sp.atv;
    row[`${sp.name}_Revenue`] = Math.floor(revBase + Math.sin(i*0.7 + idx)*0.2*revBase + srand()*0.1*revBase);
    row[`${sp.name}_Invoices`] = Math.floor(invBase + Math.sin(i*0.8 + idx)*0.15*invBase + srand()*0.1*invBase);
    row[`${sp.name}_ATV`] = Math.floor(atvBase + Math.sin(i*0.5 + idx)*0.05*atvBase + srand()*0.05*atvBase);
  });
  return row;
});
const prodRevData = {
  "2026": [
    {name:"22K Gold",revenue:848600,pct:38},{name:"21K Gold",revenue:603180,pct:27},
    {name:"18K Gold",revenue:335100,pct:15},{name:"Diamonds",revenue:268080,pct:12},{name:"Silver",revenue:178720,pct:8},
  ],
  "2025": [
    {name:"22K Gold",revenue:710400,pct:40},{name:"21K Gold",revenue:461760,pct:26},
    {name:"18K Gold",revenue:248640,pct:14},{name:"Diamonds",revenue:177600,pct:10},{name:"Silver",revenue:177600,pct:10},
  ],
  "2024": [
    {name:"22K Gold",revenue:567000,pct:42},{name:"21K Gold",revenue:337500,pct:25},
    {name:"18K Gold",revenue:175500,pct:13},{name:"Diamonds",revenue:121500,pct:9},{name:"Silver",revenue:148500,pct:11},
  ],
};

// ── Reusable UI ──
const KPICard = ({label,value,change,prefix=""}) => (
  <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 20px",minWidth:150,flex:1}}>
    <div style={{color:C.textMuted,fontSize: 14,textTransform:"uppercase",letterSpacing:1}}>{label}</div>
    <div style={{color:C.gold,fontSize:22,fontWeight:700,margin:"6px 0"}}>{prefix}{value}</div>
    {change && <div style={{fontSize: 14,color:change>0?C.green:C.red}}>{change>0?"▲":"▼"} {Math.abs(change)}% vs prev period</div>}
  </div>
);
const SectionCard = ({title,explanation,chartType,children}) => (
  <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:28,marginBottom:28,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
    <h3 style={{color:C.gold,fontSize: 18,margin:0,fontFamily:"'DM Sans',sans-serif"}}>{title}</h3>
    {chartType && <div style={{display:"inline-block",background:"#F0EBE0",color:C.goldDark,padding:"3px 10px",borderRadius:6,fontSize: 14,marginTop:8,fontFamily:"monospace"}}>{chartType}</div>}
    <p style={{color:C.textMuted,fontSize: 14,lineHeight:1.7,margin:"12px 0 20px"}}>{explanation}</p>
    {children}
  </div>
);
const Toggle = ({options,value,onChange}) => (
  <div style={{display:"inline-flex",borderRadius:8,overflow:"hidden",border:`1px solid ${C.border}`,background:"#F5F0E8"}}>
    {options.map(o => <button key={o} onClick={()=>onChange(o)} style={{padding:"6px 16px",fontSize: 14,fontWeight:value===o?600:400,background:value===o?C.gold:"transparent",color:value===o?"#FFF":C.textMuted,border:"none",cursor:"pointer",fontFamily:"inherit"}}>{o}</button>)}
  </div>
);
const Ctrl = ({children}) => <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>{children}</div>;
const ToggleBtn = ({active,onClick,children}) => (
  <button onClick={onClick} style={{padding:"6px 14px",borderRadius:8,fontSize: 14,cursor:"pointer",fontFamily:"inherit",background:active?`${C.gold}15`:"#F5F0E8",color:active?C.gold:C.textMuted,border:`1px solid ${active?C.gold:C.border}`,fontWeight:active?600:400}}>{active?"✓ ":""}{children}</button>
);
const HeatmapCell = ({value,highlight}) => {
  const i=Math.min(value/180,1);
  const bg = highlight==="best" ? C.green : highlight==="worst" ? C.red : `rgba(158,124,43,${i*0.85+0.05})`;
  return <div style={{width:44,height:28,background:bg,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",fontSize: 14,color:(highlight||i>0.4)?"#FFF":C.textMuted,fontWeight:(highlight||i>0.5)?700:400}}>{value}</div>;
};
const CTip = ({active,payload,label}) => {
  if (!active||!payload?.length) return null;
  return (<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",fontSize: 14,color:C.text}}>
    <div style={{fontWeight:600,marginBottom:4}}>{label}</div>
    {payload.map((p,i) => <div key={i} style={{color:p.color,marginTop:2}}>{p.name}: {typeof p.value==="number"?p.value.toLocaleString():p.value}</div>)}
  </div>);
};
const tabs = [
  {key:"revenue",label:"Revenue & Sales"},
  {key:"branches",label:"Branch Analytics"},{key:"salespersons",label:"Salesperson"},
  {key:"products",label:"Products"},{key:"customers",label:"Customers & Loyalty"},
  {key:"operations",label:"Operations"},{key:"campaigns",label:"Campaigns"},
];

export default function AnalyticsGuide() {
  const [activeTab,setActiveTab] = useState("revenue");
  const [revGran,setRevGran] = useState("Monthly");
  const [revYears,setRevYears] = useState(new Set(["2025"]));
  const [revMetric,setRevMetric] = useState("Revenue");
  const [prodRevView,setProdRevView] = useState("Donut");
  const [prodRevYear,setProdRevYear] = useState("2026");
  const [payView,setPayView] = useState("% Share");
  const [payYear,setPayYear] = useState("2026");
  const [payBrkYear,setPayBrkYear] = useState("2026");
  const [heatBranch,setHeatBranch] = useState("All Branches");
  const [heatView,setHeatView] = useState("Day");
  const [yoyMetric,setYoyMetric] = useState("Revenue");
  const [branchSort,setBranchSort] = useState("Revenue");
  const [branchTableYear,setBranchTableYear] = useState("2026");
  const [branchMetric,setBranchMetric] = useState("Revenue");
  const [branchLines,setBranchLines] = useState(["Mall of Emirates","Dubai Mall","Gold Souk","Abu Dhabi Mall"]);
  const [branchTrendYear,setBranchTrendYear] = useState("2026");
  const [branchSearch,setBranchSearch] = useState("");
  const [branchDropOpen,setBranchDropOpen] = useState(false);
  const [barDir,setBarDir] = useState("High → Low");
  const [revPerSpView,setRevPerSpView] = useState("Top 10");
  const [custSplitBranch,setCustSplitBranch] = useState("All Branches");
  const [prodMixBranches,setProdMixBranches] = useState(["Mall of Emirates","Dubai Mall","Gold Souk","Abu Dhabi Mall"]);
  const [prodMixSearch,setProdMixSearch] = useState("");
  const [prodMixDropOpen,setProdMixDropOpen] = useState(false);
  const [prodMixYear,setProdMixYear] = useState("2026");
  const [spSort,setSpSort] = useState("Revenue");
  const [spMetric,setSpMetric] = useState("Revenue");
  const [spLines,setSpLines] = useState(["Ahmed K.","Fatima R."]);
  const [spSearch,setSpSearch] = useState("");
  const [spDropOpen,setSpDropOpen] = useState(false);
  const [prodView,setProdView] = useState("Donut");
  const [spotOverlay,setSpotOverlay] = useState(true);
  const [weightUnit,setWeightUnit] = useState("Grams");
  const [custView,setCustView] = useState("New + Cumulative");
  const [retTier,setRetTier] = useState("All Tiers");
  const [cancelView,setCancelView] = useState("Rate + Value");
  const [showForecast,setShowForecast] = useState(false);
  const [revDateFrom,setRevDateFrom] = useState(0);
  const [revDateTo,setRevDateTo] = useState(11);
  const revKey = revGran==="Daily"?"daily":revGran==="Weekly"?"weekly":"monthly";

  return (
    <div style={{background:C.bg,minHeight:"100vh",color:C.text,fontFamily:"'DM Sans',-apple-system,sans-serif",fontSize: 14}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{background:`linear-gradient(135deg,${C.navy},${C.bg})`,borderBottom:`1px solid ${C.border}`,padding:"28px 32px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,borderRadius:8,background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize: 16,fontWeight:700,color:"#FFF"}}>AR</div>
          <div>
            <h1 style={{margin:0,fontSize:20,color:C.gold,fontWeight:700}}>Al Romaizan Analytics Specification</h1>
            <p style={{margin:0,fontSize: 14,color:C.textMuted}}>Requirements Explained · Sample Charts with Per-Chart Controls · Dummy Data</p>
          </div>
        </div>
      </div>
      <div style={{display:"flex",gap:2,padding:"0 32px",background:C.navy,overflowX:"auto",borderBottom:`1px solid ${C.border}`}}>
        {tabs.map(t => <button key={t.key} onClick={()=>setActiveTab(t.key)} style={{padding:"12px 18px",fontSize: 14,fontWeight:activeTab===t.key?600:400,color:activeTab===t.key?C.gold:C.textMuted,background:activeTab===t.key?C.card:"transparent",border:"none",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",borderBottom:activeTab===t.key?`2px solid ${C.gold}`:"2px solid transparent"}}>{t.label}</button>)}
      </div>
      <div style={{padding:"28px 32px",maxWidth:1200,margin:"0 auto"}}>

{/* ═══ REVENUE ═══ */}
{activeTab==="revenue" && (<>
  <SectionCard title="2.2 Revenue Trend Chart" chartType="Area Chart + Multi-Year Comparison + ARIMA Forecast" explanation="Switch between Revenue, Invoices, and ATV metrics. The current year (2026) is always shown as the filled area. Click past year buttons to overlay comparison lines. Enable the forecast toggle to see a 3-month ARIMA-style projection with confidence intervals (shaded band widens with uncertainty).">
    <Ctrl>
      <Toggle options={["Revenue","Invoices","ATV"]} value={revMetric} onChange={setRevMetric}/>
      <ToggleBtn active={showForecast} onClick={()=>setShowForecast(!showForecast)}>📈 Forecast</ToggleBtn>
      <span style={{fontSize: 14,color:C.textMuted}}>Compare:</span>
      {[{year:"2025",color:C.blue},{year:"2024",color:C.purple},{year:"2023",color:C.orange}].map(({year,color})=>{
        const on=revYears.has(year);
        return <button key={year} onClick={()=>{const s=new Set(revYears);if(on)s.delete(year);else s.add(year);setRevYears(s);}} style={{
          padding:"6px 16px",borderRadius:8,fontSize: 14,fontWeight:on?600:400,cursor:"pointer",fontFamily:"inherit",
          background:on?`${color}15`:"#F5F0E8",color:on?color:C.textMuted,
          border:`1px solid ${on?color:C.border}`,
        }}>{on?"✓ ":""}{year}</button>;
      })}
    </Ctrl>
    <Ctrl>
      <span style={{fontSize: 14,color:C.textMuted}}>From:</span>
      <select value={revDateFrom} onChange={e=>{const v=Number(e.target.value);setRevDateFrom(v);if(v>revDateTo)setRevDateTo(v);}} style={{padding:"6px 12px",borderRadius:8,fontSize: 14,border:`1px solid ${C.border}`,background:"#FFF",color:C.text,fontFamily:"inherit",cursor:"pointer"}}>
        {months.map((m,i)=><option key={m} value={i}>{m}</option>)}
      </select>
      <span style={{fontSize: 14,color:C.textMuted}}>To:</span>
      <select value={revDateTo} onChange={e=>{const v=Number(e.target.value);setRevDateTo(v);if(v<revDateFrom)setRevDateFrom(v);}} style={{padding:"6px 12px",borderRadius:8,fontSize: 14,border:`1px solid ${C.border}`,background:"#FFF",color:C.text,fontFamily:"inherit",cursor:"pointer"}}>
        {months.map((m,i)=><option key={m} value={i}>{m}</option>)}
      </select>
      {(revDateFrom!==0||revDateTo!==11) && <button onClick={()=>{setRevDateFrom(0);setRevDateTo(11);}} style={{padding:"6px 12px",borderRadius:8,fontSize: 14,background:"#F5F0E8",color:C.textMuted,border:`1px solid ${C.border}`,cursor:"pointer",fontFamily:"inherit"}}>Reset</button>}
    </Ctrl>
    {(() => {
      const curKey = revMetric==="Revenue"?"monthly":revMetric==="Invoices"?"invoices":"atv";
      const fcKey = revMetric==="Revenue"?"fcMonthly":revMetric==="Invoices"?"fcInvoices":"fcAtv";
      const fcUpper = fcKey+"Upper";
      const fcLower = fcKey+"Lower";
      const suffix = revMetric==="Revenue"?"":revMetric==="Invoices"?"inv":"atv";
      const yFmt = revMetric==="Revenue"?(v=>`${(v/1000).toFixed(0)}K`):revMetric==="ATV"?(v=>`${(v/1000).toFixed(1)}K`):(v=>v);
      const rawData = showForecast ? revForecastData : revenueTrend;
      const chartData = rawData.filter((_,i)=>i>=revDateFrom&&i<=revDateTo);
      return (
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.gold} stopOpacity={0.3}/><stop offset="100%" stopColor={C.gold} stopOpacity={0.02}/></linearGradient>
              <linearGradient id="fcBand" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.cyan} stopOpacity={0.18}/><stop offset="100%" stopColor={C.cyan} stopOpacity={0.04}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
            <XAxis dataKey="month" stroke={C.textMuted} fontSize={14}/>
            <YAxis stroke={C.textMuted} fontSize={14} tickFormatter={yFmt}/>
            <Tooltip content={<CTip/>}/>
            <Area type="monotone" dataKey={curKey} fill="url(#rg)" stroke={C.gold} strokeWidth={2.5} name="2026 (Current)" connectNulls={false}/>
            {showForecast && <Area type="monotone" dataKey={fcUpper} fill="url(#fcBand)" stroke="none" name="Upper CI" connectNulls={false} legendType="none"/>}
            {showForecast && <Area type="monotone" dataKey={fcLower} fill="#FAFAF7" stroke="none" name="Lower CI" connectNulls={false} legendType="none"/>}
            {showForecast && <Line type="monotone" dataKey={fcKey} stroke={C.cyan} strokeWidth={2.5} strokeDasharray="8 4" dot={{r:4,fill:C.cyan,stroke:"#FFF",strokeWidth:2}} name="Forecast (ARIMA)" connectNulls={false}/>}
            {revYears.has("2025") && <Line type="monotone" dataKey={suffix?"y2025"+suffix:"y2025"} stroke={C.blue} strokeWidth={2} strokeDasharray="6 3" dot={{r:2,fill:C.blue}} name="2025"/>}
            {revYears.has("2024") && <Line type="monotone" dataKey={suffix?"y2024"+suffix:"y2024"} stroke={C.purple} strokeWidth={2} strokeDasharray="6 3" dot={{r:2,fill:C.purple}} name="2024"/>}
            {revYears.has("2023") && <Line type="monotone" dataKey={suffix?"y2023"+suffix:"y2023"} stroke={C.orange} strokeWidth={2} strokeDasharray="6 3" dot={{r:2,fill:C.orange}} name="2023"/>}
            <Legend/>
          </ComposedChart>
        </ResponsiveContainer>
      );
    })()}
    {showForecast && (
      <div style={{marginTop:14,padding:"12px 16px",background:"#F0FBFF",borderRadius:10,border:`1px solid ${C.cyan}30`,display:"flex",alignItems:"flex-start",gap:10}}>
        <span style={{fontSize: 14}}>📊</span>
        <div>
          <div style={{fontSize: 14,fontWeight:600,color:C.cyan,marginBottom:2}}>ARIMA-Style Forecast</div>
          <div style={{fontSize: 14,color:C.textMuted,lineHeight:1.6}}>3-month projection using exponential smoothing with seasonal decomposition. The shaded band represents the confidence interval — it widens as uncertainty grows further from known data. This is a simplified simulation; production would use a proper ARIMA(p,d,q) model fitted to actual invoice data.</div>
        </div>
      </div>
    )}
  </SectionCard>

  <SectionCard title="2.3 Revenue by Payment Method" chartType="Breakdown Bars" explanation="Two dimensions per method: percentage share and actual revenue in AED. Switch years to see how payment preferences have shifted over time.">
    <Ctrl>
      <div style={{display:"flex",gap:6}}>
        {[{y:"2026",color:C.gold},{y:"2025",color:C.blue},{y:"2024",color:C.purple}].map(({y,color})=>(
          <button key={y} onClick={()=>setPayBrkYear(y)} style={{
            padding:"6px 16px",borderRadius:8,fontSize: 14,fontWeight:payBrkYear===y?600:400,cursor:"pointer",fontFamily:"inherit",
            background:payBrkYear===y?color:"#F5F0E8",color:payBrkYear===y?"#FFF":C.textMuted,
            border:`1px solid ${payBrkYear===y?color:C.border}`,
          }}>{y}{y==="2026"?" (Current)":""}</button>
        ))}
      </div>
    </Ctrl>
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {paymentData[payBrkYear].map((pm,i) => (
        <div key={pm.name} style={{display:"flex",alignItems:"center",gap:16,padding:"14px 18px",background:"#F9F7F2",borderRadius:12,border:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10,minWidth:130}}><div style={{width:12,height:12,borderRadius:"50%",background:COLORS[i]}}/><span style={{fontSize: 14,fontWeight:600}}>{pm.name}</span></div>
          <div style={{flex:1,minWidth:120}}><div style={{height:24,background:"#EDE6D8",borderRadius:6,overflow:"hidden",position:"relative"}}><div style={{height:"100%",width:`${pm.pct}%`,background:COLORS[i],borderRadius:6,display:"flex",alignItems:"center",paddingLeft:10,transition:"width 0.6s cubic-bezier(0.4,0,0.2,1)"}}>{pm.pct>15 && <span style={{fontSize: 14,fontWeight:700,color:"#FFF"}}>{pm.pct}%</span>}</div>{pm.pct<=15 && <span style={{position:"absolute",left:`${pm.pct+2}%`,top:"50%",transform:"translateY(-50%)",fontSize: 14,fontWeight:700,transition:"left 0.6s cubic-bezier(0.4,0,0.2,1)"}}>{pm.pct}%</span>}</div></div>
          <div style={{textAlign:"right",minWidth:110}}><div style={{fontSize: 14,fontWeight:700}}>AED {(pm.revenue/1000).toFixed(0)}K</div><div style={{fontSize: 14,color:C.textMuted}}>Revenue</div></div>
        </div>
      ))}
      <div style={{display:"flex",alignItems:"center",gap:16,padding:"12px 18px",background:"#FFF",borderRadius:12,border:`2px solid ${C.gold}`}}>
        <div style={{minWidth:130,display:"flex",alignItems:"center",gap:10}}><div style={{width:12}}/><span style={{fontSize: 14,fontWeight:700,color:C.gold}}>Total</span></div>
        <div style={{flex:1,minWidth:120}}><div style={{height:24,background:C.gold,borderRadius:6,display:"flex",alignItems:"center",paddingLeft:10}}><span style={{fontSize: 14,fontWeight:700,color:"#FFF"}}>100%</span></div></div>
        <div style={{textAlign:"right",minWidth:110}}><div style={{fontSize: 14,fontWeight:700,color:C.gold}}>AED {(paymentData[payBrkYear].reduce((s,p)=>s+p.revenue,0)/1000).toFixed(0)}K</div><div style={{fontSize: 14,color:C.textMuted}}>Revenue</div></div>
      </div>
    </div>
  </SectionCard>

  <SectionCard title="2.6 Invoice Value Distribution (Pareto)" chartType="Histogram + Cumulative %" explanation="Groups all invoices into value buckets (e.g. 0–500, 500–1K, etc.) to reveal how transaction sizes are distributed. The gold bars show the count of invoices in each range, while the orange cumulative line illustrates the Pareto effect — typically ~20% of invoices (the high-value ones) account for ~80% of total revenue. Use this to identify your sweet-spot price range, spot outliers, set minimum order thresholds, and tailor upsell strategies. For example, if the 1K–2K bucket has the highest volume, promotions pushing customers from 1K into 2K+ could have the biggest revenue impact.">
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={invoiceDistribution}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="range" stroke={C.textMuted} fontSize={14}/>
        <YAxis yAxisId="left" stroke={C.textMuted} fontSize={14}/><YAxis yAxisId="right" orientation="right" stroke={C.orange} fontSize={14} tickFormatter={v=>`${v}%`}/>
        <Tooltip content={<CTip/>}/>
        <Bar yAxisId="left" dataKey="count" fill={C.gold} radius={[4,4,0,0]} name="Invoice Count"/>
        <Line yAxisId="right" type="monotone" dataKey="cumPct" stroke={C.orange} strokeWidth={2.5} dot={{fill:C.orange,r:3}} name="Cumulative %"/>
        <Legend/>
      </ComposedChart>
    </ResponsiveContainer>
  </SectionCard>

  <SectionCard title="2.7 Revenue by Product Mix" chartType="Breakdown Bars" explanation="Shows how revenue is distributed across product categories with actual AED amounts. Switch years to track how the product mix has shifted.">
    <Ctrl>
      <div style={{display:"flex",gap:6}}>
        {[{y:"2026",color:C.gold},{y:"2025",color:C.blue},{y:"2024",color:C.purple}].map(({y,color})=>(
          <button key={y} onClick={()=>setProdRevYear(y)} style={{
            padding:"6px 16px",borderRadius:8,fontSize: 14,fontWeight:prodRevYear===y?600:400,cursor:"pointer",fontFamily:"inherit",
            background:prodRevYear===y?color:"#F5F0E8",color:prodRevYear===y?"#FFF":C.textMuted,
            border:`1px solid ${prodRevYear===y?color:C.border}`,
          }}>{y}{y==="2026"?" (Current)":""}</button>
        ))}
      </div>
    </Ctrl>
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {prodRevData[prodRevYear].map((p,i) => (
        <div key={p.name} style={{display:"flex",alignItems:"center",gap:16,padding:"12px 16px",background:"#F9F7F2",borderRadius:10,border:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10,minWidth:110}}><div style={{width:12,height:12,borderRadius:"50%",background:COLORS[i]}}/><span style={{fontSize: 14,fontWeight:600}}>{p.name}</span></div>
          <div style={{flex:1,minWidth:120}}><div style={{height:22,background:"#EDE6D8",borderRadius:6,overflow:"hidden",position:"relative"}}><div style={{height:"100%",width:`${p.pct}%`,background:COLORS[i],borderRadius:6,display:"flex",alignItems:"center",paddingLeft:10,transition:"width 0.6s cubic-bezier(0.4,0,0.2,1)"}}>{p.pct>12 && <span style={{fontSize: 14,fontWeight:700,color:"#FFF"}}>{p.pct}%</span>}</div>{p.pct<=12 && <span style={{position:"absolute",left:`${p.pct+2}%`,top:"50%",transform:"translateY(-50%)",fontSize: 14,fontWeight:700}}>{p.pct}%</span>}</div></div>
          <div style={{textAlign:"right",minWidth:100}}><div style={{fontSize: 14,fontWeight:700}}>AED {p.revenue.toLocaleString()}</div></div>
        </div>
      ))}
      <div style={{display:"flex",alignItems:"center",gap:16,padding:"10px 16px",background:"#FFF",borderRadius:10,border:`2px solid ${C.gold}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10,minWidth:110}}><div style={{width:12}}/><span style={{fontSize: 14,fontWeight:700,color:C.gold}}>Total</span></div>
        <div style={{flex:1,minWidth:120}}><div style={{height:22,background:C.gold,borderRadius:6,display:"flex",alignItems:"center",paddingLeft:10}}><span style={{fontSize: 14,fontWeight:700,color:"#FFF"}}>100%</span></div></div>
        <div style={{textAlign:"right",minWidth:100}}><div style={{fontSize: 14,fontWeight:700,color:C.gold}}>AED {prodRevData[prodRevYear].reduce((s,p)=>s+p.revenue,0).toLocaleString()}</div></div>
      </div>
    </div>
  </SectionCard>

</>)}

{/* ═══ BRANCHES ═══ */}
{activeTab==="branches" && (<>
  <SectionCard
  title="3.1 Branch Ranking Table"
  chartType="Sortable Table"
  explanation="Click any column header to sort. Retention shows how well each branch converts customers into repeat buyers."
>
  <Ctrl>
    <div style={{display:"flex",gap:6}}>
      {[{y:"2026",color:C.gold},{y:"2025",color:C.blue},{y:"2024",color:C.purple}].map(({y,color})=>(
        <button
          key={y}
          onClick={()=>setBranchTableYear(y)}
          style={{
            padding:"6px 16px",
            borderRadius:8,
            fontSize: 14,
            fontWeight:branchTableYear===y?600:400,
            cursor:"pointer",
            fontFamily:"inherit",
            background:branchTableYear===y?color:"#F5F0E8",
            color:branchTableYear===y?"#FFF":C.textMuted,
            border:`1px solid ${branchTableYear===y?color:C.border}`,
          }}
        >
          {y}{y==="2026"?" (Current)":""}
        </button>
      ))}
    </div>
  </Ctrl>

  <div style={{overflowX:"auto"}}>
    <table style={{width:"100%",minWidth:800,borderCollapse:"collapse",fontSize: 14}}>
      <thead>
        <tr style={{borderBottom:`2px solid ${C.border}`}}>

          {[
            {label:"Branch",key:null},
            {label:"Revenue",key:"Revenue"},
            {label:"Invoices",key:"Invoices"},
            {label:"ATV",key:"ATV"},
            {label:"SPs",key:"SPs"},
            {label:"Rev/SP",key:"Rev/SP"},
            {label:"Ret Cust",key:"RetCust"},
            {label:"New Cust",key:"NewCust"},
            {label:"Retention %",key:"Retention"},
            {label:"MoM Growth",key:"Growth"},
          ].map(h=>(
            <th
              key={h.label}
              onClick={h.key?()=>setBranchSort(h.key):undefined}
              style={{
                padding:"10px 12px",
                textAlign:"left",
                color:branchSort===h.key?C.gold:C.goldLight,
                fontWeight:600,
                fontSize: 14,
                textTransform:"uppercase",
                cursor:h.key?"pointer":"default",
                userSelect:"none"
              }}
            >
              {h.label}
              {h.key && (
                <span style={{marginLeft:4,fontSize: 14}}>
                  {branchSort===h.key?"▼":"↕"}
                </span>
              )}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {[...branchData[branchTableYear]]
        .map(b=>({
          ...b,
          retCust: Math.floor(b.invoices*0.6),
          newCust: Math.floor(b.invoices*0.4)
        }))
        .sort((a,b)=>
          branchSort==="ATV"?b.atv-a.atv:
          branchSort==="Growth"?b.growth-a.growth:
          branchSort==="Invoices"?b.invoices-a.invoices:
          branchSort==="SPs"?b.sp-a.sp:
          branchSort==="Rev/SP"?b.revPerSP-a.revPerSP:
          branchSort==="RetCust"?b.retCust-a.retCust:
          branchSort==="NewCust"?b.newCust-a.newCust:
          branchSort==="Retention"?(b.retCust/(b.retCust+b.newCust))-(a.retCust/(a.retCust+a.newCust)):
          b.revenue-a.revenue
        )
        .map((b,i)=>{

          const retention = b.retCust/(b.retCust+b.newCust)
          return (
            <tr key={i} style={{borderBottom:`1px solid ${C.border}`}}>

              <td style={{padding:"10px 12px",fontWeight:500}}>
                {b.name}
              </td>

              <td style={{padding:"10px 12px"}}>
                AED {b.revenue.toLocaleString()}
              </td>

              <td style={{padding:"10px 12px"}}>
                {b.invoices}
              </td>

              <td style={{padding:"10px 12px"}}>
                AED {b.atv.toLocaleString()}
              </td>

              <td style={{padding:"10px 12px"}}>
                {b.sp}
              </td>

              <td style={{padding:"10px 12px",fontWeight:500}}>
                AED {b.revPerSP.toLocaleString()}
              </td>

              <td style={{padding:"10px 12px"}}>
                {b.retCust}
              </td>

              <td style={{padding:"10px 12px"}}>
                {b.newCust}
              </td>

              <td style={{padding:"10px 12px",fontWeight:600}}>
                {(retention*100).toFixed(0)}%
              </td>

              <td style={{
                padding:"10px 12px",
                color:b.growth>0?C.green:C.red,
                fontWeight:600
              }}>
                {b.growth>0?"+":""}{b.growth}%
              </td>

            </tr>
          )
        })}
      </tbody>
    </table>
  </div>
</SectionCard>

  <SectionCard title="3.2 Branch Comparison Chart" chartType="Multi-Line Chart" explanation="Search and select up to 6 branches to compare on the same chart. Selected branches appear as removable chips. Switch metric between Revenue, Invoices, or ATV. Switch years to compare branch performance across 2024–2026.">
    <Ctrl>
      <Toggle options={["Revenue","Invoices","ATV"]} value={branchMetric} onChange={setBranchMetric}/>
      <div style={{display:"flex",gap:6}}>
        {[{y:"2026",color:C.gold},{y:"2025",color:C.blue},{y:"2024",color:C.purple}].map(({y,color})=>(
          <button key={y} onClick={()=>setBranchTrendYear(y)} style={{
            padding:"6px 16px",borderRadius:8,fontSize: 14,fontWeight:branchTrendYear===y?600:400,cursor:"pointer",fontFamily:"inherit",
            background:branchTrendYear===y?color:"#F5F0E8",color:branchTrendYear===y?"#FFF":C.textMuted,
            border:`1px solid ${branchTrendYear===y?color:C.border}`,
          }}>{y}{y==="2026"?" (Current)":""}</button>
        ))}
      </div>
      <div style={{position:"relative"}}>
        <div onClick={()=>setBranchDropOpen(!branchDropOpen)} style={{
          display:"flex",alignItems:"center",gap:8,padding:"6px 12px",borderRadius:8,fontSize: 14,
          border:`1px solid ${branchDropOpen?C.gold:C.border}`,background:"#FFF",cursor:"pointer",minWidth:200,fontFamily:"inherit",
        }}>
          <span style={{color:C.textMuted,fontSize: 14}}>🔍</span>
          <input
            value={branchSearch} onChange={e=>{setBranchSearch(e.target.value);setBranchDropOpen(true);}}
            onClick={e=>e.stopPropagation()}
            placeholder={`Select branches (${branchLines.length}/6)`}
            style={{border:"none",outline:"none",fontSize: 14,flex:1,background:"transparent",fontFamily:"inherit",color:C.text}}
          />
          <span style={{fontSize: 14,color:C.textMuted}}>{branchDropOpen?"▲":"▼"}</span>
        </div>
        {branchDropOpen && (
          <div style={{position:"absolute",top:"100%",left:0,right:0,marginTop:4,background:"#FFF",border:`1px solid ${C.border}`,borderRadius:8,boxShadow:"0 4px 12px rgba(0,0,0,0.1)",zIndex:10,maxHeight:200,overflowY:"auto"}}>
            {branchData["2026"].filter(b=>b.name.toLowerCase().includes(branchSearch.toLowerCase())).map(b=>{
              const on=branchLines.includes(b.name);
              const disabled=!on&&branchLines.length>=6;
              return (
                <div key={b.name} onClick={()=>{if(disabled)return;setBranchLines(on?branchLines.filter(x=>x!==b.name):[...branchLines,b.name]);}} style={{
                  display:"flex",alignItems:"center",gap:10,padding:"8px 12px",cursor:disabled?"not-allowed":"pointer",
                  background:on?"#F9F7F2":"transparent",opacity:disabled?0.4:1,
                }}>
                  <div style={{width:16,height:16,borderRadius:4,border:`2px solid ${on?C.gold:C.border}`,background:on?C.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {on && <span style={{color:"#FFF",fontSize: 14,fontWeight:700}}>✓</span>}
                  </div>
                  <span style={{fontSize: 14,color:C.text}}>{b.name}</span>
                </div>
              );
            })}
            {branchData["2026"].filter(b=>b.name.toLowerCase().includes(branchSearch.toLowerCase())).length===0 && (
              <div style={{padding:"12px",fontSize: 14,color:C.textMuted,textAlign:"center"}}>No branches found</div>
            )}
          </div>
        )}
      </div>
    </Ctrl>
    {/* Selected branch chips */}
    {branchLines.length>0 && (
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
        {branchLines.map((name,i)=>(
          <div key={name} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:20,fontSize: 14,fontWeight:500,background:`${COLORS[i]}15`,color:COLORS[i],border:`1px solid ${COLORS[i]}30`}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:COLORS[i]}}/>
            {name}
            <span onClick={()=>setBranchLines(branchLines.filter(x=>x!==name))} style={{cursor:"pointer",fontSize: 14,lineHeight:1,marginLeft:2,opacity:0.6}}>×</span>
          </div>
        ))}
        {branchLines.length>1 && <button onClick={()=>setBranchLines([])} style={{padding:"4px 10px",borderRadius:20,fontSize: 14,background:"#F5F0E8",color:C.textMuted,border:`1px solid ${C.border}`,cursor:"pointer",fontFamily:"inherit"}}>Clear all</button>}
      </div>
    )}
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={branchTrendYear==="2025"?branchTrend2025:branchTrendYear==="2024"?branchTrend2024:branchTrend}><CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="month" stroke={C.textMuted} fontSize={14}/><YAxis stroke={C.textMuted} fontSize={14} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/><Tooltip content={<CTip/>}/>
        {branchData["2026"].map((b,i)=>branchLines.includes(b.name) && <Line key={b.name} type="monotone" dataKey={b.name} stroke={COLORS[i]} strokeWidth={2} dot={{r:3}}/>)}<Legend/></LineChart>
    </ResponsiveContainer>
  </SectionCard>

  <SectionCard title="3.3 Branch Revenue Heatmap" chartType="Matrix Heatmap" explanation="Color intensity = invoice count by hour and time period. Day view shows day-of-week patterns (staff scheduling). Month view shows seasonal patterns across the year (campaign planning). Filter by branch to compare individual locations.">
    <Ctrl>
      <Toggle options={["Day","Month"]} value={heatView} onChange={setHeatView}/>
      <span style={{fontSize: 14,color:C.textMuted}}>Branch:</span>
      <select value={heatBranch} onChange={e=>setHeatBranch(e.target.value)} style={{padding:"6px 12px",borderRadius:8,fontSize: 14,border:`1px solid ${C.border}`,background:"#FFF",color:C.text,fontFamily:"inherit",cursor:"pointer",minWidth:180}}>
        {["All Branches",...branchData["2026"].map(b=>b.name)].map(b=><option key={b} value={b}>{b}</option>)}
      </select>
    </Ctrl>
    <div style={{overflowX:"auto"}}>
      <div style={{display:"flex",gap:2,marginBottom:4,paddingLeft:40}}>{Array.from({length:14},(_,i)=>i+9).map(h=><div key={h} style={{width:44,textAlign:"center",fontSize: 14,color:C.textMuted}}>{h>12?`${h-12}PM`:`${h}AM`}</div>)}</div>
      {(() => {
        const data = heatView==="Day" ? heatmapData : heatmapMonthData;
        const maxVal = Math.max(...data.map(d=>d.value));
        const minVal = Math.min(...data.map(d=>d.value));
        const bestIdx = data.findIndex(d=>d.value===maxVal);
        const worstIdx = data.findIndex(d=>d.value===minVal);
        const rows = heatView==="Day" ? days : months;
        const rowKey = heatView==="Day" ? "day" : "month";
        let cellIdx = 0;
        return (<>
          {rows.map(row => (
            <div key={row} style={{display:"flex",gap:2,alignItems:"center",marginBottom:2}}>
              <div style={{width:36,fontSize: 14,color:C.textMuted,textAlign:"right",paddingRight:4}}>{row}</div>
              {data.filter(d=>d[rowKey]===row).map((d,i) => {
                const idx = cellIdx++;
                const hl = idx===bestIdx?"best":idx===worstIdx?"worst":undefined;
                return <HeatmapCell key={i} value={d.value} highlight={hl}/>;
              })}
            </div>
          ))}
          <div style={{display:"flex",gap:16,marginTop:10,paddingLeft:40,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{fontSize: 14,color:C.textMuted,display:"flex",alignItems:"center",gap:8}}><span>Low</span>{[0.1,0.3,0.5,0.7,0.9].map(v=><div key={v} style={{width:20,height:12,borderRadius:2,background:`rgba(158,124,43,${v})`}}/>)}<span>High</span></div>
            <div style={{display:"flex",gap:12,fontSize: 14}}>
              <span style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:14,height:10,borderRadius:2,background:C.green}}/> Best ({maxVal})</span>
              <span style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:14,height:10,borderRadius:2,background:C.red}}/> Worst ({minVal})</span>
            </div>
          </div>
        </>);
      })()}
    </div>
  </SectionCard>



  <SectionCard title="3.6 Product Mix by Branch" chartType="Stacked Bar (Dropdown Filtered)" explanation="Shows which product categories sell best at a selected branch or compares top branches. With 65 branches, use the dropdown to select specific locations. Helps with inventory allocation — stock levels should reflect each branch's actual demand patterns.">
    <Ctrl>
      <div style={{display:"flex",gap:6}}>
        {[{y:"2026",color:C.gold},{y:"2025",color:C.blue},{y:"2024",color:C.purple}].map(({y,color})=>(
          <button key={y} onClick={()=>setProdMixYear(y)} style={{
            padding:"6px 16px",borderRadius:8,fontSize: 14,fontWeight:prodMixYear===y?600:400,cursor:"pointer",fontFamily:"inherit",
            background:prodMixYear===y?color:"#F5F0E8",color:prodMixYear===y?"#FFF":C.textMuted,
            border:`1px solid ${prodMixYear===y?color:C.border}`,
          }}>{y}{y==="2026"?" (Current)":""}</button>
        ))}
      </div>
      <div style={{position:"relative"}}>
        <div onClick={()=>setProdMixDropOpen(!prodMixDropOpen)} style={{
          display:"flex",alignItems:"center",gap:8,padding:"6px 12px",borderRadius:8,fontSize: 14,
          border:`1px solid ${prodMixDropOpen?C.gold:C.border}`,background:"#FFF",cursor:"pointer",minWidth:200,fontFamily:"inherit",
        }}>
          <span style={{color:C.textMuted,fontSize: 14}}>🔍</span>
          <input
            value={prodMixSearch} onChange={e=>{setProdMixSearch(e.target.value);setProdMixDropOpen(true);}}
            onClick={e=>e.stopPropagation()}
            placeholder={`Select branches (${prodMixBranches.length}/4)`}
            style={{border:"none",outline:"none",fontSize: 14,flex:1,background:"transparent",fontFamily:"inherit",color:C.text}}
          />
          <span style={{fontSize: 14,color:C.textMuted}}>{prodMixDropOpen?"▲":"▼"}</span>
        </div>
        {prodMixDropOpen && (
          <div style={{position:"absolute",top:"100%",left:0,right:0,marginTop:4,background:"#FFF",border:`1px solid ${C.border}`,borderRadius:8,boxShadow:"0 4px 12px rgba(0,0,0,0.1)",zIndex:10,maxHeight:200,overflowY:"auto"}}>
            {branchData[prodMixYear].filter(b=>b.name.toLowerCase().includes(prodMixSearch.toLowerCase())).map(b=>{
              const on=prodMixBranches.includes(b.name);
              const disabled=!on&&prodMixBranches.length>=4;
              const onlyOne=on&&prodMixBranches.length===1;
              return (
                <div key={b.name} onClick={()=>{if(disabled || onlyOne)return;setProdMixBranches(on?prodMixBranches.filter(x=>x!==b.name):[...prodMixBranches,b.name]);}} style={{
                  display:"flex",alignItems:"center",gap:10,padding:"8px 12px",cursor:(disabled||onlyOne)?"not-allowed":"pointer",
                  background:on?"#F9F7F2":"transparent",opacity:(disabled||onlyOne)?0.4:1,
                }}>
                  <div style={{width:16,height:16,borderRadius:4,border:`2px solid ${on?C.gold:C.border}`,background:on?C.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {on && <span style={{color:"#FFF",fontSize: 14,fontWeight:700}}>✓</span>}
                  </div>
                  <span style={{fontSize: 14,color:C.text}}>{b.name}</span>
                </div>
              );
            })}
            {branchData[prodMixYear].filter(b=>b.name.toLowerCase().includes(prodMixSearch.toLowerCase())).length===0 && (
              <div style={{padding:"12px",fontSize: 14,color:C.textMuted,textAlign:"center"}}>No branches found</div>
            )}
          </div>
        )}
      </div>
    </Ctrl>
    {prodMixBranches.length>0 && (
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
        {prodMixBranches.map((name,i)=>(
          <div key={name} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:20,fontSize: 14,fontWeight:500,background:`${COLORS[i]}15`,color:COLORS[i],border:`1px solid ${COLORS[i]}30`}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:COLORS[i]}}/>
            {name}
            {prodMixBranches.length>1 && <span onClick={()=>setProdMixBranches(prodMixBranches.filter(x=>x!==name))} style={{cursor:"pointer",fontSize: 14,lineHeight:1,marginLeft:2,opacity:0.6}}>×</span>}
          </div>
        ))}
      </div>
    )}
    {(() => {
      const all = prodMixData[prodMixYear];
      const shown = all.filter(d=>prodMixBranches.includes(d.fullName));
      return (
        <ResponsiveContainer width="100%" height={shown.length===1?180:280}>
          <BarChart data={shown} layout={shown.length===1?"vertical":"horizontal"} margin={shown.length===1?{left:20}:{}}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
            {shown.length===1 ? (<>
              <XAxis type="number" stroke={C.textMuted} fontSize={14} tickFormatter={v=>`${v}%`}/>
              <YAxis type="category" dataKey="branch" stroke={C.textMuted} fontSize={14} width={130}/>
            </>) : (<>
              <XAxis dataKey="branch" stroke={C.textMuted} fontSize={14} angle={-20} textAnchor="end" height={50}/>
              <YAxis stroke={C.textMuted} fontSize={14} tickFormatter={v=>`${v}%`}/>
            </>)}
            <Tooltip content={<CTip/>}/>
            <Bar dataKey="22K Gold" stackId="a" fill={C.gold}/>
            <Bar dataKey="21K Gold" stackId="a" fill={C.goldLight}/>
            <Bar dataKey="18K Gold" stackId="a" fill={C.blue}/>
            <Bar dataKey="Diamonds" stackId="a" fill={C.purple}/>
            <Bar dataKey="Silver" stackId="a" fill="#A0AEC0" radius={[4,4,0,0]}/>
            <Legend/>
          </BarChart>
        </ResponsiveContainer>
      );
    })()}
  </SectionCard>

</>)}

{/* ═══ SALESPERSON ═══ */}
{activeTab==="salespersons" && (<>
  <SectionCard title="4.1 Sales Leaderboard" chartType="Sortable Table" explanation="Rank by different metrics — Revenue for raw output, ATV for upsell ability, Retention for relationship quality.">
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize: 14}}>
        <thead>
          <tr style={{borderBottom:`2px solid ${C.border}`}}>
            {[
              {label:"Salesperson",key:null},
              {label:"Revenue",key:"Revenue"},
              {label:"ATV",key:"ATV"},
              {label:"Invoices",key:"Invoices"},
              {label:"Customers",key:"Customers"},
              {label:"Retention %",key:"Retention"}
            ].map(h=>(
              <th
                key={h.label}
                onClick={h.key?()=>setSpSort(h.key):undefined}
                style={{
                  padding:"10px 12px",
                  textAlign:"left",
                  color:spSort===h.key?C.gold:C.goldLight,
                  fontWeight:600,
                  fontSize: 14,
                  cursor:h.key?"pointer":"default",
                  userSelect:"none"
                }}
              >
                {h.label}
                {h.key && (
                  <span style={{marginLeft:4,fontSize: 14}}>
                    {spSort===h.key?"▼":"↕"}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...spData].sort((a,b)=>
            spSort==="ATV"?b.atv-a.atv:
            spSort==="Invoices"?b.invoices-a.invoices:
            spSort==="Customers"?b.customers-a.customers:
            spSort==="Retention"?b.retention-a.retention:
            b.revenue-a.revenue
          ).map((sp,i)=>(
            <tr key={i} style={{borderBottom:`1px solid ${C.border}`}}>
              <td style={{padding:"10px 12px",fontWeight:500}}>{sp.name}</td>
              <td style={{padding:"10px 12px"}}>AED {sp.revenue.toLocaleString()}</td>
              <td style={{padding:"10px 12px"}}>AED {sp.atv.toLocaleString()}</td>
              <td style={{padding:"10px 12px"}}>{sp.invoices}</td>
              <td style={{padding:"10px 12px"}}>{sp.customers}</td>
              <td style={{padding:"10px 12px",color:sp.retention>45?C.green:C.text}}>{sp.retention}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </SectionCard>

  <SectionCard title="4.2 Head-to-Head Comparison" chartType="Multi-Line Chart" explanation="Compare up to 5 salespersons over time. Switch metric to see Revenue, ATV, or Invoices.">
    <Ctrl>
      <Toggle options={["Revenue","ATV","Invoices"]} value={spMetric} onChange={setSpMetric}/>
      <div style={{position:"relative"}}>
        <div onClick={()=>setSpDropOpen(!spDropOpen)} style={{
          display:"flex",alignItems:"center",gap:8,padding:"6px 12px",borderRadius:8,fontSize: 14,
          border:`1px solid ${spDropOpen?C.gold:C.border}`,background:"#FFF",cursor:"pointer",minWidth:200,fontFamily:"inherit",
        }}>
          <span style={{color:C.textMuted,fontSize: 14}}>🔍</span>
          <input
            value={spSearch} onChange={e=>{setSpSearch(e.target.value);setSpDropOpen(true);}}
            onClick={e=>e.stopPropagation()}
            placeholder={`Select salesperson (${spLines.length}/5)`}
            style={{border:"none",outline:"none",fontSize: 14,flex:1,background:"transparent",fontFamily:"inherit",color:C.text}}
          />
          <span style={{fontSize: 14,color:C.textMuted}}>{spDropOpen?"▲":"▼"}</span>
        </div>
        {spDropOpen && (
          <div style={{position:"absolute",top:"100%",left:0,right:0,marginTop:4,background:"#FFF",border:`1px solid ${C.border}`,borderRadius:8,boxShadow:"0 4px 12px rgba(0,0,0,0.1)",zIndex:10,maxHeight:200,overflowY:"auto"}}>
            {spData.filter(b=>b.name.toLowerCase().includes(spSearch.toLowerCase())).map(b=>{
              const on=spLines.includes(b.name);
              const disabled=!on&&spLines.length>=5;
              return (
                <div key={b.name} onClick={()=>{if(disabled)return;setSpLines(on?spLines.filter(x=>x!==b.name):[...spLines,b.name]);}} style={{
                  display:"flex",alignItems:"center",gap:10,padding:"8px 12px",cursor:disabled?"not-allowed":"pointer",
                  background:on?"#F9F7F2":"transparent",opacity:disabled?0.4:1,
                }}>
                  <div style={{width:16,height:16,borderRadius:4,border:`2px solid ${on?C.gold:C.border}`,background:on?C.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {on && <span style={{color:"#FFF",fontSize: 14,fontWeight:700}}>✓</span>}
                  </div>
                  <span style={{fontSize: 14,color:C.text}}>{b.name}</span>
                </div>
              );
            })}
            {spData.filter(b=>b.name.toLowerCase().includes(spSearch.toLowerCase())).length===0 && (
              <div style={{padding:"12px",fontSize: 14,color:C.textMuted,textAlign:"center"}}>No salesperson found</div>
            )}
          </div>
        )}
      </div>
    </Ctrl>
    {spLines.length>0 && (
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
        {spLines.map((name,i)=>(
          <div key={name} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:20,fontSize: 14,fontWeight:500,background:`${COLORS[i]}15`,color:COLORS[i],border:`1px solid ${COLORS[i]}30`}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:COLORS[i]}}/>
            {name}
            <span onClick={()=>setSpLines(spLines.filter(x=>x!==name))} style={{cursor:"pointer",fontSize: 14,lineHeight:1,marginLeft:2,opacity:0.6}}>×</span>
          </div>
        ))}
        {spLines.length>1 && <button onClick={()=>setSpLines([])} style={{padding:"4px 10px",borderRadius:20,fontSize: 14,background:"#F5F0E8",color:C.textMuted,border:`1px solid ${C.border}`,cursor:"pointer",fontFamily:"inherit"}}>Clear all</button>}
      </div>
    )}
    <ResponsiveContainer width="100%" height={240}>
      {(() => {
        const chartData = computedH2hData.map(row => {
          const newRow = { month: row.month };
          spLines.forEach(name => {
            newRow[name] = row[`${name}_${spMetric}`];
          });
          return newRow;
        });
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
            <XAxis dataKey="month" stroke={C.textMuted} fontSize={14}/>
            <YAxis stroke={C.textMuted} fontSize={14} tickFormatter={v=>spMetric==="Revenue"?`${(v/1000).toFixed(0)}K`:v}/>
            <Tooltip content={<CTip/>}/>
            {spLines.map((name,i) => (
              <Line key={name} type="monotone" dataKey={name} stroke={COLORS[i]} strokeWidth={2.5} dot={{r:3}}/>
            ))}
            <Legend/>
          </LineChart>
        );
      })()}
    </ResponsiveContainer>
  </SectionCard>
</>)}

{/* ═══ PRODUCTS ═══ */}
{activeTab==="products" && (<>
  <SectionCard title="5.1 Sales by Product Category" chartType="Donut / Stacked Area" explanation="Toggle between a snapshot donut for current mix and a trend view showing how it shifts over time.">
    <Ctrl><Toggle options={["Donut","Trend"]} value={prodView} onChange={setProdView}/></Ctrl>
    {prodView==="Donut" ? (
      <ResponsiveContainer width="100%" height={250}><PieChart><Pie data={productMix} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value" label={({name,value})=>`${name} ${value}%`} labelLine={{stroke:C.textMuted}}>{productMix.map((_,i)=><Cell key={i} fill={COLORS[i]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>
    ) : (
      <ResponsiveContainer width="100%" height={250}><AreaChart data={productTrend} stackOffset="expand"><CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="month" stroke={C.textMuted} fontSize={14}/><YAxis stroke={C.textMuted} fontSize={14} tickFormatter={v=>`${Math.round(v*100)}%`}/><Tooltip content={<CTip/>}/>{["22K Gold","21K Gold","18K Gold","Diamonds","Silver"].map((k,i)=><Area key={k} type="monotone" dataKey={k} stackId="1" fill={COLORS[i]} stroke={COLORS[i]} fillOpacity={0.8}/>)}<Legend/></AreaChart></ResponsiveContainer>
    )}
  </SectionCard>

  <SectionCard title="5.2 Avg Selling Price Per Gram" chartType="Line Chart" explanation="Your selling price vs gold spot price. Toggle the spot price overlay on/off.">
    <Ctrl><ToggleBtn active={spotOverlay} onClick={()=>setSpotOverlay(!spotOverlay)}>Gold Spot Price Overlay</ToggleBtn></Ctrl>
    <ResponsiveContainer width="100%" height={260}><LineChart data={pricePerGram}><CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="month" stroke={C.textMuted} fontSize={14}/><YAxis stroke={C.textMuted} fontSize={14}/><Tooltip content={<CTip/>}/><Line type="monotone" dataKey="sellingPrice" stroke={C.gold} strokeWidth={2.5} name="Your Price/g" dot={{r:3}}/>{spotOverlay && <Line type="monotone" dataKey="spotPrice" stroke={C.textMuted} strokeWidth={2} strokeDasharray="5 3" name="Spot Price/g" dot={false}/>}<Legend/></LineChart></ResponsiveContainer>
  </SectionCard>

  <SectionCard title="5.3 Weight Sold Trends" chartType="Area Chart" explanation="Tracks gold weight sold separately from revenue. Toggle units between grams and troy ounces.">
    <Ctrl><Toggle options={["Grams","Troy Oz"]} value={weightUnit} onChange={setWeightUnit}/></Ctrl>
    <ResponsiveContainer width="100%" height={220}><AreaChart data={weightTrend}><defs><linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.green} stopOpacity={0.2}/><stop offset="100%" stopColor={C.green} stopOpacity={0.02}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="month" stroke={C.textMuted} fontSize={14}/><YAxis stroke={C.textMuted} fontSize={14} tickFormatter={v=>weightUnit==="Troy Oz"?`${(v/31.1).toFixed(0)} oz`:`${v}g`}/><Tooltip content={<CTip/>}/><Area type="monotone" dataKey="grams" fill="url(#wGrad)" stroke={C.green} strokeWidth={2} name={`Weight (${weightUnit})`}/></AreaChart></ResponsiveContainer>
  </SectionCard>
</>)}

{/* ═══ CUSTOMERS ═══ */}
{activeTab==="customers" && (<>
  <SectionCard title="6.1 Customer Acquisition Trend" chartType="Bar + Line Combo" explanation="Toggle between viewing new customers alongside cumulative total, or just new customers for cleaner analysis.">
    <Ctrl><Toggle options={["New + Cumulative","New Only"]} value={custView} onChange={setCustView}/></Ctrl>
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={customerAcq}><CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="month" stroke={C.textMuted} fontSize={14}/><YAxis yAxisId="left" stroke={C.textMuted} fontSize={14}/>{custView==="New + Cumulative" && <YAxis yAxisId="right" orientation="right" stroke={C.orange} fontSize={14}/>}<Tooltip content={<CTip/>}/><Bar yAxisId="left" dataKey="newCustomers" fill={C.gold} radius={[4,4,0,0]} name="New Customers"/>{custView==="New + Cumulative" && <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke={C.orange} strokeWidth={2} dot={false} name="Cumulative Total"/>}<Legend/></ComposedChart>
    </ResponsiveContainer>
  </SectionCard>

  <SectionCard title="6.2 Tier Distribution & Movement" chartType="Donut + Near Tier-Up" explanation="Customer distribution across loyalty tiers. Near tier-up section highlights campaign targets.">
    <div style={{display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
      <ResponsiveContainer width="45%" height={220}><PieChart><Pie data={tierData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value" label={({name,count})=>`${name} (${count})`} labelLine={{stroke:C.textMuted}}>{tierData.map((_,i)=><Cell key={i} fill={[C.goldDark,"#A0AEC0",C.gold,C.purple][i]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>
      <div style={{flex:1,minWidth:200}}>
        <div style={{fontSize: 14,color:C.goldLight,fontWeight:600,marginBottom:10}}>Near Tier-Up (Campaign Targets)</div>
        {[{tier:"Bronze → Silver",count:340,pct:15},{tier:"Silver → Gold",count:180,pct:12},{tier:"Gold → Platinum",count:65,pct:7}].map((t,i)=>(
          <div key={i} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize: 14,marginBottom:3}}><span>{t.tier}</span><span style={{color:C.gold,fontWeight:600}}>{t.count} customers</span></div><div style={{height:6,background:C.border,borderRadius:3}}><div style={{height:"100%",width:`${t.pct*5}%`,background:C.gold,borderRadius:3}}/></div></div>
        ))}
      </div>
    </div>
  </SectionCard>

  <SectionCard title="6.3 Customer Lifetime Value (CLV)" chartType="Histogram" explanation="CLV distribution — the long tail of high-CLV customers drives disproportionate revenue.">
    <ResponsiveContainer width="100%" height={240}><BarChart data={clvDistribution}><CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="range" stroke={C.textMuted} fontSize={14}/><YAxis stroke={C.textMuted} fontSize={14}/><Tooltip content={<CTip/>}/><Bar dataKey="count" fill={C.purple} radius={[4,4,0,0]} name="Customer Count"/></BarChart></ResponsiveContainer>
  </SectionCard>

  <SectionCard title="6.4 Repeat Purchase / Retention Curve" chartType="Retention Lines by Tier" explanation="Filter by tier to focus on specific customer segments or view all together.">
    <Ctrl><Toggle options={["All Tiers","Gold","Silver","Bronze"]} value={retTier} onChange={setRetTier}/></Ctrl>
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={retentionCurve}><CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="month" stroke={C.textMuted} fontSize={14}/><YAxis stroke={C.textMuted} fontSize={14} tickFormatter={v=>`${v}%`}/><Tooltip content={<CTip/>}/>
        {(retTier==="All Tiers"||retTier==="Gold") && <Line type="monotone" dataKey="gold" stroke={C.gold} strokeWidth={2.5} name="Gold Tier" dot={{r:3}}/>}
        {(retTier==="All Tiers"||retTier==="Silver") && <Line type="monotone" dataKey="silver" stroke="#A0AEC0" strokeWidth={2} name="Silver Tier" dot={{r:3}}/>}
        {(retTier==="All Tiers"||retTier==="Bronze") && <Line type="monotone" dataKey="bronze" stroke={C.goldDark} strokeWidth={2} name="Bronze Tier" dot={{r:3}}/>}
        {retTier==="All Tiers" && <Line type="monotone" dataKey="all" stroke={C.textMuted} strokeWidth={1.5} strokeDasharray="5 3" name="All Customers" dot={false}/>}
        <Legend/></LineChart>
    </ResponsiveContainer>
  </SectionCard>
</>)}

{/* ═══ OPERATIONS ═══ */}
{activeTab==="operations" && (<>
  <SectionCard title="7.1 Cancellation Analysis" chartType="Line + Bar Combo" explanation="Toggle between viewing just the cancellation rate, just the lost revenue, or both together.">
    <Ctrl><Toggle options={["Rate + Value","Rate Only","Value Only"]} value={cancelView} onChange={setCancelView}/></Ctrl>
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={cancelTrend}><CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="month" stroke={C.textMuted} fontSize={14}/>
        {(cancelView==="Rate + Value"||cancelView==="Rate Only") && <YAxis yAxisId="left" stroke={C.red} fontSize={14} tickFormatter={v=>`${v}%`}/>}
        {(cancelView==="Rate + Value"||cancelView==="Value Only") && <YAxis yAxisId="right" orientation="right" stroke={C.textMuted} fontSize={14} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>}
        <Tooltip content={<CTip/>}/>
        {(cancelView==="Rate + Value"||cancelView==="Rate Only") && <Line yAxisId="left" type="monotone" dataKey="rate" stroke={C.red} strokeWidth={2.5} name="Cancel Rate %" dot={{r:3}}/>}
        {(cancelView==="Rate + Value"||cancelView==="Value Only") && <Bar yAxisId="right" dataKey="value" fill="#FEE2E2" stroke={C.red} name="Cancel Value (AED)" radius={[4,4,0,0]}/>}
        <Legend/></ComposedChart>
    </ResponsiveContainer>
  </SectionCard>

  <SectionCard title="7.2 Data Validity Tracking" chartType="Score Cards" explanation="Key data quality metrics. Analytics are only as good as the underlying data.">
    <div style={{background:"#F5F0E8",borderRadius:12,padding:20,display:"flex",gap:20,flexWrap:"wrap"}}>
      {[{label:"Data Completeness",value:"87%",color:C.green},{label:"Missing Customer",value:"4.2%",color:C.orange},{label:"Missing Payment",value:"2.8%",color:C.orange},{label:"Invalid Entries",value:"1.3%",color:C.red}].map((m,i)=>(
        <div key={i} style={{flex:1,minWidth:120,textAlign:"center"}}><div style={{fontSize: 14,fontWeight:700,color:m.color}}>{m.value}</div><div style={{fontSize: 14,color:C.textMuted,marginTop:4}}>{m.label}</div></div>
      ))}
    </div>
  </SectionCard>

  <SectionCard title="9. Alerts & Anomaly Detection" explanation="Backend job runs daily to detect anomalies and surface them on the dashboard.">
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {[{type:"🔴",msg:"Revenue anomaly: Gold Souk dropped 35% vs 7-day average",time:"2h ago"},{type:"🟡",msg:"Inactive branch: Ajman — no invoices in 48 hours",time:"6h ago"},{type:"🟡",msg:"Churn risk: 23 Gold-tier customers exceeded avg interval by 2x",time:"1d ago"},{type:"🔴",msg:"Points anomaly: Negative redemption balance (-91 pts)",time:"3d ago"}].map((a,i)=>(
        <div key={i} style={{background:C.navyLight,borderRadius:8,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderLeft:`3px solid ${a.type==="🔴"?C.red:C.orange}`}}><div style={{fontSize: 14}}>{a.type} {a.msg}</div><div style={{fontSize: 14,color:C.textMuted,whiteSpace:"nowrap",marginLeft:12}}>{a.time}</div></div>
      ))}
    </div>
  </SectionCard>
</>)}

{/* ═══ CAMPAIGNS ═══ */}
{activeTab==="campaigns" && (<>
  <SectionCard title="8.1 Campaign Performance Summary" chartType="KPI Table" explanation="Key metrics for each campaign — Revenue Lift, New Customers, ROI, and Cost Per Acquisition.">
    <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize: 14}}><thead><tr style={{borderBottom:`2px solid ${C.border}`}}>{["Campaign","Revenue Lift %","New Customers","ROI %","CPA (AED)"].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",color:C.goldLight,fontWeight:600,fontSize: 14}}>{h}</th>)}</tr></thead><tbody>
      {campaignData.map((c,i)=><tr key={i} style={{borderBottom:`1px solid ${C.border}`}}><td style={{padding:"10px 12px",fontWeight:500}}>{c.name}</td><td style={{padding:"10px 12px",color:C.green,fontWeight:600}}>+{c.lift}%</td><td style={{padding:"10px 12px"}}>{c.newCust}</td><td style={{padding:"10px 12px",color:C.green}}>{c.roi}%</td><td style={{padding:"10px 12px"}}>AED {c.cpa}</td></tr>)}
    </tbody></table></div>
  </SectionCard>

  <SectionCard title="8.2 Before / After Comparison" chartType="Grouped Bar Chart" explanation="Revenue before, during, and after a campaign. A dip 'after' suggests demand was pulled forward rather than created.">
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={[{period:"4 Weeks Before",revenue:180000},{period:"During Campaign",revenue:245000},{period:"4 Weeks After",revenue:165000}]}><CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="period" stroke={C.textMuted} fontSize={14}/><YAxis stroke={C.textMuted} fontSize={14} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/><Tooltip content={<CTip/>}/><Bar dataKey="revenue" radius={[6,6,0,0]} name="Revenue (AED)">{["#B8AD99",C.gold,"#C9BFA8"].map((c,i)=><Cell key={i} fill={c}/>)}</Bar></BarChart>
    </ResponsiveContainer>
  </SectionCard>

  <SectionCard title="8.3 & 8.4 Campaign Reach & Customer Journey" explanation="Campaign Reach by Branch and Customer Journey tracking both require a campaign attribution system linking campaigns to invoices and customers.">
    <div style={{height:120,background:C.navyLight,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",border:`1px dashed ${C.border}`}}>
      <div style={{textAlign:"center"}}><div style={{color:C.goldLight,fontSize: 14,fontWeight:500}}>Requires: Campaign Attribution System</div><div style={{color:C.textMuted,fontSize: 14,marginTop:4}}>Link campaigns → invoices → customers for long-term tracking</div></div>
    </div>
  </SectionCard>
</>)}

      </div>
    </div>
  );
}
