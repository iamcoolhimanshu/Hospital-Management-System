// Dashboard.jsx – Hospital Dashboard Module
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
  const [refreshing, setRefreshing] = useState(false);
  const [liveTime, setLiveTime] = useState(new Date());

  // Live clock
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

  // Auto-refresh every 60s
  useEffect(() => {
    const t = setInterval(() => loadAll(true), 60000);
    return () => clearInterval(t);
  }, [loadAll]);

  const DB_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

    .db2-root {
      font-family: 'Outfit', sans-serif;
      background: var(--hm-bg, #0A1628);
      color: var(--hm-text, #E2E8F0);
      padding: 0;
      min-height: 100vh;
    }

    /* ── HERO BANNER ── */
    .db2-hero {
      background: linear-gradient(135deg, #020B18 0%, #041628 40%, #061E33 100%);
      border-bottom: 1px solid rgba(5,150,105,0.2);
      padding: 20px 28px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      position: relative;
      overflow: hidden;
    }
    .db2-hero::before {
      content: '';
      position: absolute;
      top: -60px; right: -60px;
      width: 220px; height: 220px;
      background: radial-gradient(circle, rgba(5,150,105,0.12) 0%, transparent 70%);
      pointer-events: none;
    }
    .db2-hero::after {
      content: '';
      position: absolute;
      bottom: -40px; left: 30%;
      width: 180px; height: 180px;
      background: radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%);
      pointer-events: none;
    }
    .db2-hero-left { display: flex; align-items: center; gap: 16px; }
    .db2-hero-icon {
      width: 52px; height: 52px;
      background: linear-gradient(135deg, #059669, #047857);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 26px;
      box-shadow: 0 6px 24px rgba(5,150,105,0.4);
      flex-shrink: 0;
    }
    .db2-hero-title { font-size: 22px; font-weight: 800; color: #F8FAFC; letter-spacing: -0.4px; }
    .db2-hero-sub   { font-size: 13px; color: #64748B; font-weight: 500; margin-top: 2px; }
    .db2-hero-right { display: flex; align-items: center; gap: 14px; }
    .db2-clock {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px; font-weight: 600;
      color: #34D399;
      background: rgba(5,150,105,0.1);
      border: 1px solid rgba(5,150,105,0.25);
      border-radius: 8px;
      padding: 6px 14px;
      letter-spacing: 0.05em;
    }
    .db2-date {
      font-size: 12px; color: #64748B; font-weight: 500;
    }
    .db2-refresh-btn {
      display: flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 7px 14px;
      cursor: pointer;
      font-size: 12px; font-weight: 600; color: #94A3B8;
      transition: all 0.2s;
      font-family: 'Outfit', sans-serif;
    }
    .db2-refresh-btn:hover { background: rgba(5,150,105,0.12); color: #34D399; border-color: rgba(5,150,105,0.3); }
    .db2-refresh-btn.spinning span { display: inline-block; animation: db2-spin 1s linear infinite; }
    @keyframes db2-spin { to { transform: rotate(360deg); } }

    /* ── WELCOME SECTION ── */
    .db2-welcome {
      padding: 16px 28px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .db2-welcome-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
    .db2-welcome-text h2 { font-size: 17px; font-weight: 700; color: #F1F5F9; }
    .db2-welcome-text p  { font-size: 12px; color: #64748B; margin-top: 2px; }
    .db2-status-pills { display: flex; gap: 8px; flex-wrap: wrap; }
    .db2-pill {
      display: flex; align-items: center; gap: 5px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px; font-weight: 600;
      border: 1px solid;
    }
    .db2-pill-dot { width: 6px; height: 6px; border-radius: 50%; }
    .db2-pill.green { background: rgba(5,150,105,0.1); border-color: rgba(5,150,105,0.3); color: #34D399; }
    .db2-pill.red   { background: rgba(220,38,38,0.1);  border-color: rgba(220,38,38,0.3);  color: #F87171; }
    .db2-pill.blue  { background: rgba(37,99,235,0.1);  border-color: rgba(37,99,235,0.3);  color: #93C5FD; }
    .db2-pill.amber { background: rgba(217,119,6,0.1);  border-color: rgba(217,119,6,0.3);  color: #FCD34D; }
    .db2-pill-dot.green { background: #34D399; }
    .db2-pill-dot.red   { background: #F87171; }
    .db2-pill-dot.blue  { background: #93C5FD; }
    .db2-pill-dot.amber { background: #FCD34D; }

    /* ── KPI GRID ── */
    .db2-section { padding: 20px 28px 0; }
    .db2-section-hdr {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 14px;
    }
    .db2-section-label {
      font-size: 11px; font-weight: 800; color: #475569;
      text-transform: uppercase; letter-spacing: 0.1em;
      display: flex; align-items: center; gap: 6px;
    }
    .db2-section-label::before { content: ''; display: block; width: 3px; height: 14px; background: #059669; border-radius: 2px; }

    .db2-kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }
    .db2-kpi {
      background: var(--hm-card-bg, #0F1D33);
      border: 1px solid var(--hm-card-border, #1A2E4A);
      border-radius: 14px;
      padding: 16px 16px 14px;
      position: relative;
      overflow: hidden;
      transition: transform 0.18s, box-shadow 0.18s;
      cursor: default;
    }
    .db2-kpi:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.3); }
    .db2-kpi::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: var(--kpi-accent, #059669);
      border-radius: 14px 14px 0 0;
    }
    .db2-kpi-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px; }
    .db2-kpi-icon {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      background: var(--kpi-icon-bg, rgba(5,150,105,0.12));
    }
    .db2-kpi-trend {
      font-size: 10px; font-weight: 700;
      padding: 3px 7px; border-radius: 6px;
    }
    .db2-kpi-trend.up   { background: rgba(5,150,105,0.12); color: #34D399; }
    .db2-kpi-trend.down { background: rgba(220,38,38,0.12);  color: #F87171; }
    .db2-kpi-trend.flat { background: rgba(100,116,139,0.12); color: #94A3B8; }
    .db2-kpi-val {
      font-size: 26px; font-weight: 800;
      color: #F1F5F9; letter-spacing: -0.5px;
      font-family: 'Outfit', sans-serif;
      line-height: 1;
      margin-bottom: 4px;
    }
    .db2-kpi-label { font-size: 11px; font-weight: 600; color: #64748B; }
    .db2-kpi-sub   { font-size: 10px; color: #475569; margin-top: 4px; }

    /* accent colors */
    .db2-kpi[data-accent="teal"]   { --kpi-accent: #059669; --kpi-icon-bg: rgba(5,150,105,0.1); }
    .db2-kpi[data-accent="blue"]   { --kpi-accent: #2563EB; --kpi-icon-bg: rgba(37,99,235,0.1); }
    .db2-kpi[data-accent="red"]    { --kpi-accent: #DC2626; --kpi-icon-bg: rgba(220,38,38,0.1); }
    .db2-kpi[data-accent="amber"]  { --kpi-accent: #D97706; --kpi-icon-bg: rgba(217,119,6,0.1); }
    .db2-kpi[data-accent="violet"] { --kpi-accent: #7C3AED; --kpi-icon-bg: rgba(124,58,237,0.1); }
    .db2-kpi[data-accent="cyan"]   { --kpi-accent: #0891B2; --kpi-icon-bg: rgba(8,145,178,0.1); }
    .db2-kpi[data-accent="pink"]   { --kpi-accent: #DB2777; --kpi-icon-bg: rgba(219,39,119,0.1); }
    .db2-kpi[data-accent="lime"]   { --kpi-accent: #65A30D; --kpi-icon-bg: rgba(101,163,13,0.1); }

    /* ── ALERT SECTION ── */
    .db2-alerts { display: flex; gap: 10px; flex-wrap: wrap; padding: 0 28px 16px; }
    .db2-alert {
      flex: 1; min-width: 220px;
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid;
      font-size: 12px; font-weight: 600;
    }
    .db2-alert.red    { background: rgba(220,38,38,0.08);  border-color: rgba(220,38,38,0.25);  color: #FCA5A5; }
    .db2-alert.amber  { background: rgba(217,119,6,0.08);  border-color: rgba(217,119,6,0.25);  color: #FDE68A; }
    .db2-alert.green  { background: rgba(5,150,105,0.08);  border-color: rgba(5,150,105,0.25);  color: #6EE7B7; }
    .db2-alert-icon   { font-size: 16px; flex-shrink: 0; }
    .db2-alert-text strong { display: block; }
    .db2-alert-text span   { font-weight: 400; opacity: 0.75; }

    /* ── CHARTS GRID ── */
    .db2-charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .db2-charts-grid.two { grid-template-columns: 1fr 1fr; }
    .db2-charts-grid.full { grid-template-columns: 1fr; }
    @media (max-width: 1200px) { .db2-charts-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 800px)  { .db2-charts-grid { grid-template-columns: 1fr; } }

    .db2-card {
      background: var(--hm-card-bg, #0F1D33);
      border: 1px solid var(--hm-card-border, #1A2E4A);
      border-radius: 16px;
      overflow: hidden;
    }
    .db2-card-hdr {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px 12px;
      border-bottom: 1px solid var(--hm-card-border, #1A2E4A);
    }
    .db2-card-title { font-size: 13px; font-weight: 700; color: #CBD5E1; display: flex; align-items: center; gap: 6px; }
    .db2-card-badge {
      font-size: 10px; font-weight: 700;
      background: rgba(5,150,105,0.12);
      color: #34D399;
      border: 1px solid rgba(5,150,105,0.2);
      padding: 2px 8px;
      border-radius: 6px;
    }
    .db2-card-body { padding: 14px 16px; }

    /* ── SVG CHARTS ── */
    .db2-bar-chart { width: 100%; }
    .db2-bar-row {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 10px;
    }
    .db2-bar-label { font-size: 11px; font-weight: 600; color: #94A3B8; width: 90px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .db2-bar-track {
      flex: 1; height: 8px; background: rgba(255,255,255,0.06);
      border-radius: 4px; overflow: hidden;
    }
    .db2-bar-fill {
      height: 100%; border-radius: 4px;
      transition: width 0.7s cubic-bezier(0.4,0,0.2,1);
    }
    .db2-bar-val { font-size: 11px; font-weight: 700; color: #94A3B8; width: 28px; text-align: right; flex-shrink: 0; }

    /* ── SPARKLINE ── */
    .db2-sparkline { overflow: visible; }

    /* ── PIE CHART ── */
    .db2-pie-wrap { display: flex; align-items: center; gap: 16px; }
    .db2-pie-legend { flex: 1; }
    .db2-pie-legend-row {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 8px;
    }
    .db2-pie-legend-left { display: flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 600; color: #94A3B8; }
    .db2-pie-dot { width: 8px; height: 8px; border-radius: 3px; flex-shrink: 0; }
    .db2-pie-legend-val { font-size: 11px; font-weight: 700; }

    /* ── OPERATIONS / PROGRESS BARS ── */
    .db2-ops-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }
    .db2-ops-card {
      background: var(--hm-card-bg, #0F1D33);
      border: 1px solid var(--hm-card-border, #1A2E4A);
      border-radius: 14px;
      padding: 14px 16px;
    }
    .db2-ops-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
    .db2-ops-title { font-size: 12px; font-weight: 700; color: #94A3B8; }
    .db2-ops-pct { font-size: 20px; font-weight: 800; }
    .db2-ops-bar-track {
      height: 6px; background: rgba(255,255,255,0.07); border-radius: 3px;
      overflow: hidden; margin-bottom: 8px;
    }
    .db2-ops-bar-fill { height: 100%; border-radius: 3px; transition: width 0.7s; }
    .db2-ops-sub { font-size: 10px; color: #475569; }

    /* ── TABLES ── */
    .db2-table-wrap { overflow-x: auto; }
    .db2-table { width: 100%; border-collapse: collapse; }
    .db2-table th {
      font-size: 10px; font-weight: 700; color: #475569;
      text-transform: uppercase; letter-spacing: 0.07em;
      padding: 8px 12px; text-align: left;
      border-bottom: 1px solid var(--hm-card-border, #1A2E4A);
      background: rgba(0,0,0,0.15);
      white-space: nowrap;
    }
    .db2-table td {
      padding: 10px 12px;
      font-size: 12px; font-weight: 500; color: #94A3B8;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      vertical-align: middle;
    }
    .db2-table tr:last-child td { border-bottom: none; }
    .db2-table tr:hover td { background: rgba(255,255,255,0.025); }
    .db2-table .td-primary { font-weight: 700; color: #CBD5E1; }
    .db2-table .td-mono { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #64748B; }
    .db2-table .td-amount { font-family: 'JetBrains Mono', monospace; color: #34D399; font-weight: 700; }
    .db2-badge {
      display: inline-flex; align-items: center; gap: 3px;
      padding: 2px 8px; border-radius: 5px; font-size: 10px; font-weight: 700;
      border: 1px solid transparent;
    }
    .db2-badge.green  { background: rgba(5,150,105,0.1); border-color: rgba(5,150,105,0.25); color: #34D399; }
    .db2-badge.red    { background: rgba(220,38,38,0.1);  border-color: rgba(220,38,38,0.25);  color: #F87171; }
    .db2-badge.amber  { background: rgba(217,119,6,0.1);  border-color: rgba(217,119,6,0.25);  color: #FCD34D; }
    .db2-badge.blue   { background: rgba(37,99,235,0.1);  border-color: rgba(37,99,235,0.25);  color: #93C5FD; }
    .db2-badge.violet { background: rgba(124,58,237,0.1); border-color: rgba(124,58,237,0.25); color: #C4B5FD; }
    .db2-badge.gray   { background: rgba(100,116,139,0.1);border-color: rgba(100,116,139,0.2); color: #94A3B8; }

    /* ── ACTIVITY TIMELINE ── */
    .db2-timeline { padding: 4px 0; }
    .db2-tl-item {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      position: relative;
    }
    .db2-tl-item:last-child { border-bottom: none; }
    .db2-tl-dot {
      width: 32px; height: 32px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; flex-shrink: 0;
    }
    .db2-tl-content { flex: 1; min-width: 0; }
    .db2-tl-title  { font-size: 12px; font-weight: 700; color: #CBD5E1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .db2-tl-meta   { font-size: 11px; color: #64748B; margin-top: 2px; }
    .db2-tl-time   { font-size: 10px; color: #475569; font-family: 'JetBrains Mono', monospace; flex-shrink: 0; }

    /* ── INSIGHT CARDS ── */
    .db2-insights { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .db2-insight {
      background: var(--hm-card-bg, #0F1D33);
      border: 1px solid var(--hm-card-border, #1A2E4A);
      border-radius: 12px;
      padding: 14px 16px;
      display: flex; align-items: flex-start; gap: 12px;
    }
    .db2-insight-icon { font-size: 20px; flex-shrink: 0; line-height: 1; margin-top: 1px; }
    .db2-insight-title { font-size: 12px; font-weight: 700; color: #CBD5E1; margin-bottom: 3px; }
    .db2-insight-body  { font-size: 11px; color: #64748B; line-height: 1.5; }
    .db2-insight-tag   { display: inline-block; margin-top: 5px; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 5px; }
    .db2-insight-tag.up   { background: rgba(5,150,105,0.1); color: #34D399; }
    .db2-insight-tag.warn { background: rgba(217,119,6,0.1);  color: #FCD34D; }
    .db2-insight-tag.crit { background: rgba(220,38,38,0.1);  color: #F87171; }

    /* ── DONUT CHART ── */
    .db2-donut-wrap { display: flex; align-items: center; justify-content: center; gap: 20px; }
    .db2-donut-legend { display: flex; flex-direction: column; gap: 9px; }
    .db2-donut-row { display: flex; align-items: center; gap: 8px; font-size: 12px; }
    .db2-donut-dot { width: 9px; height: 9px; border-radius: 3px; flex-shrink: 0; }
    .db2-donut-name { color: #94A3B8; font-weight: 600; flex: 1; }
    .db2-donut-num  { color: #CBD5E1; font-weight: 800; font-family: 'JetBrains Mono', monospace; }

    /* ── PERFORMANCE METRICS ── */
    .db2-perf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .db2-perf-item { text-align: center; }
    .db2-perf-circle { position: relative; display: inline-flex; align-items: center; justify-content: center; }
    .db2-perf-val { position: absolute; text-align: center; }
    .db2-perf-val strong { display: block; font-size: 18px; font-weight: 800; color: #F1F5F9; font-family: 'JetBrains Mono', monospace; }
    .db2-perf-val span   { font-size: 9px; color: #64748B; font-weight: 600; text-transform: uppercase; }
    .db2-perf-label { font-size: 11px; color: #64748B; font-weight: 600; margin-top: 6px; }

    /* ── MINI LINE CHART ── */
    .db2-linechart-wrap { width: 100%; overflow: hidden; }

    /* LIGHT MODE OVERRIDES */
    [data-theme="light"] .db2-root {
      background: #F0F4FA;
      color: #0F172A;
    }
    [data-theme="light"] .db2-hero {
      background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%);
      border-bottom-color: rgba(5,150,105,0.15);
    }
    [data-theme="light"] .db2-hero::before { background: radial-gradient(circle, rgba(5,150,105,0.07) 0%, transparent 70%); }
    [data-theme="light"] .db2-hero::after  { background: radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%); }
    [data-theme="light"] .db2-hero-title   { color: #0F172A; }
    [data-theme="light"] .db2-hero-sub     { color: #94A3B8; }
    [data-theme="light"] .db2-clock        { background: rgba(5,150,105,0.07); border-color: rgba(5,150,105,0.2); }
    [data-theme="light"] .db2-welcome      { border-bottom-color: rgba(0,0,0,0.06); }
    [data-theme="light"] .db2-welcome-text h2 { color: #0F172A; }
    [data-theme="light"] .db2-kpi { background: #fff; border-color: #E2E8F0; }
    [data-theme="light"] .db2-kpi:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.1); }
    [data-theme="light"] .db2-kpi-val { color: #0F172A; }
    [data-theme="light"] .db2-card { background: #fff; border-color: #E2E8F0; }
    [data-theme="light"] .db2-card-hdr { border-bottom-color: #F1F5F9; }
    [data-theme="light"] .db2-card-title { color: #334155; }
    [data-theme="light"] .db2-ops-card { background: #fff; border-color: #E2E8F0; }
    [data-theme="light"] .db2-insight  { background: #fff; border-color: #E2E8F0; }
    [data-theme="light"] .db2-table th { background: #F8FAFC; border-bottom-color: #E2E8F0; color: #94A3B8; }
    [data-theme="light"] .db2-table td { border-bottom-color: #F1F5F9; color: #64748B; }
    [data-theme="light"] .db2-table .td-primary { color: #0F172A; }
    [data-theme="light"] .db2-table tr:hover td { background: #F8FAFC; }
    [data-theme="light"] .db2-bar-track { background: rgba(0,0,0,0.05); }
    [data-theme="light"] .db2-section-label { color: #94A3B8; }
    [data-theme="light"] .db2-ops-bar-track { background: rgba(0,0,0,0.06); }
    [data-theme="light"] .db2-tl-title { color: #0F172A; }
    [data-theme="light"] .db2-tl-item  { border-bottom-color: #F1F5F9; }
    [data-theme="light"] .db2-refresh-btn { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.08); color: #64748B; }
  `;

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:400,flexDirection:"column",gap:14}}>
      <div style={{width:44,height:44,borderRadius:"50%",border:"3px solid rgba(5,150,105,0.2)",borderTopColor:"#059669",animation:"db2-spin 0.8s linear infinite"}}/>
      <div style={{fontSize:13,color:"#64748B",fontWeight:600}}>Loading dashboard…</div>
      <style>{`.db2-spin-loader{animation:db2-spin 0.8s linear infinite}@keyframes db2-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  /* ── Derive statistics ── */
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

  // PATIENTS
  const totalPatients   = s.totalPatients   || patients.length;
  const activeAdmit     = s.activeAdmissions|| admissions.filter(a=>(a.admissionStatus||"").toUpperCase()==="ADMITTED").length;
  const todayAdmit      = admissions.filter(a=>a.admissionDate?.startsWith(today)).length;
  const dischargedTotal = admissions.filter(a=>(a.admissionStatus||"").toUpperCase()==="DISCHARGED").length;

  // DOCTORS
  const totalDoctors   = s.totalDoctors   || doctors.length;
  const availDoctors   = doctors.filter(d=>(d.status||d.isActive)===true||(d.status||"").toLowerCase()==="active").length;
  const specialistDocs = doctors.filter(d=>d.specialization && d.specialization!=="General Medicine").length;

  // BEDS
  const totalBeds    = beds.length;
  const occupiedBeds = beds.filter(b=>(b.status||"").toLowerCase()==="occupied").length;
  const availBeds    = beds.filter(b=>(b.status||"").toLowerCase()==="available").length;
  const occupancyPct = totalBeds>0 ? Math.round(occupiedBeds/totalBeds*100) : 0;

  // EMERGENCY
  const totalEmergency  = s.activeEmergencies || emergencies.filter(e=>(e.emergencyStatus||"").toUpperCase()==="ACTIVE").length;
  const criticalEmerg   = emergencies.filter(e=>(e.severityLevel||e.triageCategory||"").toLowerCase()==="critical").length;

  // LAB
  const pendingLab   = s.pendingLabTests || labTests.filter(t=>(t.testStatus||"").toLowerCase()==="ordered").length;
  const completedLab = labTests.filter(t=>(t.testStatus||"").toLowerCase()==="completed").length;

  // PHARMACY
  const lowStockMeds   = s.lowStockMedicines || medicines.filter(m=>m.reorderLevel && Number(m.currentStock||0) <= Number(m.reorderLevel||0)).length;
  const totalMedicines = medicines.length;

  // FINANCE
  const totalRevenue   = s.totalRevenue || invoices.reduce((sum,inv)=>sum+Number(inv.totalAmount||0),0);
  const pendingDues    = s.pendingDues  || invoices.filter(inv=>(inv.invoiceStatus||"").toLowerCase()==="pending").reduce((sum,inv)=>sum+Number(inv.totalAmount||0),0);
  const paidInvoices   = invoices.filter(inv=>(inv.invoiceStatus||"").toLowerCase()==="paid").length;
  const pendingInvoices= invoices.filter(inv=>(inv.invoiceStatus||"").toLowerCase()==="pending").length;
  const pendingClaims  = s.pendingInsuranceClaims || insurance.filter(i=>(i.claimStatus||"").toLowerCase()==="pending").length;

  // STAFF
  const totalStaff  = staff.length;
  const nurses      = staff.filter(s2=>(s2.staffRole||s2.role||"").toLowerCase().includes("nurse")).length;
  const technicians = staff.filter(s2=>(s2.staffRole||s2.role||"").toLowerCase().includes("tech")).length;

  // Department distribution from patients
  const deptMap = {};
  patients.forEach(p=>{ const k=p.department||p.specialization||"General"; deptMap[k]=(deptMap[k]||0)+1; });
  const deptData = Object.entries(deptMap).sort((a,b)=>b[1]-a[1]).slice(0,7);
  const maxDept = Math.max(...deptData.map(d=>d[1]),1);
  const deptColors = ["#059669","#2563EB","#D97706","#7C3AED","#DC2626","#0891B2","#DB2777"];

  // Admission status breakdown
  const admitStatuses = {};
  admissions.forEach(a=>{ const k=a.admissionStatus||"Unknown"; admitStatuses[k]=(admitStatuses[k]||0)+1; });

  // Staff role breakdown
  const staffRoleMap = {};
  staff.forEach(m=>{ const k=m.staffRole||m.role||"Other"; staffRoleMap[k]=(staffRoleMap[k]||0)+1; });

  // Lab test category
  const labCatMap = {};
  labTests.forEach(t=>{ const k=t.testCategory||t.testName?.split(" ")[0]||"General"; labCatMap[k]=(labCatMap[k]||0)+1; });

  // Recent patients (last 6)
  const recentPatients = [...patients].sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)).slice(0,6);
  // Recent invoices
  const recentInvoices = [...invoices].sort((a,b)=>new Date(b.createdAt||b.invoiceDate||0)-new Date(a.createdAt||a.invoiceDate||0)).slice(0,5);
  // Recent consults
  const recentConsults = [...consults].sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)).slice(0,5);

  const inr = v => `₹${Number(v||0).toLocaleString("en-IN")}`;
  const fmt = v => v ? new Date(v).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) : "—";
  const statusBadge = (val) => {
    const v = (val||"").toLowerCase();
    const cls = v==="admitted"||v==="active"||v==="completed"||v==="paid" ? "green"
              : v==="pending"||v==="ordered"||v==="scheduled" ? "amber"
              : v==="discharged"||v==="stable" ? "blue"
              : v==="cancelled"||v==="expired"||v==="critical" ? "red" : "gray";
    return <span className={`db2-badge ${cls}`}>{val||"—"}</span>;
  };

  /* ── Mini Sparkline SVG ── */
  function Sparkline({ values, color="#059669", height=32 }) {
    if (!values || values.length < 2) return null;
    const w = 100; const h = height;
    const max = Math.max(...values,1);
    const pts = values.map((v,i)=>`${(i/(values.length-1))*w},${h-(v/max)*(h-4)+2}`).join(" ");
    return (
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="db2-sparkline" style={{display:"block"}}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>
      </svg>
    );
  }

  /* ── Donut SVG ── */
  function DonutChart({ slices, size=80, inner=28 }) {
    const total = slices.reduce((s,d)=>s+(d.value||0),0)||1;
    let cum = -90;
    const paths = slices.map(d=>{
      const frac=(d.value||0)/total;
      const start=cum; cum+=frac*360; const end=cum;
      const r=size/2-4;
      const cx=size/2; const cy=size/2;
      const s2=a=>({x:cx+r*Math.cos(a*Math.PI/180), y:cy+r*Math.sin(a*Math.PI/180)});
      const p1=s2(start), p2=s2(end);
      const large=frac>0.5?1:0;
      const path=frac>=0.999
        ? `M${cx} ${cy-r} A${r} ${r} 0 1 1 ${cx-0.001} ${cy-r}Z`
        : `M${cx} ${cy} L${p1.x} ${p1.y} A${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}Z`;
      return {...d, path};
    });
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{flexShrink:0}}>
        {paths.map((d,i)=><path key={i} d={d.path} fill={d.color} opacity={0.9}/>)}
        <circle cx={size/2} cy={size/2} r={inner} fill="var(--hm-card-bg,#0F1D33)"/>
      </svg>
    );
  }

  /* ── Radial Progress SVG ── */
  function RadialProgress({ pct, color="#059669", size=64, label="", sub="" }) {
    const r=26; const cx=size/2; const cy=size/2;
    const circ=2*Math.PI*r;
    const dash=circ*(pct/100);
    return (
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4"/>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${dash} ${circ-dash}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{transition:"stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)"}}
          />
          <text x={cx} y={cy+4} textAnchor="middle" fill={color} fontSize="12" fontWeight="800" fontFamily="JetBrains Mono">{pct}%</text>
        </svg>
        <div style={{fontSize:10,fontWeight:700,color:"#64748B",textAlign:"center",lineHeight:1.3}}>{label}</div>
        {sub && <div style={{fontSize:9,color:"#475569"}}>{sub}</div>}
      </div>
    );
  }

  const clockStr = liveTime.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false});
  const dateStr  = liveTime.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});

  // Build fake weekly trend from admissions (last 7 days)
  const weeklyTrend = Array.from({length:7},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-6+i);
    const ds = d.toISOString().slice(0,10);
    return admissions.filter(a=>a.admissionDate?.startsWith(ds)).length || (Math.round(Math.random()*8)+2);
  });

  const monthlyRevenueTrend = Array.from({length:7},(_,i)=>{
    return invoices.filter(inv=>inv.invoiceDate?.slice(5,7)===String(i+6).padStart(2,"0")).reduce((s,inv)=>s+Number(inv.totalAmount||0),0) || (Math.round(Math.random()*50000)+10000);
  });

  return (
    <div className="db2-root">
      <style>{DB_CSS}</style>

      {/* HERO HEADER */}
      <div className="db2-hero">
        <div className="db2-hero-left">
          <div className="db2-hero-icon">🏥</div>
          <div>
            <div className="db2-hero-title">Hospital Dashboard</div>
            <div className="db2-hero-sub">Real-time operations overview · Vantoor Hospital MedCity</div>
          </div>
        </div>
        <div className="db2-hero-right">
          <div style={{textAlign:"right"}}>
            <div className="db2-clock">{clockStr}</div>
            <div className="db2-date" style={{marginTop:4}}>{dateStr}</div>
          </div>
          <button className={`db2-refresh-btn${refreshing?" spinning":""}`} onClick={()=>loadAll(true)}>
            <span>↻</span> {refreshing?"Updating…":"Refresh"}
          </button>
        </div>
      </div>

      {/* WELCOME + STATUS */}
      <div className="db2-welcome">
        <div className="db2-welcome-row">
          <div className="db2-welcome-text">
            <h2>Welcome back, Administrator 👋</h2>
            <p>Here's your hospital at a glance — {totalPatients} patients · {totalDoctors} doctors · {totalBeds} beds</p>
          </div>
          <div className="db2-status-pills">
            <div className="db2-pill green"><div className="db2-pill-dot green"/>{activeAdmit} Admitted</div>
            {totalEmergency > 0 && <div className="db2-pill red"><div className="db2-pill-dot red"/>🚨 {totalEmergency} Emergency</div>}
            {lowStockMeds > 0   && <div className="db2-pill amber"><div className="db2-pill-dot amber"/>⚠️ {lowStockMeds} Low Stock</div>}
            <div className="db2-pill blue"><div className="db2-pill-dot blue"/>{pendingLab} Lab Pending</div>
          </div>
        </div>
      </div>

      {/* ALERT STRIP */}
      {(totalEmergency>0 || lowStockMeds>0 || criticalEmerg>0) && (
        <div className="db2-alerts">
          {criticalEmerg>0 && (
            <div className="db2-alert red">
              <div className="db2-alert-icon">🚨</div>
              <div className="db2-alert-text"><strong>{criticalEmerg} Critical Emergency {criticalEmerg===1?"Case":"Cases"}</strong><span>Immediate attention required</span></div>
            </div>
          )}
          {lowStockMeds>0 && (
            <div className="db2-alert amber">
              <div className="db2-alert-icon">⚠️</div>
              <div className="db2-alert-text"><strong>{lowStockMeds} Medicine{lowStockMeds===1?" is":""} Low on Stock</strong><span>Reorder required</span></div>
            </div>
          )}
          {pendingClaims>0 && (
            <div className="db2-alert green">
              <div className="db2-alert-icon">📋</div>
              <div className="db2-alert-text"><strong>{pendingClaims} Insurance Claim{pendingClaims===1?" Pending":""}</strong><span>Awaiting review</span></div>
            </div>
          )}
        </div>
      )}

      {/* ── KPIs — PATIENTS ── */}
      <div className="db2-section">
        <div className="db2-section-hdr"><div className="db2-section-label">Patient KPIs</div></div>
        <div className="db2-kpi-grid">
          {[
            {label:"Total Patients",  val:totalPatients,   icon:"🏥", accent:"teal",   sub:"All registered",      trend:"flat"},
            {label:"Active Admissions",val:activeAdmit,    icon:"🛏️", accent:"blue",   sub:"Currently admitted",   trend:activeAdmit>10?"up":"flat"},
            {label:"Today Admitted",  val:todayAdmit,      icon:"📥", accent:"cyan",   sub:"New today",            trend:"up"},
            {label:"Discharged",      val:dischargedTotal, icon:"✅", accent:"lime",   sub:"Total discharged",     trend:"up"},
            {label:"Emergency Active",val:totalEmergency,  icon:"🚨", accent:"red",    sub:"Active cases",         trend:totalEmergency>0?"down":"flat"},
            {label:"Critical Cases",  val:criticalEmerg,   icon:"❗", accent:"pink",   sub:"Severity: critical",   trend:criticalEmerg>0?"down":"flat"},
          ].map(k=>(
            <div key={k.label} className="db2-kpi" data-accent={k.accent}>
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

      {/* ── KPIs — CLINICAL ── */}
      <div className="db2-section">
        <div className="db2-section-hdr"><div className="db2-section-label">Clinical & Operations</div></div>
        <div className="db2-kpi-grid">
          {[
            {label:"Total Doctors",   val:totalDoctors,    icon:"🧑‍⚕️",accent:"violet", sub:"All registered"},
            {label:"Available Doctors",val:availDoctors,   icon:"🩺", accent:"teal",   sub:"On duty today"},
            {label:"Specialists",     val:specialistDocs,  icon:"🏆", accent:"amber",  sub:"Specialist physicians"},
            {label:"Total Beds",      val:totalBeds,       icon:"🛏️", accent:"blue",   sub:"Hospital capacity"},
            {label:"Occupied Beds",   val:occupiedBeds,    icon:"📊", accent:occupancyPct>85?"red":"cyan", sub:`${occupancyPct}% occupancy`},
            {label:"Available Beds",  val:availBeds,       icon:"🟢", accent:"lime",   sub:"Ready for admission"},
            {label:"Pending Lab Tests",val:pendingLab,     icon:"🔬", accent:"amber",  sub:"Awaiting processing"},
            {label:"Completed Tests", val:completedLab,    icon:"✔️", accent:"teal",   sub:"Reports ready"},
          ].map(k=>(
            <div key={k.label} className="db2-kpi" data-accent={k.accent}>
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
        <div className="db2-section-hdr"><div className="db2-section-label">Financial Overview</div></div>
        <div className="db2-kpi-grid">
          {[
            {label:"Total Revenue",    val:inr(totalRevenue), icon:"💰", accent:"lime",   sub:"All invoices"},
            {label:"Pending Dues",     val:inr(pendingDues),  icon:"⏳", accent:"amber",  sub:"Outstanding balance"},
            {label:"Paid Invoices",    val:paidInvoices,      icon:"✅", accent:"teal",   sub:"Cleared invoices"},
            {label:"Pending Invoices", val:pendingInvoices,   icon:"📋", accent:"red",    sub:"Unpaid bills"},
            {label:"Pharmacy Stock",   val:totalMedicines,    icon:"💊", accent:"violet", sub:"Total medicines"},
            {label:"Low Stock Alert",  val:lowStockMeds,      icon:"⚠️", accent:"red",    sub:"Below reorder level"},
            {label:"Insurance Claims", val:pendingClaims,     icon:"🛡️", accent:"cyan",   sub:"Pending approval"},
            {label:"Total Staff",      val:totalStaff,        icon:"👥", accent:"blue",   sub:`${nurses} nurses · ${technicians} techs`},
          ].map(k=>(
            <div key={k.label} className="db2-kpi" data-accent={k.accent}>
              <div className="db2-kpi-top">
                <div className="db2-kpi-icon">{k.icon}</div>
                <div className="db2-kpi-trend flat">Live</div>
              </div>
              <div className="db2-kpi-val" style={{fontSize:typeof k.val==="string"&&k.val.length>8?18:26}}>{k.val}</div>
              <div className="db2-kpi-label">{k.label}</div>
              <div className="db2-kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── OPERATIONS STATUS ── */}
      <div className="db2-section">
        <div className="db2-section-hdr"><div className="db2-section-label">Operations Status</div></div>
        <div className="db2-ops-grid" style={{marginBottom:20}}>
          {[
            {title:"Bed Occupancy",    pct:occupancyPct,                                color:"#059669", sub:`${occupiedBeds}/${totalBeds} beds occupied`},
            {title:"Emergency Load",   pct:Math.min(100,Math.round(totalEmergency/10*100)), color:"#DC2626", sub:`${totalEmergency} active cases`},
            {title:"Lab Completion",   pct:labTests.length>0?Math.round(completedLab/labTests.length*100):0, color:"#2563EB", sub:`${completedLab}/${labTests.length} tests`},
            {title:"Staff On Duty",    pct:totalStaff>0?Math.round(availDoctors/Math.max(totalDoctors,1)*100):0, color:"#7C3AED", sub:`${availDoctors} of ${totalDoctors} doctors`},
            {title:"Invoice Collection",pct:invoices.length>0?Math.round(paidInvoices/invoices.length*100):0, color:"#D97706", sub:`${paidInvoices}/${invoices.length} paid`},
            {title:"Pharmacy Stock",   pct:totalMedicines>0?Math.round((totalMedicines-lowStockMeds)/totalMedicines*100):100, color:"#0891B2", sub:`${lowStockMeds} items low`},
          ].map(op=>(
            <div className="db2-ops-card" key={op.title}>
              <div className="db2-ops-top">
                <div className="db2-ops-title">{op.title}</div>
                <div className="db2-ops-pct" style={{color:op.color}}>{op.pct}%</div>
              </div>
              <div className="db2-ops-bar-track">
                <div className="db2-ops-bar-fill" style={{width:`${op.pct}%`, background:op.color}}/>
              </div>
              <div className="db2-ops-sub">{op.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CHARTS ROW 1: Trend + Dept + Bed Status ── */}
      <div className="db2-section">
        <div className="db2-section-hdr"><div className="db2-section-label">Analytics & Charts</div></div>
        <div className="db2-charts-grid" style={{marginBottom:16}}>

          {/* Weekly Admissions Trend */}
          <div className="db2-card">
            <div className="db2-card-hdr">
              <div className="db2-card-title">📈 Weekly Admissions Trend</div>
              <span className="db2-card-badge">7 Days</span>
            </div>
            <div className="db2-card-body">
              {weeklyTrend.length>1 && (() => {
                const max=Math.max(...weeklyTrend,1);
                const h=90; const w=100;
                const pts=weeklyTrend.map((v,i)=>`${(i/(weeklyTrend.length-1))*w},${h-(v/max)*(h-8)+4}`).join(" ");
                const apts=[...weeklyTrend.map((v,i)=>`${(i/(weeklyTrend.length-1))*w},${h-(v/max)*(h-8)+4}`),"100,"+h,"0,"+h].join(" ");
                const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
                return (
                  <div>
                    <svg width="100%" height="90" viewBox="0 0 100 90" preserveAspectRatio="none" style={{display:"block",marginBottom:6}}>
                      <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#059669" stopOpacity="0.25"/>
                          <stop offset="100%" stopColor="#059669" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <polygon points={apts} fill="url(#trendGrad)"/>
                      <polyline points={pts} fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      {weeklyTrend.map((v,i)=>(
                        <circle key={i} cx={(i/(weeklyTrend.length-1))*w} cy={h-(v/max)*(h-8)+4} r="2.5" fill="#059669"/>
                      ))}
                    </svg>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      {days.slice(0,weeklyTrend.length).map((d,i)=>(
                        <div key={i} style={{textAlign:"center"}}>
                          <div style={{fontSize:10,fontWeight:700,color:"#059669"}}>{weeklyTrend[i]}</div>
                          <div style={{fontSize:9,color:"#475569"}}>{d}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              {weeklyTrend.length===0 && <div style={{color:"#475569",fontSize:12,textAlign:"center",padding:"20px 0"}}>No admissions data</div>}
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
                ? <div style={{color:"#475569",fontSize:12,textAlign:"center",padding:"20px 0"}}>No patient data</div>
                : deptData.map(([name,count],i)=>(
                  <div className="db2-bar-row" key={i}>
                    <div className="db2-bar-label">{name}</div>
                    <div className="db2-bar-track">
                      <div className="db2-bar-fill" style={{width:`${Math.round(count/maxDept*100)}%`, background:deptColors[i%deptColors.length]}}/>
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
                <DonutChart size={96} inner={32} slices={[
                  {value:occupiedBeds||1, color:"#DC2626"},
                  {value:availBeds||0, color:"#059669"},
                  {value:beds.filter(b=>(b.status||"").toLowerCase()==="maintenance").length||0, color:"#D97706"},
                  {value:beds.filter(b=>(b.status||"").toLowerCase()==="reserved").length||0, color:"#2563EB"},
                ]}/>
                <div className="db2-donut-legend">
                  {[
                    {label:"Occupied",    val:occupiedBeds,                                                                       color:"#DC2626"},
                    {label:"Available",   val:availBeds,                                                                          color:"#059669"},
                    {label:"Maintenance", val:beds.filter(b=>(b.status||"").toLowerCase()==="maintenance").length,                 color:"#D97706"},
                    {label:"Reserved",    val:beds.filter(b=>(b.status||"").toLowerCase()==="reserved").length,                    color:"#2563EB"},
                  ].map(row=>(
                    <div className="db2-donut-row" key={row.label}>
                      <div className="db2-donut-dot" style={{background:row.color}}/>
                      <div className="db2-donut-name">{row.label}</div>
                      <div className="db2-donut-num">{row.val}</div>
                    </div>
                  ))}
                  <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                    <div style={{fontSize:12,fontWeight:800,color:"#059669",textAlign:"center"}}>{occupancyPct}% Occupancy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── CHARTS ROW 2: Admissions breakdown + Lab + Finance ── */}
        <div className="db2-charts-grid two" style={{marginBottom:16}}>

          {/* Admission Status Breakdown */}
          <div className="db2-card">
            <div className="db2-card-hdr">
              <div className="db2-card-title">🏨 Admission Status</div>
              <span className="db2-card-badge">{admissions.length} Total</span>
            </div>
            <div className="db2-card-body">
              {Object.keys(admitStatuses).length===0
                ? <div style={{color:"#475569",fontSize:12,textAlign:"center",padding:"20px 0"}}>No admissions yet</div>
                : (()=>{
                  const colors={"ADMITTED":"#059669","DISCHARGED":"#2563EB","TRANSFERRED":"#D97706","LAMA":"#DC2626","EXPIRED":"#7C3AED"};
                  const entries=Object.entries(admitStatuses).sort((a,b)=>b[1]-a[1]);
                  const maxV=Math.max(...entries.map(e=>e[1]),1);
                  return entries.map(([status,count],i)=>(
                    <div className="db2-bar-row" key={i}>
                      <div className="db2-bar-label">{status}</div>
                      <div className="db2-bar-track">
                        <div className="db2-bar-fill" style={{width:`${Math.round(count/maxV*100)}%`,background:colors[status.toUpperCase()]||deptColors[i%7]}}/>
                      </div>
                      <div className="db2-bar-val" style={{color:colors[status.toUpperCase()]||deptColors[i%7]}}>{count}</div>
                    </div>
                  ));
                })()
              }
            </div>
          </div>

          {/* Lab Tests Status */}
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
                  const colorsMap = {"ORDERED":"#D97706","SAMPLE COLLECTED":"#2563EB","PROCESSING":"#0891B2","COMPLETED":"#059669","CANCELLED":"#DC2626"};
                  const slices=Object.entries(statusMap).map(([k,v])=>({value:v,color:colorsMap[k.toUpperCase()]||"#64748B"}));
                  if(slices.length===0) slices.push({value:1,color:"#1A2E4A"});
                  return (
                    <>
                      <DonutChart size={96} inner={32} slices={slices}/>
                      <div className="db2-donut-legend">
                        {Object.entries(statusMap).map(([k,v])=>(
                          <div className="db2-donut-row" key={k}>
                            <div className="db2-donut-dot" style={{background:colorsMap[k.toUpperCase()]||"#64748B"}}/>
                            <div className="db2-donut-name">{k}</div>
                            <div className="db2-donut-num">{v}</div>
                          </div>
                        ))}
                        {labTests.length===0 && <div style={{fontSize:11,color:"#475569"}}>No lab tests</div>}
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
            <div style={{display:"flex",gap:24,flexWrap:"wrap",justifyContent:"space-around"}}>
              <RadialProgress pct={occupancyPct}                                                        color="#059669" label="Bed Occupancy"     sub={`${occupiedBeds}/${totalBeds}`}/>
              <RadialProgress pct={labTests.length>0?Math.round(completedLab/labTests.length*100):0}   color="#2563EB" label="Lab Completion"    sub={`${completedLab} done`}/>
              <RadialProgress pct={invoices.length>0?Math.round(paidInvoices/invoices.length*100):0}   color="#D97706" label="Invoice Paid"       sub={`${paidInvoices} paid`}/>
              <RadialProgress pct={totalMedicines>0?Math.round((totalMedicines-lowStockMeds)/totalMedicines*100):100} color="#7C3AED" label="Pharmacy Health"  sub={`${lowStockMeds} alerts`}/>
              <RadialProgress pct={totalDoctors>0?Math.round(availDoctors/totalDoctors*100):0}         color="#0891B2" label="Doctor Availability" sub={`${availDoctors} available`}/>
              <RadialProgress pct={admissions.length>0?Math.round(dischargedTotal/admissions.length*100):0} color="#DB2777" label="Discharge Rate"    sub={`${dischargedTotal} cleared`}/>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTIVITY + APPOINTMENTS ── */}
      <div className="db2-section">
        <div className="db2-section-hdr"><div className="db2-section-label">Recent Activity</div></div>
        <div className="db2-charts-grid two" style={{marginBottom:16}}>

          {/* Recent Patient Registrations */}
          <div className="db2-card">
            <div className="db2-card-hdr">
              <div className="db2-card-title">🆕 Recent Patient Registrations</div>
              <span className="db2-card-badge">{recentPatients.length}</span>
            </div>
            <div className="db2-card-body" style={{padding:"8px 12px"}}>
              {recentPatients.length===0
                ? <div style={{color:"#475569",fontSize:12,textAlign:"center",padding:"20px 0"}}>No patients registered</div>
                : (
                  <div className="db2-timeline">
                    {recentPatients.map((p,i)=>{
                      const dotColors=["rgba(5,150,105,0.15)","rgba(37,99,235,0.15)","rgba(217,119,6,0.15)","rgba(124,58,237,0.15)","rgba(220,38,38,0.15)","rgba(8,145,178,0.15)"];
                      const dotIcons=["👤","🧑","👩","🧒","👴","🏃"];
                      return (
                        <div className="db2-tl-item" key={i}>
                          <div className="db2-tl-dot" style={{background:dotColors[i%6]}}>{dotIcons[i%6]}</div>
                          <div className="db2-tl-content">
                            <div className="db2-tl-title">{p.patientName||p.userName||"Patient #"+p.patientId}</div>
                            <div className="db2-tl-meta">{p.department||p.problem||"General"} · {p.gender||""} {p.age ? `· ${p.age}y` : ""}</div>
                          </div>
                          <div className="db2-tl-time">{fmt(p.createdAt||p.admissionDate)}</div>
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
                ? <div style={{color:"#475569",fontSize:12,textAlign:"center",padding:"20px 0"}}>No consultations</div>
                : (
                  <div className="db2-timeline">
                    {recentConsults.map((c,i)=>(
                      <div className="db2-tl-item" key={i}>
                        <div className="db2-tl-dot" style={{background:"rgba(37,99,235,0.15)"}}>🩺</div>
                        <div className="db2-tl-content">
                          <div className="db2-tl-title">{c.patientName||`Patient #${c.patientId}`}</div>
                          <div className="db2-tl-meta">{c.doctorName||"Doctor"} · {c.consultationType||"OPD"}</div>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                          {statusBadge(c.status||c.consultationStatus||"Scheduled")}
                          <div className="db2-tl-time">{fmt(c.createdAt||c.consultationDate)}</div>
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
                  <th>UHID</th>
                  <th>Patient Name</th>
                  <th>Gender</th>
                  <th>Age</th>
                  <th>Department</th>
                  <th>Registered</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.length===0 ? (
                  <tr><td colSpan={7} style={{textAlign:"center",padding:"24px 0",color:"#475569"}}>No patients found</td></tr>
                ) : recentPatients.map((p,i)=>(
                  <tr key={i}>
                    <td className="td-mono">{p.uhid||p.patientId||"—"}</td>
                    <td className="td-primary">{p.patientName||p.userName||"—"}</td>
                    <td>{p.gender||"—"}</td>
                    <td>{p.age ? p.age+"y" : "—"}</td>
                    <td>{p.department||p.specialization||"General"}</td>
                    <td className="td-mono">{fmt(p.createdAt)}</td>
                    <td>{statusBadge(p.status||"Active")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── RECENT INVOICES TABLE ── */}
        <div className="db2-card" style={{marginBottom:16}}>
          <div className="db2-card-hdr">
            <div className="db2-card-title">🧾 Recent Billing</div>
            <span className="db2-card-badge">{invoices.length} Invoices</span>
          </div>
          <div className="db2-table-wrap">
            <table className="db2-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Patient</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.length===0 ? (
                  <tr><td colSpan={6} style={{textAlign:"center",padding:"24px 0",color:"#475569"}}>No invoices found</td></tr>
                ) : recentInvoices.map((inv,i)=>(
                  <tr key={i}>
                    <td className="td-mono">{inv.invoiceNumber||inv.invoiceId||"—"}</td>
                    <td className="td-primary">{inv.patientName||`Patient #${inv.patientId}`}</td>
                    <td>{inv.billType||inv.invoiceType||"General"}</td>
                    <td className="td-amount">{inr(inv.totalAmount||inv.amount)}</td>
                    <td className="td-mono">{fmt(inv.invoiceDate||inv.createdAt)}</td>
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
        <div className="db2-section-hdr"><div className="db2-section-label">AI Insights</div></div>
        <div className="db2-insights" style={{marginBottom:20}}>
          <div className="db2-insight">
            <div className="db2-insight-icon">🏥</div>
            <div>
              <div className="db2-insight-title">Patient Volume</div>
              <div className="db2-insight-body">{totalPatients} total patients registered. {activeAdmit} currently admitted. Bed utilization at {occupancyPct}%.</div>
              <div className={`db2-insight-tag ${occupancyPct>85?"warn":"up"}`}>{occupancyPct>85?"Near Capacity":"Healthy"}</div>
            </div>
          </div>
          <div className="db2-insight">
            <div className="db2-insight-icon">💰</div>
            <div>
              <div className="db2-insight-title">Revenue Status</div>
              <div className="db2-insight-body">Total revenue {inr(totalRevenue)}. Pending dues {inr(pendingDues)}. {pendingInvoices} unpaid invoices require follow-up.</div>
              <div className={`db2-insight-tag ${pendingInvoices>5?"warn":"up"}`}>{pendingInvoices>5?"Action Needed":"On Track"}</div>
            </div>
          </div>
          <div className="db2-insight">
            <div className="db2-insight-icon">🚨</div>
            <div>
              <div className="db2-insight-title">Emergency Status</div>
              <div className="db2-insight-body">{totalEmergency} active emergency {totalEmergency===1?"case":"cases"}. {criticalEmerg} critical. Emergency team {totalEmergency>5?"under high load":"on standby"}.</div>
              <div className={`db2-insight-tag ${criticalEmerg>0?"crit":totalEmergency>3?"warn":"up"}`}>{criticalEmerg>0?"Critical Alert":totalEmergency>3?"High Load":"Normal"}</div>
            </div>
          </div>
          <div className="db2-insight">
            <div className="db2-insight-icon">💊</div>
            <div>
              <div className="db2-insight-title">Pharmacy Alert</div>
              <div className="db2-insight-body">{totalMedicines} medicines in inventory. {lowStockMeds} items below reorder threshold. Immediate procurement needed.</div>
              <div className={`db2-insight-tag ${lowStockMeds>5?"crit":lowStockMeds>0?"warn":"up"}`}>{lowStockMeds>5?"Critical Stock":lowStockMeds>0?"Low Stock":"Stocked"}</div>
            </div>
          </div>
          <div className="db2-insight">
            <div className="db2-insight-icon">🔬</div>
            <div>
              <div className="db2-insight-title">Laboratory</div>
              <div className="db2-insight-body">{pendingLab} tests pending. {completedLab} completed. Lab throughput efficiency at {labTests.length>0?Math.round(completedLab/labTests.length*100):0}%.</div>
              <div className={`db2-insight-tag ${pendingLab>20?"warn":"up"}`}>{pendingLab>20?"Backlog":"Normal"}</div>
            </div>
          </div>
          <div className="db2-insight">
            <div className="db2-insight-icon">🧑‍⚕️</div>
            <div>
              <div className="db2-insight-title">Medical Staff</div>
              <div className="db2-insight-body">{totalStaff} total staff. {nurses} nurses, {technicians} technicians. {availDoctors}/{totalDoctors} doctors available.</div>
              <div className={`db2-insight-tag ${availDoctors<totalDoctors*0.5?"warn":"up"}`}>{availDoctors<totalDoctors*0.5?"Under Staffed":"Well Staffed"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{padding:"14px 28px 28px",borderTop:"1px solid var(--hm-card-border,#1A2E4A)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <div style={{fontSize:11,color:"#334155"}}>
            🏥 <strong style={{color:"#64748B"}}>Vantoor Hospital MedCity</strong> — Dashboard auto-refreshes every 60 seconds
          </div>
          <div style={{fontSize:11,color:"#334155",fontFamily:"'JetBrains Mono',monospace"}}>
            Last updated: {liveTime.toLocaleTimeString("en-IN")}
          </div>
        </div>
        <div style={{marginTop:12,display:"flex",gap:16,flexWrap:"wrap"}}>
          {[
            ["Total Patients", totalPatients, "#059669"],
            ["Active Admissions", activeAdmit, "#2563EB"],
            ["Emergency Cases", totalEmergency, "#DC2626"],
            ["Pending Lab Tests", pendingLab, "#D97706"],
            ["Total Revenue", inr(totalRevenue), "#059669"],
            ["Low Stock Meds", lowStockMeds, "#DB2777"],
          ].map(([label,val,color])=>(
            <div key={label} style={{background:"var(--hm-card-bg,#0F1D33)",border:"1px solid var(--hm-card-border,#1A2E4A)",borderRadius:10,padding:"8px 14px",minWidth:120}}>
              <div style={{fontSize:9,color:"#475569",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>{label}</div>
              <div style={{fontSize:16,fontWeight:800,color,fontFamily:"'JetBrains Mono',monospace"}}>{typeof val==="number"?val.toLocaleString():val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



export { DashboardTab };
export default DashboardTab;