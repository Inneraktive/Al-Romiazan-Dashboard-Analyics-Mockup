import { useState, useRef, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart
} from "recharts";
import RevenueOverview from "./components/RevenueOverview";


/* ── Design Tokens (Figma) ── */
const C = {
  primary: "#000", primaryLight: "#d8d8d8",
  bg: "#fff", bgSubtle: "#f9f9f9",
  card: "#fff", border: "#e4e4e4",
  text: "#000", textMuted: "#727272",
  green: "#589e67", red: "#DC2626",
  blue: "#2563EB", purple: "#7C3AED",
  orange: "#EA580C", cyan: "#0891B2", pink: "#DB2777",
};
let _seed = 42;
const srand = () => { _seed=((_seed*16807)%2147483647); return (_seed-1)/2147483646; };
const COLORS = ["#4285F4", "#E67700", "#34A853", "#7C3AED", "#0891B2", "#DB2777", "#F4B400", "#EA580C"];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

/* ── Data Generation (unchanged) ── */
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
const forecastMonths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan+1","Feb+1","Mar+1"];
const buildForecast = (histKey, seasonalPeriod = 12) => {
  const hist = revenueTrend.map(d => d[histKey]);
  const alpha = 0.3;
  let level = hist[0], trend = (hist[1] - hist[0]);
  const smoothed = [level];
  for (let i = 1; i < hist.length; i++) {
    const prev = level;
    level = alpha * hist[i] + (1 - alpha) * (level + trend);
    trend = 0.3 * (level - prev) + 0.7 * trend;
    smoothed.push(level);
  }
  const forecast = [];
  for (let i = 0; i < 3; i++) {
    const seasonal = hist[hist.length - seasonalPeriod + hist.length % seasonalPeriod + i] || 0;
    const base = level + trend * (i + 1);
    const seasonalAdj = seasonal ? (seasonal / (hist.reduce((a, b) => a + b, 0) / hist.length) - 1) * base * 0.15 : 0;
    forecast.push(base + seasonalAdj);
  }
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
    const base = { month: m, isForecasted: !isHist };
    if (isHist) {
      base.monthly = revenueTrend[i].monthly;
      base.invoices = revenueTrend[i].invoices;
      base.atv = revenueTrend[i].atv;
      if (i === 11) {
        base.fcMonthly = revenueTrend[i].monthly; base.fcInvoices = revenueTrend[i].invoices; base.fcAtv = revenueTrend[i].atv;
        base.fcMonthlyUpper = revenueTrend[i].monthly; base.fcMonthlyLower = revenueTrend[i].monthly;
        base.fcInvoicesUpper = revenueTrend[i].invoices; base.fcInvoicesLower = revenueTrend[i].invoices;
        base.fcAtvUpper = revenueTrend[i].atv; base.fcAtvLower = revenueTrend[i].atv;
      }
    } else {
      const widening = (fIdx + 1) * 1.4;
      base.fcMonthly = Math.round(fc.forecast[fIdx]); base.fcMonthlyUpper = Math.round(fc.forecast[fIdx] + fc.stdDev * widening); base.fcMonthlyLower = Math.round(fc.forecast[fIdx] - fc.stdDev * widening);
      base.fcInvoices = Math.round(fcInv.forecast[fIdx]); base.fcInvoicesUpper = Math.round(fcInv.forecast[fIdx] + fcInv.stdDev * widening); base.fcInvoicesLower = Math.round(fcInv.forecast[fIdx] - fcInv.stdDev * widening);
      base.fcAtv = Math.round(fcAtv.forecast[fIdx]); base.fcAtvUpper = Math.round(fcAtv.forecast[fIdx] + fcAtv.stdDev * widening); base.fcAtvLower = Math.round(fcAtv.forecast[fIdx] - fcAtv.stdDev * widening);
    }
    if (isHist) {
      base.y2025 = revenueTrend[i].y2025; base.y2025inv = revenueTrend[i].y2025inv; base.y2025atv = revenueTrend[i].y2025atv;
      base.y2024 = revenueTrend[i].y2024; base.y2024inv = revenueTrend[i].y2024inv; base.y2024atv = revenueTrend[i].y2024atv;
      base.y2023 = revenueTrend[i].y2023; base.y2023inv = revenueTrend[i].y2023inv; base.y2023atv = revenueTrend[i].y2023atv;
    }
    return base;
  });
})();
const paymentData = {
  "2026": [{name:"Stripe",pct:48,revenue:1071360},{name:"Tabby",pct:32,revenue:714240},{name:"Amazon",pct:20,revenue:446400}],
  "2025": [{name:"Stripe",pct:52,revenue:918560},{name:"Tabby",pct:28,revenue:494800},{name:"Amazon",pct:20,revenue:353200}],
  "2024": [{name:"Stripe",pct:58,revenue:783000},{name:"Tabby",pct:24,revenue:324000},{name:"Amazon",pct:18,revenue:243000}],
};
const paymentTrendPct = months.map(m => { const idx=months.indexOf(m), stripe=60000+srand()*25000-idx*800, tabby=40000+srand()*20000+idx*1500; const amazon=25000+srand()*15000, total=stripe+tabby+amazon; return { month:m, Stripe:Math.round(stripe/total*100), Tabby:Math.round(tabby/total*100), Amazon:Math.round(amazon/total*100) }; });
const paymentTrendPct2025 = months.map(m => { const idx=months.indexOf(m), stripe=65000+srand()*22000-idx*500, tabby=40000+srand()*18000+idx*1200; const amazon=23000+srand()*13000, total=stripe+tabby+amazon; return { month:m, Stripe:Math.round(stripe/total*100), Tabby:Math.round(tabby/total*100), Amazon:Math.round(amazon/total*100) }; });
const paymentTrendPct2024 = months.map(m => { const idx=months.indexOf(m), stripe=72000+srand()*20000-idx*300, tabby=35000+srand()*16000+idx*900; const amazon=20000+srand()*11000, total=stripe+tabby+amazon; return { month:m, Stripe:Math.round(stripe/total*100), Tabby:Math.round(tabby/total*100), Amazon:Math.round(amazon/total*100) }; });
const paymentTrendAbs = months.map(m => { const idx=months.indexOf(m); return { month:m, Stripe:Math.floor(60000+srand()*25000-idx*800), Tabby:Math.floor(40000+srand()*20000+idx*1500), Amazon:Math.floor(25000+srand()*15000) }; });
const paymentTrendAbs2025 = months.map(m => { const idx=months.indexOf(m); return { month:m, Stripe:Math.floor(55000+srand()*22000-idx*500), Tabby:Math.floor(40000+srand()*18000+idx*1200), Amazon:Math.floor(23000+srand()*13000) }; });
const paymentTrendAbs2024 = months.map(m => { const idx=months.indexOf(m); return { month:m, Stripe:Math.floor(50000+srand()*20000-idx*300), Tabby:Math.floor(35000+srand()*16000+idx*900), Amazon:Math.floor(20000+srand()*11000) }; });
const heatmapData = []; for (let d=0;d<7;d++) for (let h=9;h<=22;h++) heatmapData.push({ day:days[d], hour:h, value:Math.floor(srand()*100+(h>16&&h<21?80:10)+(d>=4?40:0)) });
const heatmapMonthData = []; for (let m=0;m<12;m++) for (let h=9;h<=22;h++) heatmapMonthData.push({ month:months[m], hour:h, value:Math.floor(srand()*100+(h>16&&h<21?80:10)+(m>=9||m<=1?50:0)) });
const invoiceDistribution = {
  "2026": [{range:"0-500",count:45,cumPct:5},{range:"500-1K",count:120,cumPct:18},{range:"1K-2K",count:210,cumPct:40},{range:"2K-5K",count:310,cumPct:72},{range:"5K-10K",count:140,cumPct:87},{range:"10K-25K",count:80,cumPct:95},{range:"25K-50K",count:30,cumPct:99},{range:"50K+",count:10,cumPct:100}],
  "2025": [{range:"0-500",count:55,cumPct:6},{range:"500-1K",count:135,cumPct:20},{range:"1K-2K",count:195,cumPct:40},{range:"2K-5K",count:285,cumPct:70},{range:"5K-10K",count:150,cumPct:86},{range:"10K-25K",count:85,cumPct:95},{range:"25K-50K",count:35,cumPct:99},{range:"50K+",count:8,cumPct:100}],
  "2024": [{range:"0-500",count:60,cumPct:7},{range:"500-1K",count:145,cumPct:22},{range:"1K-2K",count:180,cumPct:41},{range:"2K-5K",count:260,cumPct:68},{range:"5K-10K",count:155,cumPct:85},{range:"10K-25K",count:90,cumPct:95},{range:"25K-50K",count:32,cumPct:98},{range:"50K+",count:12,cumPct:100}],
};
const branchData = {
  "2026": [{name:"Mall of Emirates",revenue:520000,invoices:340,atv:1529,growth:12.4,cancel:2.1,sp:4,revPerSP:130000},{name:"Dubai Mall",revenue:480000,invoices:290,atv:1655,growth:8.2,cancel:1.8,sp:4,revPerSP:120000},{name:"Gold Souk",revenue:410000,invoices:420,atv:976,growth:-3.1,cancel:4.2,sp:6,revPerSP:68333},{name:"Abu Dhabi Mall",revenue:350000,invoices:230,atv:1522,growth:15.7,cancel:1.5,sp:3,revPerSP:116667},{name:"Sharjah City",revenue:280000,invoices:310,atv:903,growth:5.3,cancel:3.0,sp:4,revPerSP:70000},{name:"Ajman Branch",revenue:190000,invoices:180,atv:1056,growth:-1.2,cancel:5.1,sp:2,revPerSP:95000}],
  "2025": [{name:"Mall of Emirates",revenue:465000,invoices:310,atv:1500,growth:9.1,cancel:2.5,sp:4,revPerSP:116250},{name:"Dubai Mall",revenue:440000,invoices:270,atv:1630,growth:6.5,cancel:2.0,sp:4,revPerSP:110000},{name:"Gold Souk",revenue:425000,invoices:450,atv:944,growth:1.2,cancel:3.8,sp:6,revPerSP:70833},{name:"Abu Dhabi Mall",revenue:305000,invoices:210,atv:1452,growth:11.3,cancel:1.8,sp:3,revPerSP:101667},{name:"Sharjah City",revenue:265000,invoices:290,atv:914,growth:4.0,cancel:3.4,sp:4,revPerSP:66250},{name:"Ajman Branch",revenue:195000,invoices:190,atv:1026,growth:2.1,cancel:4.6,sp:2,revPerSP:97500}],
  "2024": [{name:"Mall of Emirates",revenue:420000,invoices:285,atv:1474,growth:7.8,cancel:2.9,sp:3,revPerSP:140000},{name:"Dubai Mall",revenue:410000,invoices:260,atv:1577,growth:5.2,cancel:2.3,sp:4,revPerSP:102500},{name:"Gold Souk",revenue:418000,invoices:470,atv:889,growth:-0.5,cancel:4.5,sp:5,revPerSP:83600},{name:"Abu Dhabi Mall",revenue:270000,invoices:195,atv:1385,growth:8.6,cancel:2.2,sp:3,revPerSP:90000},{name:"Sharjah City",revenue:252000,invoices:280,atv:900,growth:3.1,cancel:3.8,sp:3,revPerSP:84000},{name:"Ajman Branch",revenue:188000,invoices:185,atv:1016,growth:0.8,cancel:5.3,sp:2,revPerSP:94000}],
};
const branchTrendByMetric = {
  Revenue: {
    "2026": months.map(m => ({month:m,"Mall of Emirates":40000+srand()*15000,"Dubai Mall":35000+srand()*15000,"Gold Souk":30000+srand()*12000,"Abu Dhabi Mall":25000+srand()*12000,"Sharjah City":22000+srand()*10000,"Ajman Branch":15000+srand()*8000})),
    "2025": months.map(m => ({month:m,"Mall of Emirates":36000+srand()*13000,"Dubai Mall":33000+srand()*13000,"Gold Souk":29000+srand()*11000,"Abu Dhabi Mall":22000+srand()*10000,"Sharjah City":20000+srand()*9000,"Ajman Branch":14000+srand()*7000})),
    "2024": months.map(m => ({month:m,"Mall of Emirates":32000+srand()*11000,"Dubai Mall":30000+srand()*11000,"Gold Souk":27000+srand()*10000,"Abu Dhabi Mall":19000+srand()*9000,"Sharjah City":18000+srand()*8000,"Ajman Branch":12000+srand()*6000})),
  },
  Invoices: {
    "2026": months.map(m => ({month:m,"Mall of Emirates":Math.floor(25+srand()*15),"Dubai Mall":Math.floor(20+srand()*14),"Gold Souk":Math.floor(30+srand()*18),"Abu Dhabi Mall":Math.floor(16+srand()*10),"Sharjah City":Math.floor(22+srand()*12),"Ajman Branch":Math.floor(12+srand()*8)})),
    "2025": months.map(m => ({month:m,"Mall of Emirates":Math.floor(22+srand()*13),"Dubai Mall":Math.floor(18+srand()*12),"Gold Souk":Math.floor(32+srand()*16),"Abu Dhabi Mall":Math.floor(14+srand()*9),"Sharjah City":Math.floor(20+srand()*10),"Ajman Branch":Math.floor(13+srand()*7)})),
    "2024": months.map(m => ({month:m,"Mall of Emirates":Math.floor(20+srand()*11),"Dubai Mall":Math.floor(17+srand()*10),"Gold Souk":Math.floor(34+srand()*15),"Abu Dhabi Mall":Math.floor(13+srand()*8),"Sharjah City":Math.floor(19+srand()*9),"Ajman Branch":Math.floor(12+srand()*6)})),
  },
  ATV: {
    "2026": months.map(m => ({month:m,"Mall of Emirates":Math.floor(1400+srand()*300),"Dubai Mall":Math.floor(1500+srand()*350),"Gold Souk":Math.floor(850+srand()*250),"Abu Dhabi Mall":Math.floor(1350+srand()*300),"Sharjah City":Math.floor(800+srand()*200),"Ajman Branch":Math.floor(950+srand()*200)})),
    "2025": months.map(m => ({month:m,"Mall of Emirates":Math.floor(1350+srand()*280),"Dubai Mall":Math.floor(1450+srand()*320),"Gold Souk":Math.floor(820+srand()*230),"Abu Dhabi Mall":Math.floor(1300+srand()*280),"Sharjah City":Math.floor(780+srand()*190),"Ajman Branch":Math.floor(920+srand()*180)})),
    "2024": months.map(m => ({month:m,"Mall of Emirates":Math.floor(1300+srand()*250),"Dubai Mall":Math.floor(1400+srand()*300),"Gold Souk":Math.floor(780+srand()*210),"Abu Dhabi Mall":Math.floor(1250+srand()*250),"Sharjah City":Math.floor(750+srand()*180),"Ajman Branch":Math.floor(900+srand()*170)})),
  },
};
const spData = [{name:"Ahmed K.",revenue:185000,invoices:120,atv:1542,customers:89,retention:42},{name:"Fatima R.",revenue:172000,invoices:105,atv:1638,customers:78,retention:51},{name:"Omar S.",revenue:158000,invoices:140,atv:1129,customers:110,retention:38},{name:"Sara M.",revenue:143000,invoices:98,atv:1459,customers:72,retention:45},{name:"Khalid A.",revenue:128000,invoices:115,atv:1113,customers:95,retention:33}];
const productMix = [{name:"24K",value:32},{name:"22K",value:25},{name:"21K",value:18},{name:"18K",value:12},{name:"14K",value:8},{name:"8K",value:5}];
const pricePerGram = months.map((m,i) => ({month:m,sellingPrice:245+Math.sin(i*0.5)*20+srand()*10,spotPrice:210+Math.sin(i*0.5)*15+srand()*8}));
const productByBranch = branchData["2026"].slice(0,4).map(b => ({branch:b.name.split(" ")[0],"24K":Math.floor(srand()*30+25),"22K":Math.floor(srand()*25+18),"21K":Math.floor(srand()*18+10),"18K":Math.floor(srand()*12+5),"14K":Math.floor(srand()*8+3),"8K":Math.floor(srand()*5+2)}));
const weightTrend = months.map(m => ({month:m,grams:Math.floor(800+srand()*400)}));
const customerAcq = months.map((m,i) => ({month:m,newCustomers:Math.floor(40+srand()*30),cumulative:200+i*45}));
const tierData = [{name:"Bronze",value:45,count:2250},{name:"Silver",value:30,count:1500},{name:"Gold",value:18,count:900},{name:"Platinum",value:7,count:350}];
const clvDistribution = [{range:"0-5K",count:1200},{range:"5K-15K",count:800},{range:"15K-30K",count:450},{range:"30K-60K",count:200},{range:"60K-100K",count:80},{range:"100K+",count:30}];
const retentionCurve = [{month:"M0",all:100,gold:100,silver:100,bronze:100},{month:"M3",all:62,gold:78,silver:65,bronze:48},{month:"M6",all:45,gold:68,silver:48,bronze:28},{month:"M9",all:35,gold:60,silver:38,bronze:18},{month:"M12",all:28,gold:52,silver:30,bronze:12}];
const cancelTrend = months.map(m => ({month:m,rate:(srand()*4+1).toFixed(1),value:Math.floor(srand()*30000+5000)}));
const campaignData = [{name:"Diwali Sale",lift:28,newCust:85,roi:340,cpa:120},{name:"Eid Collection",lift:22,newCust:62,roi:280,cpa:145},{name:"Summer Promo",lift:15,newCust:44,roi:190,cpa:180},{name:"New Year",lift:18,newCust:55,roi:220,cpa:160}];
const yoyData = months.map(m => ({month:m,"2025":Math.floor(160000+srand()*60000),"2024":Math.floor(140000+srand()*50000)}));
const productTrend = months.map(m => ({month:m,"24K":30+srand()*8,"22K":23+srand()*6,"21K":16+srand()*5,"18K":12+srand()*4,"14K":8+srand()*3,"8K":4+srand()*3}));
const revPerSpData = branchData["2026"].map(b => {const sp=Math.floor(srand()*5+2);return {...b, sp, revPerSP:Math.floor(b.revenue/sp)};}).sort((a,b)=>b.revPerSP-a.revPerSP);
const custSplitData = branchData["2026"].map(b => {const n=Math.floor(srand()*45+15);return {branch:b.name,newPct:n,retPct:100-n};});
const prodMixData = ["2026","2025","2024"].reduce((acc, year) => {
  acc[year] = branchData[year].map(b => {
    const v1=Math.floor(srand()*18+24),v2=Math.floor(srand()*15+18),v3=Math.floor(srand()*12+12),v4=Math.floor(srand()*10+8),v5=Math.floor(srand()*8+4),v6=Math.floor(srand()*5+2);
    const total=v1+v2+v3+v4+v5+v6; const p1=Math.round((v1/total)*100),p2=Math.round((v2/total)*100),p3=Math.round((v3/total)*100),p4=Math.round((v4/total)*100),p5=Math.round((v5/total)*100),p6=100-(p1+p2+p3+p4+p5);
    return { branch:b.name.length>14?b.name.slice(0,12)+"…":b.name, fullName:b.name, "24K":p1,"22K":p2,"21K":p3,"18K":p4,"14K":p5,"8K":p6 };
  }); return acc;
}, {});
const computedH2hData = months.map((m,i) => {
  const row = { month: m };
  spData.forEach((sp, idx) => {
    const revBase=sp.revenue/12, invBase=sp.invoices/12, atvBase=sp.atv;
    row[`${sp.name}_Revenue`]=Math.floor(revBase+Math.sin(i*0.7+idx)*0.2*revBase+srand()*0.1*revBase);
    row[`${sp.name}_Invoices`]=Math.floor(invBase+Math.sin(i*0.8+idx)*0.15*invBase+srand()*0.1*invBase);
    row[`${sp.name}_ATV`]=Math.floor(atvBase+Math.sin(i*0.5+idx)*0.05*atvBase+srand()*0.05*atvBase);
  }); return row;
});
const prodRevData = {
  "2026": [{name:"24K",revenue:714880,pct:32},{name:"22K",revenue:558500,pct:25},{name:"21K",revenue:402480,pct:18},{name:"18K",revenue:268080,pct:12},{name:"14K",revenue:178720,pct:8},{name:"8K",revenue:111700,pct:5}],
  "2025": [{name:"24K",revenue:602280,pct:34},{name:"22K",revenue:443520,pct:25},{name:"21K",revenue:319680,pct:18},{name:"18K",revenue:195360,pct:11},{name:"14K",revenue:124320,pct:7},{name:"8K",revenue:88440,pct:5}],
  "2024": [{name:"24K",revenue:486000,pct:36},{name:"22K",revenue:337500,pct:25},{name:"21K",revenue:229500,pct:17},{name:"18K",revenue:148500,pct:11},{name:"14K",revenue:94500,pct:7},{name:"8K",revenue:54000,pct:4}],
};

/* ── Shared Styles ── */
const dropdownStyle = {
  display:"inline-flex", alignItems:"center", gap:8,
  background:"#fff", border:"1px solid rgba(0,0,0,0.2)", borderRadius:4,
  padding:"8px 12px", fontSize:14, fontWeight:500, color:"#000",
  cursor:"pointer", whiteSpace:"nowrap", fontFamily:"inherit",
};
const CaretDown = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

/* ── Reusable UI ── */
const Dropdown = ({options, value, onChange, label}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} style={{position:"relative",display:"inline-block"}}>
      {label && <span style={{fontSize:14,color:C.textMuted,marginRight:8}}>{label}</span>}
      <button onClick={()=>setOpen(!open)} style={dropdownStyle}>
        {value} <CaretDown/>
      </button>
      {open && (
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,minWidth:"100%",background:"#fff",border:`1px solid ${C.border}`,borderRadius:4,boxShadow:"0 4px 20px rgba(0,0,0,0.1)",zIndex:20,overflow:"hidden"}}>
          {options.map(o => (
            <div key={o} onClick={()=>{onChange(o);setOpen(false);}} style={{
              padding:"8px 14px",fontSize:14,fontWeight:value===o?600:400,color:value===o?"#000":C.textMuted,
              background:value===o?"#f9f9f9":"#fff",cursor:"pointer",whiteSpace:"nowrap",
            }}>{o}</div>
          ))}
        </div>
      )}
    </div>
  );
};

const MultiDropdown = ({options, selected, onChange, label, max=6}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  return (
    <div ref={ref} style={{position:"relative"}}>
      <div onClick={()=>setOpen(!open)} style={{
        display:"flex",alignItems:"center",gap:8,padding:"6px 12px",borderRadius:4,fontSize:14,
        border:`1px solid ${open?"#000":"rgba(0,0,0,0.2)"}`,background:"#fff",cursor:"pointer",minWidth:200,fontFamily:"inherit",
      }}>
        <input
          value={search} onChange={e=>{setSearch(e.target.value);setOpen(true);}}
          onClick={e=>e.stopPropagation()}
          placeholder={`${label} (${selected.length}/${max})`}
          style={{border:"none",outline:"none",fontSize:14,flex:1,background:"transparent",fontFamily:"inherit",color:C.text}}
        />
        <CaretDown/>
      </div>
      {open && (
        <div style={{position:"absolute",top:"100%",left:0,right:0,marginTop:4,background:"#fff",border:`1px solid ${C.border}`,borderRadius:4,boxShadow:"0 4px 20px rgba(0,0,0,0.1)",zIndex:20,maxHeight:200,overflowY:"auto"}}>
          {filtered.map(b => {
            const on=selected.includes(b); const disabled=!on&&selected.length>=max;
            return (
              <div key={b} onClick={()=>{if(disabled)return;onChange(on?selected.filter(x=>x!==b):[...selected,b]);}} style={{
                display:"flex",alignItems:"center",gap:10,padding:"8px 12px",cursor:disabled?"not-allowed":"pointer",
                background:on?"#f9f9f9":"transparent",opacity:disabled?0.4:1,
              }}>
                <div style={{width:16,height:16,borderRadius:4,border:`2px solid ${on?"#000":C.border}`,background:on?"#000":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {on && <span style={{color:"#fff",fontSize:10,fontWeight:700}}>✓</span>}
                </div>
                <span style={{fontSize:14,color:C.text}}>{b}</span>
              </div>
            );
          })}
          {filtered.length===0 && <div style={{padding:12,fontSize:14,color:C.textMuted,textAlign:"center"}}>No results</div>}
        </div>
      )}
    </div>
  );
};

const KPICard = ({label,value,change,prefix=""}) => (
  <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:4,padding:"16px 20px",minWidth:150,flex:1}}>
    <div style={{color:C.textMuted,fontSize:13,textTransform:"uppercase",letterSpacing:1}}>{label}</div>
    <div style={{color:"#000",fontSize:22,fontWeight:600,margin:"6px 0"}}>{prefix}{value}</div>
    {change && <div style={{fontSize:13,color:change>0?C.green:C.red}}>{change>0?"+":""}{change}% vs prev period</div>}
  </div>
);

const SectionCard = ({title,explanation,children}) => (
  <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:4,padding:20,marginBottom:20}}>
    <h3 style={{color:"#000",fontSize:20,fontWeight:500,margin:0}}>{title}</h3>
    <p style={{color:C.textMuted,fontSize:14,lineHeight:1.7,margin:"8px 0 16px"}}>{explanation}</p>
    {children}
  </div>
);

const Ctrl = ({children}) => <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:16,flexWrap:"wrap",justifyContent:"flex-end"}}>{children}</div>;

const HeatmapCell = ({value,highlight}) => {
  const i=Math.min(value/180,1);
  const bg = highlight==="best"?C.green:highlight==="worst"?C.red:`rgba(0,0,0,${i*0.75+0.05})`;
  return <div style={{width:44,height:28,background:bg,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:(highlight||i>0.35)?"#fff":C.textMuted,fontWeight:(highlight||i>0.5)?700:400}}>{value}</div>;
};

const CTip = ({active,payload,label,forceTextDark}) => {
  if (!active||!payload?.length) return null;
  return (<div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",fontSize:14,color:C.text,boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}}>
    <div style={{fontWeight:600,marginBottom:4}}>{label}</div>
    {payload.map((p,i) => <div key={i} style={{color:forceTextDark?"#000":(p.color||"#000"),marginTop:2}}>{p.name}: {typeof p.value==="number"?p.value.toLocaleString():p.value}</div>)}
  </div>);
};

const Chips = ({items, colors, onRemove, onClear}) => (
  items.length > 0 && (
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
      {items.map((name,i) => (
        <div key={name} onClick={()=>onRemove(name)} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:20,fontSize:13,fontWeight:500,background:`${(colors||COLORS)[i]}15`,color:(colors||COLORS)[i],border:`1px solid ${(colors||COLORS)[i]}`,cursor:"pointer"}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:(colors||COLORS)[i]}}/>
          {name}
          <span style={{fontSize:14,lineHeight:1,marginLeft:2,opacity:0.6}}>×</span>
        </div>
      ))}
      {items.length>1 && onClear && <button onClick={onClear} style={{padding:"4px 10px",borderRadius:20,fontSize:13,background:C.bgSubtle,color:C.textMuted,border:`1px solid ${C.border}`,cursor:"pointer",fontFamily:"inherit"}}>Clear all</button>}
    </div>
  )
);

const tabs = [
  {key:"revenue",label:"Revenue & Sales"},
  {key:"branches",label:"Branch Analytics"},
  {key:"salespersons",label:"Salesperson"},
  {key:"products",label:"Products"},
  {key:"customers",label:"Customers & Loyalty"},
  {key:"operations",label:"Operations"},
  {key:"campaigns",label:"Campaigns"},
];

export default function AnalyticsGuide() {
  const [activeTab,setActiveTab] = useState("revenue");
  const [revYears,setRevYears] = useState(["2025"]);
  const [revTrendDateFrom,setRevTrendDateFrom] = useState("2026-01-01");
  const [revTrendDateTo,setRevTrendDateTo] = useState("2026-12-31");
  const [revMetric,setRevMetric] = useState("Revenue");
  const [prodRevDateFrom,setProdRevDateFrom] = useState("2026-01-01");
  const [prodRevDateTo,setProdRevDateTo] = useState("2026-12-31");
  const [payBrkDateFrom,setPayBrkDateFrom] = useState("2026-01-01");
  const [payBrkDateTo,setPayBrkDateTo] = useState("2026-12-31");
  const [paretoDateFrom,setPareDateFrom] = useState("2026-01-01");
  const [paretoDateTo,setPareDateTo] = useState("2026-12-31");
  const [heatBranch,setHeatBranch] = useState("All Branches");
  const [heatView,setHeatView] = useState("Day");
  const [branchSort,setBranchSort] = useState("Revenue");
  const [branchTableYear,setBranchTableYear] = useState("2026");
  const [branchMetric,setBranchMetric] = useState("Revenue");
  const [branchLines,setBranchLines] = useState(["Mall of Emirates","Dubai Mall","Gold Souk","Abu Dhabi Mall"]);
  const [branchTrendYear,setBranchTrendYear] = useState("2026");
  const [prodMixBranches,setProdMixBranches] = useState(["Mall of Emirates","Dubai Mall","Gold Souk","Abu Dhabi Mall"]);
  const [prodMixYear,setProdMixYear] = useState("2026");
  const [spSort,setSpSort] = useState("Revenue");
  const [spMetric,setSpMetric] = useState("Revenue");
  const [spLines,setSpLines] = useState(["Ahmed K.","Fatima R."]);
  const [prodView,setProdView] = useState("Donut");
  const [spotOverlay,setSpotOverlay] = useState("Show");
  const [weightUnit,setWeightUnit] = useState("Grams");
  const [custView,setCustView] = useState("New + Cumulative");
  const [retTier,setRetTier] = useState("All Tiers");
  const [cancelView,setCancelView] = useState("Rate + Value");
  const [showForecast,setShowForecast] = useState("Hide");
  const [dateFrom,setDateFrom] = useState("2026-01-01");
  const [dateTo,setDateTo] = useState("2026-12-31");

  return (
    <div style={{background:C.bg,minHeight:"100vh",color:C.text,fontFamily:"'DM Sans',-apple-system,sans-serif",fontSize:14}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{maxWidth:1200,margin:"0 auto",padding:"0 32px"}}>

      {/* ── Header ── */}
      <div style={{padding:"20px 0"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,borderRadius:4,background:"#000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#fff"}}>AR</div>
          <div>
            <h1 style={{margin:0,fontSize:20,color:"#000",fontWeight:600}}>Al Romaizan Analytics</h1>
            <p style={{margin:0,fontSize:14,color:C.textMuted}}>Management Dashboard</p>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{display:"flex",gap:0,overflowX:"auto",borderBottom:`1px solid ${C.border}`}}>
        {tabs.map(t => (
          <button key={t.key} onClick={()=>setActiveTab(t.key)} style={{
            padding:"12px 20px",fontSize:14,fontWeight:activeTab===t.key?600:400,
            color:activeTab===t.key?"#000":C.textMuted,
            background:"transparent",border:"none",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",
            borderBottom:activeTab===t.key?"2px solid #000":"2px solid transparent",
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── Global Date Range ── */}
      <div style={{display:"flex",alignItems:"center",gap:16,padding:"12px 0",borderBottom:`1px solid ${C.border}`}}>
        <span style={{fontSize:14,fontWeight:500,color:C.text}}>Date Range</span>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <label style={{fontSize:13,color:C.textMuted}}>From</label>
          <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{
            padding:"6px 10px",fontSize:13,fontFamily:"inherit",border:`1px solid ${C.border}`,borderRadius:4,
            background:"#fff",color:C.text,outline:"none",cursor:"pointer",
          }}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <label style={{fontSize:13,color:C.textMuted}}>To</label>
          <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} style={{
            padding:"6px 10px",fontSize:13,fontFamily:"inherit",border:`1px solid ${C.border}`,borderRadius:4,
            background:"#fff",color:C.text,outline:"none",cursor:"pointer",
          }}/>
        </div>
        <button onClick={()=>{setDateFrom("2026-01-01");setDateTo("2026-12-31");}} style={{
          padding:"6px 14px",fontSize:13,fontWeight:500,fontFamily:"inherit",
          background:"transparent",border:`1px solid ${C.border}`,borderRadius:4,
          color:C.textMuted,cursor:"pointer",
        }}>Reset</button>
      </div>

      <div style={{paddingTop:24}}>

{/* ═══ REVENUE ═══ */}
{activeTab==="revenue" && (<>
  <div style={{marginBottom:20}}><RevenueOverview /></div>

  <SectionCard title="Revenue Trend" explanation="Track monthly performance across Revenue (total sales), Invoices (transaction count), and ATV (Average Transaction Value = Revenue ÷ Invoices). Use year-over-year comparison to spot growth or decline patterns. Enable Forecast to see a 3-month ARIMA-style projection with confidence bands — wider bands mean less certainty.">
    <Ctrl>
      <Dropdown options={["Revenue","Invoices","ATV"]} value={revMetric} onChange={setRevMetric}/>
      <Dropdown options={["Hide","Show"]} value={showForecast} onChange={setShowForecast} label="Forecast"/>
      <MultiDropdown options={["2025","2024","2023"]} selected={revYears} onChange={setRevYears} label="Compare" max={3}/>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <label style={{fontSize:13,color:C.textMuted}}>From</label>
        <input type="date" value={revTrendDateFrom} onChange={e=>setRevTrendDateFrom(e.target.value)} style={{padding:"6px 10px",fontSize:13,fontFamily:"inherit",border:`1px solid ${C.border}`,borderRadius:4,background:"#fff",color:C.text,outline:"none",cursor:"pointer"}}/>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <label style={{fontSize:13,color:C.textMuted}}>To</label>
        <input type="date" value={revTrendDateTo} onChange={e=>setRevTrendDateTo(e.target.value)} style={{padding:"6px 10px",fontSize:13,fontFamily:"inherit",border:`1px solid ${C.border}`,borderRadius:4,background:"#fff",color:C.text,outline:"none",cursor:"pointer"}}/>
      </div>
    </Ctrl>
    {(() => {
      const curKey = revMetric==="Revenue"?"monthly":revMetric==="Invoices"?"invoices":"atv";
      const fcKey = revMetric==="Revenue"?"fcMonthly":revMetric==="Invoices"?"fcInvoices":"fcAtv";
      const fcUpper = fcKey+"Upper", fcLower = fcKey+"Lower";
      const suffix = revMetric==="Revenue"?"":revMetric==="Invoices"?"inv":"atv";
      const yFmt = revMetric==="Revenue"?(v=>`${(v/1000).toFixed(0)}K`):revMetric==="ATV"?(v=>`${(v/1000).toFixed(1)}K`):(v=>v);
      const chartData = showForecast==="Show" ? revForecastData : revenueTrend;
      return (
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#000" stopOpacity={0.10}/><stop offset="100%" stopColor="#000" stopOpacity={0.02}/></linearGradient>
              <linearGradient id="fcBand" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.cyan} stopOpacity={0.18}/><stop offset="100%" stopColor={C.cyan} stopOpacity={0.04}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="6 6" stroke={C.border} vertical={false}/>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:14,fill:C.textMuted}}/>
            <YAxis axisLine={false} tickLine={false} tick={{fontSize:14,fill:C.textMuted}} tickFormatter={yFmt}/>
            <Tooltip content={<CTip/>}/>
            <Area type="monotone" dataKey={curKey} fill="url(#rg)" stroke="#000" strokeWidth={2} name="2026 (Current)" connectNulls={false}/>
            {showForecast==="Show" && <Area type="monotone" dataKey={fcUpper} fill="url(#fcBand)" stroke="none" name="Upper CI" connectNulls={false} legendType="none"/>}
            {showForecast==="Show" && <Area type="monotone" dataKey={fcLower} fill="#fff" stroke="none" name="Lower CI" connectNulls={false} legendType="none"/>}
            {showForecast==="Show" && <Line type="monotone" dataKey={fcKey} stroke={C.cyan} strokeWidth={2} strokeDasharray="8 4" dot={{r:4,fill:C.cyan,stroke:"#fff",strokeWidth:2}} name="Forecast (ARIMA)" connectNulls={false}/>}
            {revYears.includes("2025") && <Line type="monotone" dataKey={suffix?"y2025"+suffix:"y2025"} stroke="#E67700" strokeWidth={2} strokeDasharray="6 3" dot={{r:2,fill:"#E67700"}} name="2025"/>}
            {revYears.includes("2024") && <Line type="monotone" dataKey={suffix?"y2024"+suffix:"y2024"} stroke="#4285F4" strokeWidth={2} strokeDasharray="6 3" dot={{r:2,fill:"#4285F4"}} name="2024"/>}
            {revYears.includes("2023") && <Line type="monotone" dataKey={suffix?"y2023"+suffix:"y2023"} stroke="#34A853" strokeWidth={2} strokeDasharray="6 3" dot={{r:2,fill:"#34A853"}} name="2023"/>}
            <Legend wrapperStyle={{ paddingTop: 24 }}/>
          </ComposedChart>
        </ResponsiveContainer>
      );
    })()}
    {showForecast==="Show" && (
      <div style={{marginTop:14,padding:"14px 18px",background:C.bgSubtle,borderRadius:4,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:14,fontWeight:600,color:"#000",marginBottom:6}}>How to Read the Forecast</div>
        <div style={{fontSize:13,color:C.textMuted,lineHeight:1.7}}>
          <div style={{marginBottom:6}}><strong style={{color:"#000"}}>Dashed cyan line</strong> — the predicted value for each future month, calculated using exponential smoothing with seasonal adjustment (ARIMA-style). It extends your current trend forward by 3 months.</div>
          <div style={{marginBottom:6}}><strong style={{color:"#000"}}>Shaded band</strong> — the confidence interval around the prediction. A narrow band means the model is more confident; a wider band (further into the future) signals greater uncertainty. Values are likely to fall within this range.</div>
          <div style={{marginBottom:6}}><strong style={{color:"#000"}}>Solid black line</strong> — actual recorded data for the current year (2026). Where the solid line ends and the dashed line begins is the boundary between real and projected data.</div>
          <div><strong style={{color:"#000"}}>Tip:</strong> Compare the forecast against prior-year lines (orange/blue/green) to judge whether projected growth is realistic relative to historical patterns.</div>
        </div>
      </div>
    )}
  </SectionCard>

  <SectionCard title="Revenue by Payment Method" explanation="Percentage share and actual revenue per method. Switch years to see how payment preferences shift.">
    <Ctrl>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <label style={{fontSize:13,color:C.textMuted}}>From</label>
        <input type="date" value={payBrkDateFrom} onChange={e=>setPayBrkDateFrom(e.target.value)} style={{padding:"6px 10px",fontSize:13,fontFamily:"inherit",border:`1px solid ${C.border}`,borderRadius:4,background:"#fff",color:C.text,outline:"none",cursor:"pointer"}}/>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <label style={{fontSize:13,color:C.textMuted}}>To</label>
        <input type="date" value={payBrkDateTo} onChange={e=>setPayBrkDateTo(e.target.value)} style={{padding:"6px 10px",fontSize:13,fontFamily:"inherit",border:`1px solid ${C.border}`,borderRadius:4,background:"#fff",color:C.text,outline:"none",cursor:"pointer"}}/>
      </div>
    </Ctrl>
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {(paymentData[new Date(payBrkDateFrom).getFullYear().toString()] || paymentData["2026"]).map((pm,i) => (
        <div key={pm.name} style={{display:"flex",alignItems:"center",gap:16,padding:"14px 18px",background:C.bgSubtle,borderRadius:4,border:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10,minWidth:130}}><div style={{width:10,height:10,borderRadius:"50%",background:["#4285F4","#E67700","#34A853"][i]}}/><span style={{fontSize:14,fontWeight:600}}>{pm.name}</span></div>
          <div style={{flex:1,minWidth:120}}><div style={{height:24,background:"#e8e8e8",borderRadius:4,overflow:"hidden",position:"relative"}}><div style={{height:"100%",width:`${pm.pct}%`,background:["#4285F4","#E67700","#34A853"][i],borderRadius:4,display:"flex",alignItems:"center",paddingLeft:10,transition:"width 0.6s cubic-bezier(0.4,0,0.2,1)"}}>{pm.pct>15 && <span style={{fontSize:12,fontWeight:700,color:"#fff"}}>{pm.pct}%</span>}</div>{pm.pct<=15 && <span style={{position:"absolute",left:`${pm.pct+2}%`,top:"50%",transform:"translateY(-50%)",fontSize:12,fontWeight:700}}>{pm.pct}%</span>}</div></div>
          <div style={{textAlign:"right",minWidth:110}}><div style={{fontSize:14,fontWeight:600}}>AED {(pm.revenue/1000).toFixed(0)}K</div><div style={{fontSize:12,color:C.textMuted}}>Revenue</div></div>
        </div>
      ))}
      <div style={{display:"flex",alignItems:"center",gap:16,padding:"12px 18px",background:"#fff",borderRadius:4,border:"2px solid #000"}}>
        <div style={{minWidth:130,display:"flex",alignItems:"center",gap:10}}><div style={{width:10}}/><span style={{fontSize:14,fontWeight:700}}>Total</span></div>
        <div style={{flex:1,minWidth:120}}><div style={{height:24,background:"#000",borderRadius:4,display:"flex",alignItems:"center",paddingLeft:10}}><span style={{fontSize:12,fontWeight:700,color:"#fff"}}>100%</span></div></div>
        <div style={{textAlign:"right",minWidth:110}}><div style={{fontSize:14,fontWeight:700}}>AED {((paymentData[new Date(payBrkDateFrom).getFullYear().toString()] || paymentData["2026"]).reduce((s,p)=>s+p.revenue,0)/1000).toFixed(0)}K</div><div style={{fontSize:12,color:C.textMuted}}>Revenue</div></div>
      </div>
    </div>
  </SectionCard>

  <SectionCard title="Invoice Value Distribution (Pareto)" explanation="Groups invoices into value buckets. The bars show invoice count, the line shows cumulative percentage — revealing the Pareto effect.">
    <Ctrl>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <label style={{fontSize:13,color:C.textMuted}}>From</label>
        <input type="date" value={paretoDateFrom} onChange={e=>setPareDateFrom(e.target.value)} style={{padding:"6px 10px",fontSize:13,fontFamily:"inherit",border:`1px solid ${C.border}`,borderRadius:4,background:"#fff",color:C.text,outline:"none",cursor:"pointer"}}/>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <label style={{fontSize:13,color:C.textMuted}}>To</label>
        <input type="date" value={paretoDateTo} onChange={e=>setPareDateTo(e.target.value)} style={{padding:"6px 10px",fontSize:13,fontFamily:"inherit",border:`1px solid ${C.border}`,borderRadius:4,background:"#fff",color:C.text,outline:"none",cursor:"pointer"}}/>
      </div>
    </Ctrl>
    {(() => { const paretoKey = new Date(paretoDateFrom).getFullYear().toString(); const paretoData = invoiceDistribution[paretoKey] || invoiceDistribution["2026"]; return (<>
    <div style={{fontSize:14,fontWeight:500,marginBottom:8}}>Total Invoices: <span style={{fontWeight:700}}>{paretoData.reduce((s,d)=>s+d.count,0).toLocaleString()}</span></div>
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={paretoData}>
        <CartesianGrid strokeDasharray="6 6" stroke={C.border} vertical={false}/>
        <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{fontSize:13,fill:C.textMuted}}/>
        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize:13,fill:C.textMuted}}/>
        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize:13,fill:C.orange}} tickFormatter={v=>`${v}%`}/>
        <Tooltip content={<CTip/>}/>
        <Bar yAxisId="left" dataKey="count" radius={[4,4,0,0]} name="Invoice Count">{paretoData.map((_,i)=><Cell key={i} fill={COLORS[i % COLORS.length]}/>)}</Bar>
        <Line yAxisId="right" type="monotone" dataKey="cumPct" stroke={C.orange} strokeWidth={2} dot={{fill:C.orange,r:3}} name="Cumulative %"/>
        <Legend wrapperStyle={{ paddingTop: 24 }}/>
      </ComposedChart>
    </ResponsiveContainer>
    </>); })()}
  </SectionCard>

  <SectionCard title="Revenue by Product Mix" explanation="Revenue distribution across product categories with actual AED amounts.">
    <Ctrl>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <label style={{fontSize:13,color:C.textMuted}}>From</label>
        <input type="date" value={prodRevDateFrom} onChange={e=>setProdRevDateFrom(e.target.value)} style={{padding:"6px 10px",fontSize:13,fontFamily:"inherit",border:`1px solid ${C.border}`,borderRadius:4,background:"#fff",color:C.text,outline:"none",cursor:"pointer"}}/>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <label style={{fontSize:13,color:C.textMuted}}>To</label>
        <input type="date" value={prodRevDateTo} onChange={e=>setProdRevDateTo(e.target.value)} style={{padding:"6px 10px",fontSize:13,fontFamily:"inherit",border:`1px solid ${C.border}`,borderRadius:4,background:"#fff",color:C.text,outline:"none",cursor:"pointer"}}/>
      </div>
    </Ctrl>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {(prodRevData[new Date(prodRevDateFrom).getFullYear().toString()] || prodRevData["2026"]).map((p,i) => (
        <div key={p.name} style={{display:"flex",alignItems:"center",gap:16,padding:"12px 16px",background:C.bgSubtle,borderRadius:4,border:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10,minWidth:110}}><div style={{width:10,height:10,borderRadius:"50%",background:["#4285F4","#E67700","#34A853","#7C3AED","#0891B2","#DB2777"][i]}}/><span style={{fontSize:14,fontWeight:600}}>{p.name}</span></div>
          <div style={{flex:1,minWidth:120}}><div style={{height:22,background:"#e8e8e8",borderRadius:4,overflow:"hidden",position:"relative"}}><div style={{height:"100%",width:`${p.pct}%`,background:["#4285F4","#E67700","#34A853","#7C3AED","#0891B2","#DB2777"][i],borderRadius:4,display:"flex",alignItems:"center",paddingLeft:10,transition:"width 0.6s cubic-bezier(0.4,0,0.2,1)"}}>{p.pct>12 && <span style={{fontSize:12,fontWeight:700,color:"#fff"}}>{p.pct}%</span>}</div>{p.pct<=12 && <span style={{position:"absolute",left:`${p.pct+2}%`,top:"50%",transform:"translateY(-50%)",fontSize:12,fontWeight:700}}>{p.pct}%</span>}</div></div>
          <div style={{textAlign:"right",minWidth:100}}><div style={{fontSize:14,fontWeight:600}}>AED {p.revenue.toLocaleString()}</div></div>
        </div>
      ))}
      <div style={{display:"flex",alignItems:"center",gap:16,padding:"10px 16px",background:"#fff",borderRadius:4,border:"2px solid #000"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,minWidth:110}}><div style={{width:10}}/><span style={{fontSize:14,fontWeight:700}}>Total</span></div>
        <div style={{flex:1,minWidth:120}}><div style={{height:22,background:"#000",borderRadius:4,display:"flex",alignItems:"center",paddingLeft:10}}><span style={{fontSize:12,fontWeight:700,color:"#fff"}}>100%</span></div></div>
        <div style={{textAlign:"right",minWidth:100}}><div style={{fontSize:14,fontWeight:700}}>AED {(prodRevData[new Date(prodRevDateFrom).getFullYear().toString()] || prodRevData["2026"]).reduce((s,p)=>s+p.revenue,0).toLocaleString()}</div></div>
      </div>
    </div>
  </SectionCard>
</>)}

{/* ═══ BRANCHES ═══ */}
{activeTab==="branches" && (<>
  <SectionCard title="Branch Ranking Table" explanation="Click any column header to sort. Tracks revenue, invoices, ATV, staff, and growth per branch.">
    <Ctrl>
      <Dropdown options={["2026","2025","2024"]} value={branchTableYear} onChange={setBranchTableYear} label="Year"/>
    </Ctrl>
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",minWidth:800,borderCollapse:"collapse",fontSize:14}}>
        <thead>
          <tr style={{borderBottom:`2px solid ${C.border}`}}>
            {[{label:"Branch",key:null},{label:"Revenue",key:"Revenue"},{label:"Invoices",key:"Invoices"},{label:"ATV",key:"ATV"},{label:"SPs",key:"SPs"},{label:"Rev/SP",key:"Rev/SP"},{label:"Ret Cust",key:"RetCust"},{label:"New Cust",key:"NewCust"},{label:"Retention %",key:"Retention"},{label:"MoM Growth",key:"Growth"}].map(h => (
              <th key={h.label} onClick={h.key?()=>setBranchSort(h.key):undefined} style={{
                padding:"10px 12px",textAlign:"left",color:branchSort===h.key?"#000":C.textMuted,fontWeight:600,fontSize:13,
                textTransform:"uppercase",cursor:h.key?"pointer":"default",userSelect:"none",
              }}>
                {h.label}{h.key && <span style={{marginLeft:4,fontSize:10}}>{branchSort===h.key?"▼":"↕"}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...branchData[branchTableYear]].map(b=>({...b,retCust:Math.floor(b.invoices*0.6),newCust:Math.floor(b.invoices*0.4)}))
          .sort((a,b)=>branchSort==="ATV"?b.atv-a.atv:branchSort==="Growth"?b.growth-a.growth:branchSort==="Invoices"?b.invoices-a.invoices:branchSort==="SPs"?b.sp-a.sp:branchSort==="Rev/SP"?b.revPerSP-a.revPerSP:branchSort==="RetCust"?b.retCust-a.retCust:branchSort==="NewCust"?b.newCust-a.newCust:branchSort==="Retention"?(b.retCust/(b.retCust+b.newCust))-(a.retCust/(a.retCust+a.newCust)):b.revenue-a.revenue)
          .map((b,i) => {
            const retention = b.retCust/(b.retCust+b.newCust);
            return (
              <tr key={i} style={{borderBottom:`1px solid ${C.border}`}}>
                <td style={{padding:"10px 12px",fontWeight:500}}>{b.name}</td>
                <td style={{padding:"10px 12px"}}>AED {b.revenue.toLocaleString()}</td>
                <td style={{padding:"10px 12px"}}>{b.invoices}</td>
                <td style={{padding:"10px 12px"}}>AED {b.atv.toLocaleString()}</td>
                <td style={{padding:"10px 12px"}}>{b.sp}</td>
                <td style={{padding:"10px 12px",fontWeight:500}}>AED {b.revPerSP.toLocaleString()}</td>
                <td style={{padding:"10px 12px"}}>{b.retCust}</td>
                <td style={{padding:"10px 12px"}}>{b.newCust}</td>
                <td style={{padding:"10px 12px",fontWeight:600}}>{(retention*100).toFixed(0)}%</td>
                <td style={{padding:"10px 12px",color:b.growth>0?C.green:C.red,fontWeight:600}}>{b.growth>0?"+":""}{b.growth}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </SectionCard>

  <SectionCard title="Branch Comparison Chart" explanation="Select up to 6 branches to compare on the same chart. Switch metric and year.">
    <Ctrl>
      <Dropdown options={["Revenue","Invoices","ATV"]} value={branchMetric} onChange={setBranchMetric}/>
      <Dropdown options={["2026","2025","2024"]} value={branchTrendYear} onChange={setBranchTrendYear} label="Year"/>
      <MultiDropdown options={branchData["2026"].map(b=>b.name)} selected={branchLines} onChange={v=>{if(v.length>=1)setBranchLines(v);}} label="Select branches" max={6}/>
    </Ctrl>
    {branchLines.length <= 2 ? (<>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={branchTrendByMetric[branchMetric][branchTrendYear]} barGap={2} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="6 6" stroke={C.border} vertical={false}/>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:14,fill:C.textMuted}}/>
          <YAxis axisLine={false} tickLine={false} tick={{fontSize:14,fill:C.textMuted}} tickFormatter={v=>branchMetric==="Revenue"?`${(v/1000).toFixed(0)}K`:branchMetric==="ATV"?`${(v/1000).toFixed(1)}K`:v}/>
          <Tooltip content={<CTip forceTextDark/>} cursor={{fill:"rgba(0,0,0,0.03)"}}/>
          {branchLines.map((name,idx)=><Bar key={name} dataKey={name} fill={idx===0?"#000":"#d8d8d8"} radius={[4,4,0,0]} maxBarSize={24}/>)}
        </BarChart>
      </ResponsiveContainer>
      <div style={{display:"flex",gap:24,justifyContent:"center",paddingTop:12}}>
        {branchLines.map((name,idx)=>(
          <div key={name} style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:12,height:12,borderRadius:2,background:idx===0?"#000":"#d8d8d8"}}/>
            <span style={{fontSize:14,color:"#000"}}>{name}</span>
          </div>
        ))}
      </div>
    </>) : (
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={branchTrendByMetric[branchMetric][branchTrendYear]}>
          <CartesianGrid strokeDasharray="6 6" stroke={C.border} vertical={false}/>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:14,fill:C.textMuted}}/>
          <YAxis axisLine={false} tickLine={false} tick={{fontSize:14,fill:C.textMuted}} tickFormatter={v=>branchMetric==="Revenue"?`${(v/1000).toFixed(0)}K`:branchMetric==="ATV"?`${(v/1000).toFixed(1)}K`:v}/>
          <Tooltip content={<CTip/>}/>
          {branchData["2026"].map((b,i)=>branchLines.includes(b.name) && <Line key={b.name} type="monotone" dataKey={b.name} stroke={COLORS[i]} strokeWidth={2} dot={{r:3}}/>)}
          <Legend wrapperStyle={{ paddingTop: 24 }}/>
        </LineChart>
      </ResponsiveContainer>
    )}
  </SectionCard>

  <SectionCard title="Branch Revenue Heatmap" explanation="Color intensity = invoice count by hour and time period. Day view for staff scheduling, Month view for seasonal patterns.">
    <Ctrl>
      <Dropdown options={["Day","Month"]} value={heatView} onChange={setHeatView} label="View"/>
      <Dropdown options={["All Branches",...branchData["2026"].map(b=>b.name)]} value={heatBranch} onChange={setHeatBranch} label="Branch"/>
    </Ctrl>
    <div style={{overflowX:"auto"}}>
      <div style={{display:"flex",gap:2,marginBottom:4,paddingLeft:40}}>{Array.from({length:14},(_,i)=>i+9).map(h=><div key={h} style={{width:44,textAlign:"center",fontSize:11,color:C.textMuted}}>{h>12?`${h-12}PM`:`${h}AM`}</div>)}</div>
      {(() => {
        const data = heatView==="Day"?heatmapData:heatmapMonthData;
        const maxVal=Math.max(...data.map(d=>d.value)), minVal=Math.min(...data.map(d=>d.value));
        const bestIdx=data.findIndex(d=>d.value===maxVal), worstIdx=data.findIndex(d=>d.value===minVal);
        const rows=heatView==="Day"?days:months, rowKey=heatView==="Day"?"day":"month";
        let cellIdx=0;
        return (<>
          {rows.map(row => (
            <div key={row} style={{display:"flex",gap:2,alignItems:"center",marginBottom:2}}>
              <div style={{width:36,fontSize:12,color:C.textMuted,textAlign:"right",paddingRight:4}}>{row}</div>
              {data.filter(d=>d[rowKey]===row).map((d,i) => { const idx=cellIdx++; return <HeatmapCell key={i} value={d.value} highlight={idx===bestIdx?"best":idx===worstIdx?"worst":undefined}/>; })}
            </div>
          ))}
          <div style={{display:"flex",gap:16,marginTop:10,paddingLeft:40,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{fontSize:12,color:C.textMuted,display:"flex",alignItems:"center",gap:6}}><span>Low</span>{[0.1,0.3,0.5,0.7,0.9].map(v=><div key={v} style={{width:20,height:12,borderRadius:2,background:`rgba(0,0,0,${v})`}}/>)}<span>High</span></div>
            <div style={{display:"flex",gap:12,fontSize:12}}>
              <span style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:14,height:10,borderRadius:2,background:C.green}}/> Best ({maxVal})</span>
              <span style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:14,height:10,borderRadius:2,background:C.red}}/> Worst ({minVal})</span>
            </div>
          </div>
        </>);
      })()}
    </div>
  </SectionCard>

  <SectionCard title="Product Mix by Branch" explanation="Shows which product categories sell best at selected branches. Helps with inventory allocation.">
    <Ctrl>
      <Dropdown options={["2026","2025","2024"]} value={prodMixYear} onChange={setProdMixYear} label="Year"/>
      <MultiDropdown options={branchData[prodMixYear].map(b=>b.name)} selected={prodMixBranches} onChange={v=>{if(v.length>=1)setProdMixBranches(v);}} label="Select branches" max={4}/>
    </Ctrl>
    <Chips items={prodMixBranches} onRemove={n=>{if(prodMixBranches.length>1)setProdMixBranches(prodMixBranches.filter(x=>x!==n));}}/>
    {(() => {
      const shown = prodMixData[prodMixYear].filter(d=>prodMixBranches.includes(d.fullName));
      return (
        <ResponsiveContainer width="100%" height={shown.length===1?180:280}>
          <BarChart data={shown} layout={shown.length===1?"vertical":"horizontal"} margin={shown.length===1?{left:20}:{}}>
            <CartesianGrid strokeDasharray="6 6" stroke={C.border} vertical={false}/>
            {shown.length===1 ? (<>
              <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize:13,fill:C.textMuted}} tickFormatter={v=>`${v}%`}/>
              <YAxis type="category" dataKey="branch" axisLine={false} tickLine={false} tick={{fontSize:13,fill:C.textMuted}} width={130}/>
            </>) : (<>
              <XAxis dataKey="branch" axisLine={false} tickLine={false} tick={{fontSize:13,fill:C.textMuted}} angle={-20} textAnchor="end" height={50}/>
              <YAxis axisLine={false} tickLine={false} tick={{fontSize:13,fill:C.textMuted}} tickFormatter={v=>`${v}%`}/>
            </>)}
            <Tooltip content={<CTip/>}/>
            <Bar dataKey="24K" stackId="a" fill="#F4B400"/>
            <Bar dataKey="22K" stackId="a" fill="#E67700"/>
            <Bar dataKey="21K" stackId="a" fill="#4285F4"/>
            <Bar dataKey="18K" stackId="a" fill="#7C3AED"/>
            <Bar dataKey="14K" stackId="a" fill="#0891B2"/>
            <Bar dataKey="8K" stackId="a" fill="#DB2777" radius={[4,4,0,0]}/>
            <Legend wrapperStyle={{ paddingTop: 24 }}/>
          </BarChart>
        </ResponsiveContainer>
      );
    })()}
  </SectionCard>
</>)}

{/* ═══ SALESPERSON ═══ */}
{activeTab==="salespersons" && (<>
  <SectionCard title="Sales Leaderboard" explanation="Rank by different metrics — Revenue for raw output, ATV for upsell ability, Retention for relationship quality.">
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
        <thead>
          <tr style={{borderBottom:`2px solid ${C.border}`}}>
            {[{label:"Salesperson",key:null},{label:"Revenue",key:"Revenue"},{label:"ATV",key:"ATV"},{label:"Invoices",key:"Invoices"},{label:"Customers",key:"Customers"},{label:"Retention %",key:"Retention"}].map(h => (
              <th key={h.label} onClick={h.key?()=>setSpSort(h.key):undefined} style={{
                padding:"10px 12px",textAlign:"left",color:spSort===h.key?"#000":C.textMuted,fontWeight:600,fontSize:13,
                cursor:h.key?"pointer":"default",userSelect:"none",
              }}>
                {h.label}{h.key && <span style={{marginLeft:4,fontSize:10}}>{spSort===h.key?"▼":"↕"}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...spData].sort((a,b)=>spSort==="ATV"?b.atv-a.atv:spSort==="Invoices"?b.invoices-a.invoices:spSort==="Customers"?b.customers-a.customers:spSort==="Retention"?b.retention-a.retention:b.revenue-a.revenue)
          .map((sp,i) => (
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

  <SectionCard title="Head-to-Head Comparison" explanation="Compare up to 5 salespersons over time. Switch metric to see Revenue, ATV, or Invoices.">
    <Ctrl>
      <Dropdown options={["Revenue","ATV","Invoices"]} value={spMetric} onChange={setSpMetric}/>
      <MultiDropdown options={spData.map(s=>s.name)} selected={spLines} onChange={setSpLines} label="Select salesperson" max={5}/>
    </Ctrl>
    <Chips items={spLines} onRemove={n=>setSpLines(spLines.filter(x=>x!==n))} onClear={()=>setSpLines([])}/>
    <ResponsiveContainer width="100%" height={240}>
      {(() => {
        const chartData = computedH2hData.map(row => {
          const newRow={month:row.month}; spLines.forEach(name=>{newRow[name]=row[`${name}_${spMetric}`];}); return newRow;
        });
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="6 6" stroke={C.border} vertical={false}/>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:14,fill:C.textMuted}}/>
            <YAxis axisLine={false} tickLine={false} tick={{fontSize:14,fill:C.textMuted}} tickFormatter={v=>spMetric==="Revenue"?`${(v/1000).toFixed(0)}K`:v}/>
            <Tooltip content={<CTip/>}/>
            {spLines.map((name,i) => <Line key={name} type="monotone" dataKey={name} stroke={COLORS[i]} strokeWidth={2} dot={{r:3}}/>)}
            <Legend wrapperStyle={{ paddingTop: 24 }}/>
          </LineChart>
        );
      })()}
    </ResponsiveContainer>
  </SectionCard>
</>)}

{/* ═══ PRODUCTS ═══ */}
{activeTab==="products" && (<>
  <SectionCard title="Sales by Product Category" explanation="Toggle between a snapshot donut for current mix and a trend view showing shift over time.">
    <Ctrl><Dropdown options={["Donut","Trend"]} value={prodView} onChange={setProdView} label="View"/></Ctrl>
    {prodView==="Donut" ? (
      <ResponsiveContainer width="100%" height={250}><PieChart><Pie data={productMix} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value" label={({name,value})=>`${name} ${value}%`} labelLine={{stroke:C.textMuted}}>{productMix.map((_,i)=><Cell key={i} fill={COLORS[i]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>
    ) : (
      <ResponsiveContainer width="100%" height={250}><AreaChart data={productTrend} stackOffset="expand"><CartesianGrid strokeDasharray="6 6" stroke={C.border} vertical={false}/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:14,fill:C.textMuted}}/><YAxis axisLine={false} tickLine={false} tick={{fontSize:14,fill:C.textMuted}} tickFormatter={v=>`${Math.round(v*100)}%`}/><Tooltip content={<CTip/>}/>{["24K","22K","21K","18K","14K","8K"].map((k,i)=><Area key={k} type="monotone" dataKey={k} stackId="1" fill={COLORS[i]} stroke={COLORS[i]} fillOpacity={0.8}/>)}<Legend wrapperStyle={{ paddingTop: 24 }}/></AreaChart></ResponsiveContainer>
    )}
  </SectionCard>

  <SectionCard title="Avg Selling Price Per Gram" explanation="Your selling price vs gold spot price. Toggle spot price overlay.">
    <Ctrl><Dropdown options={["Show","Hide"]} value={spotOverlay} onChange={setSpotOverlay} label="Spot Price"/></Ctrl>
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={pricePerGram}>
        <CartesianGrid strokeDasharray="6 6" stroke={C.border} vertical={false}/>
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:14,fill:C.textMuted}}/>
        <YAxis axisLine={false} tickLine={false} tick={{fontSize:14,fill:C.textMuted}}/>
        <Tooltip content={<CTip/>}/>
        <Line type="monotone" dataKey="sellingPrice" stroke="#000" strokeWidth={2} name="Your Price/g" dot={{r:3}}/>
        {spotOverlay==="Show" && <Line type="monotone" dataKey="spotPrice" stroke={C.textMuted} strokeWidth={2} strokeDasharray="5 3" name="Spot Price/g" dot={false}/>}
        <Legend wrapperStyle={{ paddingTop: 24 }}/>
      </LineChart>
    </ResponsiveContainer>
  </SectionCard>

  <SectionCard title="Weight Sold Trends" explanation="Tracks gold weight sold separately from revenue.">
    <Ctrl><Dropdown options={["Grams","Troy Oz"]} value={weightUnit} onChange={setWeightUnit} label="Unit"/></Ctrl>
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={weightTrend}>
        <defs><linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.green} stopOpacity={0.2}/><stop offset="100%" stopColor={C.green} stopOpacity={0.02}/></linearGradient></defs>
        <CartesianGrid strokeDasharray="6 6" stroke={C.border} vertical={false}/>
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:14,fill:C.textMuted}}/>
        <YAxis axisLine={false} tickLine={false} tick={{fontSize:14,fill:C.textMuted}} tickFormatter={v=>weightUnit==="Troy Oz"?`${(v/31.1).toFixed(0)} oz`:`${v}g`}/>
        <Tooltip content={<CTip/>}/>
        <Area type="monotone" dataKey="grams" fill="url(#wGrad)" stroke={C.green} strokeWidth={2} name={`Weight (${weightUnit})`}/>
      </AreaChart>
    </ResponsiveContainer>
  </SectionCard>
</>)}

{/* ═══ CUSTOMERS ═══ */}
{activeTab==="customers" && (<>
  <SectionCard title="Customer Acquisition Trend" explanation="View new customers with cumulative total, or just new customers for cleaner analysis.">
    <Ctrl><Dropdown options={["New + Cumulative","New Only"]} value={custView} onChange={setCustView} label="View"/></Ctrl>
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={customerAcq}>
        <CartesianGrid strokeDasharray="6 6" stroke={C.border} vertical={false}/>
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:14,fill:C.textMuted}}/>
        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize:14,fill:C.textMuted}}/>
        {custView==="New + Cumulative" && <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize:14,fill:C.orange}}/>}
        <Tooltip content={<CTip/>}/>
        <Bar yAxisId="left" dataKey="newCustomers" fill="#000" radius={[4,4,0,0]} name="New Customers"/>
        {custView==="New + Cumulative" && <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke={C.orange} strokeWidth={2} dot={false} name="Cumulative Total"/>}
        <Legend wrapperStyle={{ paddingTop: 24 }}/>
      </ComposedChart>
    </ResponsiveContainer>
  </SectionCard>

  <SectionCard title="Tier Distribution & Movement" explanation="Customer distribution across loyalty tiers. Near tier-up section highlights campaign targets.">
    <div style={{display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
      <ResponsiveContainer width="45%" height={220}><PieChart><Pie data={tierData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value" label={({name,count})=>`${name} (${count})`} labelLine={{stroke:C.textMuted}}>{tierData.map((_,i)=><Cell key={i} fill={["#333","#a0a0a0","#000",C.purple][i]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>
      <div style={{flex:1,minWidth:200}}>
        <div style={{fontSize:14,color:C.textMuted,fontWeight:600,marginBottom:10}}>Near Tier-Up (Campaign Targets)</div>
        {[{tier:"Bronze → Silver",count:340,pct:15},{tier:"Silver → Gold",count:180,pct:12},{tier:"Gold → Platinum",count:65,pct:7}].map((t,i)=>(
          <div key={i} style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:3}}><span>{t.tier}</span><span style={{fontWeight:600}}>{t.count} customers</span></div>
            <div style={{height:6,background:C.border,borderRadius:3}}><div style={{height:"100%",width:`${t.pct*5}%`,background:"#000",borderRadius:3}}/></div>
          </div>
        ))}
      </div>
    </div>
  </SectionCard>

  <SectionCard title="Customer Lifetime Value (CLV)" explanation="CLV distribution — the long tail of high-CLV customers drives disproportionate revenue.">
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={clvDistribution}>
        <CartesianGrid strokeDasharray="6 6" stroke={C.border} vertical={false}/>
        <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{fontSize:13,fill:C.textMuted}}/>
        <YAxis axisLine={false} tickLine={false} tick={{fontSize:13,fill:C.textMuted}}/>
        <Tooltip content={<CTip/>}/>
        <Bar dataKey="count" fill="#000" radius={[4,4,0,0]} name="Customer Count"/>
      </BarChart>
    </ResponsiveContainer>
  </SectionCard>

  <SectionCard title="Repeat Purchase / Retention Curve" explanation="Filter by tier to focus on specific customer segments or view all together.">
    <Ctrl><Dropdown options={["All Tiers","Gold","Silver","Bronze"]} value={retTier} onChange={setRetTier} label="Tier"/></Ctrl>
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={retentionCurve}>
        <CartesianGrid strokeDasharray="6 6" stroke={C.border} vertical={false}/>
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:14,fill:C.textMuted}}/>
        <YAxis axisLine={false} tickLine={false} tick={{fontSize:14,fill:C.textMuted}} tickFormatter={v=>`${v}%`}/>
        <Tooltip content={<CTip/>}/>
        {(retTier==="All Tiers"||retTier==="Gold") && <Line type="monotone" dataKey="gold" stroke="#000" strokeWidth={2} name="Gold Tier" dot={{r:3}}/>}
        {(retTier==="All Tiers"||retTier==="Silver") && <Line type="monotone" dataKey="silver" stroke="#a0a0a0" strokeWidth={2} name="Silver Tier" dot={{r:3}}/>}
        {(retTier==="All Tiers"||retTier==="Bronze") && <Line type="monotone" dataKey="bronze" stroke="#555" strokeWidth={2} name="Bronze Tier" dot={{r:3}}/>}
        {retTier==="All Tiers" && <Line type="monotone" dataKey="all" stroke={C.textMuted} strokeWidth={1.5} strokeDasharray="5 3" name="All Customers" dot={false}/>}
        <Legend wrapperStyle={{ paddingTop: 24 }}/>
      </LineChart>
    </ResponsiveContainer>
  </SectionCard>
</>)}

{/* ═══ OPERATIONS ═══ */}
{activeTab==="operations" && (<>
  <SectionCard title="Cancellation Analysis" explanation="View cancellation rate, lost revenue, or both together.">
    <Ctrl><Dropdown options={["Rate + Value","Rate Only","Value Only"]} value={cancelView} onChange={setCancelView} label="View"/></Ctrl>
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={cancelTrend}>
        <CartesianGrid strokeDasharray="6 6" stroke={C.border} vertical={false}/>
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:14,fill:C.textMuted}}/>
        {(cancelView==="Rate + Value"||cancelView==="Rate Only") && <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize:14,fill:C.red}} tickFormatter={v=>`${v}%`}/>}
        {(cancelView==="Rate + Value"||cancelView==="Value Only") && <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize:14,fill:C.textMuted}} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>}
        <Tooltip content={<CTip/>}/>
        {(cancelView==="Rate + Value"||cancelView==="Rate Only") && <Line yAxisId="left" type="monotone" dataKey="rate" stroke={C.red} strokeWidth={2} name="Cancel Rate %" dot={{r:3}}/>}
        {(cancelView==="Rate + Value"||cancelView==="Value Only") && <Bar yAxisId="right" dataKey="value" fill="#fecaca" stroke={C.red} name="Cancel Value (AED)" radius={[4,4,0,0]}/>}
        <Legend wrapperStyle={{ paddingTop: 24 }}/>
      </ComposedChart>
    </ResponsiveContainer>
  </SectionCard>

  <SectionCard title="Data Validity Tracking" explanation="Key data quality metrics. Analytics are only as good as the underlying data.">
    <div style={{background:C.bgSubtle,borderRadius:4,padding:20,display:"flex",gap:20,flexWrap:"wrap",border:`1px solid ${C.border}`}}>
      {[{label:"Data Completeness",value:"87%",color:C.green},{label:"Missing Customer",value:"4.2%",color:C.orange},{label:"Missing Payment",value:"2.8%",color:C.orange},{label:"Invalid Entries",value:"1.3%",color:C.red}].map((m,i) => (
        <div key={i} style={{flex:1,minWidth:120,textAlign:"center"}}><div style={{fontSize:18,fontWeight:700,color:m.color}}>{m.value}</div><div style={{fontSize:13,color:C.textMuted,marginTop:4}}>{m.label}</div></div>
      ))}
    </div>
  </SectionCard>

  <SectionCard title="Alerts & Anomaly Detection" explanation="Backend job runs daily to detect anomalies and surface them on the dashboard.">
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {[{type:"critical",msg:"Revenue anomaly: Gold Souk dropped 35% vs 7-day average",time:"2h ago"},{type:"warning",msg:"Inactive branch: Ajman — no invoices in 48 hours",time:"6h ago"},{type:"warning",msg:"Churn risk: 23 Gold-tier customers exceeded avg interval by 2x",time:"1d ago"},{type:"critical",msg:"Points anomaly: Negative redemption balance (-91 pts)",time:"3d ago"}].map((a,i) => (
        <div key={i} style={{background:C.bgSubtle,borderRadius:4,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderLeft:`3px solid ${a.type==="critical"?C.red:C.orange}`,border:`1px solid ${C.border}`,borderLeftWidth:3,borderLeftColor:a.type==="critical"?C.red:C.orange}}>
          <div style={{fontSize:14}}>{a.msg}</div>
          <div style={{fontSize:13,color:C.textMuted,whiteSpace:"nowrap",marginLeft:12}}>{a.time}</div>
        </div>
      ))}
    </div>
  </SectionCard>
</>)}

{/* ═══ CAMPAIGNS ═══ */}
{activeTab==="campaigns" && (<>
  <SectionCard title="Campaign Performance Summary" explanation="Key metrics for each campaign — Revenue Lift, New Customers, ROI, and Cost Per Acquisition.">
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
        <thead>
          <tr style={{borderBottom:`2px solid ${C.border}`}}>
            {["Campaign","Revenue Lift %","New Customers","ROI %","CPA (AED)"].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",color:C.textMuted,fontWeight:600,fontSize:13}}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {campaignData.map((c,i)=>(
            <tr key={i} style={{borderBottom:`1px solid ${C.border}`}}>
              <td style={{padding:"10px 12px",fontWeight:500}}>{c.name}</td>
              <td style={{padding:"10px 12px",color:C.green,fontWeight:600}}>+{c.lift}%</td>
              <td style={{padding:"10px 12px"}}>{c.newCust}</td>
              <td style={{padding:"10px 12px",color:C.green}}>{c.roi}%</td>
              <td style={{padding:"10px 12px"}}>AED {c.cpa}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </SectionCard>

  <SectionCard title="Before / After Comparison" explanation="Revenue before, during, and after a campaign. A dip 'after' suggests demand was pulled forward.">
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={[{period:"4 Weeks Before",revenue:180000},{period:"During Campaign",revenue:245000},{period:"4 Weeks After",revenue:165000}]}>
        <CartesianGrid strokeDasharray="6 6" stroke={C.border} vertical={false}/>
        <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fontSize:14,fill:C.textMuted}}/>
        <YAxis axisLine={false} tickLine={false} tick={{fontSize:14,fill:C.textMuted}} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
        <Tooltip content={<CTip/>}/>
        <Bar dataKey="revenue" radius={[4,4,0,0]} name="Revenue (AED)">{["#d8d8d8","#000","#a0a0a0"].map((c,i)=><Cell key={i} fill={c}/>)}</Bar>
      </BarChart>
    </ResponsiveContainer>
  </SectionCard>

  <SectionCard title="Campaign Reach & Customer Journey" explanation="Campaign Reach by Branch and Customer Journey tracking both require a campaign attribution system.">
    <div style={{height:120,background:C.bgSubtle,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",border:`1px dashed ${C.border}`}}>
      <div style={{textAlign:"center"}}><div style={{color:C.textMuted,fontSize:14,fontWeight:500}}>Requires: Campaign Attribution System</div><div style={{color:C.textMuted,fontSize:13,marginTop:4}}>Link campaigns → invoices → customers for long-term tracking</div></div>
    </div>
  </SectionCard>
</>)}

      </div>
      </div>
    </div>
  );
}
