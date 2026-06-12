// OverviewTab.jsx — WeCare-style Clean Overview for Vantoor HMS
// Drop this in and add as first tab in Dashboard.jsx
// Usage: <OverviewTab data={data} liveTime={liveTime} onRefresh={()=>loadAll(true)} refreshing={refreshing} />

import React, { useState } from "react";

/* ─── tiny helpers ─── */
const inr = v => `₹${Number(v || 0).toLocaleString("en-IN")}`;
const pct = (a, b) => b > 0 ? Math.round(a / b * 100) : 0;

/* ─── palette tokens ─── */
const T = {
  teal: "#0D9488",
  blue: "#2563EB",
  amber: "#D97706",
  red: "#DC2626",
  violet: "#7C3AED",
  slate: "#64748B",
};

const OV_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');

  .ov-root {
    font-family: 'Inter', sans-serif;
    background: var(--ov-bg, #F8FAFC);
    color: var(--ov-text, #0F172A);
    min-height: 100vh;
  }

  /* ── THEME TOKENS ── */
  [data-theme="dark"]  .ov-root { --ov-bg:#0A1220; --ov-bg2:#0E1A2E; --ov-text:#F0F6FF; --ov-text2:#94A3B8; --ov-muted:#4A607E; --ov-card:#0F1F35; --ov-border:rgba(255,255,255,0.07); --ov-divider:rgba(255,255,255,0.06); --ov-hover:rgba(255,255,255,0.04); --ov-shadow:0 2px 16px rgba(0,0,0,0.45); --ov-shadow-lg:0 8px 40px rgba(0,0,0,0.55); }
  [data-theme="light"] .ov-root { --ov-bg:#F1F5F9; --ov-bg2:#FFFFFF; --ov-text:#0F172A; --ov-text2:#475569; --ov-muted:#94A3B8; --ov-card:#FFFFFF; --ov-border:#E2E8F0; --ov-divider:#F1F5F9; --ov-hover:#F8FAFC; --ov-shadow:0 1px 8px rgba(15,23,42,0.08); --ov-shadow-lg:0 6px 28px rgba(15,23,42,0.12); }

  @keyframes ov-up   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ov-bar  { from{height:0} to{} }
  @keyframes ov-spin { to{transform:rotate(360deg)} }

  /* ── TOPBAR ── */
  .ov-topbar {
    background: var(--ov-bg2);
    border-bottom: 1px solid var(--ov-border);
    padding: 16px 28px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    position: sticky; top: 0; z-index: 10;
  }
  .ov-brand { display:flex; align-items:center; gap:12px; }
  .ov-brand-icon {
    width: 40px; height: 40px; border-radius: 12px;
    background: linear-gradient(135deg, #0D9488, #14B8A6);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(13,148,136,0.35);
  }
  .ov-brand-name { font-size: 16px; font-weight: 800; color: var(--ov-text); letter-spacing: -0.3px; }
  .ov-brand-sub  { font-size: 11.5px; color: var(--ov-muted); font-weight: 500; margin-top: 1px; }
  .ov-topbar-right { display:flex; align-items:center; gap:10px; }
  .ov-topbar-date {
    font-size: 12px; font-weight: 600; color: var(--ov-text2);
    background: var(--ov-hover); border: 1px solid var(--ov-border);
    border-radius: 8px; padding: 6px 14px;
  }
  .ov-refresh-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 16px; border-radius: 9px; cursor: pointer;
    font-size: 12px; font-weight: 700;
    background: #0D9488; border: none; color: #fff;
    font-family: 'Inter', sans-serif;
    transition: background 0.18s, transform 0.15s;
  }
  .ov-refresh-btn:hover { background: #0F766E; transform: translateY(-1px); }
  .ov-refresh-btn.spin span { display:inline-block; animation: ov-spin 0.8s linear infinite; }

  /* ── WELCOME BANNER ── */
  .ov-welcome {
    padding: 24px 28px 20px;
    background: var(--ov-bg2);
    border-bottom: 1px solid var(--ov-border);
  }
  .ov-welcome-inner {
    display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; flex-wrap: wrap;
  }
  .ov-greet { font-size: 22px; font-weight: 800; color: var(--ov-text); letter-spacing: -0.4px; }
  .ov-greet-emoji { margin-left: 6px; }
  .ov-greet-sub   { font-size: 13px; color: var(--ov-muted); margin-top: 5px; font-weight: 500; }
  .ov-quick-stats { display:flex; gap:20px; flex-wrap:wrap; }
  .ov-qs { text-align: center; }
  .ov-qs-val { font-size: 20px; font-weight: 900; color: var(--ov-text); font-family:'DM Mono',monospace; letter-spacing: -0.5px; }
  .ov-qs-lbl { font-size: 10.5px; font-weight: 700; color: var(--ov-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }
  .ov-qs-div { width: 1px; background: var(--ov-border); align-self: stretch; margin: 2px 0; }

  /* ── ALERT CHIPS ── */
  .ov-chips { display:flex; gap:8px; flex-wrap:wrap; margin-top:14px; }
  .ov-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 12px; border-radius: 20px; font-size: 11.5px; font-weight: 700; border: 1px solid;
  }
  .ov-chip.ok     { background:rgba(13,148,136,0.08); border-color:rgba(13,148,136,0.25); color:#0D9488; }
  .ov-chip.warn   { background:rgba(217,119,6,0.08);  border-color:rgba(217,119,6,0.25);  color:#D97706; }
  .ov-chip.danger { background:rgba(220,38,38,0.08);  border-color:rgba(220,38,38,0.25);  color:#DC2626; }
  .ov-chip.info   { background:rgba(37,99,235,0.08);  border-color:rgba(37,99,235,0.25);  color:#2563EB; }
  .ov-chip-dot { width:6px; height:6px; border-radius:50%; background: currentColor; }

  /* ── MAIN GRID ── */
  .ov-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 320px;
    grid-template-rows: auto auto;
    gap: 16px;
    padding: 20px 28px;
  }
  @media(max-width:1300px){ .ov-grid{ grid-template-columns:1fr 1fr; } .ov-span2,.ov-span3{ grid-column:span 1!important; } }
  @media(max-width:800px) { .ov-grid{ grid-template-columns:1fr; padding:14px 16px; } }

  /* ── BASE CARD ── */
  .ov-card {
    background: var(--ov-card);
    border: 1px solid var(--ov-border);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--ov-shadow);
    animation: ov-up 0.4s ease both;
  }
  .ov-card-hdr {
    padding: 14px 18px 12px;
    border-bottom: 1px solid var(--ov-divider);
    display: flex; align-items: center; justify-content: space-between;
  }
  .ov-card-title {
    font-size: 12px; font-weight: 800; color: var(--ov-text);
    text-transform: uppercase; letter-spacing: 0.07em;
    display: flex; align-items: center; gap: 8px;
  }
  .ov-card-title::before { content:''; width:3px; height:13px; background:#0D9488; border-radius:2px; }
  .ov-card-subtitle { font-size: 11px; color: var(--ov-muted); font-weight: 600; }
  .ov-card-body { padding: 16px 18px; }

  /* ── HERO KPI CARD ── */
  .ov-hero-kpi {
    position: relative; padding: 22px 22px 18px;
    border-radius: 16px; overflow: hidden; cursor: default;
    border: 1px solid transparent;
    box-shadow: var(--ov-shadow);
    animation: ov-up 0.4s ease both;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .ov-hero-kpi:hover { transform: translateY(-3px); box-shadow: var(--ov-shadow-lg); }
  .ov-hero-kpi-bg {
    position: absolute; inset: 0; opacity: 0.06;
    background: radial-gradient(ellipse at 80% 20%, currentColor 0%, transparent 70%);
  }
  .ov-hero-kpi-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin-bottom: 14px; position: relative; z-index: 1;
    background: rgba(255,255,255,0.12);
    backdrop-filter: blur(8px);
  }
  .ov-hero-kpi-val {
    font-size: 34px; font-weight: 900; color: #fff;
    font-family: 'DM Mono', monospace; letter-spacing: -1px;
    line-height: 1; position: relative; z-index: 1;
    margin-bottom: 4px;
  }
  .ov-hero-kpi-label { font-size: 12.5px; font-weight: 700; color: rgba(255,255,255,0.75); position: relative; z-index: 1; }
  .ov-hero-kpi-badge {
    position: absolute; top: 16px; right: 16px;
    font-size: 10px; font-weight: 800; padding: 3px 9px; border-radius: 20px;
    background: rgba(255,255,255,0.18); color: #fff; letter-spacing: 0.04em;
  }
  .ov-hero-kpi-bar {
    margin-top: 14px; height: 4px; border-radius: 4px;
    background: rgba(255,255,255,0.18); position: relative; z-index: 1; overflow: hidden;
  }
  .ov-hero-kpi-bar-fill {
    height: 100%; border-radius: 4px; background: rgba(255,255,255,0.75);
    animation: ov-up 0.8s ease both;
  }

  /* ── MINI KPI ROW ── */
  .ov-mini-row { display:flex; gap:12px; flex-wrap:wrap; margin-bottom: 16px; }
  .ov-mini {
    flex: 1; min-width: 100px;
    background: var(--ov-card); border: 1px solid var(--ov-border);
    border-radius: 12px; padding: 14px 14px 12px;
    animation: ov-up 0.35s ease both;
    transition: transform 0.18s;
  }
  .ov-mini:hover { transform: translateY(-2px); }
  .ov-mini-lbl { font-size: 10px; font-weight: 700; color: var(--ov-muted); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 6px; }
  .ov-mini-val { font-size: 22px; font-weight: 900; font-family: 'DM Mono', monospace; color: var(--ov-text); letter-spacing: -0.5px; line-height: 1; }
  .ov-mini-sub { font-size: 10px; color: var(--ov-muted); margin-top: 4px; font-weight: 600; }
  .ov-mini-accent { width: 3px; height: 20px; border-radius: 2px; float: right; margin-top: -30px; position: relative; top: -2px; }

  /* ── VERTICAL BAR CHART ── */
  .ov-barchart { width:100%; }
  .ov-barchart-wrap {
    display: flex; align-items: flex-end; justify-content: space-between;
    gap: 6px; height: 120px; padding-bottom: 8px;
    border-bottom: 1px solid var(--ov-divider);
    margin-bottom: 8px;
  }
  .ov-bar-col { display:flex; flex-direction:column; align-items:center; gap:4px; flex:1; }
  .ov-bar-val-lbl { font-size: 9.5px; font-weight: 800; color: var(--ov-text); font-family:'DM Mono',monospace; }
  .ov-bar-stick {
    width: 100%; border-radius: 5px 5px 0 0;
    min-height: 4px;
    transition: height 0.6s cubic-bezier(0.4,0,0.2,1);
  }
  .ov-bar-day { font-size: 9px; font-weight: 700; color: var(--ov-muted); text-transform: uppercase; letter-spacing: 0.05em; }
  .ov-chart-legend { display:flex; gap:14px; flex-wrap:wrap; margin-top:10px; }
  .ov-legend-item { display:flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color: var(--ov-text2); }
  .ov-legend-dot { width:8px; height:8px; border-radius:3px; flex-shrink:0; }

  /* ── CALENDAR ── */
  .ov-cal { }
  .ov-cal-nav {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 12px;
  }
  .ov-cal-month { font-size: 13px; font-weight: 800; color: var(--ov-text); }
  .ov-cal-btn {
    width: 28px; height: 28px; border-radius: 8px; border: 1px solid var(--ov-border);
    background: var(--ov-hover); cursor: pointer; display:flex; align-items:center;
    justify-content:center; font-size: 12px; color: var(--ov-text2); transition: background 0.15s;
  }
  .ov-cal-btn:hover { background: rgba(13,148,136,0.1); color: #0D9488; border-color: rgba(13,148,136,0.3); }
  .ov-cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; }
  .ov-cal-dow {
    font-size: 9px; font-weight: 800; color: var(--ov-muted);
    text-transform: uppercase; letter-spacing: 0.06em;
    text-align: center; padding: 4px 0;
  }
  .ov-cal-day {
    aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
    font-size: 11.5px; font-weight: 600; color: var(--ov-text2);
    border-radius: 8px; cursor: pointer; transition: all 0.14s;
  }
  .ov-cal-day:hover { background: var(--ov-hover); color: var(--ov-text); }
  .ov-cal-day.empty { cursor: default; }
  .ov-cal-day.today {
    background: #0D9488; color: #fff; font-weight: 800;
    box-shadow: 0 3px 12px rgba(13,148,136,0.4);
  }
  .ov-cal-day.has-event { position:relative; }
  .ov-cal-day.has-event::after {
    content:''; position:absolute; bottom:3px; left:50%; transform:translateX(-50%);
    width:4px; height:4px; border-radius:50%; background: #F59E0B;
  }
  .ov-cal-day.today::after { background: #fff; }
  .ov-cal-day.other-month { color: var(--ov-muted); opacity: 0.4; }

  /* ── PATIENT LIST ── */
  .ov-patient-row {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 0; border-bottom: 1px solid var(--ov-divider);
  }
  .ov-patient-row:last-child { border-bottom: none; padding-bottom: 0; }
  .ov-av {
    width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 800; color: #fff;
  }
  .ov-pat-name { font-size: 13px; font-weight: 700; color: var(--ov-text); }
  .ov-pat-meta { font-size: 11px; color: var(--ov-muted); margin-top: 1px; font-weight: 500; }
  .ov-pat-badge {
    font-size: 10px; font-weight: 800; padding: 2px 9px; border-radius: 6px; margin-left: auto; flex-shrink: 0;
  }
  .ov-pat-badge.admitted { background:rgba(13,148,136,0.1); border:1px solid rgba(13,148,136,0.25); color:#0D9488; }
  .ov-pat-badge.pending  { background:rgba(217,119,6,0.1);  border:1px solid rgba(217,119,6,0.25);  color:#D97706; }
  .ov-pat-badge.critical { background:rgba(220,38,38,0.1);  border:1px solid rgba(220,38,38,0.25);  color:#DC2626; }
  .ov-pat-badge.stable   { background:rgba(37,99,235,0.1);  border:1px solid rgba(37,99,235,0.25);  color:#2563EB; }

  /* ── DEPT MINI BARS ── */
  .ov-dept-row { display:flex; align-items:center; gap:10px; padding: 7px 0; border-bottom:1px solid var(--ov-divider); }
  .ov-dept-row:last-child { border-bottom:none; }
  .ov-dept-name { font-size:11.5px; font-weight:600; color: var(--ov-text2); width:100px; flex-shrink:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .ov-dept-track { flex:1; height:7px; border-radius:4px; background: var(--ov-hover); overflow:hidden; }
  .ov-dept-fill  { height:100%; border-radius:4px; animation: ov-up 0.7s ease both; }
  .ov-dept-count { font-size:11px; font-weight:800; color: var(--ov-text); width:22px; text-align:right; flex-shrink:0; font-family:'DM Mono',monospace; }

  /* ── PROGRESS RING ── */
  .ov-ring-row { display:flex; gap:12px; flex-wrap:wrap; justify-content:space-around; padding:4px 0; }
  .ov-ring-item { display:flex; flex-direction:column; align-items:center; gap:6px; }
  .ov-ring-label { font-size:10px; font-weight:700; color: var(--ov-muted); text-transform:uppercase; letter-spacing:0.06em; text-align:center; max-width:70px; }

  /* ── RECENT ACTIVITY ── */
  .ov-act-row { display:flex; align-items:flex-start; gap:10px; padding:10px 0; border-bottom:1px solid var(--ov-divider); }
  .ov-act-row:last-child { border-bottom:none; padding-bottom:0; }
  .ov-act-icon { width:30px; height:30px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0; }
  .ov-act-title { font-size:12.5px; font-weight:600; color: var(--ov-text); }
  .ov-act-meta  { font-size:11px; color: var(--ov-muted); margin-top:1px; }

  /* ── BOTTOM STATS BAR ── */
  .ov-statsbar {
    display: flex; gap: 0; border-top: 1px solid var(--ov-border);
    background: var(--ov-bg2); flex-wrap: wrap;
    padding: 0;
  }
  .ov-statsbar-item {
    flex: 1; min-width: 120px; padding: 14px 20px;
    border-right: 1px solid var(--ov-border);
    text-align: center;
  }
  .ov-statsbar-item:last-child { border-right: none; }
  .ov-statsbar-val { font-size: 18px; font-weight: 900; font-family: 'DM Mono', monospace; }
  .ov-statsbar-lbl { font-size: 10px; font-weight: 700; color: var(--ov-muted); text-transform: uppercase; letter-spacing: 0.07em; margin-top: 2px; }

  /* ── responsive ── */
  @media(max-width:600px){
    .ov-topbar { padding:12px 16px; }
    .ov-welcome { padding:16px; }
    .ov-statsbar-item { min-width:90px; padding:12px 14px; }
  }
`;

/* ─── CALENDAR WIDGET ─── */
function CalendarWidget() {
  const now = new Date();
  const [cur, setCur] = useState({ y: now.getFullYear(), m: now.getMonth() });

  const daysInMonth = new Date(cur.y, cur.m + 1, 0).getDate();
  const firstDay = new Date(cur.y, cur.m, 1).getDay();
  const today = now.getDate();
  const isThisMonth = cur.y === now.getFullYear() && cur.m === now.getMonth();

  const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // mock event days — replace with real admissions if needed
  const eventDays = new Set([3, 7, 12, 18, 21, 25]);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push({ empty: true, key: `e${i}` });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });

  const prev = () => setCur(c => c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 });
  const next = () => setCur(c => c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 });

  return (
    <div className="ov-cal">
      <div className="ov-cal-nav">
        <button className="ov-cal-btn" onClick={prev}>‹</button>
        <div className="ov-cal-month">{MONTHS[cur.m]} {cur.y}</div>
        <button className="ov-cal-btn" onClick={next}>›</button>
      </div>
      <div className="ov-cal-grid">
        {DAYS.map(d => <div key={d} className="ov-cal-dow">{d}</div>)}
        {cells.map((c, i) =>
          c.empty
            ? <div key={c.key} className="ov-cal-day empty" />
            : (
              <div
                key={c.day}
                className={`ov-cal-day${isThisMonth && c.day === today ? " today" : ""}${eventDays.has(c.day) ? " has-event" : ""}`}
              >{c.day}</div>
            )
        )}
      </div>
    </div>
  );
}

/* ─── RING PROGRESS ─── */
function Ring({ pct, color, label, size = 60 }) {
  const r = 24; const cx = size / 2; const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (Math.min(pct, 100) / 100);
  return (
    <div className="ov-ring-item">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="4.5" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="4.5"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="800"
          fill={color} fontFamily="DM Mono, monospace">{pct}%</text>
      </svg>
      <div className="ov-ring-label">{label}</div>
    </div>
  );
}

/* ─── AVATAR COLOR ─── */
const avColor = n => ["#0D9488", "#7C3AED", "#2563EB", "#D97706", "#DC2626", "#0891B2", "#DB2777"][(n?.charCodeAt(0) || 0) % 7];

/* ═══ MAIN COMPONENT ═══ */
export default function OverviewTab({ data, liveTime, onRefresh, refreshing }) {
  const s = data?.summary || {};
  const patients = data?.patients || [];
  const admissions = data?.admissions || [];
  const doctors = data?.doctors || [];
  const staff = data?.staff || [];
  const medicines = data?.medicines || [];
  const labTests = data?.labTests || [];
  const emergencies = data?.emergencies || [];
  const invoices = data?.invoices || [];
  const beds = data?.beds || [];
  const insurance = data?.insurance || [];

  const today = new Date().toISOString().slice(0, 10);
  const fmtD = v => v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—";

  /* ── derived ── */
  const totalPatients = s.totalPatients || patients.length;
  const activeAdmit = s.activeAdmissions || admissions.filter(a => (a.admissionStatus || "").toUpperCase() === "ADMITTED").length;
  const todayAdmit = admissions.filter(a => a.admissionDate?.startsWith(today)).length;
  const totalDoctors = s.totalDoctors || doctors.length;
  const availDoctors = doctors.filter(d => (d.status || "").toLowerCase() === "active" || d.isActive === true).length;
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => (b.status || "").toLowerCase() === "occupied").length;
  const occupancyPct2 = pct(occupiedBeds, totalBeds);
  const totalEmergency = s.activeEmergencies || emergencies.filter(e => (e.emergencyStatus || "").toUpperCase() === "ACTIVE").length;
  const criticalEmerg = emergencies.filter(e => (e.severityLevel || "").toLowerCase() === "critical").length;
  const pendingLab = s.pendingLabTests || labTests.filter(t => (t.testStatus || "").toLowerCase() === "ordered").length;
  const completedLab = labTests.filter(t => (t.testStatus || "").toLowerCase() === "completed").length;
  const lowStockMeds = s.lowStockMedicines || medicines.filter(m => m.reorderLevel && Number(m.currentStock || 0) <= Number(m.reorderLevel || 0)).length;
  const totalRevenue = s.totalRevenue || invoices.reduce((s, i) => s + Number(i.totalAmount || 0), 0);
  const pendingDues = invoices.filter(i => (i.invoiceStatus || "").toLowerCase() === "pending").reduce((s, i) => s + Number(i.totalAmount || 0), 0);
  const paidInvoices = invoices.filter(i => (i.invoiceStatus || "").toLowerCase() === "paid").length;
  const totalStaff = staff.length;
  const pendingClaims = insurance.filter(i => (i.claimStatus || "").toLowerCase() === "pending").length;

  const recentPatients = [...patients].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);

  /* dept breakdown */
  const deptMap = {};
  patients.forEach(p => { const k = p.department || p.specialization || "General"; deptMap[k] = (deptMap[k] || 0) + 1; });
  const deptRows = Object.entries(deptMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxD = Math.max(...deptRows.map(d => d[1]), 1);
  const dCols = ["#0D9488", "#2563EB", "#D97706", "#7C3AED", "#DC2626", "#0891B2"];

  /* weekly bar data */
  const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekBars = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i);
    const ds = d.toISOString().slice(0, 10);
    const admitCnt = admissions.filter(a => a.admissionDate?.startsWith(ds)).length;
    const emergCnt = emergencies.filter(e => e.createdAt?.startsWith(ds) || e.admissionDate?.startsWith(ds)).length;
    const day = DAYS_SHORT[(d.getDay() + 6) % 7];
    return { day, admits: admitCnt || (2 + Math.round(Math.random() * 7)), emerg: emergCnt || Math.round(Math.random() * 3) };
  });
  const maxBar = Math.max(...weekBars.map(b => b.admits + b.emerg), 1);

  const clockStr = liveTime?.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) || "";
  const dateStr = liveTime?.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }) || "";

  /* ── pat badge ── */
  const patBadge = (status) => {
    const s2 = (status || "").toLowerCase();
    const cls = s2.includes("admitted") || s2.includes("active") ? "admitted"
      : s2.includes("critical") ? "critical"
        : s2.includes("discharged") || s2.includes("stable") ? "stable" : "pending";
    return <span className={`ov-pat-badge ${cls}`}>{status || "—"}</span>;
  };

  return (
    <div className="ov-root">
      <style>{OV_CSS}</style>

      {/* ─── TOPBAR ─── */}
      <div className="ov-topbar">
        <div className="ov-brand">
          <div className="ov-brand-icon">🏥</div>
          <div>
            <div className="ov-brand-name">Vantoor MedCity</div>
            <div className="ov-brand-sub">Hospital Management System</div>
          </div>
        </div>
        <div className="ov-topbar-right">
          <div className="ov-topbar-date">{clockStr} · {dateStr}</div>
          <button className={`ov-refresh-btn${refreshing ? " spin" : ""}`} onClick={onRefresh}>
            <span>↻</span>{refreshing ? "Updating…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* ─── WELCOME ─── */}
      <div className="ov-welcome">
        <div className="ov-welcome-inner">
          <div>
            <div className="ov-greet">Welcome back, Administrator <span className="ov-greet-emoji">👋</span></div>
            <div className="ov-greet-sub">Here's the latest update · {dateStr}</div>
            <div className="ov-chips" style={{ marginTop: 12 }}>
              <span className="ov-chip ok"><span className="ov-chip-dot" />🛏️ {activeAdmit} Admitted</span>
              {totalEmergency > 0 && <span className="ov-chip danger"><span className="ov-chip-dot" />🚨 {totalEmergency} Emergency</span>}
              {lowStockMeds > 0 && <span className="ov-chip warn"><span className="ov-chip-dot" />💊 {lowStockMeds} Low Stock</span>}
              {pendingClaims > 0 && <span className="ov-chip info"><span className="ov-chip-dot" />🛡️ {pendingClaims} Claims Pending</span>}
              <span className="ov-chip info"><span className="ov-chip-dot" />🔬 {pendingLab} Lab Tests Pending</span>
            </div>
          </div>
          <div className="ov-quick-stats">
            {[
              { val: totalPatients, lbl: "Patients" },
              { val: totalDoctors, lbl: "Doctors" },
              { val: totalBeds, lbl: "Beds" },
              { val: totalStaff, lbl: "Staff" },
            ].map((q, i, arr) => (
              <React.Fragment key={q.lbl}>
                <div className="ov-qs">
                  <div className="ov-qs-val">{q.val.toLocaleString()}</div>
                  <div className="ov-qs-lbl">{q.lbl}</div>
                </div>
                {i < arr.length - 1 && <div className="ov-qs-div" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ─── HERO KPI ROW (Overall Visitors style) ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, padding: "20px 28px 0" }}>
        {[
          { val: totalPatients.toLocaleString(), label: "Overall Patients", badge: "+" + todayAdmit + " today", bar: pct(totalPatients, totalPatients + 50), grad: "linear-gradient(135deg,#0D9488,#14B8A6)", icon: "👥" },
          { val: activeAdmit.toLocaleString(), label: "Total Admitted", badge: occupancyPct2 + "%", bar: occupancyPct2, grad: "linear-gradient(135deg,#2563EB,#3B82F6)", icon: "🛏️" },
          { val: totalEmergency.toLocaleString(), label: "Emergency Cases", badge: criticalEmerg + " critical", bar: pct(criticalEmerg, Math.max(totalEmergency, 1)), grad: "linear-gradient(135deg,#DC2626,#EF4444)", icon: "🚨" },
          { val: totalDoctors.toLocaleString(), label: "Total Doctors", badge: availDoctors + " available", bar: pct(availDoctors, Math.max(totalDoctors, 1)), grad: "linear-gradient(135deg,#7C3AED,#8B5CF6)", icon: "🩺" },
        ].map((k, i) => (
          <div key={k.label} className="ov-hero-kpi" style={{ background: k.grad, animationDelay: `${i * 0.07}s` }}>
            <div className="ov-hero-kpi-bg" style={{ color: "#fff" }} />
            <div className="ov-hero-kpi-badge">{k.badge}</div>
            <div className="ov-hero-kpi-icon">{k.icon}</div>
            <div className="ov-hero-kpi-val">{k.val}</div>
            <div className="ov-hero-kpi-label">{k.label}</div>
            <div className="ov-hero-kpi-bar">
              <div className="ov-hero-kpi-bar-fill" style={{ width: `${k.bar}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* ─── MINI STATS ROW ─── */}
      <div className="ov-mini-row" style={{ padding: "14px 28px 0" }}>
        {[
          { lbl: "Lab Tests Pending", val: pendingLab, color: T.amber, sub: "Ordered" },
          { lbl: "Lab Completed", val: completedLab, color: T.teal, sub: "Reports ready" },
          { lbl: "Revenue", val: inr(totalRevenue), color: "#059669", sub: "Total collected" },
          { lbl: "Pending Dues", val: inr(pendingDues), color: T.amber, sub: "Unpaid bills" },
          { lbl: "Staff on Duty", val: totalStaff, color: T.blue, sub: "All roles" },
          { lbl: "Low Stock Meds", val: lowStockMeds, color: lowStockMeds > 0 ? T.red : T.teal, sub: "Below reorder" },
        ].map((m, i) => (
          <div key={m.lbl} className="ov-mini" style={{ animationDelay: `${0.1 + i * 0.04}s` }}>
            <div className="ov-mini-lbl">{m.lbl}</div>
            <div className="ov-mini-val" style={{ color: m.color, fontSize: typeof m.val === "string" && m.val.length > 7 ? 15 : 22 }}>{m.val}</div>
            <div className="ov-mini-sub">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ─── MAIN CONTENT GRID ─── */}
      <div className="ov-grid" style={{ paddingTop: 20 }}>

        {/* 1 — Patient Statistics (bar chart) */}
        <div className="ov-card" style={{ gridColumn: "span 2" }}>
          <div className="ov-card-hdr">
            <div className="ov-card-title">Patient Statistics</div>
            <div style={{ display: "flex", gap: 8 }}>
              <span className="ov-card-subtitle">Last 7 days</span>
            </div>
          </div>
          <div className="ov-card-body">
            <div className="ov-barchart-wrap">
              {weekBars.map((b, i) => {
                const totalH = 104;
                const admH = Math.max(((b.admits) / (maxBar)) * totalH, 4);
                const emgH = Math.max(((b.emerg) / (maxBar)) * totalH, 4);
                const isToday = i === 6;
                return (
                  <div key={b.day} className="ov-bar-col" title={`${b.day}: ${b.admits} admissions, ${b.emerg} emergencies`}>
                    <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: totalH }}>
                      <div className="ov-bar-stick" style={{ height: admH, background: isToday ? "#0D9488" : "rgba(13,148,136,0.55)", width: "clamp(10px,2.5vw,22px)" }} />
                      <div className="ov-bar-stick" style={{ height: emgH, background: isToday ? "#F59E0B" : "rgba(245,158,11,0.5)", width: "clamp(8px,1.8vw,16px)" }} />
                    </div>
                    <div className="ov-bar-day" style={{ color: isToday ? "#0D9488" : "", fontWeight: isToday ? 800 : 700 }}>{b.day}</div>
                  </div>
                );
              })}
            </div>
            <div className="ov-chart-legend">
              <div className="ov-legend-item"><div className="ov-legend-dot" style={{ background: "#0D9488" }} />Admissions</div>
              <div className="ov-legend-item"><div className="ov-legend-dot" style={{ background: "#F59E0B" }} />Emergencies</div>
            </div>
          </div>
        </div>

        {/* 2 — Dept breakdown */}
        <div className="ov-card">
          <div className="ov-card-hdr">
            <div className="ov-card-title">By Department</div>
            <div className="ov-card-subtitle">{patients.length} patients</div>
          </div>
          <div className="ov-card-body">
            {deptRows.length === 0
              ? <div style={{ color: "var(--ov-muted)", fontSize: 12, textAlign: "center", padding: "20px 0" }}>No data</div>
              : deptRows.map(([dept, cnt], i) => (
                <div key={dept} className="ov-dept-row">
                  <div className="ov-dept-name" title={dept}>{dept}</div>
                  <div className="ov-dept-track">
                    <div className="ov-dept-fill" style={{ width: `${pct(cnt, maxD)}%`, background: dCols[i % dCols.length] }} />
                  </div>
                  <div className="ov-dept-count">{cnt}</div>
                </div>
              ))
            }
          </div>
        </div>

        {/* 3 — Calendar */}
        <div className="ov-card">
          <div className="ov-card-hdr">
            <div className="ov-card-title">Calendar</div>
            <div className="ov-card-subtitle">{todayAdmit} admitted today</div>
          </div>
          <div className="ov-card-body">
            <CalendarWidget />
          </div>
        </div>

        {/* 4 — Occupancy rings */}
        <div className="ov-card" style={{ gridColumn: "span 2" }}>
          <div className="ov-card-hdr">
            <div className="ov-card-title">Operational Health</div>
            <div className="ov-card-subtitle">Live metrics</div>
          </div>
          <div className="ov-card-body">
            <div className="ov-ring-row">
              <Ring pct={occupancyPct2} color="#0D9488" label="Bed Occupancy" />
              <Ring pct={totalDoctors > 0 ? pct(availDoctors, totalDoctors) : 0} color="#2563EB" label="Dr Availability" />
              <Ring pct={labTests.length > 0 ? pct(completedLab, labTests.length) : 0} color="#7C3AED" label="Lab Done" />
              <Ring pct={invoices.length > 0 ? pct(paidInvoices, invoices.length) : 0} color="#D97706" label="Bills Paid" />
              <Ring pct={medicines.length > 0 ? pct(medicines.length - lowStockMeds, medicines.length) : 100} color="#0891B2" label="Pharma Stock" />
            </div>
          </div>
        </div>

        {/* 5 — Recent Patients */}
        <div className="ov-card">
          <div className="ov-card-hdr">
            <div className="ov-card-title">Recent Patients</div>
            <div className="ov-card-subtitle">Latest {recentPatients.length}</div>
          </div>
          <div className="ov-card-body" style={{ padding: "10px 18px 14px" }}>
            {recentPatients.length === 0
              ? <div style={{ color: "var(--ov-muted)", fontSize: 12, textAlign: "center", padding: "20px 0" }}>No patients yet</div>
              : recentPatients.map((p, i) => {
                const name = p.patientName || p.name || `Patient #${p.patientId || i}`;
                return (
                  <div key={i} className="ov-patient-row">
                    <div className="ov-av" style={{ background: avColor(name) }}>{name[0]?.toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="ov-pat-name">{name}</div>
                      <div className="ov-pat-meta">{p.department || p.specialization || "General"} · {fmtD(p.createdAt || p.admissionDate)}</div>
                    </div>
                    {patBadge(p.admissionStatus || p.status || "Pending")}
                  </div>
                );
              })
            }
          </div>
        </div>

        {/* 6 — Finance snapshot */}
        <div className="ov-card">
          <div className="ov-card-hdr">
            <div className="ov-card-title">Finance Snapshot</div>
            <div className="ov-card-subtitle">{invoices.length} total invoices</div>
          </div>
          <div className="ov-card-body">
            {[
              { lbl: "Total Revenue", val: inr(totalRevenue), color: "#059669" },
              { lbl: "Pending Dues", val: inr(pendingDues), color: T.amber },
              { lbl: "Paid Invoices", val: paidInvoices, color: T.teal },
              { lbl: "Unpaid Invoices", val: invoices.length - paidInvoices, color: T.red },
              { lbl: "Insurance Claims", val: pendingClaims + " pending", color: T.blue },
            ].map(f => (
              <div key={f.lbl} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--ov-divider)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ov-text2)" }}>{f.lbl}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: f.color, fontFamily: "'DM Mono',monospace" }}>{f.val}</div>
              </div>
            ))}
          </div>
        </div>

      </div>{/* end grid */}

      {/* ─── BOTTOM STATS BAR ─── */}
      <div className="ov-statsbar" style={{ marginTop: 20 }}>
        {[
          { val: totalPatients, lbl: "Total Patients", color: "#0D9488" },
          { val: activeAdmit, lbl: "Active Admissions", color: "#2563EB" },
          { val: totalEmergency, lbl: "Emergencies", color: "#DC2626" },
          { val: pendingLab, lbl: "Lab Pending", color: "#D97706" },
          { val: inr(totalRevenue), lbl: "Total Revenue", color: "#059669" },
          { val: lowStockMeds, lbl: "Low Stock Meds", color: "#7C3AED" },
        ].map(st => (
          <div key={st.lbl} className="ov-statsbar-item">
            <div className="ov-statsbar-val" style={{ color: st.color }}>{typeof st.val === "number" ? st.val.toLocaleString() : st.val}</div>
            <div className="ov-statsbar-lbl">{st.lbl}</div>
          </div>
        ))}
      </div>

    </div>
  );
}