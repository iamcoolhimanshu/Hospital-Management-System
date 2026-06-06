import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";

const NAV_SEARCH = [
  { key: "dashboard",    icon: "📊", label: "Dashboard" },
  { key: "hospitals",    icon: "🏥", label: "Hospitals" },
  { key: "departments",  icon: "🏢", label: "Departments" },
  { key: "staff",        icon: "👥", label: "Staff" },
  { key: "doctors",      icon: "🧑‍⚕️", label: "Doctors" },
  { key: "patients",     icon: "🧑", label: "Patients" },
  { key: "wards",        icon: "🛏️", label: "Wards & Beds" },
  { key: "ipd",          icon: "🏨", label: "IPD Admissions" },
  { key: "opd",          icon: "🩺", label: "OPD / Consultation" },
  { key: "prescription", icon: "💊", label: "Prescriptions" },
  { key: "lab",          icon: "🔬", label: "Lab Tests" },
  { key: "pharmacy",     icon: "🧪", label: "Pharmacy" },
  { key: "emergency",    icon: "🚨", label: "Emergency" },
  { key: "ot",           icon: "🔪", label: "OT Schedule" },
  { key: "nursing",      icon: "💉", label: "Nursing Notes" },
  { key: "discharge",    icon: "📋", label: "Discharge Summary" },
  { key: "billing",      icon: "🧾", label: "Billing" },
  { key: "insurance",    icon: "🛡️", label: "Insurance" },
  { key: "advancepay",   icon: "💳", label: "Advance Payment" },
  { key: "relationship", icon: "🤝", label: "Relationships" },
  { key: "reports",      icon: "📈", label: "Reports" },
  { key: "admin",        icon: "⚙️", label: "Admin" },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  .topbar-root {
    position: fixed; top: 0; right: 0; z-index: 300;
    height: 52px;
    display: flex; align-items: center;
    background: var(--tb-bg);
    border-bottom: 1px solid var(--tb-border);
    padding: 0 16px 0 16px;
    font-family: 'DM Sans', sans-serif;
    box-shadow: 0 1px 8px rgba(0,0,0,0.08);
    transition: background 0.25s, border-color 0.25s;
  }

  /* sidebar spacer inside topbar */
  /* search */
  .topbar-search-wrap {
    flex: 1; max-width: 420px; margin-left: 16px; position: relative;
  }
  .topbar-search-icon {
    position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
    color: var(--tb-muted); pointer-events: none; font-size: 14px;
  }
  .topbar-search-input {
    width: 100%; height: 34px;
    background: var(--tb-input-bg);
    border: 1px solid var(--tb-border);
    border-radius: 9px;
    padding: 0 34px 0 32px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    color: var(--tb-text);
    outline: none;
    transition: all 0.15s;
  }
  .topbar-search-input::placeholder { color: var(--tb-muted); }
  .topbar-search-input:focus {
    border-color: #059669;
    box-shadow: 0 0 0 3px rgba(5,150,105,0.12);
    background: var(--tb-input-focus);
  }
  .topbar-search-kbd {
    position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
    font-size: 10px; color: var(--tb-muted); font-weight: 600;
    background: var(--tb-kbd-bg); border: 1px solid var(--tb-border);
    border-radius: 4px; padding: 1px 5px;
  }

  /* search results dropdown */
  .search-results {
    position: absolute; top: calc(100% + 6px); left: 0; right: 0;
    background: var(--tb-dropdown-bg);
    border: 1px solid var(--tb-border);
    border-radius: 12px;
    box-shadow: 0 8px 28px rgba(0,0,0,0.18);
    overflow: hidden; z-index: 1000;
    animation: srFade 0.12s ease;
  }
  @keyframes srFade { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
  .search-result-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 14px; cursor: pointer;
    font-size: 13px; font-weight: 600; color: var(--tb-text-secondary);
    transition: background 0.1s;
  }
  .search-result-item:hover, .search-result-item.active-result {
    background: var(--tb-hover); color: var(--tb-text);
  }
  .search-result-item .sr-icon { font-size: 16px; width: 22px; text-align: center; }
  .search-no-result {
    padding: 14px; text-align: center; font-size: 13px; color: var(--tb-muted);
  }

  /* right actions */
  .topbar-spacer { flex: 1; }
  .topbar-actions {
    display: flex; align-items: center; gap: 4px;
  }
  .tb-btn {
    width: 34px; height: 34px; border-radius: 9px;
    background: none; border: 1px solid transparent;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 16px; transition: all 0.15s; color: var(--tb-text-secondary);
    position: relative;
  }
  .tb-btn:hover { background: var(--tb-hover); border-color: var(--tb-border); color: var(--tb-text); }

  /* notification badge */
  .tb-notif-badge {
    position: absolute; top: 4px; right: 4px;
    width: 8px; height: 8px; border-radius: 50%;
    background: #EF4444; border: 1.5px solid var(--tb-bg);
  }

  /* divider */
  .tb-divider {
    width: 1px; height: 22px; background: var(--tb-border); margin: 0 4px;
  }

  /* profile pill */
  .tb-profile-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 4px 10px 4px 4px;
    border-radius: 10px; cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.15s; background: none;
  }
  .tb-profile-btn:hover { background: var(--tb-hover); border-color: var(--tb-border); }
  .tb-avatar {
    width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
    background: linear-gradient(135deg,#7C3AED,#4F46E5);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 800; color: #fff;
  }
  .tb-profile-info { text-align: left; }
  .tb-profile-name { font-size: 12px; font-weight: 700; color: var(--tb-text); line-height: 1.2; }
  .tb-profile-role { font-size: 10px; color: var(--tb-muted); font-weight: 500; }
  .tb-chevron { font-size: 10px; color: var(--tb-muted); }

  /* profile dropdown */
  .tb-profile-dropdown {
    position: absolute; top: calc(100% + 6px); right: 0;
    min-width: 240px;
    background: var(--tb-dropdown-bg);
    border: 1px solid var(--tb-border);
    border-radius: 14px;
    box-shadow: 0 12px 36px rgba(0,0,0,0.22);
    z-index: 999; overflow: hidden;
    animation: srFade 0.15s ease;
  }
  .tb-pd-header {
    padding: 14px 16px 12px;
    background: linear-gradient(135deg, #312e81, #4338ca);
    display: flex; align-items: center; gap: 12px;
  }
  .tb-pd-avatar {
    width: 42px; height: 42px; border-radius: 12px;
    background: rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 800; color: #fff;
    border: 1.5px solid rgba(255,255,255,0.3);
    flex-shrink: 0;
  }
  .tb-pd-name   { font-size: 14px; font-weight: 800; color: #fff; }
  .tb-pd-email  { font-size: 11px; color: rgba(255,255,255,0.65); margin-top: 2px; }
  .tb-pd-badges { display: flex; gap: 6px; margin-top: 6px; }
  .tb-pd-badge  {
    font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px;
    background: rgba(255,255,255,0.18); color: #fff; border: 1px solid rgba(255,255,255,0.25);
  }
  .tb-pd-badge.role { background: rgba(251,191,36,0.3); color: #FDE68A; border-color: rgba(251,191,36,0.4); }
  .tb-pd-badge.status { background: rgba(52,211,153,0.3); color: #6EE7B7; border-color: rgba(52,211,153,0.4); }
  .tb-pd-meta {
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0;
    border-bottom: 1px solid var(--tb-border);
  }
  .tb-pd-meta-item {
    padding: 10px 14px; text-align: center;
    border-right: 1px solid var(--tb-border);
  }
  .tb-pd-meta-item:last-child { border-right: none; }
  .tb-pd-meta-label { font-size: 9px; font-weight: 700; color: var(--tb-muted); text-transform: uppercase; letter-spacing: 0.06em; }
  .tb-pd-meta-val   { font-size: 13px; font-weight: 800; color: var(--tb-text); margin-top: 2px; }
  .tb-pd-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; cursor: pointer;
    font-size: 13px; font-weight: 600; color: var(--tb-text-secondary);
    transition: background 0.12s, color 0.12s;
  }
  .tb-pd-item:hover { background: var(--tb-hover); color: var(--tb-text); }
  .tb-pd-item.danger { color: #F87171; }
  .tb-pd-item.danger:hover { background: rgba(239,68,68,0.1); color: #EF4444; }
  .tb-pd-item-icon { font-size: 16px; width: 24px; text-align: center; flex-shrink: 0; }
  .tb-pd-item-info { flex: 1; }
  .tb-pd-item-title { font-size: 13px; font-weight: 600; }
  .tb-pd-item-sub   { font-size: 11px; color: var(--tb-muted); font-weight: 400; margin-top: 1px; }
  .tb-pd-sep { height: 1px; background: var(--tb-border); margin: 2px 0; }

  /* ── My Profile Modal ── */
  .profile-modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.55);
    z-index: 2000; display: flex; align-items: center; justify-content: center;
    animation: overlayIn 0.18s ease;
  }
  @keyframes overlayIn { from{opacity:0} to{opacity:1} }
  .profile-modal {
    width: 860px; max-width: 95vw; max-height: 90vh;
    background: var(--tb-modal-bg);
    border-radius: 18px; overflow: hidden;
    display: flex; flex-direction: column;
    box-shadow: 0 24px 80px rgba(0,0,0,0.4);
    animation: modalPop 0.2s ease;
    font-family: 'DM Sans', sans-serif;
  }
  @keyframes modalPop { from{opacity:0;transform:scale(0.95) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }

  .pm-header {
    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%);
    padding: 24px 28px 0;
    flex-shrink: 0;
  }
  .pm-header-top {
    display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 18px;
  }
  .pm-header-left { display: flex; align-items: center; gap: 18px; }
  .pm-avatar-wrap { position: relative; }
  .pm-avatar {
    width: 72px; height: 72px; border-radius: 18px;
    background: linear-gradient(135deg,#7C3AED,#4F46E5);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; font-weight: 800; color: #fff;
    border: 3px solid rgba(255,255,255,0.25);
    box-shadow: 0 8px 24px rgba(124,58,237,0.5);
  }
  .pm-avatar-dot {
    position: absolute; bottom: 3px; right: 3px;
    width: 14px; height: 14px; border-radius: 50%;
    background: #34D399; border: 2.5px solid #312e81;
  }
  .pm-name   { font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.3px; }
  .pm-meta   { display: flex; align-items: center; gap: 10px; margin-top: 6px; font-size: 12px; color: rgba(255,255,255,0.65); }
  .pm-meta-item { display: flex; align-items: center; gap: 5px; }
  .pm-badges { display: flex; gap: 7px; margin-top: 8px; }
  .pm-badge  {
    font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.25);
  }
  .pm-badge.admin  { background: rgba(251,191,36,0.25); color: #FDE68A; border-color: rgba(251,191,36,0.4); }
  .pm-badge.active { background: rgba(52,211,153,0.25); color: #6EE7B7; border-color: rgba(52,211,153,0.4); }
  .pm-close {
    background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
    border-radius: 10px; width: 34px; height: 34px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; color: rgba(255,255,255,0.7);
    transition: all 0.15s;
  }
  .pm-close:hover { background: rgba(255,255,255,0.22); color: #fff; }

  /* tabs */
  .pm-tabs {
    display: flex; gap: 0; margin-top: 4px;
  }
  .pm-tab {
    padding: 10px 18px; font-size: 13px; font-weight: 600;
    color: rgba(255,255,255,0.55); cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.15s; white-space: nowrap;
  }
  .pm-tab:hover { color: rgba(255,255,255,0.85); }
  .pm-tab.active { color: #fff; border-bottom-color: #fff; }

  /* body */
  .pm-body {
    flex: 1; overflow-y: auto; padding: 24px 28px;
    background: var(--tb-modal-body);
  }

  .pm-section {
    background: var(--tb-modal-section);
    border: 1px solid var(--tb-border);
    border-radius: 14px; margin-bottom: 20px; overflow: hidden;
  }
  .pm-section-hdr {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 18px; border-bottom: 1px solid var(--tb-border);
  }
  .pm-section-hdr-left { display: flex; align-items: center; gap: 10px; }
  .pm-section-num {
    width: 26px; height: 26px; border-radius: 8px;
    background: linear-gradient(135deg,#4338ca,#7C3AED);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 800; color: #fff;
  }
  .pm-section-icon {
    width: 26px; height: 26px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center; font-size: 14px;
  }
  .pm-section-title { font-size: 13px; font-weight: 800; color: var(--tb-text); text-transform: uppercase; letter-spacing: 0.06em; }
  .pm-edit-btn {
    display: flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 8px;
    background: var(--tb-hover); border: 1px solid var(--tb-border);
    color: #4338ca; font-size: 12px; font-weight: 700; cursor: pointer;
    transition: all 0.15s;
  }
  .pm-edit-btn:hover { background: rgba(67,56,202,0.12); border-color: #4338ca; }

  .pm-fields {
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1px;
    background: var(--tb-border);
  }
  .pm-field {
    padding: 14px 18px;
    background: var(--tb-modal-section);
  }
  .pm-field-label { font-size: 10px; font-weight: 700; color: var(--tb-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 5px; }
  .pm-field-value { font-size: 14px; font-weight: 600; color: var(--tb-text); }
  .pm-field-empty { color: var(--tb-muted); font-weight: 400; }

  /* ── Edit input ── */
  .pm-input {
    width: 100%; padding: 7px 10px;
    background: var(--tb-input-bg);
    border: 1.5px solid var(--tb-border);
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    color: var(--tb-text);
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
  }
  .pm-input:focus {
    border-color: #4338ca;
    box-shadow: 0 0 0 3px rgba(67,56,202,0.12);
    background: var(--tb-input-focus);
  }
  .pm-input::placeholder { color: var(--tb-muted); }

  /* Save / Cancel btns */
  .pm-save-btn {
    color: #059669 !important;
    border-color: rgba(5,150,105,0.3) !important;
  }
  .pm-save-btn:hover { background: rgba(5,150,105,0.1) !important; border-color: #059669 !important; }
  .pm-cancel-btn {
    color: #EF4444 !important;
    border-color: rgba(239,68,68,0.3) !important;
  }
  .pm-cancel-btn:hover { background: rgba(239,68,68,0.1) !important; border-color: #EF4444 !important; }

  /* ── Notification dropdown ── */
  .tb-notif-dropdown {
    position: absolute; top: calc(100% + 6px); right: 0;
    width: 320px;
    background: var(--tb-dropdown-bg);
    border: 1px solid var(--tb-border);
    border-radius: 14px;
    box-shadow: 0 12px 36px rgba(0,0,0,0.22);
    z-index: 999; overflow: hidden;
    animation: srFade 0.15s ease;
  }
  .tb-notif-hdr {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 14px 10px;
    border-bottom: 1px solid var(--tb-border);
  }
  .tb-notif-hdr-title { font-size: 13px; font-weight: 800; color: var(--tb-text); }
  .tb-notif-count {
    font-size: 10px; font-weight: 700; padding: 2px 7px;
    background: rgba(5,150,105,0.12); color: #34D399;
    border: 1px solid rgba(5,150,105,0.2); border-radius: 10px;
  }
  .tb-notif-list { max-height: 340px; overflow-y: auto; }
  .tb-notif-empty { padding: 24px; text-align: center; font-size: 13px; color: var(--tb-muted); }
  .tb-notif-item {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--tb-border);
    cursor: pointer; transition: background 0.1s;
  }
  .tb-notif-item:last-child { border-bottom: none; }
  .tb-notif-item:hover { background: var(--tb-hover); }
  .tb-notif-item-icon {
    width: 30px; height: 30px; border-radius: 8px;
    background: rgba(5,150,105,0.1);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; flex-shrink: 0;
  }
  .tb-notif-item-title { font-size: 12px; font-weight: 700; color: var(--tb-text); }
  .tb-notif-item-sub   { font-size: 11px; color: var(--tb-muted); margin-top: 2px; line-height: 1.4; }
  .tb-notif-item-time  { font-size: 10px; color: var(--tb-muted); margin-top: 3px; opacity: 0.7; }
  .tb-notif-footer {
    padding: 9px 14px; text-align: center;
    font-size: 12px; font-weight: 700; color: #059669;
    border-top: 1px solid var(--tb-border);
    cursor: pointer; transition: background 0.1s;
  }
  .tb-notif-footer:hover { background: var(--tb-hover); }

  /* ── Theme vars ── */
  [data-theme="dark"] {
    --tb-bg:           #080F1E;
    --tb-border:       #1A2E4A;
    --tb-text:         #E2E8F0;
    --tb-text-secondary: #94A3B8;
    --tb-muted:        #475569;
    --tb-hover:        #111C30;
    --tb-input-bg:     #0F1D33;
    --tb-input-focus:  #0F1D33;
    --tb-kbd-bg:       #111C30;
    --tb-dropdown-bg:  #0F1D33;
    --tb-modal-bg:     #0A1628;
    --tb-modal-body:   #080F1E;
    --tb-modal-section:#0F1D33;
  }
  [data-theme="light"] {
    --tb-bg:           #FFFFFF;
    --tb-border:       #E2E8F0;
    --tb-text:         #0F172A;
    --tb-text-secondary: #475569;
    --tb-muted:        #94A3B8;
    --tb-hover:        #F1F5F9;
    --tb-input-bg:     #F8FAFC;
    --tb-input-focus:  #FFFFFF;
    --tb-kbd-bg:       #F1F5F9;
    --tb-dropdown-bg:  #FFFFFF;
    --tb-modal-bg:     #F8FAFC;
    --tb-modal-body:   #F0F4FA;
    --tb-modal-section:#FFFFFF;
  }
`;

// ── My Profile Modal ─────────────────────────────────────────────
function ProfileModal({ user, onClose }) {
  const username  = user?.username || "User";
  const rawRole   = Array.isArray(user?.roles) ? user.roles[0] : user?.roles;
  const roleLabel = rawRole?.replace("ROLE_", "").replace(/_/g, " ") || "Staff";
  const initials  = username.slice(0, 2).toUpperCase();

  // Edit states
  const [editUser, setEditUser] = React.useState(false);
  const [editAddr, setEditAddr] = React.useState(false);

  // User info fields
  const [uInfo, setUInfo] = React.useState({
    username, role: roleLabel,
    email: username.toLowerCase() + "@hospital.com",
    title: "", mobile: "", dob: "",
  });
  const [uDraft, setUDraft] = React.useState({ ...uInfo });

  // Address fields
  const [addr, setAddr] = React.useState({ street:"", city:"", state:"", zip:"", country:"", region:"" });
  const [addrDraft, setAddrDraft] = React.useState({ ...addr });

  const startEditUser = () => { setUDraft({ ...uInfo }); setEditUser(true); };
  const saveUser  = () => { setUInfo({ ...uDraft }); setEditUser(false); };
  const cancelUser = () => setEditUser(false);

  const startEditAddr = () => { setAddrDraft({ ...addr }); setEditAddr(true); };
  const saveAddr  = () => { setAddr({ ...addrDraft }); setEditAddr(false); };
  const cancelAddr = () => setEditAddr(false);

  const val = (v) => v || <span className="pm-field-empty">—</span>;

  return (
    <div className="profile-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="profile-modal">
        {/* Header */}
        <div className="pm-header">
          <div className="pm-header-top">
            <div className="pm-header-left">
              <div className="pm-avatar-wrap">
                <div className="pm-avatar">{initials}</div>
                <div className="pm-avatar-dot" />
              </div>
              <div>
                <div className="pm-name">{username}</div>
                <div className="pm-meta">
                  <span className="pm-meta-item">🏥 Hospital Suite</span>
                  <span>·</span>
                  <span className="pm-meta-item">✉️ {uInfo.email}</span>
                </div>
                <div className="pm-badges">
                  <span className="pm-badge admin">{roleLabel}</span>
                  <span className="pm-badge active">● Active</span>
                </div>
              </div>
            </div>
            <button className="pm-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Body — Personal Settings only */}
        <div className="pm-body">

          {/* ── Section 1: User Information ── */}
          <div className="pm-section">
            <div className="pm-section-hdr">
              <div className="pm-section-hdr-left">
                <div className="pm-section-num">1</div>
                <div className="pm-section-icon">👤</div>
                <div className="pm-section-title">User Information</div>
              </div>
              {!editUser
                ? <button className="pm-edit-btn" onClick={startEditUser}>✏️ Edit</button>
                : <div style={{display:"flex",gap:8}}>
                    <button className="pm-edit-btn pm-save-btn" onClick={saveUser}>✅ Save</button>
                    <button className="pm-edit-btn pm-cancel-btn" onClick={cancelUser}>✕ Cancel</button>
                  </div>
              }
            </div>

            {!editUser ? (
              <div className="pm-fields">
                <div className="pm-field"><div className="pm-field-label">Username</div><div className="pm-field-value">{val(uInfo.username)}</div></div>
                <div className="pm-field"><div className="pm-field-label">Role</div><div className="pm-field-value">{val(uInfo.role)}</div></div>
                <div className="pm-field"><div className="pm-field-label">Email</div><div className="pm-field-value">{val(uInfo.email)}</div></div>
                <div className="pm-field"><div className="pm-field-label">Title</div><div className="pm-field-value">{val(uInfo.title)}</div></div>
                <div className="pm-field"><div className="pm-field-label">Mobile</div><div className="pm-field-value">{val(uInfo.mobile)}</div></div>
                <div className="pm-field"><div className="pm-field-label">Date of Birth</div><div className="pm-field-value">{val(uInfo.dob)}</div></div>
              </div>
            ) : (
              <div className="pm-fields">
                <div className="pm-field">
                  <div className="pm-field-label">Username</div>
                  <input className="pm-input" value={uDraft.username} onChange={e=>setUDraft(d=>({...d,username:e.target.value}))} />
                </div>
                <div className="pm-field">
                  <div className="pm-field-label">Role</div>
                  <input className="pm-input" value={uDraft.role} readOnly style={{opacity:0.6,cursor:"not-allowed"}} />
                </div>
                <div className="pm-field">
                  <div className="pm-field-label">Email</div>
                  <input className="pm-input" type="email" value={uDraft.email} onChange={e=>setUDraft(d=>({...d,email:e.target.value}))} />
                </div>
                <div className="pm-field">
                  <div className="pm-field-label">Title</div>
                  <input className="pm-input" placeholder="e.g. Dr." value={uDraft.title} onChange={e=>setUDraft(d=>({...d,title:e.target.value}))} />
                </div>
                <div className="pm-field">
                  <div className="pm-field-label">Mobile</div>
                  <input className="pm-input" placeholder="+91 XXXXX XXXXX" value={uDraft.mobile} onChange={e=>setUDraft(d=>({...d,mobile:e.target.value}))} />
                </div>
                <div className="pm-field">
                  <div className="pm-field-label">Date of Birth</div>
                  <input className="pm-input" type="date" value={uDraft.dob} onChange={e=>setUDraft(d=>({...d,dob:e.target.value}))} />
                </div>
              </div>
            )}
          </div>

          {/* ── Section 2: Address Information ── */}
          <div className="pm-section">
            <div className="pm-section-hdr">
              <div className="pm-section-hdr-left">
                <div className="pm-section-num" style={{background:"linear-gradient(135deg,#7C3AED,#9333EA)"}}>2</div>
                <div className="pm-section-icon">📍</div>
                <div className="pm-section-title">Address Information</div>
              </div>
              {!editAddr
                ? <button className="pm-edit-btn" onClick={startEditAddr}>✏️ Edit</button>
                : <div style={{display:"flex",gap:8}}>
                    <button className="pm-edit-btn pm-save-btn" onClick={saveAddr}>✅ Save</button>
                    <button className="pm-edit-btn pm-cancel-btn" onClick={cancelAddr}>✕ Cancel</button>
                  </div>
              }
            </div>

            {!editAddr ? (
              <div className="pm-fields">
                {[["Street",addr.street],["City",addr.city],["State",addr.state],["Zip Code",addr.zip],["Country",addr.country],["Region",addr.region]].map(([label,v])=>(
                  <div key={label} className="pm-field">
                    <div className="pm-field-label">{label}</div>
                    <div className="pm-field-value">{val(v)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pm-fields">
                <div className="pm-field"><div className="pm-field-label">Street</div><input className="pm-input" placeholder="123 Main St" value={addrDraft.street} onChange={e=>setAddrDraft(d=>({...d,street:e.target.value}))} /></div>
                <div className="pm-field"><div className="pm-field-label">City</div><input className="pm-input" placeholder="City" value={addrDraft.city} onChange={e=>setAddrDraft(d=>({...d,city:e.target.value}))} /></div>
                <div className="pm-field"><div className="pm-field-label">State</div><input className="pm-input" placeholder="State" value={addrDraft.state} onChange={e=>setAddrDraft(d=>({...d,state:e.target.value}))} /></div>
                <div className="pm-field"><div className="pm-field-label">Zip Code</div><input className="pm-input" placeholder="000000" value={addrDraft.zip} onChange={e=>setAddrDraft(d=>({...d,zip:e.target.value}))} /></div>
                <div className="pm-field"><div className="pm-field-label">Country</div><input className="pm-input" placeholder="Country" value={addrDraft.country} onChange={e=>setAddrDraft(d=>({...d,country:e.target.value}))} /></div>
                <div className="pm-field"><div className="pm-field-label">Region</div><input className="pm-input" placeholder="Region" value={addrDraft.region} onChange={e=>setAddrDraft(d=>({...d,region:e.target.value}))} /></div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Main Topbar ──────────────────────────────────────────────────
export default function Topbar({ sidebarWidth = 240 }) {
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [search, setSearch]       = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [activeResult, setActiveResult] = useState(0);
  const [profileOpen, setProfileOpen]   = useState(false);
  const [showProfile, setShowProfile]   = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liveTime, setLiveTime]         = useState(new Date());
  const [notifOpen, setNotifOpen]       = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  const searchRef   = useRef(null);
  const profileRef  = useRef(null);
  const inputRef    = useRef(null);

  const username = user?.username || "User";
  const initials = username.slice(0, 2).toUpperCase();
  const rawRole  = Array.isArray(user?.roles) ? user.roles[0] : user?.roles;
  const roleLabel = rawRole?.replace("ROLE_", "").replace(/_/g, " ") || "Staff";
  const today    = new Date().toLocaleDateString("en-IN", { weekday:"short", day:"2-digit", month:"short", year:"numeric" });

  const results = search.trim().length > 0
    ? NAV_SEARCH.filter(n => n.label.toLowerCase().includes(search.toLowerCase()))
    : [];

  // Keyboard shortcut: Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setSearch(""); setSearchFocus(false); setProfileOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Arrow key navigation in search results
  const handleSearchKey = (e) => {
    if (e.key === "ArrowDown")  { e.preventDefault(); setActiveResult(r => Math.min(r+1, results.length-1)); }
    if (e.key === "ArrowUp")    { e.preventDefault(); setActiveResult(r => Math.max(r-1, 0)); }
    if (e.key === "Enter" && results.length > 0) {
      navigate(`/hospital/${results[activeResult].key}`);
      setSearch(""); setSearchFocus(false);
    }
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const h = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [profileOpen]);

  // Close search on outside click
  useEffect(() => {
    if (!searchFocus) return;
    const h = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocus(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [searchFocus]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  // Live clock tick
  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Close notification dropdown on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const h = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [notifOpen]);

  // Fetch notifications from audit logs
  useEffect(() => {
    import("../../api/api").then(mod => {
      const API = mod.default;
      API.get("/hospital/audit/logs").then(r => {
        const logs = (r.data || []).slice(0, 10);
        setNotifications(logs.map(l => ({
          id: l.logId || Math.random(),
          icon: l.action === "CREATE" ? "🆕" : l.action === "UPDATE" ? "✏️" : l.action === "DELETE" ? "🗑️" : "📋",
          title: l.module + " — " + l.action,
          body: l.description || l.details || "System event",
          time: l.actionTime,
          read: false,
        })));
      }).catch(() => {
        // fallback: show static welcome notification
        setNotifications([{ id:1, icon:"🏥", title:"Dashboard loaded", body:"Hospital system is online and running.", time: new Date().toISOString(), read:false }]);
      });
    });
  }, []);

  const doLogout = () => { logout(); navigate("/login"); };

  return (
    <>
      <style>{CSS}</style>

      <div className="topbar-root" style={{ left: sidebarWidth, right: 0, transition: "left 0.25s ease" }}>

        {/* Search */}
        <div className="topbar-search-wrap" ref={searchRef}>
          <span className="topbar-search-icon">🔍</span>
          <input
            ref={inputRef}
            className="topbar-search-input"
            placeholder="Search pages, modules..."
            value={search}
            onChange={e => { setSearch(e.target.value); setActiveResult(0); }}
            onFocus={() => setSearchFocus(true)}
            onKeyDown={handleSearchKey}
          />
          <span className="topbar-search-kbd">⌘K</span>

          {searchFocus && search.trim().length > 0 && (
            <div className="search-results">
              {results.length === 0
                ? <div className="search-no-result">No results for "{search}"</div>
                : results.map((r, i) => (
                  <div
                    key={r.key}
                    className={`search-result-item${i === activeResult ? " active-result" : ""}`}
                    onMouseEnter={() => setActiveResult(i)}
                    onClick={() => { navigate(`/hospital/${r.key}`); setSearch(""); setSearchFocus(false); }}
                  >
                    <span className="sr-icon">{r.icon}</span>
                    {r.label}
                  </div>
                ))
              }
            </div>
          )}
        </div>

        <div className="topbar-spacer" />

        {/* Live clock + date chip */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", marginRight: 10, lineHeight:1.3, flexShrink:0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--tb-text)", letterSpacing: "0.03em", fontFamily: "'DM Mono',monospace" }}>
            {liveTime.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false})}
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, color: "var(--tb-muted)", whiteSpace: "nowrap" }}>
            {liveTime.toLocaleDateString("en-IN",{weekday:"short",day:"2-digit",month:"short",year:"numeric"})}
          </span>
        </div>

        {/* Action buttons */}
        <div className="topbar-actions">
          {/* Theme toggle */}
          <button className="tb-btn" title={isDark ? "Light Mode" : "Dark Mode"} onClick={toggleTheme}>
            {isDark ? "☀️" : "🌙"}
          </button>

          {/* Fullscreen */}
          <button className="tb-btn" title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} onClick={toggleFullscreen}>
            {isFullscreen ? "⊠" : "⛶"}
          </button>

          {/* Notifications */}
          <div style={{ position:"relative" }} ref={notifRef}>
            <button className="tb-btn" title="Notifications" onClick={() => setNotifOpen(o => !o)}>
              🔔
              {notifications.length > 0 && <span className="tb-notif-badge" />}
            </button>
            {notifOpen && (
              <div className="tb-notif-dropdown">
                <div className="tb-notif-hdr">
                  <span className="tb-notif-hdr-title">Notifications</span>
                  <span className="tb-notif-count">{notifications.length}</span>
                </div>
                <div className="tb-notif-list">
                  {notifications.length === 0 ? (
                    <div className="tb-notif-empty">No notifications</div>
                  ) : notifications.map((n, i) => (
                    <div className="tb-notif-item" key={n.id || i}>
                      <div className="tb-notif-item-icon">{n.icon}</div>
                      <div className="tb-notif-item-body">
                        <div className="tb-notif-item-title">{n.title}</div>
                        <div className="tb-notif-item-sub">{n.body}</div>
                        {n.time && <div className="tb-notif-item-time">{new Date(n.time).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})} · {new Date(n.time).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</div>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="tb-notif-footer" onClick={() => setNotifOpen(false)}>
                  Mark all as read
                </div>
              </div>
            )}
          </div>

          <div className="tb-divider" />

          {/* Profile pill */}
          <div style={{ position: "relative" }} ref={profileRef}>
            <button className="tb-profile-btn" onClick={() => setProfileOpen(o => !o)}>
              <div className="tb-avatar">{initials}</div>
              <div className="tb-profile-info">
                <div className="tb-profile-name">{username}</div>
                <div className="tb-profile-role">{roleLabel}</div>
              </div>
              <span className="tb-chevron">{profileOpen ? "▲" : "▼"}</span>
            </button>

            {profileOpen && (
              <div className="tb-profile-dropdown">
                {/* Header */}
                <div className="tb-pd-header">
                  <div className="tb-pd-avatar">{initials}</div>
                  <div>
                    <div className="tb-pd-name">{username}</div>
                    <div className="tb-pd-email">{username.toLowerCase()}@hospital.com</div>
                    <div className="tb-pd-badges">
                      <span className="tb-pd-badge role">{roleLabel}</span>
                      <span className="tb-pd-badge status">● Active</span>
                    </div>
                  </div>
                </div>

                {/* Meta strip */}
                <div className="tb-pd-meta">
                  <div className="tb-pd-meta-item">
                    <div className="tb-pd-meta-label">Account ID</div>
                    <div className="tb-pd-meta-val">1</div>
                  </div>
                  <div className="tb-pd-meta-item">
                    <div className="tb-pd-meta-label">Role</div>
                    <div className="tb-pd-meta-val">{roleLabel}</div>
                  </div>
                  <div className="tb-pd-meta-item">
                    <div className="tb-pd-meta-label">Status</div>
                    <div className="tb-pd-meta-val" style={{color:"#34D399"}}>● Active</div>
                  </div>
                </div>

                {/* Items */}
                <div className="tb-pd-item" onClick={() => { setProfileOpen(false); setShowProfile(true); }}>
                  <span className="tb-pd-item-icon">👤</span>
                  <div className="tb-pd-item-info">
                    <div className="tb-pd-item-title">My Profile</div>
                    <div className="tb-pd-item-sub">Personal settings & preferences</div>
                  </div>
                </div>
                <div className="tb-pd-sep" />
                <div className="tb-pd-item danger" onClick={doLogout}>
                  <span className="tb-pd-item-icon">🚪</span>
                  <div className="tb-pd-item-info">
                    <div className="tb-pd-item-title">Sign Out</div>
                    <div className="tb-pd-item-sub">End your session</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* My Profile Modal */}
      {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} />}
    </>
  );
}