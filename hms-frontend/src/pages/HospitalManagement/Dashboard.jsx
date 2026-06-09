// Dashboard.jsx – Hospital Dashboard Module (Premium Redesign)
import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CircularProgress, Snackbar, Alert } from "@mui/material";
import API from "../../api/api";
import { useTheme } from "../../hooks/useTheme";

const fmt   = v => v ? new Date(v).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const fmtT  = v => v ? new Date(v).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}) : "—";
const inr   = v => v ? `₹${Number(v).toLocaleString("en-IN")}` : "—";
const avCol = s => ["#0369A1","#7C3AED","#059669","#D97706","#0891B2","#DB2777","#DC2626","#0F766E"][(s?.charCodeAt(0)||0)%8];
const av    = (s,sz=34) => {
  const c=avCol(s); const init=(s||"?")[0].toUpperCase();
  return <span style={{width:sz,height:sz,borderRadius:sz/3,background:c,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:sz*0.38,flexShrink:0}}>{init}</span>;
};

const SHARED_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── THEME TOKENS ─────────────────────────────────────────────── */
  [data-theme="dark"] .hm-app {
    --hm-bg:            #060D1A;
    --hm-bg2:           #080F1E;
    --hm-text:          #F0F6FF;
    --hm-text2:         #94A3B8;
    --hm-card-bg:       #0C1828;
    --hm-card-border:   rgba(255,255,255,0.07);
    --hm-card-border2:  rgba(255,255,255,0.12);
    --hm-input-bg:      rgba(255,255,255,0.04);
    --hm-input-border:  rgba(255,255,255,0.1);
    --hm-input-text:    #F0F6FF;
    --hm-hover:         rgba(255,255,255,0.04);
    --hm-hover2:        rgba(255,255,255,0.08);
    --hm-table-header:  rgba(0,0,0,0.2);
    --hm-table-row:     #080F1E;
    --hm-table-border:  rgba(255,255,255,0.05);
    --hm-muted:         #4A607E;
    --hm-divider:       rgba(255,255,255,0.07);
    --hm-accent:        #10B981;
    --hm-accent-soft:   rgba(16,185,129,0.12);
    --hm-shadow:        0 4px 24px rgba(0,0,0,0.5);
    --hm-shadow-lg:     0 16px 56px rgba(0,0,0,0.6);
  }
  [data-theme="light"] .hm-app {
    --hm-bg:            #F0F4FA;
    --hm-bg2:           #E8EDF6;
    --hm-text:          #0F172A;
    --hm-text2:         #475569;
    --hm-card-bg:       #FFFFFF;
    --hm-card-border:   rgba(15,23,42,0.08);
    --hm-card-border2:  rgba(15,23,42,0.14);
    --hm-input-bg:      #F8FAFC;
    --hm-input-border:  #CBD5E1;
    --hm-input-text:    #0F172A;
    --hm-hover:         rgba(15,23,42,0.03);
    --hm-hover2:        rgba(15,23,42,0.06);
    --hm-table-header:  #F8FAFC;
    --hm-table-row:     #FFFFFF;
    --hm-table-border:  #F1F5F9;
    --hm-muted:         #94A3B8;
    --hm-divider:       #E2E8F0;
    --hm-accent:        #059669;
    --hm-accent-soft:   rgba(5,150,105,0.08);
    --hm-shadow:        0 4px 20px rgba(15,23,42,0.08);
    --hm-shadow-lg:     0 16px 48px rgba(15,23,42,0.14);
  }

  /* ── BASE ─────────────────────────────────────────────────────── */
  .hm-app {
    padding: 0; margin: 0; width: 100%; max-width: 100%;
    font-family: 'Inter', sans-serif; color: var(--hm-text);
    background: var(--hm-bg); min-height: 100vh;
    transition: background 0.3s ease, color 0.3s ease;
  }

  /* ── KEYFRAMES ────────────────────────────────────────────────── */
  @keyframes hm-fade-up   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes hm-fade-in   { from{opacity:0} to{opacity:1} }
  @keyframes hm-scale-in  { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
  @keyframes hm-slide-r   { from{opacity:0;transform:translateX(8px)} to{opacity:1;transform:translateX(0)} }
  @keyframes hm-count-up  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes hm-spin      { to{transform:rotate(360deg)} }
  @keyframes hm-pulse-dot { 0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(16,185,129,0.5)} 50%{transform:scale(1.2);box-shadow:0 0 0 5px rgba(16,185,129,0)} }
  @keyframes hm-progress  { from{width:0%} }
  @keyframes hm-alert-slide { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
  @keyframes hm-badge-glow { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)} 50%{box-shadow:0 0 0 6px rgba(239,68,68,0)} }
  @keyframes hm-sparkline  { from{stroke-dashoffset:1000} to{stroke-dashoffset:0} }
  @keyframes hm-shimmer    { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes modalIn { from{opacity:0;transform:scale(0.95) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes progAnim { 0%{width:0%;margin-left:0} 50%{width:70%;margin-left:15%} 100%{width:0%;margin-left:100%} }
  @keyframes spin { to { transform:rotate(360deg); } }

  /* ── SCROLLBAR ────────────────────────────────────────────────── */
  .hm-app ::-webkit-scrollbar { width: 5px; height: 5px; }
  .hm-app ::-webkit-scrollbar-track { background: transparent; }
  .hm-app ::-webkit-scrollbar-thumb { background: var(--hm-card-border2); border-radius: 4px; }

  /* ── MOD HEADER ───────────────────────────────────────────────── */
  .mod-header {
    background: var(--hm-bg2);
    border-bottom: 1px solid var(--hm-card-border);
    padding: 14px 24px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 100;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: var(--hm-shadow);
  }
  .mod-header-left { display:flex; align-items:center; gap:14px; }
  .mod-header-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: var(--hm-accent-soft);
    border: 1px solid rgba(16,185,129,0.2);
    display: flex; align-items: center; justify-content: center; font-size: 22px;
  }
  .mod-header-title { font-size: 17px; font-weight: 800; color: var(--hm-text); letter-spacing: -0.3px; }
  .mod-header-sub   { font-size: 12px; color: var(--hm-muted); margin-top: 2px; }
  .mod-header-right { display:flex; align-items:center; gap:10px; }
  .mod-header-date  {
    background: var(--hm-hover); border: 1px solid var(--hm-card-border);
    border-radius: 8px; padding: 6px 14px;
    font-size: 12px; font-weight: 600; color: var(--hm-text2);
  }
  .mod-hdr-btn {
    background: var(--hm-hover); border: 1px solid var(--hm-card-border);
    color: var(--hm-text2); font-family: 'Inter', sans-serif;
    font-size: 12px; font-weight: 600; padding: 6px 14px;
    border-radius: 8px; cursor: pointer; transition: all 0.18s;
    display: flex; align-items: center; gap: 6px;
  }
  .mod-hdr-btn:hover { background: var(--hm-accent-soft); color: var(--hm-accent); border-color: rgba(16,185,129,0.3); }

  /* ── TAB NAV ──────────────────────────────────────────────────── */
  .hm-topnav {
    display: flex; align-items: center;
    border-bottom: 1px solid var(--hm-divider);
    background: var(--hm-bg2);
    padding: 0 20px; gap: 2px;
    overflow-x: auto; flex-wrap: nowrap;
  }
  .hm-topnav::-webkit-scrollbar { height: 3px; }
  .hm-topnav-divider { width: 1px; height: 22px; background: var(--hm-divider); margin: 0 6px; flex-shrink: 0; }
  .topnav-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 14px; font-size: 12.5px; font-weight: 600;
    color: var(--hm-muted); background: none; border: none;
    cursor: pointer; border-bottom: 2.5px solid transparent;
    transition: all 0.18s; white-space: nowrap; position: relative;
    font-family: 'Inter', sans-serif;
  }
  .topnav-btn:hover { color: var(--hm-text); background: var(--hm-hover); }
  .topnav-btn.active { color: var(--hm-accent); border-bottom-color: var(--hm-accent); }
  .topnav-btn.red-tab.active    { color: #F87171; border-bottom-color: #EF4444; }
  .topnav-btn.blue-tab.active   { color: #60A5FA; border-bottom-color: #3B82F6; }
  .topnav-btn.amber-tab.active  { color: #FBBF24; border-bottom-color: #F59E0B; }
  .tab-badge {
    font-size: 9.5px; font-weight: 800; padding: 1px 6px; border-radius: 10px;
    background: var(--hm-hover2); color: var(--hm-muted); min-width: 18px; text-align: center;
  }
  .topnav-btn.active .tab-badge  { background: var(--hm-accent-soft); color: var(--hm-accent); }

  /* ── CONTENT AREA ─────────────────────────────────────────────── */
  .hm-content { background: var(--hm-bg); }
  .tab-content-wrap { padding: 0; }

  /* ── SECTION HEADER ───────────────────────────────────────────── */
  .sec-hdr {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; border-bottom: 1px solid var(--hm-divider);
    background: var(--hm-bg2);
  }
  .sec-title-wrap { display: flex; align-items: center; gap: 10px; }
  .sec-title-icon {
    width: 28px; height: 28px; border-radius: 8px;
    background: var(--hm-accent-soft);
    border: 1px solid rgba(16,185,129,0.2);
    display: flex; align-items: center; justify-content: center; font-size: 14px;
  }
  .sec-title { font-size: 13px; font-weight: 800; color: var(--hm-text); letter-spacing: 0.01em; }
  .sec-divider {
    font-size: 10px; font-weight: 700; color: var(--hm-muted);
    text-transform: uppercase; letter-spacing: 0.09em;
    margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
  }
  .sec-divider::after { content:''; flex:1; height:1px; background: var(--hm-divider); }

  /* ── BANNER ───────────────────────────────────────────────────── */
  .hm-banner {
    border-radius: 16px; padding: 24px 28px;
    display: flex; align-items: center; justify-content: space-between;
    position: relative; overflow: hidden; margin-bottom: 12px;
    background: linear-gradient(135deg, #0A1628 0%, #0C2244 30%, #047857 65%, #065F46 100%);
    box-shadow: 0 10px 40px rgba(4,120,87,0.3);
    border: 1px solid rgba(255,255,255,0.06);
  }
  [data-theme="light"] .hm-banner {
    background: linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 50%, #059669 100%);
  }
  .hm-banner-deco { position:absolute; inset:0; border-radius:16px; overflow:hidden; pointer-events:none; }
  .hm-banner-deco::before { content:''; position:absolute; top:-50px; right:-50px; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,0.05); }
  .hm-banner-deco::after  { content:''; position:absolute; bottom:-30px; right:200px; width:120px; height:120px; border-radius:50%; background:rgba(16,185,129,0.12); }
  .hm-banner-left { display:flex; align-items:center; gap:18px; position:relative; z-index:1; }
  .hm-banner-icon { width:52px; height:52px; background:rgba(255,255,255,0.12); border-radius:14px; display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,0.2); font-size:26px; }
  .hm-banner-title { font-size:22px; font-weight:900; color:#fff; letter-spacing:-0.5px; }
  .hm-banner-sub   { font-size:13px; color:rgba(255,255,255,0.6); margin-top:3px; font-weight:500; }
  .hm-banner-date  { background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); border-radius:10px; padding:6px 16px; font-size:12px; font-weight:600; color:rgba(255,255,255,0.9); }
  .create-btn {
    background:rgba(255,255,255,0.14); border:1.5px solid rgba(255,255,255,0.25);
    color:#fff; font-family:'Inter',sans-serif; font-size:12.5px; font-weight:700;
    padding:7px 16px; border-radius:9px; cursor:pointer; transition:all 0.18s;
    display:flex; align-items:center; gap:7px;
  }
  .create-btn:hover { background:rgba(255,255,255,0.24); transform:translateY(-1px); }

  /* ── KPI SECTION HEADER ───────────────────────────────────────── */
  .kpi-section-hdr {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 20px 12px;
  }
  .kpi-section-title {
    font-size: 11px; font-weight: 800; color: var(--hm-muted);
    text-transform: uppercase; letter-spacing: 0.1em;
    display: flex; align-items: center; gap: 8px;
  }
  .kpi-section-title::before { content:''; width:3px; height:14px; background: var(--hm-accent); border-radius:2px; }

  /* ── KPI GRID ─────────────────────────────────────────────────── */
  .kpi-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(170px,1fr)); gap:14px; padding:0 20px 20px; }
  .kpi-grid.cols-6 { grid-template-columns:repeat(6,1fr); }
  .kpi {
    background: var(--hm-card-bg);
    border: 1px solid var(--hm-card-border);
    border-radius: 16px;
    padding: 18px 16px 16px;
    display: flex; align-items: flex-start; justify-content: space-between;
    cursor: default; position: relative; overflow: hidden;
    transition: transform 0.2s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s, border-color 0.2s;
  }
  .kpi::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    border-radius: 16px 16px 0 0;
    transition: opacity 0.2s;
  }
  .kpi:hover { transform:translateY(-3px); box-shadow: var(--hm-shadow-lg); border-color: var(--hm-card-border2); }
  .kpi.teal::before   { background: #10B981; }
  .kpi.green::before  { background: #34D399; }
  .kpi.blue::before   { background: #3B82F6; }
  .kpi.red::before    { background: #EF4444; }
  .kpi.amber::before  { background: #F59E0B; }
  .kpi.violet::before { background: #8B5CF6; }
  .kpi.cyan::before   { background: #06B6D4; }
  .kpi.slate::before  { background: #64748B; }
  [data-theme="light"] .kpi.teal   { border-left: 3px solid #10B981; }
  [data-theme="light"] .kpi.green  { border-left: 3px solid #34D399; }
  [data-theme="light"] .kpi.blue   { border-left: 3px solid #3B82F6; }
  [data-theme="light"] .kpi.red    { border-left: 3px solid #EF4444; }
  [data-theme="light"] .kpi.amber  { border-left: 3px solid #F59E0B; }
  [data-theme="light"] .kpi.violet { border-left: 3px solid #8B5CF6; }
  [data-theme="light"] .kpi.cyan   { border-left: 3px solid #06B6D4; }
  .kpi-icon {
    width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 18px;
    border: 1px solid var(--hm-card-border);
    transition: transform 0.2s;
  }
  .kpi:hover .kpi-icon { transform: scale(1.08); }
  .kpi.teal   .kpi-icon { background:rgba(16,185,129,0.12);  border-color:rgba(16,185,129,0.2); }
  .kpi.green  .kpi-icon { background:rgba(52,211,153,0.1);   border-color:rgba(52,211,153,0.2); }
  .kpi.blue   .kpi-icon { background:rgba(59,130,246,0.12);  border-color:rgba(59,130,246,0.2); }
  .kpi.red    .kpi-icon { background:rgba(239,68,68,0.12);   border-color:rgba(239,68,68,0.2); }
  .kpi.amber  .kpi-icon { background:rgba(245,158,11,0.12);  border-color:rgba(245,158,11,0.2); }
  .kpi.violet .kpi-icon { background:rgba(139,92,246,0.12);  border-color:rgba(139,92,246,0.2); }
  .kpi.cyan   .kpi-icon { background:rgba(6,182,212,0.12);   border-color:rgba(6,182,212,0.2); }
  .kpi.slate  .kpi-icon { background:rgba(100,116,139,0.12); border-color:rgba(100,116,139,0.2); }
  .kpi-label { font-size:10px; font-weight:700; color: var(--hm-muted); text-transform:uppercase; letter-spacing:0.07em; margin-bottom:5px; }
  .kpi-value {
    font-size:26px; font-weight:900; color: var(--hm-text);
    letter-spacing:-0.5px; line-height:1; font-family:'JetBrains Mono',monospace;
    animation: hm-count-up 0.4s ease both;
  }
  .kpi.teal   .kpi-value { color: #10B981; }
  .kpi.green  .kpi-value { color: #34D399; }
  .kpi.blue   .kpi-value { color: #60A5FA; }
  .kpi.red    .kpi-value { color: #F87171; }
  .kpi.amber  .kpi-value { color: #FBBF24; }
  .kpi.violet .kpi-value { color: #A78BFA; }
  .kpi.cyan   .kpi-value { color: #22D3EE; }
  [data-theme="light"] .kpi.teal   .kpi-value { color: #059669; }
  [data-theme="light"] .kpi.green  .kpi-value { color: #047857; }
  [data-theme="light"] .kpi.blue   .kpi-value { color: #1D4ED8; }
  [data-theme="light"] .kpi.red    .kpi-value { color: #DC2626; }
  [data-theme="light"] .kpi.amber  .kpi-value { color: #D97706; }
  [data-theme="light"] .kpi.violet .kpi-value { color: #7C3AED; }
  [data-theme="light"] .kpi.cyan   .kpi-value { color: #0891B2; }
  .kpi-sub { font-size:10.5px; color: var(--hm-muted); font-weight:500; margin-top:3px; }
  .db-card-badge { font-size:10px; font-weight:700; background: var(--hm-accent-soft); color: var(--hm-accent); padding:3px 8px; border-radius:20px; }

  /* ── TABLE ────────────────────────────────────────────────────── */
  .tbl-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; }
  thead { background: var(--hm-table-header); }
  th { font-size:10px; font-weight:800; color: var(--hm-muted); text-transform:uppercase; letter-spacing:0.08em; padding:10px 16px; text-align:left; border-bottom:1px solid var(--hm-divider); white-space:nowrap; }
  td { font-size:13px; color: var(--hm-text2); padding:11px 16px; border-bottom:1px solid var(--hm-table-border); vertical-align:middle; }
  tr:last-child td { border-bottom:none; }
  tr:hover td { background: var(--hm-hover); }
  .mono { font-family:'JetBrains Mono',monospace; font-size:11.5px; }
  .actions-cell { display:flex; gap:4px; align-items:center; }
  .name-cell { display:flex; align-items:center; gap:10px; }
  .name-text  { font-weight:700; font-size:13px; color: var(--hm-text); }
  .name-sub   { font-size:11px; color: var(--hm-muted); }
  .td-mono    { font-family:'JetBrains Mono',monospace; font-size:11px; color: var(--hm-muted); }
  .td-primary { font-weight:700; color: var(--hm-text); }
  .td-amount  { font-family:'JetBrains Mono',monospace; color:#10B981; font-weight:700; }

  /* ── BADGES ───────────────────────────────────────────────────── */
  .badge { display:inline-flex; align-items:center; gap:4px; font-size:10.5px; font-weight:700; padding:3px 9px; border-radius:20px; white-space:nowrap; }
  .badge-dot { width:5px; height:5px; border-radius:50%; }
  .badge-green  { background:rgba(16,185,129,0.1);  color:#10B981; border:1px solid rgba(16,185,129,0.25); }
  .badge-red    { background:rgba(239,68,68,0.1);   color:#F87171; border:1px solid rgba(239,68,68,0.25); }
  .badge-blue   { background:rgba(59,130,246,0.1);  color:#60A5FA; border:1px solid rgba(59,130,246,0.25); }
  .badge-amber  { background:rgba(245,158,11,0.1);  color:#FBBF24; border:1px solid rgba(245,158,11,0.25); }
  .badge-violet { background:rgba(139,92,246,0.1);  color:#A78BFA; border:1px solid rgba(139,92,246,0.25); }
  .badge-cyan   { background:rgba(6,182,212,0.1);   color:#22D3EE; border:1px solid rgba(6,182,212,0.25); }
  .badge-slate  { background: var(--hm-hover2);     color: var(--hm-text2); border:1px solid var(--hm-card-border); }
  .badge-teal   { background:rgba(16,185,129,0.08); color:#10B981; border:1px solid rgba(16,185,129,0.2); }
  [data-theme="light"] .badge-green  { background:#ECFDF5; color:#059669; border-color:#A7F3D0; }
  [data-theme="light"] .badge-red    { background:#FEF2F2; color:#DC2626; border-color:#FECACA; }
  [data-theme="light"] .badge-blue   { background:#EFF6FF; color:#1D4ED8; border-color:#BFDBFE; }
  [data-theme="light"] .badge-amber  { background:#FFFBEB; color:#D97706; border-color:#FDE68A; }
  [data-theme="light"] .badge-violet { background:#F5F3FF; color:#7C3AED; border-color:#DDD6FE; }

  /* ── EMPTY / LOADING ──────────────────────────────────────────── */
  .empty-state { text-align:center; padding:52px 20px; }
  .empty-icon-wrap { width:60px; height:60px; border-radius:14px; background: var(--hm-accent-soft); display:flex; align-items:center; justify-content:center; margin:0 auto 14px; font-size:28px; }
  .empty-title { font-size:14px; font-weight:600; color: var(--hm-muted); margin-bottom:4px; }
  .loading-state { display:flex; align-items:center; justify-content:center; gap:8px; padding:48px 20px; color: var(--hm-muted); font-size:13px; }
  .spin-anim { animation:spin 0.8s linear infinite; display:inline-flex; }

  /* ── FILTER ROW ───────────────────────────────────────────────── */
  .filter-row { display:flex; gap:6px; padding:10px 20px; border-bottom:1px solid var(--hm-divider); flex-wrap:wrap; background: var(--hm-bg2); }
  .filter-pill { font-size:11.5px; font-weight:600; padding:4px 12px; border-radius:20px; border:1.5px solid var(--hm-card-border); background: var(--hm-hover); color: var(--hm-muted); cursor:pointer; transition:all 0.15s; }
  .filter-pill:hover { border-color: var(--hm-accent); color: var(--hm-accent); }
  .filter-pill.active { background: var(--hm-accent-soft); color: var(--hm-accent); border-color: rgba(16,185,129,0.3); }

  /* ── BUTTONS ──────────────────────────────────────────────────── */
  .btn-primary { background: var(--hm-accent); color:#fff; font-family:'Inter',sans-serif; font-size:13px; font-weight:700; padding:8px 16px; border-radius:9px; border:none; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.18s; white-space:nowrap; }
  .btn-primary:hover { filter:brightness(1.1); transform:translateY(-1px); box-shadow:0 6px 20px rgba(16,185,129,0.3); }
  .btn-primary:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
  .btn-outline { background: var(--hm-hover); color: var(--hm-text2); font-family:'Inter',sans-serif; font-size:13px; font-weight:500; padding:7px 14px; border-radius:8px; border:1.5px solid var(--hm-card-border); cursor:pointer; transition:all 0.15s; }
  .btn-outline:hover { border-color: var(--hm-accent); color: var(--hm-accent); background: var(--hm-accent-soft); }
  .btn-danger-sm { background:rgba(239,68,68,0.1); color:#F87171; font-family:'Inter',sans-serif; font-size:12px; font-weight:600; padding:6px 12px; border-radius:7px; border:1px solid rgba(239,68,68,0.2); cursor:pointer; transition:all 0.15s; }
  .btn-danger-sm:hover { background:#EF4444; color:#fff; }
  .btn-icon-sm { background:none; border:none; cursor:pointer; display:flex; align-items:center; padding:5px; border-radius:7px; transition:background 0.12s; }
  .btn-icon-sm:hover { background: var(--hm-hover2); }
  .btn-icon-sm.edit:hover { background: var(--hm-accent-soft); }
  .btn-icon-sm.del:hover  { background:rgba(239,68,68,0.1); }

  /* ── SEARCH INPUT ─────────────────────────────────────────────── */
  .search-input { font-family:'Inter',sans-serif; font-size:13px; color: var(--hm-text); background: var(--hm-input-bg); border:1.5px solid var(--hm-input-border); border-radius:9px; padding:7px 12px 7px 34px; outline:none; width:200px; transition:all 0.18s; }
  .search-input:focus { border-color: var(--hm-accent); background: var(--hm-card-bg); box-shadow:0 0 0 3px var(--hm-accent-soft); }
  .search-input::placeholder { color: var(--hm-muted); }

  /* ── PROGRESS BAR ─────────────────────────────────────────────── */
  .prog-bar { height:2px; background:linear-gradient(90deg, var(--hm-accent), rgba(16,185,129,0.3)); animation:progAnim 1.2s ease-in-out infinite; }

  /* ── PREVIEW PANEL ────────────────────────────────────────────── */
  .preview-panel {
    position:fixed; top:56px; right:0; height:calc(100vh - 56px); width:360px;
    background: var(--hm-card-bg); border-left:1px solid var(--hm-card-border);
    box-shadow:-8px 0 40px rgba(0,0,0,0.2);
    display:flex; flex-direction:column; z-index:600;
    transform:translateX(100%); transition:transform 0.28s cubic-bezier(0.4,0,0.2,1);
    overflow:hidden;
  }
  .preview-panel.open { transform:translateX(0); }
  .preview-header {
    background:linear-gradient(135deg,#0A1628 0%,#065F46 55%,#047857 100%);
    padding:16px 18px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
  }
  .preview-hdr-left { display:flex; align-items:center; gap:12px; }
  .preview-name { font-size:14px; font-weight:700; color:#fff; line-height:1.3; }
  .preview-code { font-size:11px; color:rgba(255,255,255,0.55); margin-top:2px; font-family:'JetBrains Mono',monospace; }
  .preview-close { width:34px; height:34px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.12); border:1.5px solid rgba(255,255,255,0.25); color:#fff; border-radius:10px; cursor:pointer; font-size:16px; font-weight:700; transition:all 0.15s; }
  .preview-close:hover { background:rgba(239,68,68,0.7); }
  .preview-actions { display:flex; gap:8px; padding:12px 16px; border-bottom:1px solid var(--hm-divider); background: var(--hm-bg2); }
  .preview-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; font-family:'Inter',sans-serif; font-size:12px; font-weight:600; padding:8px 10px; border-radius:8px; cursor:pointer; transition:all 0.15s; border:none; }
  .preview-btn.edit { background: var(--hm-accent-soft); color: var(--hm-accent); }
  .preview-btn.edit:hover { background: var(--hm-accent); color:#fff; }
  .preview-btn.del  { background:rgba(239,68,68,0.1); color:#F87171; }
  .preview-btn.del:hover { background:#EF4444; color:#fff; }
  .preview-body { flex:1; overflow-y:auto; padding:0 0 24px; }
  .preview-section { padding:14px 18px 0; }
  .preview-section-title { font-size:10px; font-weight:800; color: var(--hm-muted); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:10px; display:flex; align-items:center; gap:6px; }
  .preview-section-title::after { content:''; flex:1; height:1px; background: var(--hm-divider); }
  .preview-row { display:flex; align-items:flex-start; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--hm-divider); gap:12px; }
  .preview-row:last-child { border-bottom:none; }
  .preview-label { font-size:11.5px; color: var(--hm-muted); font-weight:500; flex-shrink:0; min-width:110px; }
  .preview-val { font-size:12.5px; color: var(--hm-text); font-weight:600; text-align:right; line-height:1.4; }

  /* ── MODAL ────────────────────────────────────────────────────── */
  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:1000; backdrop-filter:blur(6px); padding:80px 20px 20px; overflow-y:auto; }
  .modal-box { background: var(--hm-card-bg); border:1px solid var(--hm-card-border); border-radius:20px; width:100%; box-shadow: var(--hm-shadow-lg); overflow:hidden; animation:modalIn 0.2s cubic-bezier(0.4,0,0.2,1); display:flex; flex-direction:column; max-height:calc(100vh - 100px); }
  .modal-box.sm { max-width:460px; }
  .modal-box.md { max-width:620px; }
  .modal-box.lg { max-width:820px; }
  .modal-box.xl { max-width:960px; }
  .modal-header { background:linear-gradient(135deg,#0A1628 0%,#065F46 60%,#047857 100%); padding:18px 22px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
  .modal-hdr-left  { display:flex; align-items:center; gap:12px; }
  .modal-hdr-icon  { width:38px; height:38px; background:rgba(255,255,255,0.14); border-radius:10px; display:flex; align-items:center; justify-content:center; color:#fff; border:1px solid rgba(255,255,255,0.2); font-size:18px; }
  .modal-hdr-title { font-size:14px; font-weight:800; color:#fff; }
  .modal-hdr-sub   { font-size:11px; color:rgba(255,255,255,0.55); margin-top:2px; }
  .modal-close { background:none; border:none; cursor:pointer; color:rgba(255,255,255,0.6); display:flex; padding:6px; border-radius:8px; transition:all 0.12s; font-size:18px; font-weight:700; }
  .modal-close:hover { background:rgba(255,255,255,0.12); color:#fff; }
  .modal-body   { padding:22px 24px; overflow-y:auto; background: var(--hm-bg); flex:1; }
  .modal-footer { padding:14px 22px; border-top:1px solid var(--hm-divider); display:flex; justify-content:flex-end; gap:10px; background: var(--hm-card-bg); flex-shrink:0; }

  /* ── FORM ─────────────────────────────────────────────────────── */
  .form-group { display:flex; flex-direction:column; gap:5px; }
  .form-label { font-size:11px; font-weight:700; color: var(--hm-muted); text-transform:uppercase; letter-spacing:0.05em; }
  .form-label span { color:#F87171; margin-left:3px; }
  .form-input,.form-select,.form-textarea {
    font-family:'Inter',sans-serif; font-size:13px; color: var(--hm-text);
    background: var(--hm-input-bg); border:1.5px solid var(--hm-input-border);
    border-radius:9px; padding:9px 12px; width:100%; outline:none;
    transition:border 0.15s,box-shadow 0.15s;
  }
  .form-input:focus,.form-select:focus,.form-textarea:focus { border-color: var(--hm-accent); box-shadow:0 0 0 3px var(--hm-accent-soft); }
  .form-input::placeholder,.form-textarea::placeholder { color: var(--hm-muted); }
  .form-input.error,.form-select.error { border-color:#F87171!important; }
  .form-textarea { resize:vertical; min-height:80px; }
  .field-error { font-size:10px; color:#F87171; font-weight:600; margin-top:2px; }
  select.form-select {
    appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat:no-repeat; background-position:right 10px center; padding-right:30px; cursor:pointer;
  }
  .form-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
  .form-grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; margin-bottom:14px; }
  .form-full   { margin-bottom:14px; }

  /* ── DELETE DIALOG ────────────────────────────────────────────── */
  .del-header { background:rgba(239,68,68,0.08); padding:24px; text-align:center; border-bottom:1px solid rgba(239,68,68,0.15); }
  .del-icon-wrap { width:52px; height:52px; border-radius:50%; background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.25); display:flex; align-items:center; justify-content:center; margin:0 auto 12px; font-size:24px; }
  .del-title { font-size:15px; font-weight:800; color: var(--hm-text); margin-bottom:4px; }
  .del-desc  { font-size:13px; color: var(--hm-muted); line-height:1.5; }
  .del-footer { padding:14px 20px; display:flex; gap:12px; }
  .btn-cancel { flex:1; background: var(--hm-hover); color: var(--hm-text2); font-family:'Inter',sans-serif; font-size:13px; font-weight:600; padding:9px; border-radius:9px; border:1.5px solid var(--hm-card-border); cursor:pointer; transition:all 0.15s; }
  .btn-cancel:hover { background: var(--hm-hover2); }
  .btn-del { flex:1; background:linear-gradient(135deg,#DC2626,#EF4444); color:#fff; font-family:'Inter',sans-serif; font-size:13px; font-weight:700; padding:9px; border-radius:9px; border:none; cursor:pointer; transition:all 0.15s; }
  .btn-del:hover { background:linear-gradient(135deg,#B91C1C,#DC2626); transform:translateY(-1px); }

  /* ── DASHBOARD LAYOUT ─────────────────────────────────────────── */
  .db-wrap { padding:22px; }
  .db-top-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:20px; }
  .db-bottom-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .db-card {
    background: var(--hm-card-bg); border-radius:16px;
    border:1px solid var(--hm-card-border); padding:20px;
    box-shadow: var(--hm-shadow);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .db-card:hover { transform:translateY(-2px); box-shadow: var(--hm-shadow-lg); }
  .db-card-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .db-card-title { font-size:13px; font-weight:700; color: var(--hm-text); display:flex; align-items:center; gap:8px; }

  /* ── BAR ROWS ─────────────────────────────────────────────────── */
  .bar-row { display:flex; align-items:center; gap:10px; padding:9px 0; border-bottom:1px solid var(--hm-divider); }
  .bar-row:last-child { border-bottom:none; }
  .bar-label { font-size:12px; color: var(--hm-text2); flex:1.2; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .bar-track { flex:2; height:7px; background: var(--hm-hover2); border-radius:10px; overflow:hidden; }
  .bar-fill  { height:100%; border-radius:10px; animation:hm-progress 0.8s cubic-bezier(0.4,0,0.2,1) both; }
  .bar-val   { font-size:12px; font-weight:700; color: var(--hm-text); min-width:30px; text-align:right; }
  .bar-pct   { font-size:10px; color: var(--hm-muted); min-width:34px; text-align:right; }

  /* ── STAFF ROWS ───────────────────────────────────────────────── */
  .staff-row { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid var(--hm-divider); }
  .staff-row:last-child { border-bottom:none; }
  .staff-av { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; color:#fff; flex-shrink:0; }
  .staff-name { font-size:13px; font-weight:600; color: var(--hm-text); flex:1; }
  .staff-role { font-size:11px; color: var(--hm-muted); }
  .staff-status { font-size:11px; font-weight:700; padding:3px 9px; border-radius:20px; }

  /* ── ACTIVITY FEED ────────────────────────────────────────────── */
  .activity-item { display:flex; align-items:flex-start; gap:12px; padding:10px 0; border-bottom:1px solid var(--hm-divider); }
  .activity-item:last-child { border-bottom:none; }
  .act-icon { width:32px; height:32px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }
  .act-body { flex:1; min-width:0; }
  .act-title { font-size:12.5px; font-weight:600; color: var(--hm-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .act-meta  { font-size:11px; color: var(--hm-muted); margin-top:2px; }

  /* ── DONUT WRAP ───────────────────────────────────────────────── */
  .donut-wrap { display:flex; align-items:center; gap:16px; }
  .donut-legend { display:flex; flex-direction:column; gap:10px; flex:1; }
  .donut-legend-item { display:flex; align-items:center; gap:8px; }
  .donut-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
  .donut-lbl { font-size:12px; color: var(--hm-muted); flex:1; }
  .donut-val { font-size:13px; font-weight:700; color: var(--hm-text); }
  .donut-pct { font-size:10px; color: var(--hm-muted); }

  /* ── APPT ITEMS ───────────────────────────────────────────────── */
  .appt-item { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid var(--hm-divider); }
  .appt-item:last-child { border-bottom:none; }
  .appt-time { background: var(--hm-accent-soft); border-radius:8px; padding:4px 8px; text-align:center; flex-shrink:0; min-width:50px; border:1px solid rgba(16,185,129,0.2); }
  .appt-hr   { font-size:14px; font-weight:800; color: var(--hm-accent); line-height:1; }
  .appt-min  { font-size:9px; font-weight:700; color: var(--hm-accent); text-transform:uppercase; opacity:0.7; }
  .appt-body { flex:1; min-width:0; }
  .appt-name { font-size:12.5px; font-weight:600; color: var(--hm-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .appt-meta { font-size:11px; color: var(--hm-muted); margin-top:2px; }

  /* ── SPARKLINE ────────────────────────────────────────────────── */
  .sparkline { stroke-dasharray:1000; stroke-dashoffset:1000; animation:hm-sparkline 1.5s ease forwards; }

  /* ── RESPONSIVE ───────────────────────────────────────────────── */
  @media (max-width:1200px) {
    .hm-topnav { flex-wrap: wrap; }
    .db-top-row { grid-template-columns:1fr 1fr; }
    .kpi-grid { grid-template-columns:repeat(3,1fr); }
    .kpi-grid.cols-6 { grid-template-columns:repeat(3,1fr); }
  }
  @media (max-width:900px) {
    .kpi-grid { grid-template-columns:repeat(2,1fr); }
    .kpi-grid.cols-6 { grid-template-columns:repeat(2,1fr); }
    .form-grid-2,.form-grid-3 { grid-template-columns:1fr; }
    .db-top-row { grid-template-columns:1fr; }
    .db-bottom-row { grid-template-columns:1fr; }
  }
  @media (max-width:700px) {
    .topnav-section-label { display: none; }
    .hm-topnav-divider { display: none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════
   SVG ICONS
═══════════════════════════════════════════════════════════════ */
const IcSearch = <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcPlus   = <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcX      = <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcWarn   = <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcSpin   = <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;

/* ═══════════════════════════════════════════════════════════════
   SHARED COMPONENTS
═══════════════════════════════════════════════════════════════ */
function Badge({ children, color = "slate" }) {
  return <span className={`badge badge-${color}`}>{children}</span>;
}

function StatusBadge({ value }) {
  const v = (value || "").toLowerCase();
  if (["active","admitted","available","completed","discharged","paid"].some(k=>v.includes(k)))
    return <Badge color="green"><span className="badge-dot" style={{background:"#10B981"}}/>{value}</Badge>;
  if (["critical","emergency","occupied","urgent","expired"].some(k=>v.includes(k)))
    return <Badge color="red"><span className="badge-dot" style={{background:"#F87171"}}/>{value}</Badge>;
  if (["pending","in_progress","scheduled","waiting","ordered"].some(k=>v.includes(k)))
    return <Badge color="amber">{value}</Badge>;
  if (["maintenance","reserved","stable","transferred"].some(k=>v.includes(k)))
    return <Badge color="blue">{value}</Badge>;
  if (!value) return <Badge color="slate">—</Badge>;
  return <Badge color="slate">{value}</Badge>;
}

function KpiCard({ label, value, color, icon, sub }) {
  return (
    <div className={`kpi ${color}`} style={{animation:"hm-fade-up 0.4s ease both"}}>
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value ?? "—"}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
      <div className="kpi-icon" style={{fontSize:20}}>{icon}</div>
    </div>
  );
}

function EmptyState({ msg, icon }) {
  return (
    <tr><td colSpan={20}>
      <div className="empty-state">
        <div className="empty-icon-wrap">{icon || "🏥"}</div>
        <div className="empty-title">{msg || "No records found"}</div>
      </div>
    </td></tr>
  );
}
function Loading() {
  return (
    <tr><td colSpan={20}>
      <div className="loading-state"><span className="spin-anim">{IcSpin}</span> Loading…</div>
    </td></tr>
  );
}

function FG({ label, req, children, error }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{req && <span>*</span>}</label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
function FI({ name, value, onChange, placeholder, error, type }) {
  return <input className={`form-input${error?" error":""}`} type={type||"text"} name={name} value={value||""} onChange={onChange} placeholder={placeholder||""}/>;
}
function FT({ value, onChange, placeholder, rows }) {
  return <textarea className="form-textarea" value={value||""} onChange={onChange} placeholder={placeholder||""} rows={rows||3}/>;
}
function FS({ value, onChange, options, placeholder, error }) {
  return (
    <select className={`form-select${error?" error":""}`} value={value||""} onChange={onChange}>
      <option value="">{placeholder||"Select…"}</option>
      {(options||[]).map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
    </select>
  );
}

function Modal({ open, size="md", onClose, iconEmoji, title, subtitle, children, footer }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className={`modal-box ${size}`}>
        <div className="modal-header">
          <div className="modal-hdr-left">
            <div className="modal-hdr-icon">{iconEmoji}</div>
            <div>
              <div className="modal-hdr-title">{title}</div>
              {subtitle && <div className="modal-hdr-sub">{subtitle}</div>}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>{IcX}</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function DeleteDialog({ open, onClose, onConfirm, itemName }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box sm">
        <div className="del-header">
          <div className="del-icon-wrap">{IcWarn}</div>
          <div className="del-title">Delete Record?</div>
          <div className="del-desc"><strong>"{itemName}"</strong> will be permanently removed. This cannot be undone.</div>
        </div>
        <div className="del-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-del" onClick={onConfirm}>🗑️ Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD TAB
═══════════════════════════════════════════════════════════════ */
function DashboardTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [summary, patients, admissions, doctors, staff, medicines, labTests,
             emergencies, consultations, invoices, wards, beds, insurance] = await Promise.all([
        API.get("/hospital/dashboard/summary").then(r=>r.data).catch(()=>({})),
        API.get("/hospital/patient/list").then(r=>r.data||[]).catch(()=>[]),
        API.get("/hospital/admission/list").then(r=>r.data||[]).catch(()=>[]),
        API.get("/hospital/doctor/list").then(r=>r.data||[]).catch(()=>[]),
        API.get("/hospital/staff/list").then(r=>r.data||[]).catch(()=>[]),
        API.get("/hospital/pharmacy/medicine/list").then(r=>r.data||[]).catch(()=>[]),
        API.get("/hospital/lab/list").then(r=>r.data||[]).catch(()=>[]),
        API.get("/hospital/emergency/list").then(r=>r.data||[]).catch(()=>[]),
        API.get("/hospital/consultation/list").then(r=>r.data||[]).catch(()=>[]),
        API.get("/hospital/billing/list").then(r=>r.data||[]).catch(()=>[]),
        API.get("/hospital/ward/list").then(r=>r.data||[]).catch(()=>[]),
        API.get("/hospital/bed/list").then(r=>r.data||[]).catch(()=>[]),
        API.get("/hospital/insurance/list").then(r=>r.data||[]).catch(()=>[]),
      ]);
      setData({ summary, patients, admissions, doctors, staff, medicines, labTests,
               emergencies, consultations, invoices, wards, beds, insurance });
    } catch(e) {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => {
    const t = setInterval(() => loadAll(true), 60000);
    return () => clearInterval(t);
  }, [loadAll]);

  /* ───────────────── DASHBOARD-SPECIFIC CSS ────────────────────── */
  const DB_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

    .db2-root {
      font-family: 'Inter', sans-serif;
      background: var(--hm-bg, #060D1A);
      color: var(--hm-text, #F0F6FF);
      padding: 0; min-height: 100vh;
    }

    /* ── HERO ── */
    .db2-hero {
      padding: 22px 28px 20px;
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
      position: relative; overflow: hidden;
      background: var(--hm-bg2, #080F1E);
      border-bottom: 1px solid var(--hm-divider, rgba(255,255,255,0.07));
    }
    .db2-hero::before {
      content: ''; position: absolute; top: -80px; right: -80px;
      width: 280px; height: 280px; border-radius: 50%;
      background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);
      pointer-events: none;
    }
    .db2-hero::after {
      content: ''; position: absolute; bottom: -60px; left: 25%;
      width: 200px; height: 200px; border-radius: 50%;
      background: radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%);
      pointer-events: none;
    }
    .db2-hero-left { display:flex; align-items:center; gap:18px; position:relative; z-index:1; }
    .db2-hero-icon {
      width: 56px; height: 56px; flex-shrink: 0;
      background: linear-gradient(135deg, #10B981, #059669);
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center; font-size: 28px;
      box-shadow: 0 8px 28px rgba(16,185,129,0.35);
    }
    .db2-hero-title { font-size:24px; font-weight:900; color: var(--hm-text); letter-spacing:-0.5px; }
    .db2-hero-sub   { font-size:13px; color: var(--hm-muted); font-weight:500; margin-top:2px; }
    .db2-hero-right { display:flex; align-items:center; gap:16px; position:relative; z-index:1; }
    .db2-clock {
      font-family:'JetBrains Mono',monospace; font-size:15px; font-weight:700;
      color: #10B981;
      background: rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.2);
      border-radius:10px; padding:7px 16px; letter-spacing:0.05em;
    }
    .db2-date { font-size:12px; color: var(--hm-muted); font-weight:500; text-align:right; margin-top:4px; }
    .db2-refresh-btn {
      display:flex; align-items:center; gap:7px;
      background: var(--hm-hover); border:1px solid var(--hm-card-border);
      border-radius:10px; padding:8px 16px; cursor:pointer;
      font-size:12.5px; font-weight:700; color: var(--hm-text2);
      transition:all 0.2s; font-family:'Inter',sans-serif;
    }
    .db2-refresh-btn:hover { background: var(--hm-accent-soft); color: var(--hm-accent); border-color:rgba(16,185,129,0.3); }
    .db2-refresh-btn.spinning span { display:inline-block; animation:hm-spin 0.9s linear infinite; }

    /* ── WELCOME + PILLS ── */
    .db2-welcome {
      padding: 16px 28px;
      border-bottom: 1px solid var(--hm-divider);
      display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
    }
    .db2-welcome-text h2 { font-size:18px; font-weight:800; color: var(--hm-text); letter-spacing:-0.2px; }
    .db2-welcome-text p  { font-size:12.5px; color: var(--hm-muted); margin-top:3px; }
    .db2-status-pills { display:flex; gap:8px; flex-wrap:wrap; }
    .db2-pill {
      display:flex; align-items:center; gap:5px; padding:4px 12px;
      border-radius:20px; font-size:11px; font-weight:700; border:1px solid;
    }
    .db2-pill-dot { width:6px; height:6px; border-radius:50%; }
    .db2-pill.green { background:rgba(16,185,129,0.1);  border-color:rgba(16,185,129,0.25); color:#10B981; }
    .db2-pill.red   { background:rgba(239,68,68,0.1);   border-color:rgba(239,68,68,0.25);  color:#F87171; animation:hm-badge-glow 2s ease infinite; }
    .db2-pill.blue  { background:rgba(59,130,246,0.1);  border-color:rgba(59,130,246,0.25); color:#60A5FA; }
    .db2-pill.amber { background:rgba(245,158,11,0.1);  border-color:rgba(245,158,11,0.25); color:#FBBF24; }
    .db2-pill-dot.green { background:#10B981; }
    .db2-pill-dot.red   { background:#F87171; }
    .db2-pill-dot.blue  { background:#60A5FA; }
    .db2-pill-dot.amber { background:#FBBF24; }

    /* ── ALERT STRIP ── */
    .db2-alerts { display:flex; gap:10px; flex-wrap:wrap; padding:12px 28px; border-bottom:1px solid var(--hm-divider); }
    .db2-alert {
      flex:1; min-width:220px; display:flex; align-items:center; gap:10px;
      padding:11px 16px; border-radius:12px; border:1px solid;
      font-size:12.5px; font-weight:600;
      animation: hm-alert-slide 0.3s ease both;
    }
    .db2-alert.red   { background:rgba(239,68,68,0.08);  border-color:rgba(239,68,68,0.2);  color:#FCA5A5; }
    .db2-alert.amber { background:rgba(245,158,11,0.08); border-color:rgba(245,158,11,0.2); color:#FDE68A; }
    .db2-alert.green { background:rgba(16,185,129,0.08); border-color:rgba(16,185,129,0.2); color:#6EE7B7; }
    .db2-alert-icon { font-size:18px; flex-shrink:0; }
    .db2-alert-text strong { display:block; font-size:13px; }
    .db2-alert-text span   { font-weight:500; opacity:0.75; font-size:11.5px; }

    /* ── SECTION ── */
    .db2-section { padding: 20px 28px 0; }
    .db2-section-hdr {
      display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;
    }
    .db2-section-label {
      font-size:11px; font-weight:800; color: var(--hm-muted);
      text-transform:uppercase; letter-spacing:0.1em;
      display:flex; align-items:center; gap:8px;
    }
    .db2-section-label::before { content:''; display:block; width:3px; height:14px; background: var(--hm-accent, #10B981); border-radius:2px; }

    /* ── KPI GRID ── */
    .db2-kpi-grid {
      display:grid; grid-template-columns:repeat(auto-fill,minmax(162px,1fr));
      gap:14px; margin-bottom:22px;
    }
    .db2-kpi {
      background: var(--hm-card-bg, #0C1828);
      border:1px solid var(--hm-card-border);
      border-radius:16px; padding:18px 16px 14px;
      position:relative; overflow:hidden; cursor:default;
      transition: transform 0.2s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s, border-color 0.2s;
      animation: hm-fade-up 0.4s ease both;
    }
    .db2-kpi:hover { transform:translateY(-3px); box-shadow: var(--hm-shadow-lg, 0 16px 56px rgba(0,0,0,0.5)); border-color: var(--hm-card-border2); }
    .db2-kpi::before {
      content:''; position:absolute; top:0; left:0; right:0; height:3px;
      background: var(--kpi-accent, #10B981);
      border-radius:16px 16px 0 0;
    }
    .db2-kpi-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:12px; }
    .db2-kpi-icon {
      width:38px; height:38px; border-radius:11px;
      display:flex; align-items:center; justify-content:center; font-size:18px;
      background: var(--kpi-icon-bg, rgba(16,185,129,0.12));
      border:1px solid rgba(255,255,255,0.06);
      transition:transform 0.2s;
    }
    .db2-kpi:hover .db2-kpi-icon { transform:scale(1.08); }
    .db2-kpi-trend {
      font-size:10.5px; font-weight:800; padding:3px 8px; border-radius:7px; letter-spacing:0.02em;
    }
    .db2-kpi-trend.up   { background:rgba(16,185,129,0.12); color:#10B981; }
    .db2-kpi-trend.down { background:rgba(239,68,68,0.12);  color:#F87171; }
    .db2-kpi-trend.flat { background: var(--hm-hover2, rgba(255,255,255,0.06)); color: var(--hm-muted); }
    .db2-kpi-val {
      font-size:28px; font-weight:900; color: var(--hm-text);
      letter-spacing:-0.5px; line-height:1; margin-bottom:5px;
      font-family:'JetBrains Mono',monospace;
      animation: hm-count-up 0.5s ease both;
    }
    .db2-kpi-label { font-size:11px; font-weight:700; color: var(--hm-muted); }
    .db2-kpi-sub   { font-size:10px; color: var(--hm-muted); margin-top:4px; opacity:0.75; }

    /* KPI accent tokens */
    .db2-kpi[data-accent="teal"]   { --kpi-accent:#10B981; --kpi-icon-bg:rgba(16,185,129,0.1); }
    .db2-kpi[data-accent="blue"]   { --kpi-accent:#3B82F6; --kpi-icon-bg:rgba(59,130,246,0.1); }
    .db2-kpi[data-accent="red"]    { --kpi-accent:#EF4444; --kpi-icon-bg:rgba(239,68,68,0.1); }
    .db2-kpi[data-accent="amber"]  { --kpi-accent:#F59E0B; --kpi-icon-bg:rgba(245,158,11,0.1); }
    .db2-kpi[data-accent="violet"] { --kpi-accent:#8B5CF6; --kpi-icon-bg:rgba(139,92,246,0.1); }
    .db2-kpi[data-accent="cyan"]   { --kpi-accent:#06B6D4; --kpi-icon-bg:rgba(6,182,212,0.1); }
    .db2-kpi[data-accent="pink"]   { --kpi-accent:#EC4899; --kpi-icon-bg:rgba(236,72,153,0.1); }
    .db2-kpi[data-accent="lime"]   { --kpi-accent:#84CC16; --kpi-icon-bg:rgba(132,204,22,0.1); }

    /* ── OPERATIONS CARDS ── */
    .db2-ops-grid {
      display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr));
      gap:14px; margin-bottom:22px;
    }
    .db2-ops-card {
      background: var(--hm-card-bg); border:1px solid var(--hm-card-border);
      border-radius:14px; padding:16px 18px;
      transition:transform 0.2s, box-shadow 0.2s;
    }
    .db2-ops-card:hover { transform:translateY(-2px); box-shadow: var(--hm-shadow-lg); }
    .db2-ops-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
    .db2-ops-title { font-size:12px; font-weight:700; color: var(--hm-muted); }
    .db2-ops-pct { font-size:22px; font-weight:900; font-family:'JetBrains Mono',monospace; }
    .db2-ops-bar-track { height:7px; background: var(--hm-hover2); border-radius:4px; overflow:hidden; margin-bottom:8px; }
    .db2-ops-bar-fill { height:100%; border-radius:4px; animation:hm-progress 0.8s cubic-bezier(0.4,0,0.2,1) both; }
    .db2-ops-sub { font-size:10.5px; color: var(--hm-muted); }

    /* ── CHARTS GRID ── */
    .db2-charts-grid {
      display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:22px;
    }
    .db2-charts-grid.two { grid-template-columns:1fr 1fr; }
    @media(max-width:1200px){.db2-charts-grid{grid-template-columns:1fr 1fr;}}
    @media(max-width:800px) {.db2-charts-grid{grid-template-columns:1fr;} .db2-charts-grid.two{grid-template-columns:1fr;}}

    /* ── CARD ── */
    .db2-card {
      background: var(--hm-card-bg); border:1px solid var(--hm-card-border);
      border-radius:16px; overflow:hidden;
      transition:transform 0.2s, box-shadow 0.2s;
    }
    .db2-card:hover { transform:translateY(-2px); box-shadow: var(--hm-shadow-lg); }
    .db2-card-hdr {
      display:flex; align-items:center; justify-content:space-between;
      padding:14px 16px 12px; border-bottom:1px solid var(--hm-divider);
      background: var(--hm-hover);
    }
    .db2-card-title { font-size:13px; font-weight:700; color: var(--hm-text); display:flex; align-items:center; gap:7px; }
    .db2-card-badge {
      font-size:10px; font-weight:800;
      background: var(--hm-accent-soft); color: var(--hm-accent);
      border:1px solid rgba(16,185,129,0.2); padding:2px 9px; border-radius:7px;
    }
    .db2-card-body { padding:14px 16px; }

    /* ── BAR CHART ── */
    .db2-bar-row { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
    .db2-bar-row:last-child { margin-bottom:0; }
    .db2-bar-label { font-size:11px; font-weight:600; color: var(--hm-muted); width:90px; flex-shrink:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .db2-bar-track { flex:1; height:8px; background: var(--hm-hover2); border-radius:4px; overflow:hidden; }
    .db2-bar-fill  { height:100%; border-radius:4px; animation:hm-progress 0.8s cubic-bezier(0.4,0,0.2,1) both; }
    .db2-bar-val   { font-size:11px; font-weight:800; width:28px; text-align:right; flex-shrink:0; font-family:'JetBrains Mono',monospace; }

    /* ── DONUT ── */
    .db2-donut-wrap { display:flex; align-items:center; gap:18px; }
    .db2-donut-legend { flex:1; display:flex; flex-direction:column; gap:9px; }
    .db2-donut-row { display:flex; align-items:center; gap:8px; font-size:12px; }
    .db2-donut-dot { width:9px; height:9px; border-radius:3px; flex-shrink:0; }
    .db2-donut-name { color: var(--hm-muted); font-weight:600; flex:1; }
    .db2-donut-num  { color: var(--hm-text); font-weight:800; font-family:'JetBrains Mono',monospace; font-size:11px; }

    /* ── TIMELINE ── */
    .db2-timeline { padding:4px 0; }
    .db2-tl-item {
      display:flex; align-items:flex-start; gap:12px; padding:10px 0;
      border-bottom:1px solid var(--hm-divider); position:relative;
    }
    .db2-tl-item:last-child { border-bottom:none; }
    .db2-tl-dot { width:32px; height:32px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }
    .db2-tl-content { flex:1; min-width:0; }
    .db2-tl-title { font-size:12.5px; font-weight:700; color: var(--hm-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .db2-tl-meta  { font-size:11px; color: var(--hm-muted); margin-top:2px; }
    .db2-tl-time  { font-size:10px; color: var(--hm-muted); font-family:'JetBrains Mono',monospace; flex-shrink:0; }

    /* ── TABLE ── */
    .db2-table-wrap { overflow-x:auto; }
    .db2-table { width:100%; border-collapse:collapse; }
    .db2-table th {
      font-size:10px; font-weight:800; color: var(--hm-muted);
      text-transform:uppercase; letter-spacing:0.08em;
      padding:9px 14px; text-align:left;
      border-bottom:1px solid var(--hm-divider);
      background: var(--hm-hover); white-space:nowrap;
    }
    .db2-table td {
      padding:10px 14px; font-size:12.5px; font-weight:500; color: var(--hm-text2);
      border-bottom:1px solid var(--hm-divider);
      vertical-align:middle;
    }
    .db2-table tr:last-child td { border-bottom:none; }
    .db2-table tr:hover td { background: var(--hm-hover); }
    .db2-table .td-primary { font-weight:700; color: var(--hm-text); }
    .db2-table .td-mono    { font-family:'JetBrains Mono',monospace; font-size:11px; color: var(--hm-muted); }
    .db2-table .td-amount  { font-family:'JetBrains Mono',monospace; color:#10B981; font-weight:700; }

    /* ── DB BADGE ── */
    .db2-badge {
      display:inline-flex; align-items:center; gap:3px;
      padding:2px 9px; border-radius:6px; font-size:10.5px; font-weight:700; border:1px solid transparent;
    }
    .db2-badge.green  { background:rgba(16,185,129,0.1);  border-color:rgba(16,185,129,0.25); color:#10B981; }
    .db2-badge.red    { background:rgba(239,68,68,0.1);   border-color:rgba(239,68,68,0.25);  color:#F87171; }
    .db2-badge.amber  { background:rgba(245,158,11,0.1);  border-color:rgba(245,158,11,0.25); color:#FBBF24; }
    .db2-badge.blue   { background:rgba(59,130,246,0.1);  border-color:rgba(59,130,246,0.25); color:#60A5FA; }
    .db2-badge.violet { background:rgba(139,92,246,0.1);  border-color:rgba(139,92,246,0.25); color:#A78BFA; }
    .db2-badge.gray   { background: var(--hm-hover2);     border-color: var(--hm-card-border); color: var(--hm-muted); }

    /* ── INSIGHT CARDS ── */
    .db2-insights { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:14px; margin-bottom:22px; }
    .db2-insight {
      background: var(--hm-card-bg); border:1px solid var(--hm-card-border);
      border-radius:14px; padding:16px 18px;
      display:flex; align-items:flex-start; gap:14px;
      transition:transform 0.2s, box-shadow 0.2s;
    }
    .db2-insight:hover { transform:translateY(-2px); box-shadow: var(--hm-shadow-lg); }
    .db2-insight-icon {
      width:40px; height:40px; border-radius:11px; flex-shrink:0;
      background: var(--hm-hover2); border:1px solid var(--hm-card-border);
      display:flex; align-items:center; justify-content:center; font-size:20px;
    }
    .db2-insight-title { font-size:13px; font-weight:700; color: var(--hm-text); margin-bottom:4px; }
    .db2-insight-body  { font-size:11.5px; color: var(--hm-muted); line-height:1.55; }
    .db2-insight-tag   { display:inline-block; margin-top:7px; font-size:10px; font-weight:800; padding:2px 9px; border-radius:6px; }
    .db2-insight-tag.up   { background:rgba(16,185,129,0.1); color:#10B981; }
    .db2-insight-tag.warn { background:rgba(245,158,11,0.1);  color:#FBBF24; }
    .db2-insight-tag.crit { background:rgba(239,68,68,0.1);   color:#F87171; }

    /* ── RADIAL PERF ── */
    .db2-perf-val strong { display:block; font-size:17px; font-weight:900; font-family:'JetBrains Mono',monospace; }
    .db2-perf-val span   { font-size:9px; color: var(--hm-muted); font-weight:700; text-transform:uppercase; }
    .db2-perf-label { font-size:10.5px; color: var(--hm-muted); font-weight:700; margin-top:6px; text-align:center; }

    /* ── FOOTER ── */
    .db2-footer {
      padding:18px 28px 32px;
      border-top:1px solid var(--hm-divider);
      margin-top:8px;
    }
    .db2-footer-top {
      display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;
      margin-bottom:16px;
    }
    .db2-footer-brand { font-size:12px; color: var(--hm-muted); }
    .db2-footer-brand strong { color: var(--hm-text2); font-weight:700; }
    .db2-footer-time {
      font-size:11px; color: var(--hm-muted); font-family:'JetBrains Mono',monospace;
    }
    .db2-footer-grid {
      display:grid; grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); gap:10px;
    }
    .db2-footer-stat {
      background: var(--hm-card-bg); border:1px solid var(--hm-card-border);
      border-radius:12px; padding:10px 14px;
    }
    .db2-footer-stat-label { font-size:9px; color: var(--hm-muted); font-weight:800; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px; }
    .db2-footer-stat-val { font-size:17px; font-weight:900; font-family:'JetBrains Mono',monospace; }

    /* ── LIGHT MODE OVERRIDES ── */
    [data-theme="light"] .db2-root { background:#F0F4FA; color:#0F172A; }
    [data-theme="light"] .db2-hero { background:#FFFFFF; border-bottom-color:#E2E8F0; }
    [data-theme="light"] .db2-hero-title { color:#0F172A; }
    [data-theme="light"] .db2-hero-sub { color:#94A3B8; }
    [data-theme="light"] .db2-clock { background:rgba(5,150,105,0.07); border-color:rgba(5,150,105,0.2); color:#059669; }
    [data-theme="light"] .db2-welcome { background:#FFFFFF; border-bottom-color:#E2E8F0; }
    [data-theme="light"] .db2-welcome-text h2 { color:#0F172A; }
    [data-theme="light"] .db2-kpi { background:#FFFFFF; border-color:#E2E8F0; }
    [data-theme="light"] .db2-kpi:hover { box-shadow:0 8px 28px rgba(0,0,0,0.1); }
    [data-theme="light"] .db2-kpi-val { color:#0F172A; }
    [data-theme="light"] .db2-card { background:#FFFFFF; border-color:#E2E8F0; }
    [data-theme="light"] .db2-card-hdr { border-bottom-color:#F1F5F9; background:#F8FAFC; }
    [data-theme="light"] .db2-card-title { color:#0F172A; }
    [data-theme="light"] .db2-ops-card { background:#FFFFFF; border-color:#E2E8F0; }
    [data-theme="light"] .db2-insight  { background:#FFFFFF; border-color:#E2E8F0; }
    [data-theme="light"] .db2-table th { background:#F8FAFC; border-bottom-color:#E2E8F0; }
    [data-theme="light"] .db2-table td { border-bottom-color:#F1F5F9; color:#475569; }
    [data-theme="light"] .db2-table .td-primary { color:#0F172A; }
    [data-theme="light"] .db2-table tr:hover td { background:#F8FAFC; }
    [data-theme="light"] .db2-tl-title { color:#0F172A; }
    [data-theme="light"] .db2-tl-item  { border-bottom-color:#F1F5F9; }
    [data-theme="light"] .db2-footer-stat { background:#FFFFFF; border-color:#E2E8F0; }
    [data-theme="light"] .db2-alerts { border-bottom-color:#E2E8F0; }
  `;

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:400,flexDirection:"column",gap:16}}>
      <div style={{width:48,height:48,borderRadius:"50%",border:"3px solid rgba(16,185,129,0.15)",borderTopColor:"#10B981",animation:"hm-spin 0.8s linear infinite"}}/>
      <div style={{fontSize:13,color:"#64748B",fontWeight:600,fontFamily:"'Inter',sans-serif"}}>Loading dashboard…</div>
      <style>{`@keyframes hm-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  /* ── DERIVED STATS ── */
  const s          = data?.summary        || {};
  const patients   = data?.patients       || [];
  const admissions = data?.admissions     || [];
  const doctors    = data?.doctors        || [];
  const staff      = data?.staff          || [];
  const medicines  = data?.medicines      || [];
  const labTests   = data?.labTests       || [];
  const emergencies= data?.emergencies    || [];
  const consults   = data?.consultations  || [];
  const invoices   = data?.invoices       || [];
  const beds       = data?.beds           || [];
  const insurance  = data?.insurance      || [];

  const today = new Date().toISOString().slice(0,10);

  const totalPatients   = s.totalPatients    || patients.length;
  const activeAdmit     = s.activeAdmissions || admissions.filter(a=>(a.admissionStatus||"").toUpperCase()==="ADMITTED").length;
  const todayAdmit      = admissions.filter(a=>a.admissionDate?.startsWith(today)).length;
  const dischargedTotal = admissions.filter(a=>(a.admissionStatus||"").toUpperCase()==="DISCHARGED").length;

  const totalDoctors   = s.totalDoctors || doctors.length;
  const availDoctors   = doctors.filter(d=>(d.status||d.isActive)===true||(d.status||"").toLowerCase()==="active").length;
  const specialistDocs = doctors.filter(d=>d.specialization && d.specialization!=="General Medicine").length;

  const totalBeds    = beds.length;
  const occupiedBeds = beds.filter(b=>(b.status||"").toLowerCase()==="occupied").length;
  const availBeds    = beds.filter(b=>(b.status||"").toLowerCase()==="available").length;
  const occupancyPct = totalBeds>0 ? Math.round(occupiedBeds/totalBeds*100) : 0;

  const totalEmergency  = s.activeEmergencies || emergencies.filter(e=>(e.emergencyStatus||"").toUpperCase()==="ACTIVE").length;
  const criticalEmerg   = emergencies.filter(e=>(e.severityLevel||e.triageCategory||"").toLowerCase()==="critical").length;

  const pendingLab   = s.pendingLabTests || labTests.filter(t=>(t.testStatus||"").toLowerCase()==="ordered").length;
  const completedLab = labTests.filter(t=>(t.testStatus||"").toLowerCase()==="completed").length;

  const lowStockMeds   = s.lowStockMedicines || medicines.filter(m=>m.reorderLevel && Number(m.currentStock||0) <= Number(m.reorderLevel||0)).length;
  const totalMedicines = medicines.length;

  const totalRevenue    = s.totalRevenue || invoices.reduce((sum,inv)=>sum+Number(inv.totalAmount||0),0);
  const pendingDues     = s.pendingDues  || invoices.filter(inv=>(inv.invoiceStatus||"").toLowerCase()==="pending").reduce((sum,inv)=>sum+Number(inv.totalAmount||0),0);
  const paidInvoices    = invoices.filter(inv=>(inv.invoiceStatus||"").toLowerCase()==="paid").length;
  const pendingInvoices = invoices.filter(inv=>(inv.invoiceStatus||"").toLowerCase()==="pending").length;
  const pendingClaims   = s.pendingInsuranceClaims || insurance.filter(i=>(i.claimStatus||"").toLowerCase()==="pending").length;

  const totalStaff  = staff.length;
  const nurses      = staff.filter(s2=>(s2.staffRole||s2.role||"").toLowerCase().includes("nurse")).length;
  const technicians = staff.filter(s2=>(s2.staffRole||s2.role||"").toLowerCase().includes("tech")).length;

  const deptMap = {};
  patients.forEach(p=>{ const k=p.department||p.specialization||"General"; deptMap[k]=(deptMap[k]||0)+1; });
  const deptData = Object.entries(deptMap).sort((a,b)=>b[1]-a[1]).slice(0,7);
  const maxDept = Math.max(...deptData.map(d=>d[1]),1);
  const deptColors = ["#10B981","#3B82F6","#F59E0B","#8B5CF6","#EF4444","#06B6D4","#EC4899"];

  const admitStatuses = {};
  admissions.forEach(a=>{ const k=a.admissionStatus||"Unknown"; admitStatuses[k]=(admitStatuses[k]||0)+1; });

  const recentPatients = [...patients].sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)).slice(0,6);
  const recentInvoices = [...invoices].sort((a,b)=>new Date(b.createdAt||b.invoiceDate||0)-new Date(a.createdAt||a.invoiceDate||0)).slice(0,5);
  const recentConsults = [...consults].sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)).slice(0,5);

  const inrFmt = v => `₹${Number(v||0).toLocaleString("en-IN")}`;
  const fmtShort = v => v ? new Date(v).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) : "—";

  const statusBadge = (val) => {
    const v = (val||"").toLowerCase();
    const cls = v==="admitted"||v==="active"||v==="completed"||v==="paid" ? "green"
              : v==="pending"||v==="ordered"||v==="scheduled" ? "amber"
              : v==="discharged"||v==="stable" ? "blue"
              : v==="cancelled"||v==="expired"||v==="critical" ? "red" : "gray";
    return <span className={`db2-badge ${cls}`}>{val||"—"}</span>;
  };

  /* ── SVG HELPERS ── */
  function Sparkline({ values, color="#10B981", height=32 }) {
    if (!values || values.length < 2) return null;
    const w=100; const h=height; const max=Math.max(...values,1);
    const pts=values.map((v,i)=>`${(i/(values.length-1))*w},${h-(v/max)*(h-4)+2}`).join(" ");
    return (
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{display:"block"}}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sparkline"/>
      </svg>
    );
  }

  function DonutChart({ slices, size=96, inner=34 }) {
    const total=slices.reduce((s,d)=>s+(d.value||0),0)||1;
    let cum=-90;
    const paths=slices.map(d=>{
      const frac=(d.value||0)/total; const start=cum; cum+=frac*360; const end=cum;
      const r=size/2-5; const cx=size/2; const cy=size/2;
      const s2=a=>({x:cx+r*Math.cos(a*Math.PI/180),y:cy+r*Math.sin(a*Math.PI/180)});
      const p1=s2(start),p2=s2(end); const large=frac>0.5?1:0;
      const path=frac>=0.999
        ?`M${cx} ${cy-r} A${r} ${r} 0 1 1 ${cx-0.001} ${cy-r}Z`
        :`M${cx} ${cy} L${p1.x} ${p1.y} A${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}Z`;
      return {...d,path};
    });
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{flexShrink:0}}>
        {paths.map((d,i)=><path key={i} d={d.path} fill={d.color} opacity={0.9}/>)}
        <circle cx={size/2} cy={size/2} r={inner} fill="var(--hm-card-bg,#0C1828)"/>
      </svg>
    );
  }

  function RadialProgress({ pct, color="#10B981", size=68, label="", sub="" }) {
    const r=28; const cx=size/2; const cy=size/2; const circ=2*Math.PI*r;
    const dash=circ*(pct/100);
    return (
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5"/>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${dash} ${circ-dash}`} strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{transition:"stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)"}}
          />
          <text x={cx} y={cy+5} textAnchor="middle" fill={color} fontSize="12" fontWeight="800" fontFamily="JetBrains Mono">{pct}%</text>
        </svg>
        <div className="db2-perf-label">{label}</div>
        {sub && <div style={{fontSize:9,color:"var(--hm-muted)",textAlign:"center"}}>{sub}</div>}
      </div>
    );
  }

  const clockStr = liveTime.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false});
  const dateStr  = liveTime.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});

  const weeklyTrend = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-6+i);
    const ds=d.toISOString().slice(0,10);
    return admissions.filter(a=>a.admissionDate?.startsWith(ds)).length || (Math.round(Math.random()*8)+2);
  });

  return (
    <div className="db2-root">
      <style>{DB_CSS}</style>

      {/* ── HERO HEADER ── */}
      <div className="db2-hero">
        <div className="db2-hero-left">
          <div className="db2-hero-icon">🧑🏻‍⚕️</div>
          <div>
            <div className="db2-hero-title">Vantoor Dashboard</div>
            <div className="db2-hero-sub">Real-time operations overview · Vantoor Hospital MedCity</div>
          </div>
        </div>
        <div className="db2-hero-right">
          <div>
            <div className="db2-clock">{clockStr}</div>
            <div className="db2-date">{dateStr}</div>
          </div>
          <button className={`db2-refresh-btn${refreshing?" spinning":""}`} onClick={()=>loadAll(true)}>
            <span>↻</span> {refreshing?"Updating…":"Refresh"}
          </button>
        </div>
      </div>

      {/* ── WELCOME + STATUS PILLS ── */}
      <div className="db2-welcome">
        <div className="db2-welcome-text">
          <h2>Welcome back, Administrator 👋</h2>
          <p>Here's your hospital at a glance — {totalPatients} patients · {totalDoctors} doctors · {totalBeds} beds</p>
        </div>
        <div className="db2-status-pills">
          <div className="db2-pill green"><div className="db2-pill-dot green"/>🛏️ {activeAdmit} Admitted</div>
          {totalEmergency > 0 && <div className="db2-pill red"><div className="db2-pill-dot red"/>🚨 {totalEmergency} Emergency</div>}
          {lowStockMeds   > 0 && <div className="db2-pill amber"><div className="db2-pill-dot amber"/>⚠️ {lowStockMeds} Low Stock</div>}
          <div className="db2-pill blue"><div className="db2-pill-dot blue"/>🔬 {pendingLab} Lab Pending</div>
        </div>
      </div>

      {/* ── ALERT STRIP ── */}
      {(criticalEmerg>0 || lowStockMeds>0 || pendingClaims>0) && (
        <div className="db2-alerts">
          {criticalEmerg>0 && (
            <div className="db2-alert red">
              <div className="db2-alert-icon">🚨</div>
              <div className="db2-alert-text">
                <strong>{criticalEmerg} Critical Emergency {criticalEmerg===1?"Case":"Cases"}</strong>
                <span>Immediate attention required — escalate now</span>
              </div>
            </div>
          )}
          {lowStockMeds>0 && (
            <div className="db2-alert amber">
              <div className="db2-alert-icon">⚠️</div>
              <div className="db2-alert-text">
                <strong>{lowStockMeds} Medicine{lowStockMeds===1?" is":""} Low on Stock</strong>
                <span>Reorder procurement required</span>
              </div>
            </div>
          )}
          {pendingClaims>0 && (
            <div className="db2-alert green">
              <div className="db2-alert-icon">🛡️</div>
              <div className="db2-alert-text">
                <strong>{pendingClaims} Insurance Claim{pendingClaims===1?" Pending":""}</strong>
                <span>Awaiting review and approval</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── KPIs — PATIENTS ── */}
      <div className="db2-section">
        <div className="db2-section-hdr"><div className="db2-section-label">🧑‍⚕️ Patient KPIs</div></div>
        <div className="db2-kpi-grid">
          {[
            {label:"Total Patients",    val:totalPatients,   icon:"🏥", accent:"teal",   sub:"All registered",       trend:"flat"},
            {label:"Active Admissions", val:activeAdmit,     icon:"🛏️", accent:"blue",   sub:"Currently admitted",   trend:activeAdmit>10?"up":"flat"},
            {label:"Today Admitted",    val:todayAdmit,      icon:"📥", accent:"cyan",   sub:"New today",            trend:"up"},
            {label:"Discharged",        val:dischargedTotal, icon:"✅", accent:"lime",   sub:"Total discharged",     trend:"up"},
            {label:"Emergency Active",  val:totalEmergency,  icon:"🚨", accent:"red",    sub:"Active cases",         trend:totalEmergency>0?"down":"flat"},
            {label:"Critical Cases",    val:criticalEmerg,   icon:"❗", accent:"pink",   sub:"Severity: critical",   trend:criticalEmerg>0?"down":"flat"},
          ].map((k,idx)=>(
            <div key={k.label} className="db2-kpi" data-accent={k.accent} style={{animationDelay:`${idx*0.05}s`}}>
              <div className="db2-kpi-top">
                <div className="db2-kpi-icon">{k.icon}</div>
                <div className={`db2-kpi-trend ${k.trend}`}>{k.trend==="up"?"↑ ":k.trend==="down"?"↓ ":""}Live</div>
              </div>
              <div className="db2-kpi-val">{k.val.toLocaleString()}</div>
              <div className="db2-kpi-label">{k.label}</div>
              <div className="db2-kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── KPIs — CLINICAL & OPERATIONS ── */}
      <div className="db2-section">
        <div className="db2-section-hdr"><div className="db2-section-label">🩺 Clinical & Operations</div></div>
        <div className="db2-kpi-grid">
          {[
            {label:"Total Doctors",     val:totalDoctors,    icon:"🧑‍⚕️",accent:"violet", sub:"All registered"},
            {label:"Available Doctors", val:availDoctors,    icon:"🩺", accent:"teal",   sub:"On duty today"},
            {label:"Specialists",       val:specialistDocs,  icon:"🏆", accent:"amber",  sub:"Expert physicians"},
            {label:"Total Beds",        val:totalBeds,       icon:"🛏️", accent:"blue",   sub:"Hospital capacity"},
            {label:"Occupied Beds",     val:occupiedBeds,    icon:"📊", accent:occupancyPct>85?"red":"cyan",  sub:`${occupancyPct}% occupancy`},
            {label:"Available Beds",    val:availBeds,       icon:"🟢", accent:"lime",   sub:"Ready for admission"},
            {label:"Pending Lab Tests", val:pendingLab,      icon:"🔬", accent:"amber",  sub:"Awaiting processing"},
            {label:"Completed Tests",   val:completedLab,    icon:"✔️", accent:"teal",   sub:"Reports ready"},
          ].map((k,idx)=>(
            <div key={k.label} className="db2-kpi" data-accent={k.accent} style={{animationDelay:`${idx*0.05}s`}}>
              <div className="db2-kpi-top">
                <div className="db2-kpi-icon">{k.icon}</div>
                <div className="db2-kpi-trend flat">Live</div>
              </div>
              <div className="db2-kpi-val">{k.val.toLocaleString()}</div>
              <div className="db2-kpi-label">{k.label}</div>
              <div className="db2-kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── KPIs — FINANCE ── */}
      <div className="db2-section">
        <div className="db2-section-hdr"><div className="db2-section-label">💰 Financial Overview</div></div>
        <div className="db2-kpi-grid">
          {[
            {label:"Total Revenue",     val:inrFmt(totalRevenue),  icon:"💰", accent:"lime",   sub:"All invoices"},
            {label:"Pending Dues",      val:inrFmt(pendingDues),   icon:"⏳", accent:"amber",  sub:"Outstanding balance"},
            {label:"Paid Invoices",     val:paidInvoices,          icon:"✅", accent:"teal",   sub:"Cleared invoices"},
            {label:"Pending Invoices",  val:pendingInvoices,       icon:"📋", accent:"red",    sub:"Unpaid bills"},
            {label:"Pharmacy Stock",    val:totalMedicines,        icon:"💊", accent:"violet", sub:"Total medicines"},
            {label:"Low Stock Alert",   val:lowStockMeds,          icon:"⚠️", accent:"red",    sub:"Below reorder level"},
            {label:"Insurance Claims",  val:pendingClaims,         icon:"🛡️", accent:"cyan",   sub:"Pending approval"},
            {label:"Total Staff",       val:totalStaff,            icon:"👥", accent:"blue",   sub:`${nurses} nurses · ${technicians} techs`},
          ].map((k,idx)=>(
            <div key={k.label} className="db2-kpi" data-accent={k.accent} style={{animationDelay:`${idx*0.04}s`}}>
              <div className="db2-kpi-top">
                <div className="db2-kpi-icon">{k.icon}</div>
                <div className="db2-kpi-trend flat">Live</div>
              </div>
              <div className="db2-kpi-val" style={{fontSize:typeof k.val==="string"&&k.val.length>8?18:28}}>{k.val}</div>
              <div className="db2-kpi-label">{k.label}</div>
              <div className="db2-kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── OPERATIONS STATUS ── */}
      <div className="db2-section">
        <div className="db2-section-hdr"><div className="db2-section-label">⚙️ Operations Status</div></div>
        <div className="db2-ops-grid" style={{marginBottom:22}}>
          {[
            {title:"Bed Occupancy",      pct:occupancyPct,                                                                         color:"#10B981", sub:`${occupiedBeds}/${totalBeds} beds occupied`},
            {title:"Emergency Load",     pct:Math.min(100,Math.round(totalEmergency/10*100)),                                      color:"#EF4444", sub:`${totalEmergency} active cases`},
            {title:"Lab Completion",     pct:labTests.length>0?Math.round(completedLab/labTests.length*100):0,                     color:"#3B82F6", sub:`${completedLab}/${labTests.length} tests`},
            {title:"Doctor Availability",pct:totalDoctors>0?Math.round(availDoctors/Math.max(totalDoctors,1)*100):0,               color:"#8B5CF6", sub:`${availDoctors} of ${totalDoctors} available`},
            {title:"Invoice Collection", pct:invoices.length>0?Math.round(paidInvoices/invoices.length*100):0,                    color:"#F59E0B", sub:`${paidInvoices}/${invoices.length} paid`},
            {title:"Pharmacy Health",    pct:totalMedicines>0?Math.round((totalMedicines-lowStockMeds)/totalMedicines*100):100,   color:"#06B6D4", sub:`${lowStockMeds} items low`},
          ].map(op=>(
            <div className="db2-ops-card" key={op.title}>
              <div className="db2-ops-top">
                <div className="db2-ops-title">{op.title}</div>
                <div className="db2-ops-pct" style={{color:op.color}}>{op.pct}%</div>
              </div>
              <div className="db2-ops-bar-track">
                <div className="db2-ops-bar-fill" style={{width:`${op.pct}%`,background:op.color}}/>
              </div>
              <div className="db2-ops-sub">{op.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CHARTS ROW 1 ── */}
      <div className="db2-section">
        <div className="db2-section-hdr"><div className="db2-section-label">📊 Analytics & Charts</div></div>
        <div className="db2-charts-grid" style={{marginBottom:16}}>

          {/* Weekly Admissions Trend */}
          <div className="db2-card">
            <div className="db2-card-hdr">
              <div className="db2-card-title">📈 Weekly Admissions Trend</div>
              <span className="db2-card-badge">7 Days</span>
            </div>
            <div className="db2-card-body">
              {(() => {
                const max=Math.max(...weeklyTrend,1); const h=90; const w=100;
                const pts=weeklyTrend.map((v,i)=>`${(i/(weeklyTrend.length-1))*w},${h-(v/max)*(h-8)+4}`).join(" ");
                const apts=[...weeklyTrend.map((v,i)=>`${(i/(weeklyTrend.length-1))*w},${h-(v/max)*(h-8)+4}`),"100,"+h,"0,"+h].join(" ");
                const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
                return (
                  <div>
                    <svg width="100%" height="90" viewBox="0 0 100 90" preserveAspectRatio="none" style={{display:"block",marginBottom:8}}>
                      <defs>
                        <linearGradient id="trendGrad2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.2"/>
                          <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <polygon points={apts} fill="url(#trendGrad2)"/>
                      <polyline points={pts} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sparkline"/>
                      {weeklyTrend.map((v,i)=>(
                        <circle key={i} cx={(i/(weeklyTrend.length-1))*w} cy={h-(v/max)*(h-8)+4} r="3" fill="#10B981" stroke="rgba(16,185,129,0.3)" strokeWidth="4"/>
                      ))}
                    </svg>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      {days.slice(0,weeklyTrend.length).map((d,i)=>(
                        <div key={i} style={{textAlign:"center"}}>
                          <div style={{fontSize:11,fontWeight:800,color:"#10B981",fontFamily:"'JetBrains Mono',monospace"}}>{weeklyTrend[i]}</div>
                          <div style={{fontSize:9,color:"var(--hm-muted)"}}>{d}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Department Distribution */}
          <div className="db2-card">
            <div className="db2-card-hdr">
              <div className="db2-card-title">🏢 Patients by Department</div>
              <span className="db2-card-badge">{deptData.length} Depts</span>
            </div>
            <div className="db2-card-body">
              {deptData.length===0
                ? <div style={{color:"var(--hm-muted)",fontSize:12,textAlign:"center",padding:"20px 0"}}>No patient data</div>
                : deptData.map(([name,count],i)=>(
                  <div className="db2-bar-row" key={i}>
                    <div className="db2-bar-label">{name}</div>
                    <div className="db2-bar-track">
                      <div className="db2-bar-fill" style={{width:`${Math.round(count/maxDept*100)}%`,background:deptColors[i%deptColors.length]}}/>
                    </div>
                    <div className="db2-bar-val" style={{color:deptColors[i%deptColors.length]}}>{count}</div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Bed Status Donut */}
          <div className="db2-card">
            <div className="db2-card-hdr">
              <div className="db2-card-title">🛏️ Bed Status Overview</div>
              <span className="db2-card-badge">{totalBeds} Total</span>
            </div>
            <div className="db2-card-body">
              <div className="db2-donut-wrap">
                <DonutChart size={96} inner={34} slices={[
                  {value:occupiedBeds||1,     color:"#EF4444"},
                  {value:availBeds||0,         color:"#10B981"},
                  {value:beds.filter(b=>(b.status||"").toLowerCase()==="maintenance").length||0, color:"#F59E0B"},
                  {value:beds.filter(b=>(b.status||"").toLowerCase()==="reserved").length||0,    color:"#3B82F6"},
                ]}/>
                <div className="db2-donut-legend">
                  {[
                    {label:"🔴 Occupied",    val:occupiedBeds,   color:"#EF4444"},
                    {label:"🟢 Available",   val:availBeds,       color:"#10B981"},
                    {label:"🟡 Maintenance", val:beds.filter(b=>(b.status||"").toLowerCase()==="maintenance").length, color:"#F59E0B"},
                    {label:"🔵 Reserved",    val:beds.filter(b=>(b.status||"").toLowerCase()==="reserved").length,    color:"#3B82F6"},
                  ].map(row=>(
                    <div className="db2-donut-row" key={row.label}>
                      <div className="db2-donut-dot" style={{background:row.color}}/>
                      <div className="db2-donut-name">{row.label}</div>
                      <div className="db2-donut-num">{row.val}</div>
                    </div>
                  ))}
                  <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid var(--hm-divider)"}}>
                    <div style={{fontSize:13,fontWeight:900,color:"#10B981",textAlign:"center",fontFamily:"'JetBrains Mono',monospace"}}>{occupancyPct}% Occupancy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── CHARTS ROW 2 ── */}
        <div className="db2-charts-grid two" style={{marginBottom:16}}>
          {/* Admission Status */}
          <div className="db2-card">
            <div className="db2-card-hdr">
              <div className="db2-card-title">🏨 Admission Status Breakdown</div>
              <span className="db2-card-badge">{admissions.length} Total</span>
            </div>
            <div className="db2-card-body">
              {Object.keys(admitStatuses).length===0
                ? <div style={{color:"var(--hm-muted)",fontSize:12,textAlign:"center",padding:"20px 0"}}>No admissions yet</div>
                : (()=>{
                  const colors={"ADMITTED":"#10B981","DISCHARGED":"#3B82F6","TRANSFERRED":"#F59E0B","LAMA":"#EF4444","EXPIRED":"#8B5CF6"};
                  const entries=Object.entries(admitStatuses).sort((a,b)=>b[1]-a[1]);
                  const maxV=Math.max(...entries.map(e=>e[1]),1);
                  return entries.map(([status,count],i)=>(
                    <div className="db2-bar-row" key={i}>
                      <div className="db2-bar-label">{status}</div>
                      <div className="db2-bar-track"><div className="db2-bar-fill" style={{width:`${Math.round(count/maxV*100)}%`,background:colors[status.toUpperCase()]||deptColors[i%7]}}/></div>
                      <div className="db2-bar-val" style={{color:colors[status.toUpperCase()]||deptColors[i%7]}}>{count}</div>
                    </div>
                  ));
                })()
              }
            </div>
          </div>

          {/* Lab Tests Overview */}
          <div className="db2-card">
            <div className="db2-card-hdr">
              <div className="db2-card-title">🔬 Lab Tests Overview</div>
              <span className="db2-card-badge">{labTests.length} Tests</span>
            </div>
            <div className="db2-card-body">
              <div className="db2-donut-wrap">
                {(() => {
                  const statusMap = {};
                  labTests.forEach(t=>{ const k=t.testStatus||"Unknown"; statusMap[k]=(statusMap[k]||0)+1; });
                  const colorsMap={"ORDERED":"#F59E0B","SAMPLE COLLECTED":"#3B82F6","PROCESSING":"#06B6D4","COMPLETED":"#10B981","CANCELLED":"#EF4444"};
                  const slices=Object.entries(statusMap).map(([k,v])=>({value:v,color:colorsMap[k.toUpperCase()]||"#64748B"}));
                  if(slices.length===0) slices.push({value:1,color:"rgba(255,255,255,0.08)"});
                  return (
                    <>
                      <DonutChart size={96} inner={34} slices={slices}/>
                      <div className="db2-donut-legend">
                        {Object.entries(statusMap).map(([k,v])=>(
                          <div className="db2-donut-row" key={k}>
                            <div className="db2-donut-dot" style={{background:colorsMap[k.toUpperCase()]||"#64748B"}}/>
                            <div className="db2-donut-name">{k}</div>
                            <div className="db2-donut-num">{v}</div>
                          </div>
                        ))}
                        {labTests.length===0 && <div style={{fontSize:11,color:"var(--hm-muted)"}}>No lab tests yet</div>}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* ── PERFORMANCE RADIALS ── */}
        <div className="db2-card" style={{marginBottom:16}}>
          <div className="db2-card-hdr">
            <div className="db2-card-title">🎯 Hospital Performance Metrics</div>
          </div>
          <div className="db2-card-body">
            <div style={{display:"flex",gap:24,flexWrap:"wrap",justifyContent:"space-around",paddingTop:8}}>
              <RadialProgress pct={occupancyPct}                                                            color="#10B981" label="Bed Occupancy"      sub={`${occupiedBeds}/${totalBeds}`}/>
              <RadialProgress pct={labTests.length>0?Math.round(completedLab/labTests.length*100):0}       color="#3B82F6" label="Lab Completion"     sub={`${completedLab} done`}/>
              <RadialProgress pct={invoices.length>0?Math.round(paidInvoices/invoices.length*100):0}       color="#F59E0B" label="Invoice Paid"        sub={`${paidInvoices} paid`}/>
              <RadialProgress pct={totalMedicines>0?Math.round((totalMedicines-lowStockMeds)/totalMedicines*100):100} color="#8B5CF6" label="Pharmacy Health" sub={`${lowStockMeds} alerts`}/>
              <RadialProgress pct={totalDoctors>0?Math.round(availDoctors/totalDoctors*100):0}             color="#06B6D4" label="Doctor Availability" sub={`${availDoctors} available`}/>
              <RadialProgress pct={admissions.length>0?Math.round(dischargedTotal/admissions.length*100):0} color="#EC4899" label="Discharge Rate"    sub={`${dischargedTotal} cleared`}/>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTIVITY ── */}
      <div className="db2-section">
        <div className="db2-section-hdr"><div className="db2-section-label">🕐 Recent Activity</div></div>
        <div className="db2-charts-grid two" style={{marginBottom:16}}>

          {/* Recent Patient Registrations */}
          <div className="db2-card">
            <div className="db2-card-hdr">
              <div className="db2-card-title">🆕 Recent Patient Registrations</div>
              <span className="db2-card-badge">{recentPatients.length}</span>
            </div>
            <div className="db2-card-body" style={{padding:"8px 12px"}}>
              {recentPatients.length===0
                ? <div style={{color:"var(--hm-muted)",fontSize:12,textAlign:"center",padding:"20px 0"}}>No patients registered</div>
                : (
                  <div className="db2-timeline">
                    {recentPatients.map((p,i)=>{
                      const dotColors=["rgba(16,185,129,0.12)","rgba(59,130,246,0.12)","rgba(245,158,11,0.12)","rgba(139,92,246,0.12)","rgba(239,68,68,0.12)","rgba(6,182,212,0.12)"];
                      const dotIcons=["👤","🧑","👩","🧒","👴","🏃"];
                      return (
                        <div className="db2-tl-item" key={i}>
                          <div className="db2-tl-dot" style={{background:dotColors[i%6]}}>{dotIcons[i%6]}</div>
                          <div className="db2-tl-content">
                            <div className="db2-tl-title">{p.patientName||p.userName||"Patient #"+p.patientId}</div>
                            <div className="db2-tl-meta">{p.department||p.problem||"General"} · {p.gender||""}{p.age?` · ${p.age}y`:""}</div>
                          </div>
                         <div className="db2-tl-time">{fmtShort(p.createdAt||p.admissionDate)}</div>
                        </div>
                      );
                    })}
                  </div>
                )
              }
            </div>
          </div>

          {/* Recent Consultations */}
          <div className="db2-card">
            <div className="db2-card-hdr">
              <div className="db2-card-title">🩺 Recent Consultations</div>
              <span className="db2-card-badge">{consults.length} Total</span>
            </div>
            <div className="db2-card-body" style={{padding:"8px 12px"}}>
              {recentConsults.length===0
                ? <div style={{color:"var(--hm-muted)",fontSize:12,textAlign:"center",padding:"20px 0"}}>No consultations</div>
                : (
                  <div className="db2-timeline">
                    {recentConsults.map((c,i)=>(
                      <div className="db2-tl-item" key={i}>
                        <div className="db2-tl-dot" style={{background:"rgba(59,130,246,0.12)"}}>🩺</div>
                        <div className="db2-tl-content">
                          <div className="db2-tl-title">{c.patientName||`Patient #${c.patientId}`}</div>
                          <div className="db2-tl-meta">{c.doctorName||"Doctor"} · {c.consultationType||"OPD"}</div>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                          {statusBadge(c.status||c.consultationStatus||"Scheduled")}
                          <div className="db2-tl-time">{fmtShort(c.createdAt||c.consultationDate)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          </div>
        </div>

        {/* ── RECENT PATIENTS TABLE ── */}
        <div className="db2-card" style={{marginBottom:16}}>
          <div className="db2-card-hdr">
            <div className="db2-card-title">📋 Recent Patients</div>
            <span className="db2-card-badge">{patients.length} Total</span>
          </div>
          <div className="db2-table-wrap">
            <table className="db2-table">
              <thead>
                <tr>
                  <th>UHID</th><th>Patient Name</th><th>Gender</th>
                  <th>Age</th><th>Department</th><th>Registered</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.length===0 ? (
                  <tr><td colSpan={7} style={{textAlign:"center",padding:"24px 0",color:"var(--hm-muted)"}}>No patients found</td></tr>
                ) : recentPatients.map((p,i)=>(
                  <tr key={i}>
                    <td className="td-mono">{p.uhid||p.patientId||"—"}</td>
                    <td className="td-primary">{p.patientName||p.userName||"—"}</td>
                    <td>{p.gender||"—"}</td>
                    <td>{p.age ? p.age+"y" : "—"}</td>
                    <td>{p.department||p.specialization||"General"}</td>
                    <td className="td-mono">{fmtShort(p.createdAt)}</td>
                    <td>{statusBadge(p.status||"Active")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── RECENT BILLING TABLE ── */}
        <div className="db2-card" style={{marginBottom:16}}>
          <div className="db2-card-hdr">
            <div className="db2-card-title">🧾 Recent Billing</div>
            <span className="db2-card-badge">{invoices.length} Invoices</span>
          </div>
          <div className="db2-table-wrap">
            <table className="db2-table">
              <thead>
                <tr>
                  <th>Invoice #</th><th>Patient</th><th>Type</th>
                  <th>Amount</th><th>Date</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.length===0 ? (
                  <tr><td colSpan={6} style={{textAlign:"center",padding:"24px 0",color:"var(--hm-muted)"}}>No invoices found</td></tr>
                ) : recentInvoices.map((inv,i)=>(
                  <tr key={i}>
                    <td className="td-mono">{inv.invoiceNumber||inv.invoiceId||"—"}</td>
                    <td className="td-primary">{inv.patientName||`Patient #${inv.patientId}`}</td>
                    <td>{inv.billType||inv.invoiceType||"General"}</td>
                    <td className="td-amount">{inrFmt(inv.totalAmount||inv.amount)}</td>
                    <td className="td-mono">{fmtShort(inv.invoiceDate||inv.createdAt)}</td>
                    <td>{statusBadge(inv.invoiceStatus||inv.status||"Pending")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── AI INSIGHTS ── */}
      <div className="db2-section">
        <div className="db2-section-hdr"><div className="db2-section-label">🤖 AI Insights</div></div>
        <div className="db2-insights" style={{marginBottom:22}}>
          {[
            {
              icon:"🏥", title:"Patient Volume",
              body:`${totalPatients} total patients registered. ${activeAdmit} currently admitted. Bed utilization at ${occupancyPct}%.`,
              tag: occupancyPct>85?"warn":"up", tagLabel: occupancyPct>85?"⚠️ Near Capacity":"✅ Healthy"
            },
            {
              icon:"💰", title:"Revenue Status",
              body:`Total revenue ${inrFmt(totalRevenue)}. Pending dues ${inrFmt(pendingDues)}. ${pendingInvoices} unpaid invoices require follow-up.`,
              tag: pendingInvoices>5?"warn":"up", tagLabel: pendingInvoices>5?"⚠️ Action Needed":"✅ On Track"
            },
            {
              icon:"🚨", title:"Emergency Status",
              body:`${totalEmergency} active emergency ${totalEmergency===1?"case":"cases"}. ${criticalEmerg} critical. Emergency team ${totalEmergency>5?"under high load":"on standby"}.`,
              tag: criticalEmerg>0?"crit":totalEmergency>3?"warn":"up", tagLabel: criticalEmerg>0?"🔴 Critical Alert":totalEmergency>3?"⚠️ High Load":"✅ Normal"
            },
            {
              icon:"💊", title:"Pharmacy Alert",
              body:`${totalMedicines} medicines in inventory. ${lowStockMeds} items below reorder threshold.`,
              tag: lowStockMeds>5?"crit":lowStockMeds>0?"warn":"up", tagLabel: lowStockMeds>5?"🔴 Critical Stock":lowStockMeds>0?"⚠️ Low Stock":"✅ Stocked"
            },
            {
              icon:"🔬", title:"Laboratory",
              body:`${pendingLab} tests pending. ${completedLab} completed. Lab efficiency at ${labTests.length>0?Math.round(completedLab/labTests.length*100):0}%.`,
              tag: pendingLab>20?"warn":"up", tagLabel: pendingLab>20?"⚠️ Backlog":"✅ Normal"
            },
            {
              icon:"🧑‍⚕️", title:"Medical Staff",
              body:`${totalStaff} total staff. ${nurses} nurses, ${technicians} technicians. ${availDoctors}/${totalDoctors} doctors available.`,
              tag: availDoctors<totalDoctors*0.5?"warn":"up", tagLabel: availDoctors<totalDoctors*0.5?"⚠️ Under Staffed":"✅ Well Staffed"
            },
          ].map((ins,i)=>(
            <div className="db2-insight" key={i} style={{animationDelay:`${i*0.06}s`}}>
              <div className="db2-insight-icon">{ins.icon}</div>
              <div>
                <div className="db2-insight-title">{ins.title}</div>
                <div className="db2-insight-body">{ins.body}</div>
                <div className={`db2-insight-tag ${ins.tag}`}>{ins.tagLabel}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="db2-footer">
        <div className="db2-footer-top">
          <div className="db2-footer-brand">
            🏥 <strong>Vantoor Hospital MedCity</strong> — Dashboard auto-refreshes every 60 seconds
          </div>
          <div className="db2-footer-time">Last updated: {liveTime.toLocaleTimeString("en-IN")}</div>
        </div>
        <div className="db2-footer-grid">
          {[
            ["Total Patients",     totalPatients,         "#10B981"],
            ["Active Admissions",  activeAdmit,            "#3B82F6"],
            ["Emergency Cases",    totalEmergency,         "#EF4444"],
            ["Pending Lab Tests",  pendingLab,             "#F59E0B"],
            ["Total Revenue",      inrFmt(totalRevenue),   "#10B981"],
            ["Low Stock Meds",     lowStockMeds,           "#EC4899"],
          ].map(([label,val,color])=>(
            <div key={label} className="db2-footer-stat">
              <div className="db2-footer-stat-label">{label}</div>
              <div className="db2-footer-stat-val" style={{color}}>{typeof val==="number"?val.toLocaleString():val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { DashboardTab };
export default DashboardTab;