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

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .hm-app {
    padding: 0; margin: 0; width: 100%; max-width: 100%;
    font-family: 'DM Sans', sans-serif; color: var(--hm-text, #0F172A);
    background: var(--hm-bg, #F0F4FA); min-height: 100vh;
    transition: background 0.25s ease, color 0.25s ease;
  }

  /* Dark mode (default when no .hm-light class) */
  [data-theme="dark"] .hm-app {
    --hm-bg: #0A1628;
    --hm-text: #E2E8F0;
    --hm-card-bg: #0F1D33;
    --hm-card-border: #1A2E4A;
    --hm-input-bg: #0F1D33;
    --hm-input-border: #1A2E4A;
    --hm-input-text: #E2E8F0;
    --hm-table-header: #0F1D33;
    --hm-table-row: #0A1628;
    --hm-table-row-alt: #0D1C30;
    --hm-table-border: #1A2E4A;
    --hm-muted: #64748B;
    --hm-divider: #1A2E4A;
  }

  /* Light mode */
  [data-theme="light"] .hm-app, .hm-light {
    --hm-bg: #F0F4FA;
    --hm-text: #0F172A;
    --hm-card-bg: #FFFFFF;
    --hm-card-border: #E2E8F0;
    --hm-input-bg: #FFFFFF;
    --hm-input-border: #CBD5E1;
    --hm-input-text: #0F172A;
    --hm-table-header: #F8FAFC;
    --hm-table-row: #FFFFFF;
    --hm-table-row-alt: #F8FAFC;
    --hm-table-border: #E2E8F0;
    --hm-muted: #94A3B8;
    --hm-divider: #E2E8F0;
  }

  /* ═══════════════════════════════════════════
     DARK MODE — comprehensive overrides
     Uses :root[data-theme="dark"] so it wins
     against any hardcoded colour in this file.
  ═══════════════════════════════════════════ */
  :root[data-theme="dark"] .hm-app,
  :root[data-theme="dark"] .hm-app .hm-content {
    background: #0A1628 !important; color: #E2E8F0 !important;
  }

  /* ── top-nav bar ── */
  :root[data-theme="dark"] .hm-app .hm-topnav {
    background: #080F1E !important; border-color: #1A2E4A !important;
  }
  :root[data-theme="dark"] .hm-app .hm-topnav-divider { background: #1A2E4A !important; }
  :root[data-theme="dark"] .hm-app .topnav-btn {
    color: #64748B !important; background: transparent !important;
  }
  :root[data-theme="dark"] .hm-app .topnav-btn:hover {
    background: #111C30 !important; color: #94A3B8 !important;
  }
  /* active tab – keep a subtle tinted glow, no bright green fill */
  :root[data-theme="dark"] .hm-app .topnav-btn.active,
  :root[data-theme="dark"] .hm-app .topnav-btn.dash-tab.active,
  :root[data-theme="dark"] .hm-app .topnav-btn.green-tab.active {
    background: rgba(5,150,105,0.14) !important; color: #34D399 !important;
    border-color: rgba(5,150,105,0.35) !important;
  }
  :root[data-theme="dark"] .hm-app .topnav-btn.red-tab.active   { background: rgba(220,38,38,0.14)  !important; color: #F87171 !important; border-color: rgba(220,38,38,0.35) !important; }
  :root[data-theme="dark"] .hm-app .topnav-btn.blue-tab.active  { background: rgba(37,99,235,0.14)  !important; color: #93C5FD !important; border-color: rgba(37,99,235,0.35) !important; }
  :root[data-theme="dark"] .hm-app .topnav-btn.amber-tab.active { background: rgba(217,119,6,0.14)  !important; color: #FCD34D !important; border-color: rgba(217,119,6,0.35) !important; }
  /* tab badges */
  :root[data-theme="dark"] .hm-app .topnav-btn .tab-badge         { background: #1A2E4A !important; color: #64748B !important; }
  :root[data-theme="dark"] .hm-app .topnav-btn.active .tab-badge  { background: rgba(5,150,105,0.3) !important; color: #34D399 !important; }
  :root[data-theme="dark"] .hm-app .topnav-btn.red-tab.active .tab-badge   { background: rgba(220,38,38,0.3) !important; color: #F87171 !important; }
  :root[data-theme="dark"] .hm-app .topnav-btn.blue-tab.active .tab-badge  { background: rgba(37,99,235,0.3) !important; color: #93C5FD !important; }
  :root[data-theme="dark"] .hm-app .topnav-btn.amber-tab.active .tab-badge { background: rgba(217,119,6,0.3) !important; color: #FCD34D !important; }

  /* ── cards & layout surfaces ── */
  :root[data-theme="dark"] .hm-app .card,
  :root[data-theme="dark"] .hm-app .db-card {
    background: #0F1D33 !important; border-color: #1A2E4A !important;
    box-shadow: 0 2px 12px rgba(0,0,0,0.35) !important;
  }
  :root[data-theme="dark"] .hm-app .hm-content > div > div[style*="background:#fff"],
  :root[data-theme="dark"] .hm-app [style*="background:#fff"]    { background: #0F1D33 !important; }
  :root[data-theme="dark"] .hm-app [style*="background:#F8FAFC"] { background: #0A1628 !important; }
  :root[data-theme="dark"] .hm-app [style*="background:#F0F4FA"] { background: #0A1628 !important; }
  :root[data-theme="dark"] .hm-app [style*="background:#F1F5F9"] { background: #111C30 !important; }

  /* ── sec-title-icon (green gradient icon bg) ── */
  :root[data-theme="dark"] .hm-app .sec-title-icon {
    background: rgba(5,150,105,0.18) !important; color: #34D399 !important;
  }
  :root[data-theme="dark"] .hm-app .sec-title { color: #E2E8F0 !important; }
  :root[data-theme="dark"] .hm-app .sec-divider::after { background: #1A2E4A !important; }

  /* ── tables ── */
  :root[data-theme="dark"] .hm-app thead      { background: #0F1D33 !important; }
  :root[data-theme="dark"] .hm-app th         { color: #475569 !important; border-bottom-color: #1A2E4A !important; }
  :root[data-theme="dark"] .hm-app td         { color: #CBD5E1 !important; border-bottom-color: #111C30 !important; }
  :root[data-theme="dark"] .hm-app tr:hover td { background: #0F1D33 !important; }
  :root[data-theme="dark"] .hm-app .name-text  { color: #E2E8F0 !important; }

  /* ── search / filter / buttons ── */
  :root[data-theme="dark"] .hm-app .search-input {
    background: #0F1D33 !important; border-color: #1A2E4A !important; color: #E2E8F0 !important;
  }
  :root[data-theme="dark"] .hm-app .search-input::placeholder { color: #334155 !important; }
  :root[data-theme="dark"] .hm-app .search-input:focus { background: #0F1D33 !important; border-color: #047857 !important; }
  :root[data-theme="dark"] .hm-app .filter-pill {
    background: #0F1D33 !important; border-color: #1A2E4A !important; color: #64748B !important;
  }
  :root[data-theme="dark"] .hm-app .filter-pill.active {
    background: rgba(5,150,105,0.18) !important; border-color: rgba(5,150,105,0.4) !important; color: #34D399 !important;
  }
  :root[data-theme="dark"] .hm-app .btn-outline {
    background: #0F1D33 !important; border-color: #1A2E4A !important; color: #94A3B8 !important;
  }
  :root[data-theme="dark"] .hm-app .btn-outline:hover { background: #111C30 !important; color: #34D399 !important; border-color: #047857 !important; }
  :root[data-theme="dark"] .hm-app .btn-icon-sm:hover       { background: #111C30 !important; }
  :root[data-theme="dark"] .hm-app .btn-icon-sm.edit:hover  { background: rgba(5,150,105,0.15) !important; }
  :root[data-theme="dark"] .hm-app .btn-icon-sm.del:hover   { background: rgba(220,38,38,0.15) !important; }
  :root[data-theme="dark"] .hm-app .btn-danger-sm { background: rgba(220,38,38,0.18) !important; color: #F87171 !important; }
  :root[data-theme="dark"] .hm-app .btn-danger-sm:hover { background: #DC2626 !important; color: #fff !important; }

  /* ── forms ── */
  :root[data-theme="dark"] .hm-app .form-input,
  :root[data-theme="dark"] .hm-app .form-select,
  :root[data-theme="dark"] .hm-app .form-textarea {
    background: #0F1D33 !important; border-color: #1A2E4A !important; color: #E2E8F0 !important;
  }
  :root[data-theme="dark"] .hm-app .form-input::placeholder,
  :root[data-theme="dark"] .hm-app .form-textarea::placeholder { color: #334155 !important; }
  :root[data-theme="dark"] .hm-app .form-input:focus,
  :root[data-theme="dark"] .hm-app .form-select:focus,
  :root[data-theme="dark"] .hm-app .form-textarea:focus { border-color: #047857 !important; box-shadow: 0 0 0 3px rgba(4,120,87,0.15) !important; }
  :root[data-theme="dark"] .hm-app .form-label { color: #475569 !important; }

  /* inline select (used in some tabs) */
  :root[data-theme="dark"] .hm-app select[style] {
    background: #0F1D33 !important; border-color: #1A2E4A !important; color: #E2E8F0 !important;
  }

  /* ── modals ── */
  :root[data-theme="dark"] .hm-app .modal-box   { background: #0F1D33 !important; border-color: #1A2E4A !important; }
  :root[data-theme="dark"] .hm-app .modal-body  { background: #0A1628 !important; }
  :root[data-theme="dark"] .hm-app .modal-footer { background: #0F1D33 !important; border-top-color: #1A2E4A !important; }
  :root[data-theme="dark"] .hm-app .btn-cancel   { background: #111C30 !important; border-color: #1A2E4A !important; color: #64748B !important; }
  :root[data-theme="dark"] .hm-app .btn-cancel:hover { background: #1A2E4A !important; }
  /* delete modal */
  :root[data-theme="dark"] .hm-app .del-header   { background: rgba(220,38,38,0.12) !important; }
  :root[data-theme="dark"] .hm-app .del-icon-wrap { background: rgba(220,38,38,0.2) !important; }
  :root[data-theme="dark"] .hm-app .del-title     { color: #E2E8F0 !important; }
  :root[data-theme="dark"] .hm-app .del-msg       { color: #64748B !important; }

  /* ── badges ── */
  :root[data-theme="dark"] .hm-app .badge-green  { background: rgba(5,150,105,0.18) !important;  color: #34D399 !important; border-color: rgba(5,150,105,0.35) !important; }
  :root[data-theme="dark"] .hm-app .badge-teal   { background: rgba(5,150,105,0.15) !important;  color: #2DD4BF !important; border-color: rgba(5,150,105,0.3) !important; }
  :root[data-theme="dark"] .hm-app .badge-red    { background: rgba(220,38,38,0.18) !important;  color: #F87171 !important; border-color: rgba(220,38,38,0.35) !important; }
  :root[data-theme="dark"] .hm-app .badge-blue   { background: rgba(37,99,235,0.18) !important;  color: #93C5FD !important; border-color: rgba(37,99,235,0.35) !important; }
  :root[data-theme="dark"] .hm-app .badge-amber  { background: rgba(217,119,6,0.18) !important;  color: #FCD34D !important; border-color: rgba(217,119,6,0.35) !important; }
  :root[data-theme="dark"] .hm-app .badge-slate  { background: #1A2E4A !important;               color: #94A3B8 !important; border-color: #253650 !important; }
  :root[data-theme="dark"] .hm-app .badge-violet { background: rgba(124,58,237,0.18) !important; color: #C4B5FD !important; border-color: rgba(124,58,237,0.35) !important; }
  :root[data-theme="dark"] .hm-app .db-card-badge { background: rgba(5,150,105,0.18) !important; color: #34D399 !important; }

  /* ── empty state icon bg ── */
  :root[data-theme="dark"] .hm-app .empty-icon-wrap { background: #0F1D33 !important; }

  /* ── preview panel ── */
  :root[data-theme="dark"] .hm-app .preview-panel { background: #0F1D33 !important; border-color: #1A2E4A !important; }
  :root[data-theme="dark"] .hm-app .preview-btn.edit { background: rgba(5,150,105,0.15) !important; color: #34D399 !important; }
  :root[data-theme="dark"] .hm-app .preview-btn.edit:hover { background: #047857 !important; color: #fff !important; }
  :root[data-theme="dark"] .hm-app .preview-val { color: #E2E8F0 !important; }
  :root[data-theme="dark"] .hm-app .preview-label { color: #475569 !important; }

  /* ── dashboard text / sub-elements ── */
  :root[data-theme="dark"] .hm-app .db-card-title  { color: #E2E8F0 !important; }
  :root[data-theme="dark"] .hm-app .bar-label      { color: #64748B !important; }
  :root[data-theme="dark"] .hm-app .bar-val        { color: #E2E8F0 !important; }
  :root[data-theme="dark"] .hm-app .donut-val      { color: #E2E8F0 !important; }
  :root[data-theme="dark"] .hm-app .staff-name     { color: #E2E8F0 !important; }
  :root[data-theme="dark"] .hm-app .act-title      { color: #E2E8F0 !important; }
  :root[data-theme="dark"] .hm-app .appt-name      { color: #E2E8F0 !important; }
  :root[data-theme="dark"] .hm-app .kpi-section-title { color: #94A3B8 !important; }
  :root[data-theme="dark"] .hm-app .kpi-section-hdr  { border-color: #1A2E4A !important; }

  /* ── Dark mode: mod-header (top sticky banner on every page) ── */
  :root[data-theme="dark"] .hm-app .mod-header {
    background: #080F1E !important;
    border-bottom: 1px solid #1A2E4A !important;
    box-shadow: 0 2px 12px rgba(0,0,0,0.4) !important;
  }
  :root[data-theme="dark"] .hm-app .mod-header-icon {
    background: #111C30 !important; border-color: #1A2E4A !important;
  }
  :root[data-theme="dark"] .hm-app .mod-header-title { color: #E2E8F0 !important; }
  :root[data-theme="dark"] .hm-app .mod-header-sub   { color: #475569 !important; }
  :root[data-theme="dark"] .hm-app .mod-header-date  {
    background: #111C30 !important; border-color: #1A2E4A !important; color: #94A3B8 !important;
  }
  :root[data-theme="dark"] .hm-app .mod-hdr-btn {
    background: #111C30 !important; border-color: #1A2E4A !important; color: #94A3B8 !important;
  }
  :root[data-theme="dark"] .hm-app .mod-hdr-btn:hover {
    background: #1A2E4A !important; color: #34D399 !important; border-color: #047857 !important;
  }

  /* ── Dark mode: hm-banner (dashboard header) ── */
  :root[data-theme="dark"] .hm-app .hm-banner {
    background: #080F1E !important;
    border-color: #1A2E4A !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
  }
  :root[data-theme="dark"] .hm-app .hm-banner-date {
    background: #111C30 !important; border-color: #1A2E4A !important; color: #94A3B8 !important;
  }
  :root[data-theme="dark"] .hm-app .create-btn {
    background: #111C30 !important; border-color: #1A2E4A !important; color: #94A3B8 !important;
  }
  :root[data-theme="dark"] .hm-app .create-btn:hover {
    background: #1A2E4A !important; color: #34D399 !important; border-color: #047857 !important;
  }

  /* ── Dark mode: modal-header green gradient → dark ── */
  :root[data-theme="dark"] .hm-app .modal-header {
    background: #080F1E !important;
    border-bottom: 1px solid #1A2E4A !important;
  }

  /* ── Dark mode: tab-content-wrap and layout areas ── */
  :root[data-theme="dark"] .hm-app .tab-content-wrap { background: #0A1628 !important; }
  :root[data-theme="dark"] .hm-app .sec-hdr { background: #0A1628 !important; border-color: #1A2E4A !important; }
  :root[data-theme="dark"] .hm-app .filter-row { background: #0A1628 !important; border-color: #1A2E4A !important; }
  :root[data-theme="dark"] .hm-app .tbl-wrap { background: #0F1D33 !important; border-color: #1A2E4A !important; }
  :root[data-theme="dark"] .hm-app .db-wrap { background: #0A1628 !important; }

  /* ── Dark mode: KPI cards — replace vivid gradients with dark muted cards ── */
  :root[data-theme="dark"] .hm-app .kpi {
    background: #0F1D33 !important;
    box-shadow: 0 2px 12px rgba(0,0,0,0.35) !important;
    border: 1px solid #1A2E4A !important;
  }
  :root[data-theme="dark"] .hm-app .kpi:hover {
    background: #111C30 !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.45) !important;
  }
  /* Teal KPI */
  :root[data-theme="dark"] .hm-app .kpi.teal  { border-left: 3px solid #059669 !important; }
  :root[data-theme="dark"] .hm-app .kpi.green { border-left: 3px solid #34D399 !important; }
  :root[data-theme="dark"] .hm-app .kpi.blue  { border-left: 3px solid #3B82F6 !important; }
  :root[data-theme="dark"] .hm-app .kpi.red   { border-left: 3px solid #EF4444 !important; }
  :root[data-theme="dark"] .hm-app .kpi.amber { border-left: 3px solid #F59E0B !important; }
  :root[data-theme="dark"] .hm-app .kpi.violet{ border-left: 3px solid #8B5CF6 !important; }
  :root[data-theme="dark"] .hm-app .kpi.cyan  { border-left: 3px solid #06B6D4 !important; }
  :root[data-theme="dark"] .hm-app .kpi.slate { border-left: 3px solid #64748B !important; }

  /* KPI text in dark mode */
  :root[data-theme="dark"] .hm-app .kpi-label { color: #64748B !important; }
  :root[data-theme="dark"] .hm-app .kpi-value { color: #E2E8F0 !important; }
  :root[data-theme="dark"] .hm-app .kpi-sub   { color: #475569 !important; }

  /* KPI icon box per color */
  :root[data-theme="dark"] .hm-app .kpi.teal  .kpi-icon { background: rgba(5,150,105,0.15) !important; border-color: rgba(5,150,105,0.3) !important; }
  :root[data-theme="dark"] .hm-app .kpi.green .kpi-icon { background: rgba(52,211,153,0.12) !important; border-color: rgba(52,211,153,0.25) !important; }
  :root[data-theme="dark"] .hm-app .kpi.blue  .kpi-icon { background: rgba(59,130,246,0.15) !important; border-color: rgba(59,130,246,0.3) !important; }
  :root[data-theme="dark"] .hm-app .kpi.red   .kpi-icon { background: rgba(239,68,68,0.15)  !important; border-color: rgba(239,68,68,0.3)  !important; }
  :root[data-theme="dark"] .hm-app .kpi.amber .kpi-icon { background: rgba(245,158,11,0.15) !important; border-color: rgba(245,158,11,0.3) !important; }
  :root[data-theme="dark"] .hm-app .kpi.violet.kpi-icon { background: rgba(139,92,246,0.15) !important; border-color: rgba(139,92,246,0.3) !important; }
  :root[data-theme="dark"] .hm-app .kpi.violet .kpi-icon { background: rgba(139,92,246,0.15) !important; border-color: rgba(139,92,246,0.3) !important; }
  :root[data-theme="dark"] .hm-app .kpi.cyan  .kpi-icon { background: rgba(6,182,212,0.15)  !important; border-color: rgba(6,182,212,0.3)  !important; }
  :root[data-theme="dark"] .hm-app .kpi.slate .kpi-icon { background: rgba(100,116,139,0.15)!important; border-color: rgba(100,116,139,0.3)!important; }

  /* KPI value accent colors per type */
  :root[data-theme="dark"] .hm-app .kpi.teal  .kpi-value { color: #34D399 !important; }
  :root[data-theme="dark"] .hm-app .kpi.green .kpi-value { color: #6EE7B7 !important; }
  :root[data-theme="dark"] .hm-app .kpi.blue  .kpi-value { color: #93C5FD !important; }
  :root[data-theme="dark"] .hm-app .kpi.red   .kpi-value { color: #FCA5A5 !important; }
  :root[data-theme="dark"] .hm-app .kpi.amber .kpi-value { color: #FCD34D !important; }
  :root[data-theme="dark"] .hm-app .kpi.violet .kpi-value{ color: #C4B5FD !important; }
  :root[data-theme="dark"] .hm-app .kpi.cyan  .kpi-value { color: #67E8F9 !important; }



  .mod-header {
    background: linear-gradient(135deg, #065F46 0%, #047857 50%, #059669 100%);
    padding: 14px 24px;
    display: flex; align-items: center; justify-content: space-between;
    border-radius: 0;
    box-shadow: 0 2px 12px rgba(4,120,87,0.2);
    position: sticky; top: 0; z-index: 100;
  }
  .mod-header-left { display:flex; align-items:center; gap:14px; }
  .mod-header-icon {
    width: 44px; height: 44px;
    background: rgba(255,255,255,0.15);
    border-radius: 12px; border: 1px solid rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center; font-size: 22px;
  }
  .mod-header-title { font-size: 17px; font-weight: 800; color: #fff; letter-spacing: -0.3px; }
  .mod-header-sub   { font-size: 12px; color: rgba(255,255,255,0.65); margin-top: 2px; }
  .mod-header-right { display:flex; align-items:center; gap:10px; }
  .mod-header-date  {
    background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25);
    border-radius: 8px; padding: 6px 14px;
    font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.95);
  }
  .mod-header-actions { display:flex; gap:8px; }
  .mod-hdr-btn {
    background: rgba(255,255,255,0.18); border: 1.5px solid rgba(255,255,255,0.3);
    color: #fff; font-family: 'DM Sans',sans-serif;
    font-size: 12px; font-weight: 700; padding: 6px 14px;
    border-radius: 8px; cursor: pointer; transition: all 0.15s;
    display: flex; align-items: center; gap: 6px;
  }
  .mod-hdr-btn:hover { background: rgba(255,255,255,0.28); }

  /* ── KPI Section header ── */
  .kpi-section-hdr {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px 10px;
  }
  .kpi-section-title {
    font-size: 12px; font-weight: 800; color: #64748B;
    text-transform: uppercase; letter-spacing: 0.08em;
    display: flex; align-items: center; gap: 8px;
  }
  .kpi-section-title::before { content:''; width:3px; height:14px; background:#047857; border-radius:2px; }

  /* ── Tab content wrapper ── */
  .tab-content-wrap { padding: 0; }

  /* ── Banner ── */
  .hm-banner {
    background: linear-gradient(135deg, #0A1628 0%, #0C2244 30%, #047857 65%, #065F46 100%);
    border-radius: 14px; padding: 22px 28px;
    display: flex; align-items: center; justify-content: space-between;
    position: relative; overflow: hidden; margin-bottom: 12px;
    box-shadow: 0 10px 36px rgba(4,120,87,0.32);
    border: 1px solid rgba(255,255,255,0.06);
  }
  .hm-banner-deco { position:absolute; inset:0; border-radius:14px; overflow:hidden; pointer-events:none; }
  .hm-banner-deco::before { content:''; position:absolute; top:-50px; right:-50px; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,0.05); }
  .hm-banner-deco::after  { content:''; position:absolute; bottom:-30px; right:200px; width:120px; height:120px; border-radius:50%; background:rgba(16,185,129,0.12); }
  .hm-banner-left  { display:flex; align-items:center; gap:18px; position:relative; z-index:1; }
  .hm-banner-icon  { width:52px; height:52px; background:rgba(255,255,255,0.12); border-radius:14px; display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,0.18); font-size:26px; }
  .hm-banner-title { font-size:22px; font-weight:800; color:#fff; letter-spacing:-0.4px; }
  .hm-banner-sub   { font-size:13px; color:rgba(255,255,255,0.6); margin-top:3px; }
  .hm-banner-right { display:flex; align-items:center; gap:10px; position:relative; z-index:2; }
  .hm-banner-date  { background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); border-radius:10px; padding:8px 16px; font-size:12px; font-weight:600; color:rgba(255,255,255,0.9); }
  .create-btn { background:rgba(255,255,255,0.18); color:#fff; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:700; padding:8px 18px; border-radius:10px; border:1.5px solid rgba(255,255,255,0.3); cursor:pointer; display:flex; align-items:center; gap:7px; transition:all 0.15s; }
  .create-btn:hover { background:rgba(255,255,255,0.26); }

  /* ── Top Nav ── */
  .hm-topnav {
    display: flex; align-items: center; gap: 2px;
    background: #fff; border-radius: 14px;
    border: 1px solid #E2E8F0;
    padding: 6px 10px;
    margin-bottom: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    overflow-x: auto;
    scrollbar-width: none;
    flex-wrap: nowrap;
  }
  .hm-topnav::-webkit-scrollbar { display: none; }

  .hm-topnav-divider {
    width: 1px; height: 28px; background: #E8EDF5;
    flex-shrink: 0; margin: 0 4px;
  }

  .topnav-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 12px; border-radius: 9px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12.5px; font-weight: 600; color: #64748B;
    background: none; border: none; cursor: pointer;
    transition: all 0.14s; white-space: nowrap; flex-shrink: 0;
    position: relative;
  }
  .topnav-btn:hover { background: #F1F5F9; color: #047857; }
  .topnav-btn.active { background: linear-gradient(135deg,#F0FDF4,#DCFCE7); color: #047857; }

  .topnav-btn.dash-tab:hover { background: #ECFDF5; color: #047857; }
  .topnav-btn.dash-tab.active { background: linear-gradient(135deg,#ECFDF5,#D1FAE5); color: #065F46; }

  .topnav-btn.red-tab:hover { background: #FEF2F2; color: #DC2626; }
  .topnav-btn.red-tab.active { background: linear-gradient(135deg,#FEF2F2,#FEE2E2); color: #DC2626; }

  .topnav-btn.blue-tab:hover { background: #EFF6FF; color: #2563EB; }
  .topnav-btn.blue-tab.active { background: linear-gradient(135deg,#EFF6FF,#DBEAFE); color: #1D4ED8; }

  .topnav-btn.amber-tab:hover { background: #FFFBEB; color: #D97706; }
  .topnav-btn.amber-tab.active { background: linear-gradient(135deg,#FFFBEB,#FEF3C7); color: #D97706; }

  .topnav-btn.green-tab:hover { background: #F0FDF4; color: #047857; }
  .topnav-btn.green-tab.active { background: linear-gradient(135deg,#F0FDF4,#DCFCE7); color: #065F46; }

  .topnav-btn .topnav-emoji { font-size: 15px; }
  .topnav-btn .tab-badge {
    background: #DCFCE7; color: #047857;
    font-size: 10px; font-weight: 700;
    padding: 1px 6px; border-radius: 20px; line-height: 1.5;
  }
  .topnav-btn.active .tab-badge { background: #047857; color: #fff; }
  .topnav-btn.red-tab .tab-badge { background: #FEE2E2; color: #DC2626; }
  .topnav-btn.red-tab.active .tab-badge { background: #DC2626; color: #fff; }
  .topnav-btn.blue-tab .tab-badge { background: #DBEAFE; color: #2563EB; }
  .topnav-btn.blue-tab.active .tab-badge { background: #2563EB; color: #fff; }
  .topnav-btn.amber-tab .tab-badge { background: #FEF3C7; color: #D97706; }
  .topnav-btn.amber-tab.active .tab-badge { background: #D97706; color: #fff; }

  .topnav-section-label {
    font-size: 9.5px; font-weight: 800; color: #CBD5E1;
    text-transform: uppercase; letter-spacing: 0.1em;
    padding: 0 6px; flex-shrink: 0;
  }

  /* ── KPI ── */
  .kpi-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:14px; margin-bottom:22px; }
  .kpi-grid.cols-4 { grid-template-columns:repeat(4,1fr); }
  .kpi-grid.cols-6 { grid-template-columns:repeat(6,1fr); }
  .kpi { border-radius:14px; padding:18px 20px; display:flex; align-items:center; justify-content:space-between; position:relative; overflow:hidden; cursor:default; transition:transform 0.18s,box-shadow 0.18s; }
  .kpi:hover { transform:translateY(-2px); }
  .kpi.teal   { background:linear-gradient(135deg,#065F46,#047857); box-shadow:0 4px 20px rgba(4,120,87,0.28); }
  .kpi.blue   { background:linear-gradient(135deg,#1E3A8A,#2563EB); box-shadow:0 4px 20px rgba(37,99,235,0.28); }
  .kpi.green  { background:linear-gradient(135deg,#065F46,#059669); box-shadow:0 4px 20px rgba(5,150,105,0.28); }
  .kpi.red    { background:linear-gradient(135deg,#7F1D1D,#DC2626); box-shadow:0 4px 20px rgba(220,38,38,0.28); }
  .kpi.amber  { background:linear-gradient(135deg,#92400E,#D97706); box-shadow:0 4px 20px rgba(217,119,6,0.28); }
  .kpi.violet { background:linear-gradient(135deg,#4C1D95,#7C3AED); box-shadow:0 4px 20px rgba(124,58,237,0.28); }
  .kpi.cyan   { background:linear-gradient(135deg,#164E63,#0891B2); box-shadow:0 4px 20px rgba(8,145,178,0.28); }
  .kpi.slate  { background:linear-gradient(135deg,#334155,#475569); box-shadow:0 4px 20px rgba(71,85,105,0.24); }
  .kpi::after { content:''; position:absolute; right:-18px; bottom:-18px; width:80px; height:80px; border-radius:50%; background:rgba(255,255,255,0.08); }
  .kpi-label  { font-size:10px; font-weight:700; color:rgba(255,255,255,0.68); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px; }
  .kpi-value  { font-size:30px; font-weight:800; color:#fff; line-height:1; }
  .kpi-sub    { font-size:11px; color:rgba(255,255,255,0.55); margin-top:5px; }
  .kpi-icon   { width:42px; height:42px; background:rgba(255,255,255,0.16); border-radius:12px; display:flex; align-items:center; justify-content:center; position:relative; z-index:1; border:1px solid rgba(255,255,255,0.2); flex-shrink:0; }

  /* ── Content card ── */
  .hm-content {
    background: #fff; border-radius: 0;
    border: none;
    overflow: hidden; min-height: 100vh;
  }
  .card { background:#fff; border-radius:16px; border:1px solid #E2E8F0; box-shadow:0 2px 12px rgba(0,0,0,0.06); overflow:hidden; }

  /* ── Section header ── */
  .sec-hdr { display:flex; justify-content:space-between; align-items:center; padding:14px 20px; border-bottom:1px solid #F1F5F9; }
  .sec-title { font-size:14px; font-weight:700; color:#0F172A; display:flex; align-items:center; gap:8px; }
  .sec-title-icon { width:30px; height:30px; background:linear-gradient(135deg,#ECFDF5,#D1FAE5); border-radius:8px; display:flex; align-items:center; justify-content:center; color:#047857; }
  .sec-right { display:flex; align-items:center; gap:10px; }

  /* ── Search ── */
  .search-wrap { position:relative; }
  .search-wrap svg { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:#94A3B8; }
  .search-input { font-family:'DM Sans',sans-serif; font-size:13px; color:#0F172A; background:#F8FAFC; border:1.5px solid #E2E8F0; border-radius:9px; padding:7px 12px 7px 34px; outline:none; width:200px; transition:border 0.15s; }
  .search-input:focus { border-color:#047857; background:#fff; box-shadow:0 0 0 3px rgba(4,120,87,0.08); }
  .search-input::placeholder { color:#94A3B8; }

  /* ── Filter pills ── */
  .filter-row { display:flex; gap:6px; padding:10px 20px; border-bottom:1px solid #F1F5F9; flex-wrap:wrap; }
  .filter-pill { font-size:11.5px; font-weight:600; padding:4px 12px; border-radius:20px; border:1.5px solid #E2E8F0; background:#fff; color:#64748B; cursor:pointer; transition:all 0.13s; }
  .filter-pill:hover { border-color:#047857; color:#047857; }
  .filter-pill.active { background:#047857; color:#fff; border-color:#047857; }

  /* ── Buttons ── */
  .btn-primary { background:#047857; color:#fff; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; padding:8px 16px; border-radius:8px; border:none; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.15s; white-space:nowrap; }
  .btn-primary:hover { background:#065F46; transform:translateY(-1px); }
  .btn-primary:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
  .btn-outline { background:#fff; color:#475569; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; padding:7px 14px; border-radius:8px; border:1.5px solid #CBD5E1; cursor:pointer; transition:all 0.15s; }
  .btn-outline:hover { border-color:#047857; color:#047857; background:#F0FDF4; }
  .btn-danger-sm { background:#FEE2E2; color:#DC2626; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; padding:6px 12px; border-radius:7px; border:none; cursor:pointer; transition:all 0.15s; }
  .btn-danger-sm:hover { background:#DC2626; color:#fff; }
  .btn-icon-sm { background:none; border:none; cursor:pointer; display:flex; align-items:center; padding:5px; border-radius:7px; transition:background 0.12s; }
  .btn-icon-sm:hover { background:#F1F5F9; }
  .btn-icon-sm.edit:hover  { background:#ECFDF5; }
  .btn-icon-sm.del:hover   { background:#FEF2F2; }

  /* ── Table ── */
  .tbl-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; }
  thead { background:#F8FAFC; }
  th { font-size:10px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:0.07em; padding:10px 16px; text-align:left; border-bottom:1px solid #E8EDF5; white-space:nowrap; }
  td { font-size:13px; color:#1E293B; padding:11px 16px; border-bottom:1px solid #F1F5F9; vertical-align:middle; }
  tr:last-child td { border-bottom:none; }
  tr:hover td { background:#F0FDF4; }
  .mono { font-family:'DM Mono',monospace; font-size:11.5px; }
  .actions-cell { display:flex; gap:4px; align-items:center; }
  .name-cell { display:flex; align-items:center; gap:10px; }
  .name-text  { font-weight:700; font-size:13px; color:#0F172A; }
  .name-sub   { font-size:11px; color:#94A3B8; }

  /* ── Badges ── */
  .badge { display:inline-flex; align-items:center; gap:4px; font-size:10.5px; font-weight:700; padding:3px 9px; border-radius:20px; white-space:nowrap; }
  .badge-green  { background:#ECFDF5; color:#059669; border:1px solid #A7F3D0; }
  .badge-red    { background:#FEF2F2; color:#DC2626; border:1px solid #FECACA; }
  .badge-blue   { background:#EFF6FF; color:#1D4ED8; border:1px solid #BFDBFE; }
  .badge-amber  { background:#FFFBEB; color:#D97706; border:1px solid #FDE68A; }
  .badge-violet { background:#F5F3FF; color:#7C3AED; border:1px solid #DDD6FE; }
  .badge-cyan   { background:#ECFEFF; color:#0891B2; border:1px solid #A5F3FC; }
  .badge-slate  { background:#F1F5F9; color:#475569; border:1px solid #CBD5E1; }
  .badge-teal   { background:#F0FDF4; color:#047857; border:1px solid #6EE7B7; }
  .badge-dot    { width:5px; height:5px; border-radius:50%; }

  /* ── Empty / Loading ── */
  .empty-state { text-align:center; padding:52px 20px; }
  .empty-icon-wrap { width:60px; height:60px; border-radius:14px; background:#F0FDF4; display:flex; align-items:center; justify-content:center; margin:0 auto 14px; font-size:28px; }
  .empty-title { font-size:14px; font-weight:600; color:#94A3B8; margin-bottom:4px; }
  .loading-state { display:flex; align-items:center; justify-content:center; gap:8px; padding:48px 20px; color:#94A3B8; font-size:13px; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .spin-anim { animation:spin 0.8s linear infinite; display:inline-flex; }

  /* ── Modal ── */
  .modal-overlay { position:fixed; inset:0; background:rgba(15,23,42,0.55); display:flex; align-items:center; justify-content:center; z-index:1000; backdrop-filter:blur(4px); padding:80px 20px 20px; overflow-y:auto; }
  .modal-box { background:#fff; border-radius:18px; width:100%; box-shadow:0 24px 64px rgba(0,0,0,0.22); overflow:hidden; animation:modalIn 0.18s ease; display:flex; flex-direction:column; max-height:calc(100vh - 100px); }
  .modal-box.sm { max-width:460px; }
  .modal-box.md { max-width:620px; }
  .modal-box.lg { max-width:820px; }
  .modal-box.xl { max-width:960px; }
  @keyframes modalIn { from{opacity:0;transform:scale(0.96) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
  .modal-header { background:linear-gradient(135deg,#0A1628 0%,#065F46 60%,#047857 100%); padding:18px 22px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
  .modal-hdr-left  { display:flex; align-items:center; gap:12px; }
  .modal-hdr-icon  { width:38px; height:38px; background:rgba(255,255,255,0.14); border-radius:10px; display:flex; align-items:center; justify-content:center; color:#fff; border:1px solid rgba(255,255,255,0.2); font-size:18px; }
  .modal-hdr-title { font-size:14px; font-weight:700; color:#fff; }
  .modal-hdr-sub   { font-size:11px; color:rgba(255,255,255,0.55); margin-top:2px; }
  .modal-close { background:none; border:none; cursor:pointer; color:rgba(255,255,255,0.6); display:flex; padding:5px; border-radius:7px; transition:all 0.12s; font-size:18px; font-weight:700; }
  .modal-close:hover { background:rgba(255,255,255,0.12); color:#fff; }
  .modal-body   { padding:20px 24px; overflow-y:auto; background:#F8FAFC; flex:1; }
  .modal-footer { padding:14px 22px; border-top:1px solid #E2E8F0; display:flex; justify-content:flex-end; gap:10px; background:#fff; flex-shrink:0; }

  /* ── Form ── */
  .form-group { display:flex; flex-direction:column; gap:5px; }
  .form-label { font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:0.05em; }
  .form-label span { color:#EF4444; margin-left:3px; }
  .form-input, .form-select, .form-textarea {
    font-family:'DM Sans',sans-serif; font-size:13px; color:#0F172A; background:#fff;
    border:1.5px solid #E2E8F0; border-radius:9px; padding:9px 12px; width:100%; outline:none;
    transition:border 0.15s,box-shadow 0.15s;
  }
  .form-input:focus,.form-select:focus,.form-textarea:focus { border-color:#047857; box-shadow:0 0 0 3px rgba(4,120,87,0.09); }
  .form-input::placeholder,.form-textarea::placeholder { color:#94A3B8; }
  .form-input.error,.form-select.error { border-color:#EF4444!important; }
  .form-textarea { resize:vertical; min-height:80px; }
  .field-error { font-size:10px; color:#EF4444; font-weight:600; margin-top:2px; }
  select.form-select {
    appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat:no-repeat; background-position:right 10px center; padding-right:30px; cursor:pointer;
  }
  .form-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
  .form-grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; margin-bottom:14px; }
  .form-full   { margin-bottom:14px; }
  .sec-divider { font-size:10px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:14px; display:flex; align-items:center; gap:8px; }
  .sec-divider::after { content:''; flex:1; height:1px; background:#E2E8F0; }

  /* ── Delete dialog ── */
  .del-header { background:#FEF2F2; padding:24px; text-align:center; }
  .del-icon-wrap { width:52px; height:52px; border-radius:50%; background:#FEE2E2; display:flex; align-items:center; justify-content:center; margin:0 auto 12px; font-size:24px; }
  .del-title { font-size:15px; font-weight:700; color:#1E293B; margin-bottom:4px; }
  .del-desc  { font-size:13px; color:#64748B; line-height:1.5; }
  .del-footer { padding:14px 20px; display:flex; gap:12px; border-top:1px solid #FEE2E2; }
  .btn-cancel { flex:1; background:#fff; color:#64748B; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; padding:9px; border-radius:9px; border:1.5px solid #E2E8F0; cursor:pointer; transition:all 0.15s; }
  .btn-cancel:hover { background:#F8FAFC; }
  .btn-del { flex:1; background:linear-gradient(135deg,#DC2626,#EF4444); color:#fff; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:700; padding:9px; border-radius:9px; border:none; cursor:pointer; transition:all 0.15s; }
  .btn-del:hover { background:linear-gradient(135deg,#B91C1C,#DC2626); }

  /* ── Progress bar ── */
  .prog-bar { height:2px; background:linear-gradient(90deg,#047857,#059669); animation:progAnim 1.2s ease-in-out infinite; }
  @keyframes progAnim { 0%{width:0%;margin-left:0} 50%{width:70%;margin-left:15%} 100%{width:0%;margin-left:100%} }

  /* ── Dashboard specific ── */
  .db-wrap { padding:22px; }
  .db-top-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:20px; }
  .db-bottom-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .db-card { background:#fff; border-radius:14px; border:1px solid #E2E8F0; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.05); }
  .db-card-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .db-card-title { font-size:13px; font-weight:700; color:#0F172A; display:flex; align-items:center; gap:8px; }
  .db-card-badge { font-size:10px; font-weight:700; background:#ECFDF5; color:#047857; padding:3px 8px; border-radius:20px; }

  /* Bed status visual */
  .bed-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
  .bed-item { border-radius:8px; padding:10px; text-align:center; }
  .bed-item.occupied { background:linear-gradient(135deg,#FEE2E2,#FECACA); border:1px solid #FECACA; }
  .bed-item.available { background:linear-gradient(135deg,#ECFDF5,#D1FAE5); border:1px solid #BBF7D0; }
  .bed-item.maintenance { background:linear-gradient(135deg,#FEF3C7,#FDE68A); border:1px solid #FDE68A; }
  .bed-item.reserved { background:linear-gradient(135deg,#EFF6FF,#DBEAFE); border:1px solid #BFDBFE; }
  .bed-num { font-size:20px; font-weight:800; }
  .bed-lbl { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; margin-top:2px; opacity:0.75; }

  /* Bar row */
  .bar-row { display:flex; align-items:center; gap:10px; padding:9px 0; border-bottom:1px solid #F8FAFC; }
  .bar-row:last-child { border-bottom:none; }
  .bar-label { font-size:12px; color:#475569; flex:1.2; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .bar-track { flex:2; height:7px; background:#F1F5F9; border-radius:10px; overflow:hidden; }
  .bar-fill  { height:100%; border-radius:10px; transition:width 0.6s ease; }
  .bar-val   { font-size:12px; font-weight:700; color:#0F172A; min-width:30px; text-align:right; }
  .bar-pct   { font-size:10px; color:#94A3B8; min-width:34px; text-align:right; }

  /* Staff availability */
  .staff-row { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid #F8FAFC; }
  .staff-row:last-child { border-bottom:none; }
  .staff-av { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; color:#fff; flex-shrink:0; }
  .staff-name { font-size:13px; font-weight:600; color:#0F172A; flex:1; }
  .staff-role { font-size:11px; color:#94A3B8; }
  .staff-status { font-size:11px; font-weight:700; padding:3px 9px; border-radius:20px; }

  /* Activity feed */
  .activity-item { display:flex; align-items:flex-start; gap:12px; padding:10px 0; border-bottom:1px solid #F8FAFC; }
  .activity-item:last-child { border-bottom:none; }
  .act-icon { width:32px; height:32px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }
  .act-body { flex:1; min-width:0; }
  .act-title { font-size:12.5px; font-weight:600; color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .act-meta  { font-size:11px; color:#94A3B8; margin-top:2px; }

  /* Donut */
  .donut-wrap { display:flex; align-items:center; gap:16px; }
  .donut-legend { display:flex; flex-direction:column; gap:10px; flex:1; }
  .donut-legend-item { display:flex; align-items:center; gap:8px; }
  .donut-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
  .donut-lbl { font-size:12px; color:#64748B; flex:1; }
  .donut-val { font-size:13px; font-weight:700; color:#0F172A; }
  .donut-pct { font-size:10px; color:#94A3B8; }

  /* Upcoming appointments */
  .appt-item { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid #F8FAFC; }
  .appt-item:last-child { border-bottom:none; }
  .appt-time { background:#ECFDF5; border-radius:8px; padding:4px 8px; text-align:center; flex-shrink:0; min-width:50px; }
  .appt-hr   { font-size:14px; font-weight:800; color:#047857; line-height:1; }
  .appt-min  { font-size:9px; font-weight:700; color:#6EE7B7; text-transform:uppercase; }
  .appt-body { flex:1; min-width:0; }
  .appt-name { font-size:12.5px; font-weight:600; color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .appt-meta { font-size:11px; color:#94A3B8; margin-top:2px; }

  /* KPI mini trend sparkline */
  .sparkline { stroke-dasharray:1000; stroke-dashoffset:1000; animation:dash 1.2s ease forwards; }
  @keyframes dash { to{stroke-dashoffset:0;} }

  /* Preview panel */
  .preview-panel {
    position:fixed; top:60px; right:0; height:calc(100vh - 60px); width:360px;
    background:#fff; border-left:1px solid #E2E8F0;
    box-shadow:-8px 0 40px rgba(0,0,0,0.12);
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
  .preview-code { font-size:11px; color:rgba(255,255,255,0.55); margin-top:2px; font-family:'DM Mono',monospace; }
  .preview-close { width:34px; height:34px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.15); border:1.5px solid rgba(255,255,255,0.3); color:#fff; border-radius:10px; cursor:pointer; font-size:18px; font-weight:700; transition:all 0.15s; }
  .preview-close:hover { background:rgba(239,68,68,0.7); }
  .preview-actions { display:flex; gap:8px; padding:12px 16px; border-bottom:1px solid #F1F5F9; background:#FAFBFD; }
  .preview-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; padding:8px 10px; border-radius:8px; cursor:pointer; transition:all 0.15s; border:none; }
  .preview-btn.edit { background:#ECFDF5; color:#047857; }
  .preview-btn.edit:hover { background:#047857; color:#fff; }
  .preview-btn.del  { background:#FEF2F2; color:#DC2626; }
  .preview-btn.del:hover { background:#DC2626; color:#fff; }
  .preview-body { flex:1; overflow-y:auto; padding:0 0 24px; }
  .preview-section { padding:14px 18px 0; }
  .preview-section-title { font-size:10px; font-weight:800; color:#94A3B8; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:10px; display:flex; align-items:center; gap:6px; }
  .preview-section-title::after { content:''; flex:1; height:1px; background:#F1F5F9; }
  .preview-row { display:flex; align-items:flex-start; justify-content:space-between; padding:8px 0; border-bottom:1px solid #F8FAFC; gap:12px; }
  .preview-row:last-child { border-bottom:none; }
  .preview-label { font-size:11.5px; color:#94A3B8; font-weight:500; flex-shrink:0; min-width:110px; }
  .preview-val { font-size:12.5px; color:#0F172A; font-weight:600; text-align:right; line-height:1.4; }

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

/* ═══════════════════════════════════════════════════════════════════════
   SVG ICONS
═══════════════════════════════════════════════════════════════════════ */
const IcSearch = <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcPlus   = <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcX      = <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcWarn   = <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcSpin   = <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;

/* ═══════════════════════════════════════════════════════════════════════
   SMALL SHARED COMPONENTS
═══════════════════════════════════════════════════════════════════════ */
function Badge({ children, color = "slate" }) {
  return <span className={`badge badge-${color}`}>{children}</span>;
}

function StatusBadge({ value }) {
  const v = (value || "").toLowerCase();
  if (["active","admitted","available","completed","discharged"].some(k=>v.includes(k)))
    return <Badge color="green"><span className="badge-dot" style={{background:"#059669"}}/>{value}</Badge>;
  if (["critical","emergency","occupied","urgent"].some(k=>v.includes(k)))
    return <Badge color="red"><span className="badge-dot" style={{background:"#DC2626"}}/>{value}</Badge>;
  if (["pending","in_progress","scheduled","waiting"].some(k=>v.includes(k)))
    return <Badge color="amber">{value}</Badge>;
  if (["maintenance","reserved"].some(k=>v.includes(k)))
    return <Badge color="blue">{value}</Badge>;
  if (!value) return <Badge color="slate">—</Badge>;
  return <Badge color="slate">{value}</Badge>;
}

function KpiCard({ label, value, color, icon, sub }) {
  return (
    <div className={`kpi ${color}`}>
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

/* Form helpers */
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
          <div className="del-desc"><strong>"{itemName}"</strong> will be permanently removed.</div>
        </div>
        <div className="del-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-del" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DASHBOARD TAB
═══════════════════════════════════════════════════════════════════════ */
function DashboardTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [summary, patients, admissions, staff] = await Promise.all([
          API.get("/hospital/dashboard/summary").then(r=>r.data).catch(()=>null),
          API.get("/hospital/patient/list").then(r=>r.data||[]).catch(()=>[]),
          API.get("/hospital/admission/list").then(r=>r.data||[]).catch(()=>[]),
          API.get("/hospital/staff/list").then(r=>r.data||[]).catch(()=>[]),
        ]);
        setData({ summary, patients, admissions, beds:[], staff });
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return (
    <div className="db-wrap" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:400}}>
      <div className="loading-state"><span className="spin-anim">{IcSpin}</span> Loading dashboard…</div>
    </div>
  );

  const s         = data?.summary || {};
  const patients  = data?.patients || [];
  const appts     = data?.appointments || [];
  const beds      = data?.beds || [];
  const staff     = data?.staff || [];

  const totalPatients  = s.totalPatients  || patients.length || 0;
  const todayAdmit     = s.todayAdmissions|| patients.filter(p=>p.admissionDate?.startsWith(new Date().toISOString().slice(0,10))).length || 0;
  const totalBeds      = s.totalBeds      || beds.length || 0;
  const occupiedBeds   = s.occupiedBeds   || beds.filter(b=>(b.status||"").toLowerCase()==="occupied").length || 0;
  const availBeds      = totalBeds - occupiedBeds;
  const todayAppts     = s.todayAppointments || appts.filter(a=>a.appointmentDate?.startsWith(new Date().toISOString().slice(0,10))).length || 0;
  const emergencyCases = s.emergencyCases || 0;
  const discharged     = s.dischargedToday|| 0;
  const occupancyPct   = totalBeds>0 ? Math.round(occupiedBeds/totalBeds*100) : 0;

  const deptMap = {};
  patients.forEach(p=>{ const k=p.department||p.specialization||"General"; deptMap[k]=(deptMap[k]||0)+1; });
  const deptData = Object.entries(deptMap).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const maxDept  = Math.max(...deptData.map(d=>d[1]),1);
  const deptColors = ["#047857","#2563EB","#D97706","#7C3AED","#DC2626","#0891B2"];

  const bedTypes = ["ICU","General","Private","Ward","NICU"];
  const bedTypeData = bedTypes.map((t,i)=>({
    label:t,
    total: beds.filter(b=>(b.bedType||b.type||"General")===t).length || Math.round(totalBeds/5*(i===1?2.2:i===2?1.5:0.8)) || 0,
    occupied: Math.round((s[`${t.toLowerCase()}Occupied`]||occupiedBeds/5)),
    color: ["#DC2626","#2563EB","#7C3AED","#059669","#0891B2"][i],
  }));

  const todayStr = new Date().toISOString().slice(0,10);
  const upcomingAppts = [...appts]
    .filter(a=>a.appointmentDate>=todayStr && a.status!=="completed")
    .sort((a,b)=>a.appointmentTime?.localeCompare(b.appointmentTime)||0)
    .slice(0,5);

  const recentPatients = [...patients].sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)).slice(0,5);

  const staffRoles = ["Doctors","Nurses","Technicians","ER Staff"];
  const staffData  = staffRoles.map((r,i)=>{
    const cnt = staff.filter(m=>(m.role||m.department||"").toLowerCase().includes(r.slice(0,-1).toLowerCase())).length;
    const total = staff.length > 0 ? Math.max(cnt, 1) : 0;
    const pct = s[r.toLowerCase()+"Pct"] || (total > 0 ? Math.round(cnt/total*100) : 0);
    return { label:r, count:cnt, total, pct, color:deptColors[i] };
  });

  function Donut({ data: slices, cx=50, cy=50, r=42, inner=22 }) {
    let cum=-90;
    const paths = slices.map(d=>{
      const frac=d.pct/100; const start=cum; cum+=frac*360; const end=cum;
      const s2=(a)=>({x:cx+r*Math.cos(a*Math.PI/180), y:cy+r*Math.sin(a*Math.PI/180)});
      const p1=s2(start),p2=s2(end);
      const large=frac>0.5?1:0;
      const path=frac>=0.999
        ? `M${cx} ${cy-r} A${r} ${r} 0 1 1 ${cx-0.001} ${cy-r}Z`
        : `M${cx} ${cy} L${p1.x} ${p1.y} A${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}Z`;
      return {...d,path};
    });
    return (
      <svg width="100" height="100" viewBox="0 0 100 100">
        {paths.map((d,i)=><path key={i} d={d.path} fill={d.color} opacity={0.9}/>)}
        <circle cx={cx} cy={cy} r={inner} fill="#fff"/>
        <text x={cx} y={cy-5} textAnchor="middle" fontSize="13" fontWeight="800" fill="#0F172A">{occupancyPct}%</text>
        <text x={cx} y={cy+9} textAnchor="middle" fontSize="7" fill="#94A3B8">OCCUPANCY</text>
      </svg>
    );
  }

  const todayStr2 = new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"long",year:"numeric"});
  return (
    <div className="db-wrap" style={{padding:0}}>
      {/* Dashboard Header */}
      <div className="mod-header">
        <div className="mod-header-left">
          <div className="mod-header-icon">🏥</div>
          <div>
            <div className="mod-header-title">Hospital Management</div>
            <div className="mod-header-sub">Dashboard · Overview · Analytics</div>
          </div>
        </div>
        <div className="mod-header-right">
          <div className="mod-header-date">📅 {todayStr2}</div>
          <div className="mod-header-actions">
            <button className="mod-hdr-btn">📋 Overview</button>
            <button className="mod-hdr-btn">📊 Reports</button>
          </div>
        </div>
      </div>

      <div className="kpi-section-hdr" style={{padding:"12px 20px 10px"}}>
        <div className="kpi-section-title">Live Overview</div>
      </div>
      <div style={{padding:"0 20px"}}>
      <div className="kpi-grid cols-6" style={{marginBottom:20}}>
        <KpiCard label="Total Patients"    value={totalPatients}  color="teal"   icon="🏥" sub="All registered"/>
        <KpiCard label="Today Admissions"  value={todayAdmit}     color="blue"   icon="🛏️" sub="New today"/>
        <KpiCard label="Bed Occupancy"     value={`${occupancyPct}%`} color={occupancyPct>85?"red":"green"} icon="📊" sub={`${occupiedBeds}/${totalBeds} beds`}/>
        <KpiCard label="Today Appts"       value={todayAppts}     color="amber"  icon="📅" sub="Scheduled"/>
        <KpiCard label="Emergency Cases"   value={emergencyCases} color="red"    icon="🚨" sub="Active"/>
        <KpiCard label="Discharged Today"  value={discharged}     color="violet" icon="✅" sub="Cleared"/>
      </div>
      </div>

      <div className="db-top-row">
        <div className="db-card">
          <div className="db-card-hdr">
            <div className="db-card-title">🛏️ Bed Status</div>
            <span className="db-card-badge">{totalBeds} Total</span>
          </div>
          <div className="bed-grid">
            <div className="bed-item occupied">
              <div className="bed-num" style={{color:"#DC2626"}}>{occupiedBeds}</div>
              <div className="bed-lbl" style={{color:"#DC2626"}}>Occupied</div>
            </div>
            <div className="bed-item available">
              <div className="bed-num" style={{color:"#059669"}}>{availBeds}</div>
              <div className="bed-lbl" style={{color:"#059669"}}>Available</div>
            </div>
            <div className="bed-item maintenance">
              <div className="bed-num" style={{color:"#D97706"}}>{s.maintenanceBeds||beds.filter(b=>(b.status||"").toLowerCase()==="maintenance").length||2}</div>
              <div className="bed-lbl" style={{color:"#D97706"}}>Maintenance</div>
            </div>
            <div className="bed-item reserved">
              <div className="bed-num" style={{color:"#2563EB"}}>{s.reservedBeds||beds.filter(b=>(b.status||"").toLowerCase()==="reserved").length||4}</div>
              <div className="bed-lbl" style={{color:"#2563EB"}}>Reserved</div>
            </div>
          </div>
          <div style={{marginTop:14}}>
            {bedTypeData.map((bt,i)=>(
              <div className="bar-row" key={i}>
                <div className="bar-label">{bt.label}</div>
                <div className="bar-track"><div className="bar-fill" style={{width:`${bt.total>0?Math.round(bt.occupied/bt.total*100):0}%`,background:bt.color}}/></div>
                <div className="bar-val" style={{color:bt.color}}>{bt.occupied}</div>
                <div className="bar-pct">/{bt.total}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="db-card">
          <div className="db-card-hdr">
            <div className="db-card-title">📊 Occupancy & Staff</div>
          </div>
          <div className="donut-wrap" style={{marginBottom:14}}>
            <Donut data={[
              {pct:occupancyPct,color:"#047857"},
              {pct:100-occupancyPct,color:"#F1F5F9"},
            ]}/>
            <div className="donut-legend">
              {[["#047857","Occupied",occupiedBeds],["#059669","Available",availBeds],["#D97706","Maintenance",s.maintenanceBeds||2],["#2563EB","Reserved",s.reservedBeds||4]].map(([c,l,v])=>(
                <div className="donut-legend-item" key={l}>
                  <div className="donut-dot" style={{background:c}}/>
                  <div className="donut-lbl">{l}</div>
                  <div className="donut-val">{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{borderTop:"1px solid #F1F5F9",paddingTop:12}}>
            <div style={{fontSize:11,fontWeight:800,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>Staff Availability</div>
            {staffData.slice(0,4).map((sd,i)=>(
              <div className="bar-row" key={i}>
                <div className="bar-label">{sd.label}</div>
                <div className="bar-track"><div className="bar-fill" style={{width:`${sd.pct}%`,background:sd.color}}/></div>
                <div className="bar-val" style={{color:sd.color,fontSize:11}}>{sd.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="db-card">
          <div className="db-card-hdr">
            <div className="db-card-title">📅 Today's Appointments</div>
            <span className="db-card-badge">{todayAppts}</span>
          </div>
          {upcomingAppts.length===0 ? (
            <div style={{textAlign:"center",padding:"30px 0",color:"#94A3B8",fontSize:13}}>No appointments today</div>
          ) : upcomingAppts.map((a,i)=>{
            const t=(a.appointmentTime||"").split(":"); const hr=t[0]||"--"; const mn=t[1]||"00";
            return (
              <div className="appt-item" key={i}>
                <div className="appt-time"><div className="appt-hr">{hr}:{mn}</div><div className="appt-min">{Number(hr)<12?"AM":"PM"}</div></div>
                <div className="appt-body">
                  <div className="appt-name">{a.patientName||a.name||"Patient"}</div>
                  <div className="appt-meta">{a.doctorName||"—"} · {a.department||"General"}</div>
                </div>
                <StatusBadge value={a.status||"Scheduled"}/>
              </div>
            );
          })}
        </div>
      </div>

      <div className="db-bottom-row">
        <div className="db-card">
          <div className="db-card-hdr">
            <div className="db-card-title">🏨 Patient by Department</div>
            <span className="db-card-badge">{deptData.length} Depts</span>
          </div>
          {deptData.length===0 ? (
            <div style={{textAlign:"center",padding:"20px 0",color:"#94A3B8",fontSize:13}}>No data</div>
          ) : deptData.map(([name,count],i)=>(
            <div className="bar-row" key={i}>
              <div className="bar-label">{name}</div>
              <div className="bar-track"><div className="bar-fill" style={{width:`${Math.round(count/maxDept*100)}%`,background:deptColors[i%deptColors.length]}}/></div>
              <div className="bar-val" style={{color:deptColors[i%deptColors.length]}}>{count}</div>
              <div className="bar-pct">{Math.round(count/totalPatients*100)||0}%</div>
            </div>
          ))}
        </div>

        <div className="db-card">
          <div className="db-card-hdr">
            <div className="db-card-title">🔔 Recent Admissions</div>
          </div>
          {recentPatients.length===0 ? (
            <div style={{textAlign:"center",padding:"20px 0",color:"#94A3B8",fontSize:13}}>No recent patients</div>
          ) : recentPatients.map((p,i)=>{
            const icons=["🧑‍⚕️","🏥","🚑","💊","🩺"];
            const bgs=["#ECFDF5","#EFF6FF","#FEF2F2","#FFFBEB","#F5F3FF"];
            return (
              <div className="activity-item" key={i}>
                <div className="act-icon" style={{background:bgs[i%5],fontSize:16}}>{icons[i%5]}</div>
                <div className="act-body">
                  <div className="act-title">{p.patientName||p.userName||"Patient"}</div>
                  <div className="act-meta">{p.department||p.problem||"General"} · {fmt(p.createdAt||p.admissionDate)}</div>
                </div>
                <StatusBadge value={p.status||"Active"}/>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   GENERIC CRUD TABLE TAB
═══════════════════════════════════════════════════════════════════════ */
function CrudTab({ config }) {
  const { title, icon, endpoint, columns, formFields, statusField, kpiCards, filterOptions, emptyIcon } = config;
  const [rows, setRows]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("all");
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [delItem, setDelItem] = useState(null);
  const [form, setForm]       = useState({});
  const [saving, setSaving]   = useState(false);
  const [preview, setPreview] = useState(null);
  const [snack, setSnack]     = useState({open:false,msg:"",sev:"success"});
  const [hospitals, setHospitals] = useState([]);

  // ── Hardcoded lookup data (replaces API-based useLookup) ────────────────────────
  const LOOKUP_DATA = {
    GENDER:                 ["Male","Female","Other"],
    BLOOD_GROUP:            ["A+","A-","B+","B-","AB+","AB-","O+","O-"],
    PATIENT_TYPE:           ["General","VIP","Insurance","Government","Emergency"],
    ACTIVE_STATUS:          ["Active","Inactive","Suspended"],
    STAFF_STATUS:           ["Active","Inactive","On Leave","Resigned"],
    STAFF_ROLE:             ["Doctor","Nurse","Receptionist","Lab Technician","Pharmacist","Ward Boy","Admin","Accountant","Security"],
    SPECIALIZATION:         ["General Medicine","Cardiology","Orthopedics","Neurology","Pediatrics","Gynecology","Dermatology","ENT","Ophthalmology","Psychiatry","Radiology","Pathology","Anesthesiology","Oncology","Urology","Nephrology","Gastroenterology","Pulmonology","Endocrinology","Rheumatology"],
    CONSULTATION_TYPE:      ["OPD","Follow-Up","Emergency","Teleconsultation"],
    CONSULTATION_STATUS:    ["Scheduled","Completed","Cancelled","No Show"],
    ADMISSION_TYPE:         ["Emergency","Planned","Transfer","Day Care"],
    ADMISSION_STATUS:       ["Admitted","Discharged","Transferred","LAMA","Expired"],
    PRIORITY:               ["Low","Normal","High","Critical"],
    WARD_TYPE:              ["General","ICU","NICU","PICU","HDU","Maternity","Pediatric","Surgical","Orthopedic","Isolation","Private","Semi-Private"],
    OPERATIONAL_STATUS:     ["Operational","Under Maintenance","Closed"],
    SEVERITY_LEVEL:         ["Minor","Moderate","Severe","Critical"],
    TRANSPORT_MODE:         ["Walk-in","Ambulance","Private Vehicle","Air Ambulance","Referred"],
    TRIAGE_CATEGORY:        ["Immediate","Delayed","Minimal","Expectant"],
    EMERGENCY_STATUS:       ["Active","Stable","Discharged","Referred","Expired"],
    MEDICINE_CATEGORY:      ["Tablet","Capsule","Syrup","Injection","Drops","Ointment","Cream","Inhaler","Suppository","Powder","Patch","Suspension"],
    LAB_TEST_CATEGORY:      ["Hematology","Biochemistry","Microbiology","Pathology","Radiology","Serology","Immunology","Urine","Stool","Hormone","Cardiac","Thyroid","Liver","Kidney"],
    SAMPLE_STATUS:          ["Pending Collection","Collected","Processing","Completed","Rejected"],
    TEST_STATUS:            ["Ordered","Sample Collected","Processing","Completed","Cancelled"],
    RESULT_STATUS:          ["Normal","Abnormal","Critical","Inconclusive"],
    BILL_TYPE:              ["OPD","IPD","Emergency","Pharmacy","Lab","Radiology","Consultation","Surgery","Miscellaneous"],
    PAYMENT_MODE:           ["Cash","Credit Card","Debit Card","UPI","Net Banking","Insurance","Cheque","NEFT/RTGS"],
    PAYMENT_STATUS:         ["Pending","Partial","Paid","Overdue","Cancelled","Refunded"],
    INSURANCE_CLAIM_STATUS: ["Submitted","Under Review","Approved","Rejected","Partially Approved","Settled"],
    ANESTHESIA_TYPE:        ["General","Local","Regional","Spinal","Epidural","Sedation"],
    OT_STATUS:              ["Scheduled","In Progress","Completed","Cancelled","Postponed"],
    DISCHARGE_CONDITION:    ["Stable","Improved","Cured","LAMA","Referred","Expired"],
    DISCHARGE_TYPE:         ["Normal","LAMA","Death","Referral","Absconded"],
    PRESCRIPTION_TYPE:      ["OPD","IPD","Emergency"],
    PRESCRIPTION_STATUS:    ["Active","Completed","Cancelled"],
    HOSPITAL_TYPE:          ["Government","Private","Trust","Semi-Government","Charitable"],
    ADVANCE_TYPE:           ["Cash","Card","UPI","Cheque","Online"],
    ADVANCE_STATUS:         ["Received","Adjusted","Refunded","Partial"],
    NURSING_NOTE_TYPE:      ["Observation","Medication","Procedure","Vitals","Intake-Output","Wound Care","Patient Education"],
    SHIFT_TYPE:             ["Morning","Evening","Night","Rotational"],
    DOCUMENT_STATUS:        ["Pending","Verified","Rejected"],
    REPORT_TYPE:            ["Daily","Weekly","Monthly","Annual","Custom"],
    REPORT_STATUS:          ["Generated","Pending","Failed"],
  };

  const getValues = (code) =>
    (LOOKUP_DATA[code] || []).map(v => ({ value: v, label: v }));

  // Load hospital list for dropdowns (used in ward/dept/bed forms)
  useEffect(()=>{
    const needsHospital = (formFields||[]).some(s=>s.fields?.some(f=>f.key==="hospitalId" && f.type==="number"));
    if (needsHospital) {
      API.get("/hospital/list").then(r=>{
        setHospitals((r.data||[]).map(h=>({value:h.hospitalId, label:`${h.hospitalName} (ID:${h.hospitalId})`})));
      }).catch(()=>{});
    }
  },[formFields]);

  const load = useCallback(async()=>{
    setLoading(true);
    try { const r=await API.get(endpoint); setRows(r.data||[]); }
    catch { setSnack({open:true,msg:"Failed to load data",sev:"error"}); }
    finally { setLoading(false); }
  },[endpoint]);

  useEffect(()=>{ load(); },[load]);

  const openAdd  = ()=>{ setEditing(null); setForm({}); setModal(true); };
  const openEdit = (row)=>{ setEditing(row); setForm({...row}); setModal(true); };

  const { createEndpoint, updateEndpoint, deleteEndpoint, idField } = config;
  // Helper: get the primary key value from a row using idField or common fallbacks
  const getRowId = (row) => {
    if (!row) return null;
    if (idField) return row[idField];
    // Auto-detect common entity ID fields
    const idKeys = ['hospitalId','deptId','wardId','bedId','doctorId','patientId',
      'admissionId','consultationId','staffId','labTestId','invoiceId','paymentId',
      'claimId','otScheduleId','dischargeSummaryId','emergencyId','prescriptionId',
      'noteId','medicineId','advancePaymentId','refundId','id'];
    for (const k of idKeys) { if (row[k] != null) return row[k]; }
    return null;
  };

  const handleSave = async()=>{
    setSaving(true);
    try {
      if (editing) {
        const upd = updateEndpoint || endpoint.replace('/list','');
        const rowId = getRowId(editing);
        await API.put(`${upd}/${rowId}`, form);
      } else {
        if (!createEndpoint) { setSnack({open:true,msg:"Create not supported for this module.",sev:"warning"}); setSaving(false); return; }
        const crt = createEndpoint;
        await API.post(crt, form);
      }
      setSnack({open:true,msg:`${title} ${editing?"updated":"created"} successfully!`,sev:"success"});
      setModal(false); setEditing(null); load();
    } catch(e) {
      const msg = e?.response?.data?.message || e?.response?.data || "Save failed. Please try again.";
      setSnack({open:true,msg:String(msg).slice(0,120),sev:"error"});
    }
    finally { setSaving(false); }
  };

  const handleDelete = async()=>{
    try {
      const del = deleteEndpoint || endpoint.replace('/list','');
      const rowId = getRowId(delItem);
      await API.delete(`${del}/${rowId}`);
      setSnack({open:true,msg:"Record deleted.",sev:"success"});
      const delId = getRowId(delItem);
      setDelItem(null); if(getRowId(preview)===delId) setPreview(null); load();
    } catch(e) {
      const msg = e?.response?.data?.message || "Delete failed.";
      setSnack({open:true,msg:String(msg).slice(0,120),sev:"error"});
    }
  };

  const fi = (k,v)=>setForm(p=>({...p,[k]:v}));

  const filtered = rows.filter(r=>{
    const matchSearch = !search || Object.values(r).some(v=>String(v).toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter==="all" || (filterOptions?.find(f=>f.value===filter)?.match?.(r));
    return matchSearch && matchFilter;
  });

  const kpis = (kpiCards||[]).map(k=>({...k, value: k.compute ? k.compute(rows) : (rows.length)}));

  const today = new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"long",year:"numeric"});

  return (
    <div className="tab-content-wrap">

      {/* Module Header — like Service Management reference */}
      <div className="mod-header">
        <div className="mod-header-left">
          <div className="mod-header-icon">{icon}</div>
          <div>
            <div className="mod-header-title">{title}</div>
            <div className="mod-header-sub">Hospital Management · {title}</div>
          </div>
        </div>
        <div className="mod-header-right">
          <div className="mod-header-date">📅 {today}</div>
          <div className="mod-header-actions">
            <button className="mod-hdr-btn" onClick={load}>🔄 Refresh</button>
            <button className="mod-hdr-btn" onClick={openAdd}>{IcPlus} Add {title}</button>
          </div>
        </div>
      </div>

      {kpis.length>0 && (
        <>
          <div className="kpi-section-hdr">
            <div className="kpi-section-title">Overview · {title}</div>
            <div style={{fontSize:11,color:"#94A3B8",fontWeight:600}}>{filtered.length} records</div>
          </div>
          <div style={{padding:"0 20px 16px"}}>
            <div className={`kpi-grid cols-${Math.min(kpis.length,4)}`}>
              {kpis.map((k,i)=><KpiCard key={i} label={k.label} value={k.value} color={k.color||"teal"} icon={k.icon} sub={k.sub}/>)}
            </div>
          </div>
        </>
      )}

      <div className="sec-hdr">
        <div className="sec-title">
          <div className="sec-title-icon">{icon}</div>
          {title}
          <span className="tab-badge" style={{marginLeft:4}}>{filtered.length}</span>
        </div>
        <div className="sec-right">
          <div className="search-wrap">
            {IcSearch}
            <input className="search-input" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <button className="btn-primary" onClick={openAdd}>{IcPlus} Add {title}</button>
        </div>
      </div>

      {filterOptions?.length>0 && (
        <div className="filter-row">
          <button className={`filter-pill ${filter==="all"?"active":""}`} onClick={()=>setFilter("all")}>All ({rows.length})</button>
          {filterOptions.map(f=>(
            <button key={f.value} className={`filter-pill ${filter===f.value?"active":""}`} onClick={()=>setFilter(f.value)}>
              {f.label} ({rows.filter(f.match).length})
            </button>
          ))}
        </div>
      )}

      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              {columns.map(c=><th key={c.key}>{c.label}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <Loading/> : filtered.length===0 ? <EmptyState msg={`No ${title} found`} icon={emptyIcon}/> :
              filtered.map((row,i)=>(
                <tr key={getRowId(row)||i} onClick={()=>setPreview(p=>getRowId(p)===getRowId(row)?null:row)} style={{cursor:"pointer"}}>
                  <td className="num-cell">{i+1}</td>
                  {columns.map(c=>(
                    <td key={c.key}>
                      {c.render ? c.render(row[c.key], row)
                        : c.key===statusField ? <StatusBadge value={row[c.key]}/>
                        : c.isName ? (
                          <div className="name-cell">
                            {av(String(row[c.key]||"?"))}
                            <div>
                              <div className="name-text">{row[c.key]||"—"}</div>
                              {c.sub && <div className="name-sub">{row[c.sub]||""}</div>}
                            </div>
                          </div>
                        ) : (row[c.key]??<span style={{color:"#CBD5E1"}}>—</span>)}
                    </td>
                  ))}
                  <td>
                    <div className="actions-cell" onClick={e=>e.stopPropagation()}>
                      <button className="btn-icon-sm edit" title="Edit" onClick={()=>openEdit(row)}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#047857" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="btn-icon-sm del" title="Delete" onClick={()=>setDelItem(row)}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#DC2626" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      <div className={`preview-panel${preview?" open":""}`}>
        {preview && (
          <>
            <div className="preview-header">
              <div className="preview-hdr-left">
                {av(String(preview[columns[0]?.key]||"?"),40)}
                <div>
                  <div className="preview-name">{preview[columns[0]?.key]||"Record"}</div>
                  <div className="preview-code">ID: {preview.id||preview.patientId||preview.doctorId||"—"}</div>
                </div>
              </div>
              <button className="preview-close" onClick={()=>setPreview(null)}>×</button>
            </div>
            <div className="preview-actions">
              <button className="preview-btn edit" onClick={()=>{openEdit(preview);setPreview(null);}}>✏️ Edit</button>
              <button className="preview-btn del"  onClick={()=>{setDelItem(preview);setPreview(null);}}>🗑️ Delete</button>
            </div>
            <div className="preview-body">
              <div className="preview-section">
                <div className="preview-section-title">Details</div>
                {columns.map(c=>(
                  <div className="preview-row" key={c.key}>
                    <div className="preview-label">{c.label}</div>
                    <div className="preview-val">
                      {c.key===statusField ? <StatusBadge value={preview[c.key]}/> : (String(preview[c.key]||"—"))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <Modal open={modal} size="lg" onClose={()=>setModal(false)}
        iconEmoji={icon} title={`${editing?"Edit":"Add"} ${title}`}
        subtitle={editing?"Update existing record":"Create new record"}
        footer={
          <>
            <button className="btn-outline" onClick={()=>setModal(false)}>Cancel</button>
            <button className="btn-primary" disabled={saving} onClick={handleSave}>
              {saving?<><span className="spin-anim" style={{fontSize:12}}>{IcSpin}</span>Saving…</>:<>{IcPlus} {editing?"Update":"Create"}</>}
            </button>
          </>
        }
      >
        {(formFields||[]).map((section,si)=>(
          <div key={si}>
            {section.section && <div className="sec-divider">{section.section}</div>}
            <div className={`form-grid-${section.cols||2}`} style={{marginBottom:16}}>
              {(section.fields||[]).map(f=>(
                <FG key={f.key} label={f.label} req={f.req} error={f.req&&!form[f.key]&&saving?`${f.label} is required`:""}>
                  {f.key==="hospitalId" && hospitals.length>0
                    ? <select style={{width:"100%",padding:"8px 10px",border:"1.5px solid #E2E8F0",borderRadius:8,fontSize:13,background:"#F8FAFC",color:"#0F172A"}}
                        value={form[f.key]||""} onChange={e=>fi(f.key,Number(e.target.value)||e.target.value)}>
                        <option value="">— Select Hospital —</option>
                        {hospitals.map(h=><option key={h.value} value={h.value}>{h.label}</option>)}
                      </select>
                  : f.type==="select"
                    ? <FS value={form[f.key]} onChange={e=>fi(f.key,e.target.value)}
                        options={f.lookupType ? getValues(f.lookupType) : (f.options||[])}
                        placeholder={f.placeholder}/>
                  : f.type==="textarea"
                    ? <FT value={form[f.key]} onChange={e=>fi(f.key,e.target.value)} placeholder={f.placeholder} rows={f.rows}/>
                  : f.type==="number"
                    ? <FI type="number" name={f.key} value={form[f.key]??""} onChange={e=>fi(f.key,e.target.value===""?null:Number(e.target.value))} placeholder={f.placeholder}/>
                  : <FI type={f.type||"text"} name={f.key} value={form[f.key]??""} onChange={e=>fi(f.key,e.target.value)} placeholder={f.placeholder}/>
                  }
                </FG>
              ))}
            </div>
          </div>
        ))}
      </Modal>

      <DeleteDialog open={!!delItem} onClose={()=>setDelItem(null)} onConfirm={handleDelete} itemName={delItem?.[columns[0]?.key]||"record"}/>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={()=>setSnack(p=>({...p,open:false}))} anchorOrigin={{vertical:"bottom",horizontal:"right"}}>
        <Alert severity={snack.sev} onClose={()=>setSnack(p=>({...p,open:false}))} sx={{borderRadius:"10px",fontWeight:600}}>{snack.msg}</Alert>
      </Snackbar>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TAB CONFIGS (unchanged)
═══════════════════════════════════════════════════════════════════════ */
const PATIENT_CONFIG = {
  title:"Patients", icon:"🧑‍⚕️", idField:"patientId", endpoint:"/hospital/patient/list", createEndpoint:"/hospital/patient/register", updateEndpoint:"/hospital/patient", deleteEndpoint:"/hospital/patient", statusField:"status", emptyIcon:"🧑‍⚕️",
  kpiCards:[
    {label:"Total Patients",  color:"teal",  icon:"🏥", compute:r=>r.length},
    {label:"Admitted",        color:"blue",  icon:"🛏️", compute:r=>r.filter(p=>(p.status||"").toLowerCase()==="admitted").length},
    {label:"OPD Today",       color:"amber", icon:"📅", compute:r=>r.filter(p=>p.patientType==="OPD"&&p.createdAt?.startsWith(new Date().toISOString().slice(0,10))).length},
    {label:"Discharged",      color:"green", icon:"✅", compute:r=>r.filter(p=>(p.status||"").toLowerCase()==="discharged").length},
  ],
  filterOptions:[
    {label:"Admitted",  value:"admitted",  match:r=>(r.status||"").toLowerCase()==="admitted"},
    {label:"OPD",       value:"opd",       match:r=>r.patientType==="OPD"},
    {label:"Discharged",value:"discharged",match:r=>(r.status||"").toLowerCase()==="discharged"},
  ],
  columns:[
    {key:"patientName",  label:"Patient",isName:true,sub:"uhid"},
    {key:"mobileNumber", label:"Mobile"},
    {key:"age",          label:"Age"},
    {key:"gender",       label:"Gender"},
    {key:"problem",      label:"Complaint"},
    {key:"patientType",  label:"Type"},
    {key:"status",       label:"Status"},
    {key:"createdAt",    label:"Registered",render:v=>fmt(v)},
  ],
  formFields:[
    {section:"Patient Information", cols:2, fields:[
      {key:"patientName",  label:"Full Name",    req:true,placeholder:"Patient full name"},
      {key:"mobileNumber", label:"Mobile",       req:true,placeholder:"10-digit mobile"},
      {key:"age",          label:"Age",          type:"number",placeholder:"Age"},
      {key:"gender",       label:"Gender",       type:"select",lookupType:"GENDER"},
      {key:"dateOfBirth",  label:"Date of Birth",type:"date"},
      {key:"bloodGroup",   label:"Blood Group",  type:"select",lookupType:"BLOOD_GROUP"},
      {key:"email",        label:"Email",        placeholder:"Email address"},
      {key:"emergencyContact",label:"Emergency Contact",placeholder:"Emergency mobile"},
    ]},
    {section:"Medical Details", cols:2, fields:[
      {key:"problem",      label:"Problem / Complaint",req:true,placeholder:"Chief complaint"},
      {key:"patientType",  label:"Patient Type",type:"select",lookupType:"PATIENT_TYPE"},
      {key:"allergies",    label:"Allergies",   placeholder:"Known allergies"},
      {key:"medicalHistory",label:"Medical History",type:"textarea",placeholder:"Past medical history",rows:2},
      {key:"status",       label:"Status",      type:"select",lookupType:"ACTIVE_STATUS"},
    ]},
    {section:"Address", cols:1, fields:[
      {key:"address",      label:"Address",req:true,type:"textarea",placeholder:"Full address",rows:2},
    ]},
  ],
};

const DOCTOR_CONFIG = {
  title:"Doctors", icon:"👨‍⚕️", idField:"doctorId", endpoint:"/hospital/doctor/list", createEndpoint:"/hospital/doctor", updateEndpoint:"/hospital/doctor", deleteEndpoint:"/hospital/doctor", statusField:"status", emptyIcon:"👨‍⚕️",
  kpiCards:[
    {label:"Total Doctors",   color:"blue",  icon:"👨‍⚕️",compute:r=>r.length},
    {label:"Active",          color:"green", icon:"✅",  compute:r=>r.filter(d=>(d.status||"").toLowerCase()==="active").length},
    {label:"Specializations", color:"violet",icon:"🩺",  compute:r=>new Set(r.map(d=>d.specialization)).size},
    {label:"Avg Fees",        color:"amber", icon:"💰",  compute:r=>r.length?`₹${Math.round(r.reduce((s,d)=>s+Number(d.consultationFees||0),0)/r.length).toLocaleString("en-IN")}`:"—"},
  ],
  filterOptions:[
    {label:"Active",   value:"active",   match:r=>(r.status||"").toLowerCase()==="active"},
    {label:"Inactive", value:"inactive", match:r=>(r.status||"").toLowerCase()==="inactive"},
  ],
  columns:[
    {key:"doctorName",     label:"Doctor",isName:true,sub:"doctorId"},
    {key:"mobileNumber",   label:"Mobile"},
    {key:"specialization", label:"Specialization"},
    {key:"qualification",  label:"Qualification"},
    {key:"consultationFees",label:"Fees",render:v=>inr(v)},
    {key:"status",         label:"Status"},
  ],
  formFields:[
    {section:"Doctor Information", cols:2, fields:[
      {key:"doctorName",     label:"Full Name",         req:true,placeholder:"Dr. Full Name"},
      {key:"mobileNumber",   label:"Mobile",            req:true,placeholder:"10-digit mobile"},
      {key:"email",          label:"Email",             placeholder:"Email address"},
      {key:"specialization", label:"Specialization",    req:true,type:"select",lookupType:"SPECIALIZATION"},
      {key:"consultationFees",label:"Consultation Fees",req:true,type:"number",placeholder:"Fee in INR"},
      {key:"experience",     label:"Experience (yrs)",  placeholder:"Years of experience"},
      {key:"qualification",  label:"Qualification",     placeholder:"MBBS, MD, etc."},
      {key:"licenseNumber",  label:"License Number",    placeholder:"Medical license no."},
      {key:"gender",         label:"Gender",            type:"select",lookupType:"GENDER"},
      {key:"status",         label:"Status",            type:"select",lookupType:"STAFF_STATUS"},
    ]},
    {section:"Address", cols:1, fields:[
      {key:"address",label:"Address",type:"textarea",placeholder:"Doctor's address",rows:2},
    ]},
  ],
};

const APPOINTMENT_CONFIG = {
  title:"Appointments", icon:"📅", idField:"consultationId", endpoint:"/hospital/appointment/list", createEndpoint:"/hospital/consultation", updateEndpoint:"/hospital/consultation", deleteEndpoint:"/hospital/consultation", statusField:"consultationStatus", emptyIcon:"📅",
  kpiCards:[
    {label:"Total",     color:"teal",  icon:"📅",compute:r=>r.length},
    {label:"Today",     color:"blue",  icon:"🕐",compute:r=>r.filter(a=>a.consultationDate?.startsWith(new Date().toISOString().slice(0,10))).length},
    {label:"Scheduled", color:"amber", icon:"⏳",compute:r=>r.filter(a=>(a.consultationStatus||"").toLowerCase()==="scheduled").length},
    {label:"Completed", color:"green", icon:"✅",compute:r=>r.filter(a=>(a.consultationStatus||"").toLowerCase()==="completed").length},
  ],
  filterOptions:[
    {label:"Scheduled", value:"scheduled", match:r=>(r.consultationStatus||"").toLowerCase()==="scheduled"},
    {label:"Completed", value:"completed", match:r=>(r.consultationStatus||"").toLowerCase()==="completed"},
    {label:"Cancelled", value:"cancelled", match:r=>(r.consultationStatus||"").toLowerCase()==="cancelled"},
  ],
  columns:[
    {key:"consultationNumber", label:"Consult #",isName:true},
    {key:"patientId",          label:"Patient ID"},
    {key:"doctorId",           label:"Doctor ID"},
    {key:"diagnosis",          label:"Diagnosis"},
    {key:"consultationDate",   label:"Date",render:v=>fmt(v)},
    {key:"consultationStatus", label:"Status"},
  ],
  formFields:[
    {section:"Consultation Details", cols:2, fields:[
      {key:"patientId",         label:"Patient ID",       req:true,type:"number",placeholder:"Patient ID"},
      {key:"doctorId",          label:"Doctor ID",        req:true,type:"number",placeholder:"Doctor ID"},
      {key:"hospitalId",        label:"Hospital ID",      req:true,type:"number",placeholder:"Hospital ID"},
      {key:"consultationDate",  label:"Consultation Date",req:true,type:"date"},
      {key:"consultationType",  label:"Type",             type:"select",lookupType:"CONSULTATION_TYPE"},
      {key:"consultationStatus",label:"Status",           type:"select",lookupType:"CONSULTATION_STATUS"},
    ]},
    {section:"Clinical Info", cols:2, fields:[
      {key:"symptoms",          label:"Symptoms",         type:"textarea",placeholder:"Patient symptoms",rows:2},
      {key:"diagnosis",         label:"Diagnosis",        req:true,type:"textarea",placeholder:"Primary diagnosis",rows:2},
      {key:"clinicalFindings",  label:"Clinical Findings",type:"textarea",placeholder:"Examination findings",rows:2},
      {key:"doctorNotes",       label:"Doctor Notes",     type:"textarea",placeholder:"Treatment notes",rows:2},
    ]},
    {section:"Vitals", cols:3, fields:[
      {key:"vitalsBloodPressure",label:"Blood Pressure",placeholder:"e.g. 120/80"},
      {key:"vitalsPulse",        label:"Pulse",           placeholder:"e.g. 72 bpm"},
      {key:"vitalsTemperature",  label:"Temperature",     placeholder:"e.g. 98.6°F"},
      {key:"vitalsSpO2",         label:"SpO2",            placeholder:"e.g. 98%"},
      {key:"vitalsWeight",       label:"Weight (kg)",     placeholder:"e.g. 70"},
      {key:"vitalsHeight",       label:"Height (cm)",     placeholder:"e.g. 170"},
    ]},
  ],
};

const IPD_CONFIG = {
  title:"IPD / Admissions", icon:"🛏️", idField:"admissionId", endpoint:"/hospital/admission/list", createEndpoint:"/hospital/admission/create", updateEndpoint:"/hospital/admission", deleteEndpoint:"/hospital/admission", statusField:"admissionStatus", emptyIcon:"🛏️",
  kpiCards:[
    {label:"Total Admissions", color:"teal",  icon:"🛏️",compute:r=>r.length},
    {label:"Admitted",         color:"blue",  icon:"✅",compute:r=>r.filter(a=>(a.admissionStatus||"").toLowerCase()==="admitted").length},
    {label:"Critical",         color:"red",   icon:"🚨",compute:r=>r.filter(a=>(a.priority||"").toLowerCase()==="critical").length},
    {label:"Discharged",       color:"green", icon:"🏠",compute:r=>r.filter(a=>(a.admissionStatus||"").toLowerCase()==="discharged").length},
  ],
  filterOptions:[
    {label:"Admitted",   value:"admitted",   match:r=>(r.admissionStatus||"").toLowerCase()==="admitted"},
    {label:"Critical",   value:"critical",   match:r=>(r.priority||"").toLowerCase()==="critical"},
    {label:"Discharged", value:"discharged", match:r=>(r.admissionStatus||"").toLowerCase()==="discharged"},
  ],
  columns:[
    {key:"admissionNumber",  label:"Admission #",isName:true},
    {key:"patientId",        label:"Patient ID"},
    {key:"doctorId",         label:"Doctor ID"},
    {key:"admissionType",    label:"Type"},
    {key:"admissionDate",    label:"Admitted",render:v=>fmt(v)},
    {key:"admissionStatus",  label:"Status"},
    {key:"priority",         label:"Priority"},
  ],
  formFields:[
    {section:"Admission Details", cols:2, fields:[
      {key:"patientId",      label:"Patient ID",     req:true,type:"number",placeholder:"Patient ID"},
      {key:"doctorId",       label:"Doctor ID",      req:true,type:"number",placeholder:"Doctor ID"},
      {key:"hospitalId",     label:"Hospital ID",    req:true,type:"number",placeholder:"Hospital ID"},
      {key:"wardId",         label:"Ward ID",        req:true,type:"number",placeholder:"Ward ID"},
      {key:"bedId",          label:"Bed ID",         req:true,type:"number",placeholder:"Bed ID"},
      {key:"admissionDate",  label:"Admission Date", type:"date"},
      {key:"admissionType",  label:"Admission Type", type:"select",lookupType:"ADMISSION_TYPE"},
      {key:"admissionStatus",label:"Status",         type:"select",lookupType:"ADMISSION_STATUS"},
      {key:"priority",       label:"Priority",       type:"select",lookupType:"PRIORITY"},
      {key:"depositAmount",  label:"Deposit Amount", type:"number",placeholder:"Amount in INR"},
    ]},
    {section:"Clinical", cols:1, fields:[
      {key:"admissionReason",     label:"Admission Reason",     req:true,type:"textarea",placeholder:"Reason for admission",rows:2},
      {key:"diagnosisOnAdmission",label:"Diagnosis on Admission",type:"textarea",placeholder:"Initial diagnosis",rows:2},
      {key:"admissionNotes",      label:"Notes",                type:"textarea",placeholder:"Additional notes",rows:2},
    ]},
  ],
};

const OPD_CONFIG = {
  title:"OPD", icon:"🩺", idField:"consultationId", endpoint:"/hospital/consultation/list", createEndpoint:"/hospital/consultation", updateEndpoint:"/hospital/consultation", deleteEndpoint:"/hospital/consultation", statusField:"consultationStatus", emptyIcon:"🩺",
  kpiCards:[
    {label:"Total OPD",  color:"teal",  icon:"🩺",compute:r=>r.length},
    {label:"Today",      color:"blue",  icon:"📅",compute:r=>r.filter(o=>o.consultationDate?.startsWith(new Date().toISOString().slice(0,10))).length},
    {label:"Completed",  color:"green", icon:"✅",compute:r=>r.filter(o=>(o.consultationStatus||"").toLowerCase()==="completed").length},
    {label:"Follow-up",  color:"amber", icon:"🔄",compute:r=>r.filter(o=>o.followUpDate).length},
  ],
  columns:[
    {key:"consultationNumber",label:"Consult #",isName:true},
    {key:"patientId",         label:"Patient ID"},
    {key:"doctorId",          label:"Doctor ID"},
    {key:"diagnosis",         label:"Diagnosis"},
    {key:"consultationDate",  label:"Date",render:v=>fmt(v)},
    {key:"consultationStatus",label:"Status"},
  ],
  formFields:[
    {section:"OPD Consultation", cols:2, fields:[
      {key:"patientId",         label:"Patient ID",   req:true,type:"number",placeholder:"Patient ID"},
      {key:"doctorId",          label:"Doctor ID",    req:true,type:"number",placeholder:"Doctor ID"},
      {key:"hospitalId",        label:"Hospital ID",  req:true,type:"number",placeholder:"Hospital ID"},
      {key:"consultationDate",  label:"Visit Date",   req:true,type:"date"},
      {key:"consultationType",  label:"Type",         type:"select",lookupType:"CONSULTATION_TYPE"},
      {key:"consultationStatus",label:"Status",       type:"select",lookupType:"CONSULTATION_STATUS"},
    ]},
    {section:"Clinical Info", cols:2, fields:[
      {key:"symptoms",    label:"Symptoms",        type:"textarea",placeholder:"Patient symptoms",rows:2},
      {key:"diagnosis",   label:"Diagnosis",       req:true,type:"textarea",placeholder:"Primary diagnosis",rows:2},
      {key:"doctorNotes", label:"Doctor Notes",    type:"textarea",placeholder:"Treatment notes",rows:2},
      {key:"clinicalFindings",label:"Clinical Findings",type:"textarea",placeholder:"Examination findings",rows:2},
    ]},
    {section:"Vitals", cols:3, fields:[
      {key:"vitalsBloodPressure",label:"Blood Pressure",placeholder:"e.g. 120/80"},
      {key:"vitalsPulse",        label:"Pulse",          placeholder:"e.g. 72 bpm"},
      {key:"vitalsTemperature",  label:"Temperature",    placeholder:"e.g. 98.6°F"},
      {key:"vitalsSpO2",         label:"SpO2",           placeholder:"e.g. 98%"},
      {key:"vitalsWeight",       label:"Weight (kg)",    placeholder:"e.g. 70"},
      {key:"vitalsHeight",       label:"Height (cm)",    placeholder:"e.g. 170"},
    ]},
  ],
};

const WARD_CONFIG = {
  title:"Wards & Beds", icon:"🏨", idField:"wardId", endpoint:"/hospital/ward/list", createEndpoint:"/hospital/ward", updateEndpoint:"/hospital/ward", deleteEndpoint:"/hospital/ward", statusField:"status", emptyIcon:"🏨",
  kpiCards:[
    {label:"Total Wards",  color:"teal",  icon:"🏨",compute:r=>r.length},
    {label:"Total Beds",   color:"blue",  icon:"🛏️",compute:r=>r.reduce((s,w)=>s+(Number(w.totalBeds)||0),0)},
    {label:"Available",    color:"green", icon:"🟢",compute:r=>r.reduce((s,w)=>s+(Number(w.availableBeds)||0),0)},
    {label:"Active",       color:"amber", icon:"✅",compute:r=>r.filter(w=>(w.status||"").toLowerCase()==="active").length},
  ],
  columns:[
    {key:"wardName",     label:"Ward",isName:true},
    {key:"wardType",     label:"Type"},
    {key:"totalBeds",    label:"Total Beds"},
    {key:"availableBeds",label:"Available"},
    {key:"floor",        label:"Floor"},
    {key:"status",       label:"Status"},
  ],
  formFields:[
    {section:"Ward Details", cols:2, fields:[
      {key:"wardName",    label:"Ward Name",  req:true,placeholder:"Ward name"},
      {key:"hospitalId",  label:"Hospital ID",req:true,type:"number",placeholder:"Hospital ID"},
      {key:"wardType",    label:"Ward Type",  type:"select",lookupType:"WARD_TYPE"},
      {key:"totalBeds",   label:"Total Beds", type:"number",req:true,placeholder:"Total beds"},
      {key:"availableBeds",label:"Available Beds",type:"number",placeholder:"Available beds"},
      {key:"floor",       label:"Floor",      placeholder:"Floor number"},
      {key:"description", label:"Description",type:"textarea",placeholder:"Ward description",rows:2},
      {key:"status",      label:"Status",     type:"select",lookupType:"OPERATIONAL_STATUS"},
    ]},
  ],
};

const EMERGENCY_CONFIG = {
  title:"Emergency", icon:"🚨", idField:"emergencyId", endpoint:"/hospital/emergency/list", createEndpoint:"/hospital/emergency/register", updateEndpoint:"/hospital/emergency", deleteEndpoint:"/hospital/emergency", statusField:"emergencyStatus", emptyIcon:"🚨",
  kpiCards:[
    {label:"Total Cases",  color:"red",   icon:"🚨",compute:r=>r.length},
    {label:"Critical",     color:"red",   icon:"🔴",compute:r=>r.filter(e=>(e.severityLevel||"").toLowerCase()==="critical").length},
    {label:"Active",       color:"amber", icon:"⚡",compute:r=>r.filter(e=>(e.emergencyStatus||"").toLowerCase()==="active").length},
    {label:"Resolved",     color:"green", icon:"✅",compute:r=>r.filter(e=>(e.emergencyStatus||"").toLowerCase()==="stabilized"||(e.emergencyStatus||"").toLowerCase()==="discharged").length},
  ],
  filterOptions:[
    {label:"Critical", value:"critical", match:r=>(r.severityLevel||"").toLowerCase()==="critical"},
    {label:"High",     value:"high",     match:r=>(r.severityLevel||"").toLowerCase()==="high"},
    {label:"Active",   value:"active",   match:r=>(r.emergencyStatus||"").toLowerCase()==="active"},
  ],
  columns:[
    {key:"patientName",    label:"Patient",isName:true},
    {key:"chiefComplaint", label:"Complaint"},
    {key:"severityLevel",  label:"Severity",render:v=>{const c={critical:"red",high:"amber",moderate:"blue",low:"green"}[v?.toLowerCase()]||"slate";return <Badge color={c}>{v||"—"}</Badge>;}},
    {key:"assignedDoctorId",label:"Doctor ID"},
    {key:"arrivalTime",    label:"Arrival",render:v=>fmt(v)},
    {key:"emergencyStatus",label:"Status"},
  ],
  formFields:[
    {section:"Emergency Case", cols:2, fields:[
      {key:"patientName",    label:"Patient Name",    placeholder:"Walk-in patient name"},
      {key:"patientAge",     label:"Age",             type:"number",placeholder:"Age"},
      {key:"patientGender",  label:"Gender",          type:"select",lookupType:"GENDER"},
      {key:"patientMobile",  label:"Mobile",          placeholder:"Patient mobile"},
      {key:"assignedDoctorId",label:"Doctor ID",      req:true,type:"number",placeholder:"Doctor ID"},
      {key:"hospitalId",     label:"Hospital ID",     type:"number",placeholder:"Hospital ID"},
      {key:"chiefComplaint", label:"Chief Complaint", req:true,type:"textarea",placeholder:"Presenting complaint",rows:2},
      {key:"severityLevel",  label:"Severity",        req:true,type:"select",lookupType:"SEVERITY_LEVEL"},
      {key:"arrivalTime",    label:"Arrival Time",    type:"datetime-local"},
      {key:"transportMode",  label:"Transport Mode",  type:"select",lookupType:"TRANSPORT_MODE"},
      {key:"triageCategory", label:"Triage Category", type:"select",lookupType:"TRIAGE_CATEGORY"},
      {key:"emergencyStatus",label:"Status",          type:"select",lookupType:"EMERGENCY_STATUS"},
    ]},
    {section:"Notes", cols:1, fields:[
      {key:"notes",label:"Clinical Notes",type:"textarea",placeholder:"Observations, treatment notes",rows:3},
    ]},
  ],
};

const PHARMACY_CONFIG = {
  title:"Pharmacy", icon:"💊", idField:"medicineId", endpoint:"/hospital/pharmacy/medicine/list", createEndpoint:"/hospital/pharmacy/medicine", updateEndpoint:"/hospital/pharmacy/medicine", deleteEndpoint:"/hospital/pharmacy/medicine", statusField:"isActive", emptyIcon:"💊",
  kpiCards:[
    {label:"Total Medicines",color:"teal",  icon:"💊",compute:r=>r.length},
    {label:"Low Stock",      color:"red",   icon:"⚠️",compute:r=>r.filter(m=>Number(m.quantity||0)<Number(m.lowStockAlertLevel||10)).length},
    {label:"Expiring Soon",  color:"amber", icon:"📅",compute:r=>r.filter(m=>{const d=new Date(m.expiryDate);const n=new Date();return d>n&&(d-n)<30*86400000;}).length},
    {label:"Total Value",    color:"green", icon:"💰",compute:r=>inr(r.reduce((s,m)=>s+(Number(m.sellingPrice||0)*Number(m.quantity||0)),0))},
  ],
  filterOptions:[
    {label:"Low Stock", value:"lowstock", match:r=>Number(r.quantity||0)<Number(r.lowStockAlertLevel||10)},
    {label:"Expiring",  value:"expiring", match:r=>{const d=new Date(r.expiryDate);const n=new Date();return d>n&&(d-n)<30*86400000;}},
  ],
  columns:[
    {key:"medicineName",   label:"Medicine",isName:true,sub:"batchNumber"},
    {key:"medicineCategory",label:"Category"},
    {key:"manufacturer",   label:"Manufacturer"},
    {key:"quantity",       label:"Stock",render:(v,r)=><span style={{color:Number(v)<Number(r.lowStockAlertLevel||10)?"#DC2626":"#059669",fontWeight:700}}>{v}</span>},
    {key:"sellingPrice",   label:"Price",render:v=>inr(v)},
    {key:"expiryDate",     label:"Expiry",render:v=>fmt(v)},
  ],
  formFields:[
    {section:"Medicine Details", cols:2, fields:[
      {key:"medicineName",    label:"Medicine Name",   req:true,placeholder:"Medicine name"},
      {key:"genericName",     label:"Generic Name",    placeholder:"Generic / compound name"},
      {key:"medicineCategory",label:"Category",        type:"select",lookupType:"MEDICINE_CATEGORY"},
      {key:"manufacturer",    label:"Manufacturer",    placeholder:"Manufacturer name"},
      {key:"batchNumber",     label:"Batch Number",    req:true,placeholder:"Batch no."},
      {key:"quantity",        label:"Quantity",        type:"number",req:true,placeholder:"Stock quantity"},
      {key:"unit",            label:"Unit",            placeholder:"e.g. Strips, Vials, Bottles"},
      {key:"lowStockAlertLevel",label:"Low Stock Level",type:"number",placeholder:"Reorder threshold"},
      {key:"purchasePrice",   label:"Purchase Price (₹)",type:"number",placeholder:"Cost price"},
      {key:"sellingPrice",    label:"Selling Price (₹)", type:"number",placeholder:"Selling price"},
      {key:"expiryDate",      label:"Expiry Date",     req:true,type:"date"},
      {key:"supplier",        label:"Supplier",        placeholder:"Supplier name"},
      {key:"storageLocation", label:"Storage Location",placeholder:"Shelf / rack location"},
      {key:"hospitalId",      label:"Hospital ID",     type:"number",placeholder:"Hospital ID"},
    ]},
  ],
};

const LAB_CONFIG = {
  title:"Lab & Reports", icon:"🔬", idField:"labTestId", endpoint:"/hospital/lab/list", createEndpoint:"/hospital/lab/order", updateEndpoint:"/hospital/lab", deleteEndpoint:"/hospital/lab", statusField:"testStatus", emptyIcon:"🔬",
  kpiCards:[
    {label:"Total Tests",  color:"teal",  icon:"🔬",compute:r=>r.length},
    {label:"Pending",      color:"amber", icon:"⏳",compute:r=>r.filter(l=>(l.testStatus||"").toLowerCase()==="ordered"||(l.sampleStatus||"").toLowerCase()==="pending_collection").length},
    {label:"Completed",    color:"green", icon:"✅",compute:r=>r.filter(l=>(l.testStatus||"").toLowerCase()==="completed").length},
    {label:"Critical",     color:"red",   icon:"🚨",compute:r=>r.filter(l=>l.isCritical).length},
  ],
  filterOptions:[
    {label:"Ordered",    value:"ordered",    match:r=>(r.testStatus||"").toLowerCase()==="ordered"},
    {label:"Completed",  value:"completed",  match:r=>(r.testStatus||"").toLowerCase()==="completed"},
    {label:"Critical",   value:"critical",   match:r=>!!r.isCritical},
  ],
  columns:[
    {key:"labOrderNumber",label:"Order #",isName:true},
    {key:"patientId",     label:"Patient ID"},
    {key:"testName",      label:"Test"},
    {key:"testCategory",  label:"Category"},
    {key:"orderedDate",   label:"Ordered",render:v=>fmt(v)},
    {key:"result",        label:"Result"},
    {key:"testStatus",    label:"Status"},
  ],
  formFields:[
    {section:"Lab Test", cols:2, fields:[
      {key:"patientId",   label:"Patient ID",  req:true,type:"number",placeholder:"Patient ID"},
      {key:"doctorId",    label:"Doctor ID",   req:true,type:"number",placeholder:"Doctor ID"},
      {key:"hospitalId",  label:"Hospital ID", type:"number",placeholder:"Hospital ID"},
      {key:"testName",    label:"Test Name",   req:true,placeholder:"e.g. CBC, LFT, Blood Sugar"},
      {key:"testCategory",label:"Category",    type:"select",lookupType:"LAB_TEST_CATEGORY"},
      {key:"orderedDate", label:"Ordered Date",type:"date"},
      {key:"sampleStatus",label:"Sample Status",req:true,type:"select",lookupType:"SAMPLE_STATUS"},
      {key:"testStatus",  label:"Test Status", type:"select",lookupType:"TEST_STATUS"},
      {key:"testCharges", label:"Test Charges (₹)",type:"number",placeholder:"Amount"},
    ]},
    {section:"Results", cols:2, fields:[
      {key:"result",       label:"Result",        type:"textarea",placeholder:"Test result",rows:2},
      {key:"resultStatus", label:"Result Status", type:"select",lookupType:"RESULT_STATUS"},
      {key:"notes",        label:"Notes",         type:"textarea",placeholder:"Additional notes",rows:2},
    ]},
  ],
};

const BILLING_CONFIG = {
  title:"Billing", icon:"💳", idField:"invoiceId", endpoint:"/hospital/billing/list", createEndpoint:"/hospital/billing/generate", updateEndpoint:"/hospital/billing", deleteEndpoint:"/hospital/billing", statusField:"paymentStatus", emptyIcon:"💳",
  kpiCards:[
    {label:"Total Bills",    color:"teal",  icon:"💳",compute:r=>r.length},
    {label:"Total Revenue",  color:"green", icon:"💰",compute:r=>inr(r.filter(b=>(b.paymentStatus||"").toLowerCase()==="paid").reduce((s,b)=>s+Number(b.totalAmount||0),0))},
    {label:"Pending",        color:"amber", icon:"⏳",compute:r=>inr(r.filter(b=>(b.paymentStatus||"").toLowerCase()==="pending").reduce((s,b)=>s+Number(b.totalAmount||0),0))},
    {label:"Overdue",        color:"red",   icon:"⚠️",compute:r=>r.filter(b=>(b.paymentStatus||"").toLowerCase()==="overdue").length},
  ],
  filterOptions:[
    {label:"Paid",    value:"paid",    match:r=>(r.paymentStatus||"").toLowerCase()==="paid"},
    {label:"Pending", value:"pending", match:r=>(r.paymentStatus||"").toLowerCase()==="pending"},
    {label:"Overdue", value:"overdue", match:r=>(r.paymentStatus||"").toLowerCase()==="overdue"},
  ],
  columns:[
    {key:"patientName",   label:"Patient",isName:true,sub:"invoiceNumber"},
    {key:"billType",      label:"Type"},
    {key:"totalAmount",   label:"Amount",render:v=>inr(v)},
    {key:"paidAmount",    label:"Paid",render:v=>inr(v)},
    {key:"pendingAmount", label:"Pending",render:(_,r)=>inr((Number(r.totalAmount||0)-Number(r.paidAmount||0)))},
    {key:"billDate",      label:"Date",render:v=>fmt(v)},
    {key:"paymentStatus", label:"Status"},
  ],
  formFields:[
    {section:"Bill Details", cols:2, fields:[
      {key:"patientName",  label:"Patient Name",  req:true,placeholder:"Patient name"},
      {key:"billType",     label:"Bill Type",     type:"select",lookupType:"BILL_TYPE"},
      {key:"totalAmount",  label:"Total Amount",  req:true,type:"number",placeholder:"Total in INR"},
      {key:"paidAmount",   label:"Paid Amount",   type:"number",placeholder:"Amount paid"},
      {key:"paymentMode",  label:"Payment Mode",  type:"select",lookupType:"PAYMENT_MODE"},
      {key:"billDate",     label:"Bill Date",     type:"date"},
      {key:"paymentStatus",label:"Status",        type:"select",lookupType:"PAYMENT_STATUS"},
      {key:"notes",        label:"Notes",         type:"textarea",placeholder:"Bill notes",rows:2},
    ]},
  ],
};

const INSURANCE_CONFIG = {
  title:"Insurance", icon:"🛡️", idField:"claimId", endpoint:"/hospital/insurance/list", createEndpoint:"/hospital/insurance/claim", updateEndpoint:"/hospital/insurance", deleteEndpoint:"/hospital/insurance", statusField:"claimStatus", emptyIcon:"🛡️",
  kpiCards:[
    {label:"Total Claims",    color:"teal",  icon:"🛡️",compute:r=>r.length},
    {label:"Approved",        color:"green", icon:"✅",compute:r=>r.filter(i=>(i.claimStatus||"").toLowerCase()==="approved").length},
    {label:"Pending",         color:"amber", icon:"⏳",compute:r=>r.filter(i=>(i.claimStatus||"").toLowerCase()==="pending").length},
    {label:"Total Claimed",   color:"blue",  icon:"💰",compute:r=>inr(r.reduce((s,i)=>s+Number(i.claimAmount||0),0))},
  ],
  columns:[
    {key:"patientName",   label:"Patient",isName:true},
    {key:"insurerName",   label:"Insurer"},
    {key:"policyNumber",  label:"Policy No."},
    {key:"claimAmount",   label:"Claim Amount",render:v=>inr(v)},
    {key:"claimDate",     label:"Claim Date",render:v=>fmt(v)},
    {key:"claimStatus",   label:"Status"},
  ],
  formFields:[
    {section:"Insurance Claim", cols:2, fields:[
      {key:"patientName",  label:"Patient Name",    req:true,placeholder:"Patient name"},
      {key:"insurerName",  label:"Insurance Company",req:true,placeholder:"Insurer name"},
      {key:"policyNumber", label:"Policy Number",   req:true,placeholder:"Policy no."},
      {key:"claimAmount",  label:"Claim Amount",    type:"number",placeholder:"Amount in INR"},
      {key:"claimDate",    label:"Claim Date",      type:"date"},
      {key:"policyExpiry", label:"Policy Expiry",   type:"date"},
      {key:"claimStatus",  label:"Status",          type:"select",lookupType:"INSURANCE_CLAIM_STATUS"},
      {key:"notes",        label:"Notes",           type:"textarea",placeholder:"Claim notes",rows:2},
    ]},
  ],
};

const OT_CONFIG = {
  title:"Operation Theatre", icon:"🔪", idField:"otId", endpoint:"/hospital/ot/list", createEndpoint:"/hospital/ot/schedule", updateEndpoint:"/hospital/ot", deleteEndpoint:"/hospital/ot", statusField:"otStatus", emptyIcon:"🔪",
  kpiCards:[
    {label:"Total OTs",   color:"teal",  icon:"🔪",compute:r=>r.length},
    {label:"Scheduled",   color:"blue",  icon:"📅",compute:r=>r.filter(o=>(o.otStatus||"").toUpperCase()==="SCHEDULED").length},
    {label:"Completed",   color:"green", icon:"✅",compute:r=>r.filter(o=>(o.otStatus||"").toUpperCase()==="COMPLETED").length},
    {label:"Emergency OT",color:"red",   icon:"🚨",compute:r=>r.filter(o=>o.otType==="Emergency").length},
  ],
  columns:[
    {key:"otNumber",      label:"OT #",isName:true},
    {key:"patientId",     label:"Patient ID"},
    {key:"surgeonId",     label:"Surgeon ID"},
    {key:"procedureName", label:"Procedure"},
    {key:"otRoom",        label:"OT Room"},
    {key:"scheduledStartTime",label:"Scheduled",render:v=>fmt(v)},
    {key:"otStatus",      label:"Status"},
  ],
  formFields:[
    {section:"Operation Theatre Details", cols:2, fields:[
      {key:"patientId",     label:"Patient ID",    req:true,type:"number",placeholder:"Patient ID"},
      {key:"surgeonId",     label:"Surgeon ID",    req:true,type:"number",placeholder:"Surgeon Doctor ID"},
      {key:"admissionId",   label:"Admission ID",  type:"number",placeholder:"Admission ID"},
      {key:"hospitalId",    label:"Hospital",      req:true,type:"number",placeholder:"Hospital ID"},
      {key:"procedureName", label:"Procedure",     req:true,placeholder:"Surgery/procedure name"},
      {key:"otRoom",        label:"OT Room",       placeholder:"Theatre room no."},
      {key:"anesthesiaType",label:"Anesthesia",    type:"select",lookupType:"ANESTHESIA_TYPE"},
      {key:"anesthesiaDoctorId",label:"Anesthesiologist ID",placeholder:"Doctor ID"},
      {key:"otStatus",      label:"Status",        type:"select",lookupType:"OT_STATUS"},
      {key:"otCharges",     label:"OT Charges",    type:"number",placeholder:"Amount in INR"},
    ]},
    {section:"Notes", cols:2, fields:[
      {key:"preOpNotes",  label:"Pre-Op Notes",  type:"textarea",placeholder:"Pre-operative notes",rows:2},
      {key:"postOpNotes", label:"Post-Op Notes", type:"textarea",placeholder:"Post-operative notes",rows:2},
    ]},
  ],
};

const DISCHARGE_CONFIG = {
  title:"Discharge", icon:"🏠", idField:"dischargeId", endpoint:"/hospital/discharge/list", createEndpoint:"/hospital/discharge", updateEndpoint:"/hospital/discharge", deleteEndpoint:"/hospital/discharge", statusField:"status", emptyIcon:"🏠",
  kpiCards:[
    {label:"Total Discharges",  color:"teal",  icon:"🏠",compute:r=>r.length},
    {label:"Today",             color:"blue",  icon:"📅",compute:r=>r.filter(d=>d.dischargeDate?.startsWith(new Date().toISOString().slice(0,10))).length},
    {label:"Draft",             color:"amber", icon:"⏳",compute:r=>r.filter(d=>(d.status||"").toLowerCase()==="draft").length},
    {label:"Finalized",         color:"green", icon:"✅",compute:r=>r.filter(d=>(d.status||"").toLowerCase()==="finalized").length},
  ],
  columns:[
    {key:"dischargeId",    label:"Discharge #",isName:true},
    {key:"patientId",      label:"Patient ID"},
    {key:"doctorId",       label:"Doctor ID"},
    {key:"dischargeDate",  label:"Discharged",render:v=>fmt(v)},
    {key:"finalDiagnosis", label:"Diagnosis"},
    {key:"dischargeType",  label:"Type"},
    {key:"status",         label:"Status"},
  ],
  formFields:[
    {section:"Discharge Details", cols:2, fields:[
      {key:"admissionId",        label:"Admission ID",     req:true,type:"number",placeholder:"Admission ID"},
      {key:"patientId",          label:"Patient ID",       req:true,type:"number",placeholder:"Patient ID"},
      {key:"doctorId",           label:"Doctor ID",        req:true,type:"number",placeholder:"Doctor ID"},
      {key:"hospitalId",         label:"Hospital ID",      type:"number",placeholder:"Hospital ID"},
      {key:"dischargeDate",      label:"Discharge Date",   type:"date"},
      {key:"finalDiagnosis",     label:"Final Diagnosis",  req:true,placeholder:"Discharge diagnosis"},
      {key:"dischargeCondition", label:"Discharge Condition",type:"select",lookupType:"DISCHARGE_CONDITION"},
      {key:"dischargeType",      label:"Discharge Type",   type:"select",lookupType:"DISCHARGE_TYPE"},
      {key:"followUpDate",       label:"Follow-up Date",   type:"date"},
      {key:"status",             label:"Status",           type:"select",lookupType:"DOCUMENT_STATUS"},
    ]},
    {section:"Clinical Summary", cols:1, fields:[
      {key:"treatmentSummary",     label:"Treatment Summary",     type:"textarea",placeholder:"Summary of treatment given",rows:2},
      {key:"dischargeMedications", label:"Discharge Medications", type:"textarea",placeholder:"Medicines at discharge",rows:2},
      {key:"followUpInstructions", label:"Follow-up Instructions",type:"textarea",placeholder:"Post-discharge instructions",rows:2},
      {key:"specialInstructions",  label:"Special Instructions",  type:"textarea",placeholder:"Special care notes",rows:2},
    ]},
  ],
};

const STAFF_CONFIG = {
  title:"Staff", icon:"👥", idField:"staffId", endpoint:"/hospital/staff/list", createEndpoint:"/hospital/staff", updateEndpoint:"/hospital/staff", deleteEndpoint:"/hospital/staff", statusField:"status", emptyIcon:"👥",
  kpiCards:[
    {label:"Total Staff",  color:"teal",  icon:"👥",compute:r=>r.length},
    {label:"Nurses",       color:"blue",  icon:"👩‍⚕️",compute:r=>r.filter(s=>(s.staffRole||"").toLowerCase().includes("nurse")).length},
    {label:"Technicians",  color:"violet",icon:"🔬",compute:r=>r.filter(s=>(s.staffRole||"").toLowerCase().includes("technician")).length},
    {label:"Active",       color:"green", icon:"✅",compute:r=>r.filter(s=>(s.status||"").toLowerCase()==="active").length},
  ],
  filterOptions:[
    {label:"Active",     value:"active",  match:r=>(r.status||"").toLowerCase()==="active"},
    {label:"Nurses",     value:"nurses",  match:r=>(r.staffRole||"").toLowerCase().includes("nurse")},
    {label:"On Leave",   value:"leave",   match:r=>(r.status||"").toLowerCase()==="on_leave"},
  ],
  columns:[
    {key:"staffName",    label:"Staff",isName:true,sub:"staffCode"},
    {key:"staffRole",    label:"Role"},
    {key:"mobileNumber", label:"Mobile"},
    {key:"shiftType",    label:"Shift"},
    {key:"qualification",label:"Qualification"},
    {key:"status",       label:"Status"},
  ],
  formFields:[
    {section:"Staff Information", cols:2, fields:[
      {key:"staffName",   label:"Full Name",    req:true,placeholder:"Staff full name"},
      {key:"mobileNumber",label:"Mobile",       req:true,placeholder:"10-digit mobile"},
      {key:"email",       label:"Email",        placeholder:"Email address"},
      {key:"gender",      label:"Gender",       type:"select",lookupType:"GENDER"},
      {key:"staffRole",   label:"Role",         req:true,type:"select",lookupType:"STAFF_ROLE"},
      {key:"hospitalId",  label:"Hospital ID",  req:true,type:"number",placeholder:"Hospital ID"},
      {key:"shiftType",   label:"Shift",        type:"select",lookupType:"SHIFT_TYPE"},
      {key:"staffCode",   label:"Staff Code",   placeholder:"EMP-XXXX"},
      {key:"qualification",label:"Qualification",placeholder:"Degrees/certifications"},
      {key:"licenseNumber",label:"License Number",placeholder:"License no."},
      {key:"joiningDate", label:"Joining Date", type:"date"},
      {key:"status",      label:"Status",       type:"select",lookupType:"STAFF_STATUS"},
    ]},
    {section:"Address", cols:1, fields:[
      {key:"address",label:"Address",type:"textarea",placeholder:"Staff address",rows:2},
    ]},
  ],
};

const REPORTS_CONFIG = {
  title:"Reports", icon:"📊", idField:"invoiceId", endpoint:"/hospital/billing/list", createEndpoint:null, updateEndpoint:"/hospital/billing", deleteEndpoint:"/hospital/billing", statusField:"paymentStatus", emptyIcon:"📊",
  kpiCards:[
    {label:"Total Reports",  color:"teal",  icon:"📊",compute:r=>r.length},
    {label:"This Month",     color:"blue",  icon:"📅",compute:r=>r.filter(r2=>new Date(r2.createdAt).getMonth()===new Date().getMonth()).length},
    {label:"Financial",      color:"green", icon:"💰",compute:r=>r.filter(r2=>r2.reportType==="Financial").length},
    {label:"Operational",    color:"amber", icon:"⚙️",compute:r=>r.filter(r2=>r2.reportType==="Operational").length},
  ],
  columns:[
    {key:"reportTitle",label:"Report",isName:true},
    {key:"reportType", label:"Type"},
    {key:"generatedBy",label:"Generated By"},
    {key:"dateRange",  label:"Date Range"},
    {key:"createdAt",  label:"Created",render:v=>fmt(v)},
    {key:"status",     label:"Status"},
  ],
  formFields:[
    {section:"Report Details", cols:2, fields:[
      {key:"reportTitle", label:"Report Title",  req:true,placeholder:"Report name"},
      {key:"reportType",  label:"Report Type",   type:"select",lookupType:"REPORT_TYPE"},
      {key:"dateFrom",    label:"From Date",     type:"date"},
      {key:"dateTo",      label:"To Date",       type:"date"},
      {key:"generatedBy", label:"Generated By",  placeholder:"User name"},
      {key:"status",      label:"Status",        type:"select",lookupType:"REPORT_STATUS"},
    ]},
  ],
};

/* ═══════════════════════════════════════════════════════════════════════
   NAV CONFIG
═══════════════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════════════
   MISSING EPIC CONFIGS — Department, Admin, Relationship, Hospital,
   Nursing Notes, Prescription, Advance Payment
═══════════════════════════════════════════════════════════════════════ */
const HOSPITAL_CONFIG = {
  title:"Hospital Management", icon:"🏥",
  idField:"hospitalId",
  endpoint:"/hospital/list",
  createEndpoint:"/hospital/register",
  updateEndpoint:"/hospital",
  deleteEndpoint:"/hospital",
  statusField:"isActive", emptyIcon:"🏥",
  kpiCards:[
    {label:"Total Hospitals",color:"teal",  icon:"🏥",compute:r=>r.length},
    {label:"Active",         color:"green", icon:"✅",compute:r=>r.filter(h=>h.isActive===true||h.isActive===1).length},
  ],
  columns:[
    {key:"hospitalName",      label:"Hospital",isName:true,sub:"registrationNumber"},
    {key:"registrationNumber",label:"Reg. Number"},
    {key:"address",           label:"Address"},
    {key:"phone",             label:"Contact"},
    {key:"city",              label:"City"},
    {key:"hospitalType",      label:"Type"},
  ],
  formFields:[
    {section:"Hospital Information", cols:2, fields:[
      {key:"hospitalName",       label:"Hospital Name",        req:true,placeholder:"Full hospital name"},
      {key:"registrationNumber", label:"Registration Number",  req:true,placeholder:"Unique registration no."},
      {key:"phone",              label:"Phone (10 digits)",    placeholder:"10-digit phone number"},
      {key:"email",              label:"Email",                placeholder:"Email address"},
      {key:"address",            label:"Address",              placeholder:"Street address"},
      {key:"city",               label:"City",                 placeholder:"City"},
      {key:"state",              label:"State",                placeholder:"State"},
      {key:"pincode",            label:"Pincode",              placeholder:"6-digit pincode"},
      {key:"hospitalType",       label:"Hospital Type",        type:"select",lookupType:"HOSPITAL_TYPE"},
      {key:"totalBeds",          label:"Total Beds",           type:"number",placeholder:"Total bed count"},
      {key:"website",            label:"Website",              placeholder:"https://..."},
      {key:"description",        label:"Description",          type:"textarea",placeholder:"About the hospital",rows:2},
    ]},
  ],
};

const DEPARTMENT_CONFIG = {
  title:"Department Management", icon:"🏢",
  idField:"deptId",
  endpoint:"/hospital/department/list",
  createEndpoint:"/hospital/department",
  updateEndpoint:"/hospital/department",
  deleteEndpoint:"/hospital/department",
  statusField:"operationalStatus", emptyIcon:"🏢",
  kpiCards:[
    {label:"Total Departments",color:"teal",  icon:"🏢",compute:r=>r.length},
    {label:"Active",           color:"green", icon:"✅",compute:r=>r.filter(d=>(d.operationalStatus||"").toUpperCase()==="ACTIVE").length},
  ],
  columns:[
    {key:"deptName",          label:"Department",isName:true},
    {key:"hospitalId",        label:"Hospital ID"},
    {key:"headDoctorId",      label:"Head Doctor"},
    {key:"operationalStatus", label:"Status"},
    {key:"description",       label:"Description"},
  ],
  formFields:[
    {section:"Department Details", cols:2, fields:[
      {key:"deptName",          label:"Department Name",    req:true,placeholder:"e.g. Cardiology, Orthopedics"},
      {key:"hospitalId",        label:"Hospital ID",        req:true,type:"number",placeholder:"Enter Hospital ID"},
      {key:"headDoctorId",      label:"Head Doctor ID",     placeholder:"Doctor ID (optional)"},
      {key:"description",       label:"Description",        type:"textarea",placeholder:"Department description",rows:2},
      {key:"operationalStatus", label:"Status",             type:"select",lookupType:"ACTIVE_STATUS"},
    ]},
  ],
};

const ADMIN_CONFIG = {
  title:"Admin Management", icon:"⚙️",
  idField:"staffId",
  endpoint:"/hospital/staff/list",
  createEndpoint:"/hospital/staff",
  updateEndpoint:"/hospital/staff",
  deleteEndpoint:"/hospital/staff",
  statusField:"status", emptyIcon:"⚙️",
  kpiCards:[
    {label:"Total Staff",   color:"teal",  icon:"⚙️",compute:r=>r.length},
    {label:"Active",        color:"green", icon:"✅",compute:r=>r.filter(a=>(a.status||"").toUpperCase()==="ACTIVE").length},
    {label:"On Leave",      color:"amber", icon:"🌴",compute:r=>r.filter(a=>(a.status||"").toUpperCase()==="ON_LEAVE").length},
  ],
  columns:[
    {key:"staffName",   label:"Staff",isName:true,sub:"staffCode"},
    {key:"email",       label:"Email"},
    {key:"staffRole",   label:"Role"},
    {key:"mobileNumber",label:"Mobile"},
    {key:"hospitalId",  label:"Hospital ID"},
    {key:"status",      label:"Status"},
  ],
  formFields:[
    {section:"Staff Information", cols:2, fields:[
      {key:"staffName",    label:"Full Name",   req:true,placeholder:"Staff full name"},
      {key:"mobileNumber", label:"Mobile",      req:true,placeholder:"10-digit mobile number"},
      {key:"email",        label:"Email",        placeholder:"Staff email"},
      {key:"staffRole",    label:"Role",         req:true,type:"select",lookupType:"STAFF_ROLE"},
      {key:"hospitalId",   label:"Hospital",     req:true,type:"number",placeholder:"Hospital ID"},
      {key:"deptId",       label:"Department ID",type:"number",placeholder:"Department ID"},
      {key:"shiftType",    label:"Shift",        type:"select",lookupType:"SHIFT_TYPE"},
      {key:"gender",       label:"Gender",       type:"select",lookupType:"GENDER"},
      {key:"qualification",label:"Qualification",placeholder:"Degree / certification"},
      {key:"status",       label:"Status",       type:"select",lookupType:"STAFF_STATUS"},
    ]},
  ],
};

const RELATIONSHIP_CONFIG = {
  title:"Relationship Management", icon:"🤝",
  idField:"patientId",
  endpoint:"/hospital/patient/list",
  createEndpoint:"/hospital/patient/register",
  updateEndpoint:"/hospital/patient",
  deleteEndpoint:"/hospital/patient",
  statusField:"status", emptyIcon:"🤝",
  kpiCards:[
    {label:"Total Patients",color:"teal",  icon:"🤝", compute:r=>r.length},
    {label:"Active",        color:"green", icon:"✅",  compute:r=>r.filter(p=>(p.status||"").toUpperCase()==="ACTIVE").length},
    {label:"OPD",           color:"blue",  icon:"🩺",  compute:r=>r.filter(p=>p.patientType==="OPD").length},
    {label:"IPD",           color:"amber", icon:"🛏️", compute:r=>r.filter(p=>p.patientType==="IPD").length},
  ],
  columns:[
    {key:"patientName",  label:"Patient",isName:true,sub:"uhid"},
    {key:"mobileNumber", label:"Mobile"},
    {key:"patientType",  label:"Type"},
    {key:"insuranceProvider",label:"Insurance Provider"},
    {key:"insurancePolicyNumber",label:"Policy No."},
    {key:"status",       label:"Status"},
  ],
  formFields:[
    {section:"Patient Details", cols:2, fields:[
      {key:"patientName",  label:"Patient Name",    req:true,placeholder:"Full name"},
      {key:"mobileNumber", label:"Mobile",          req:true,placeholder:"10-digit mobile"},
      {key:"email",        label:"Email",            placeholder:"Email address"},
      {key:"address",      label:"Address",          req:true,placeholder:"Full address"},
      {key:"gender",       label:"Gender",           type:"select",lookupType:"GENDER"},
      {key:"age",          label:"Age",              type:"number",placeholder:"Age in years"},
      {key:"bloodGroup",   label:"Blood Group",      type:"select",lookupType:"BLOOD_GROUP"},
      {key:"patientType",  label:"Patient Type",     type:"select",lookupType:"PATIENT_TYPE"},
      {key:"insuranceProvider",      label:"Insurance Provider", placeholder:"Provider name"},
      {key:"insurancePolicyNumber",  label:"Policy Number",      placeholder:"Policy number"},
      {key:"status",       label:"Status",           type:"select",lookupType:"ACTIVE_STATUS"},
    ]},
  ],
};

const PRESCRIPTION_CONFIG = {
  title:"Prescription Management", icon:"📝",
  idField:"prescriptionId",
  endpoint:"/hospital/prescription/list", createEndpoint:"/hospital/prescription/create",
  updateEndpoint:"/hospital/prescription",
  deleteEndpoint:"/hospital/prescription",
  statusField:"status", emptyIcon:"📝",
  kpiCards:[
    {label:"Total",     color:"teal",  icon:"📝",compute:r=>r.length},
    {label:"Today",     color:"blue",  icon:"📅",compute:r=>r.filter(p=>p.prescriptionDate?.startsWith(new Date().toISOString().slice(0,10))).length},
    {label:"Active",    color:"green", icon:"✅",compute:r=>r.filter(p=>(p.status||"").toLowerCase()==="active").length},
    {label:"Refillable",color:"amber", icon:"🔄",compute:r=>r.filter(p=>p.isRefillAllowed).length},
  ],
  filterOptions:[
    {label:"Active",   value:"active",   match:r=>(r.status||"").toLowerCase()==="active"},
    {label:"Completed",value:"completed",match:r=>(r.status||"").toLowerCase()==="completed"},
  ],
  columns:[
    {key:"prescriptionNumber",label:"Rx #",isName:true},
    {key:"patientId",         label:"Patient ID"},
    {key:"doctorId",          label:"Doctor ID"},
    {key:"prescriptionType",  label:"Type"},
    {key:"prescriptionDate",  label:"Date",render:v=>fmt(v)},
    {key:"status",            label:"Status"},
  ],
  formFields:[
    {section:"Prescription Details", cols:2, fields:[
      {key:"patientId",       label:"Patient ID",    req:true,type:"number",placeholder:"Patient ID"},
      {key:"doctorId",        label:"Doctor ID",     req:true,type:"number",placeholder:"Doctor ID"},
      {key:"hospitalId",      label:"Hospital ID",   type:"number",placeholder:"Hospital ID"},
      {key:"consultationId",  label:"Consultation ID",type:"number",placeholder:"Consultation ID (optional)"},
      {key:"admissionId",     label:"Admission ID",  type:"number",placeholder:"Admission ID (optional)"},
      {key:"prescriptionDate",label:"Date",          type:"date"},
      {key:"prescriptionType",label:"Type",          type:"select",lookupType:"PRESCRIPTION_TYPE"},
      {key:"status",          label:"Status",        type:"select",lookupType:"PRESCRIPTION_STATUS"},
    ]},
    {section:"Medicines", cols:1, fields:[
      {key:"medicines",label:"Medicines",req:true,type:"textarea",placeholder:"List medicines with dosage, frequency, duration (e.g. Paracetamol 500mg - Twice daily - 5 days)",rows:4},
      {key:"notes",    label:"Notes",    type:"textarea",placeholder:"Special instructions",rows:2},
    ]},
  ],
};

const NURSING_CONFIG = {
  title:"Nursing Notes", icon:"🩺",
  idField:"noteId",
  endpoint:"/hospital/nursing/list", createEndpoint:"/hospital/nursing/note",
  updateEndpoint:"/hospital/nursing",
  deleteEndpoint:"/hospital/nursing",
  statusField:"noteType", emptyIcon:"🩺",
  kpiCards:[
    {label:"Total Notes",color:"teal",  icon:"🩺",compute:r=>r.length},
    {label:"Today",      color:"blue",  icon:"📅",compute:r=>r.filter(n=>n.recordedAt?.startsWith(new Date().toISOString().slice(0,10))).length},
    {label:"Night Shift",color:"violet",icon:"🌙",compute:r=>r.filter(n=>(n.shift||"").toLowerCase()==="night").length},
  ],
  columns:[
    {key:"nurseName",           label:"Nurse",isName:true},
    {key:"patientId",           label:"Patient ID"},
    {key:"admissionId",         label:"Admission ID"},
    {key:"shift",               label:"Shift"},
    {key:"vitalsBloodPressure", label:"BP"},
    {key:"recordedAt",          label:"Recorded",render:v=>fmt(v)},
  ],
  formFields:[
    {section:"Nursing Note", cols:2, fields:[
      {key:"admissionId",        label:"Admission ID",   req:true,type:"number",placeholder:"Admission ID"},
      {key:"patientId",          label:"Patient ID",     req:true,type:"number",placeholder:"Patient ID"},
      {key:"nurseName",          label:"Nurse Name",     placeholder:"Nurse name"},
      {key:"nurseId",            label:"Nurse ID",       type:"number",placeholder:"Nurse staff ID"},
      {key:"hospitalId",         label:"Hospital ID",    type:"number",placeholder:"Hospital ID"},
      {key:"shift",              label:"Shift",          type:"select",lookupType:"SHIFT_TYPE"},
      {key:"noteType",           label:"Note Type",      type:"select",lookupType:"NURSING_NOTE_TYPE"},
      {key:"recordedAt",         label:"Recorded At",    type:"datetime-local"},
    ]},
    {section:"Vitals", cols:3, fields:[
      {key:"vitalsBloodPressure",label:"Blood Pressure", placeholder:"e.g. 120/80"},
      {key:"vitalsPulse",        label:"Pulse",          placeholder:"e.g. 72 bpm"},
      {key:"vitalsTemperature",  label:"Temperature",    placeholder:"e.g. 98.6°F"},
      {key:"vitalsSpO2",         label:"SpO2",           placeholder:"e.g. 98%"},
      {key:"vitalsWeight",       label:"Weight (kg)",    placeholder:"e.g. 70"},
    ]},
    {section:"Notes", cols:1, fields:[
      {key:"notes",label:"Clinical Notes",type:"textarea",placeholder:"Observations, medications given, handover notes",rows:3},
    ]},
  ],
};

const ADVANCE_PAYMENT_CONFIG = {
  title:"Advance Payment", icon:"💵",
  idField:"advanceId",
  endpoint:"/hospital/billing/advance/all", createEndpoint:"/hospital/billing/advance",
  updateEndpoint:"/hospital/billing/advance",
  deleteEndpoint:"/hospital/billing/advance",
  statusField:"advanceStatus", emptyIcon:"💵",
  kpiCards:[
    {label:"Total Advances",color:"teal",  icon:"💵",compute:r=>r.length},
    {label:"Total Amount",  color:"green", icon:"💰",compute:r=>inr(r.reduce((s,a)=>s+Number(a.amount||0),0))},
    {label:"Adjusted",      color:"amber", icon:"✅",compute:r=>r.filter(a=>(a.advanceStatus||"").toUpperCase()==="ADJUSTED").length},
    {label:"Pending",       color:"blue",  icon:"⏳",compute:r=>r.filter(a=>(a.advanceStatus||"").toUpperCase()==="PENDING").length},
  ],
  filterOptions:[
    {label:"Pending",  value:"pending",  match:r=>(r.status||"").toLowerCase()==="pending"},
    {label:"Adjusted", value:"adjusted", match:r=>(r.status||"").toLowerCase()==="adjusted"},
    {label:"Refunded", value:"refunded", match:r=>(r.status||"").toLowerCase()==="refunded"},
  ],
  columns:[
    {key:"advanceReference",label:"Reference",isName:true},
    {key:"patientId",      label:"Patient ID"},
    {key:"amount",         label:"Amount",render:v=>inr(v)},
    {key:"paymentMode",    label:"Payment Mode"},
    {key:"receiptNumber",  label:"Receipt No."},
    {key:"paymentDate",    label:"Date",render:v=>fmt(v)},
    {key:"advanceStatus",  label:"Status"},
  ],
  filterOptions:[
    {label:"Pending",  value:"pending",  match:r=>(r.advanceStatus||"").toUpperCase()==="PENDING"},
    {label:"Adjusted", value:"adjusted", match:r=>(r.advanceStatus||"").toUpperCase()==="ADJUSTED"},
    {label:"Refunded", value:"refunded", match:r=>(r.advanceStatus||"").toUpperCase()==="REFUNDED"},
  ],
  formFields:[
    {section:"Advance Payment Details", cols:2, fields:[
      {key:"patientId",    label:"Patient ID",    req:true,type:"number",placeholder:"Patient ID"},
      {key:"admissionId",  label:"Admission ID",  type:"number",placeholder:"Admission ID (if IPD)"},
      {key:"hospitalId",   label:"Hospital",      req:true,type:"number",placeholder:"Hospital ID"},
      {key:"amount",       label:"Amount (₹)",    req:true,type:"number",placeholder:"Amount"},
      {key:"advanceType",  label:"Advance Type",  type:"select",lookupType:"ADVANCE_TYPE"},
      {key:"paymentMode",  label:"Payment Mode",  type:"select",lookupType:"PAYMENT_MODE"},
      {key:"transactionId",label:"Transaction ID",placeholder:"UPI/card reference"},
      {key:"receiptNumber",label:"Receipt Number",placeholder:"Auto-generated"},
      {key:"paymentDate",  label:"Payment Date",  type:"date"},
      {key:"collectedBy",  label:"Collected By",  placeholder:"Staff name"},
      {key:"advanceStatus",label:"Status",        type:"select",lookupType:"ADVANCE_STATUS"},
      {key:"notes",        label:"Notes",         type:"textarea",placeholder:"Payment notes",rows:2},
    ]},
  ],
};

const NAV = [
  {
    section: "Overview",
    items: [
      { key:"dashboard",     label:"Dashboard",            emoji:"📊", cls:"dash-tab" },
    ]
  },
  {
    section: "Clinical",
    items: [
      { key:"patients",      label:"Patients",             emoji:"🧑‍⚕️" },
      { key:"doctors",       label:"Doctors",              emoji:"👨‍⚕️" },
      { key:"appointments",  label:"Appointments",         emoji:"📅", cls:"blue-tab" },
      { key:"opd",           label:"OPD",                  emoji:"🩺" },
      { key:"ipd",           label:"IPD / Admissions",     emoji:"🛏️", cls:"blue-tab" },
      { key:"discharge",     label:"Discharge",            emoji:"🏠" },
      { key:"emergency",     label:"Emergency",            emoji:"🚨", cls:"red-tab" },
    ]
  },
  {
    section: "Procedures",
    items: [
      { key:"ot",            label:"Operation Theatre",    emoji:"🔪", cls:"red-tab" },
      { key:"lab",           label:"Lab & Reports",        emoji:"🔬" },
      { key:"pharmacy",      label:"Pharmacy",             emoji:"💊", cls:"amber-tab" },
      { key:"prescription",  label:"Prescriptions",        emoji:"📝" },
      { key:"nursing",       label:"Nursing Notes",        emoji:"🩺", cls:"blue-tab" },
    ]
  },
  {
    section: "Administration",
    items: [
      { key:"wards",         label:"Wards & Beds",         emoji:"🏨", cls:"blue-tab" },
      { key:"insurance",     label:"Insurance",            emoji:"🛡️" },
      { key:"billing",       label:"Billing",              emoji:"💳", cls:"amber-tab" },
      { key:"advancepay",    label:"Advance Payment",      emoji:"💵", cls:"green-tab" },
      { key:"staff",         label:"Staff",                emoji:"👥" },
    ]
  },
  {
    section: "Management",
    items: [
      { key:"hospitals",     label:"Hospital Mgmt",        emoji:"🏥" },
      { key:"departments",   label:"Departments",          emoji:"🏢", cls:"blue-tab" },
      { key:"admin",         label:"Admin",                emoji:"⚙️" },
      { key:"relationship",  label:"Relationships",        emoji:"🤝" },
      { key:"reports",       label:"Reports",              emoji:"📊", cls:"blue-tab" },
    ]
  },
];

const TAB_CONFIG_MAP = {
  patients: PATIENT_CONFIG, doctors: DOCTOR_CONFIG, appointments: APPOINTMENT_CONFIG,
  opd: OPD_CONFIG, ipd: IPD_CONFIG, discharge: DISCHARGE_CONFIG, emergency: EMERGENCY_CONFIG,
  ot: OT_CONFIG, lab: LAB_CONFIG, pharmacy: PHARMACY_CONFIG,
  wards: WARD_CONFIG, insurance: INSURANCE_CONFIG, billing: BILLING_CONFIG,
  staff: STAFF_CONFIG, reports: REPORTS_CONFIG,
  hospitals: HOSPITAL_CONFIG, departments: DEPARTMENT_CONFIG, admin: ADMIN_CONFIG,
  relationship: RELATIONSHIP_CONFIG, prescription: PRESCRIPTION_CONFIG,
  nursing: NURSING_CONFIG, advancepay: ADVANCE_PAYMENT_CONFIG,
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════ */
export default function HospitalManagement({ activeTab: propTab }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const tabFromPath = location.pathname.split("/hospital/")[1]?.split("/")[0] || "dashboard";
  const [activeTab, setActiveTab] = useState(propTab || tabFromPath || "dashboard");

  useEffect(()=>{
    const t = location.pathname.split("/hospital/")[1]?.split("/")[0];
    if (t && t!==activeTab) setActiveTab(t);
  },[location.pathname]);

  const goTab = (key) => {
    setActiveTab(key);
    navigate(`/hospital/${key}`, {replace:true});
  };

  const [counts, setCounts] = useState({});
  useEffect(()=>{
    API.get("/hospital/dashboard/summary").then(r=>{
      const d=r.data||{};
      setCounts({
        patients: d.totalPatients||"",
        appointments: d.todayAppointments||"",
        emergency: d.emergencyCases||"",
        ipd: d.activeAdmissions||"",
      });
    }).catch(()=>{});
  },[]);

  const today = new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});

  return (
    <>
      <style>{CSS}</style>
      <div className={`hm-app${isDark ? "" : " hm-light"}`}>

        {/* Content Area */}
        <div className="hm-content">
          {activeTab==="dashboard" ? <DashboardTab key="dashboard"/> :
            TAB_CONFIG_MAP[activeTab] ? <CrudTab key={activeTab} config={TAB_CONFIG_MAP[activeTab]}/> :
            <div style={{padding:40,textAlign:"center",color:"#94A3B8"}}>Tab not found</div>
          }
        </div>

      </div>
    </>
  );
}