// ModulePage.jsx – Generic stub for modules under construction
import React from "react";
import { useTheme } from "../../hooks/useTheme";

const MODULE_META = {
  hospitals:    { icon: "🏥", label: "Hospitals",          color: "#059669", desc: "Manage hospital branches, facilities, and infrastructure." },
  departments:  { icon: "🏢", label: "Departments",        color: "#2563EB", desc: "Configure clinical and administrative departments." },
  staff:        { icon: "👥", label: "Staff",              color: "#7C3AED", desc: "Manage non-clinical staff, roles, and shifts." },
  doctors:      { icon: "🧑‍⚕️", label: "Doctors",         color: "#0891B2", desc: "Doctor profiles, specializations, and availability." },
  patients:     { icon: "🧑", label: "Patients",           color: "#D97706", desc: "Patient registry, UHID, and medical history." },
  wards:        { icon: "🛏️", label: "Wards & Beds",      color: "#DB2777", desc: "Ward management, bed allocation, and occupancy." },
  ipd:          { icon: "🏨", label: "IPD Admissions",     color: "#2563EB", desc: "In-patient admissions, discharge planning, and tracking." },
  opd:          { icon: "🩺", label: "OPD / Consultation", color: "#059669", desc: "Out-patient consultations, scheduling, and records." },
  prescription: { icon: "💊", label: "Prescriptions",      color: "#7C3AED", desc: "Digital prescriptions, drug orders, and dosage records." },
  lab:          { icon: "🔬", label: "Lab Tests",          color: "#0891B2", desc: "Lab test orders, results, and report management." },
  pharmacy:     { icon: "🧪", label: "Pharmacy",           color: "#059669", desc: "Medicine inventory, dispensing, and stock management." },
  emergency:    { icon: "🚨", label: "Emergency",          color: "#DC2626", desc: "Emergency case intake, triage, and critical care." },
  ot:           { icon: "🔪", label: "OT Schedule",        color: "#D97706", desc: "Operation theatre scheduling, teams, and outcomes." },
  nursing:      { icon: "💉", label: "Nursing Notes",      color: "#DB2777", desc: "Nurse charting, vitals, care plans, and handover notes." },
  discharge:    { icon: "📋", label: "Discharge Summary",  color: "#059669", desc: "Discharge documents, follow-up instructions, and records." },
  billing:      { icon: "🧾", label: "Billing",            color: "#2563EB", desc: "Patient invoicing, receipts, and payment tracking." },
  insurance:    { icon: "🛡️", label: "Insurance",         color: "#7C3AED", desc: "Insurance claims, TPA management, and approvals." },
  advancepay:   { icon: "💳", label: "Advance Payment",   color: "#0891B2", desc: "Advance deposits, adjustments, and refunds." },
  relationship: { icon: "🤝", label: "Relationships",      color: "#D97706", desc: "Patient relations, feedback, and loyalty programs." },
  reports:      { icon: "📈", label: "Reports",            color: "#059669", desc: "Analytics, operational reports, and data exports." },
  admin:        { icon: "⚙️", label: "Admin",              color: "#475569", desc: "System settings, user management, and configuration." },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  .mp-root {
    font-family: 'DM Sans', sans-serif;
    min-height: calc(100vh - 52px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    background: var(--mp-bg, #0A1628);
    transition: background 0.25s;
  }
  [data-theme="light"] .mp-root { --mp-bg: #F0F4FA; }
  [data-theme="dark"]  .mp-root { --mp-bg: #0A1628; }

  .mp-card {
    background: var(--mp-card, #0F1D33);
    border: 1px solid var(--mp-border, #1A2E4A);
    border-radius: 20px;
    padding: 48px 52px;
    text-align: center;
    max-width: 520px;
    width: 100%;
    box-shadow: 0 8px 40px rgba(0,0,0,0.35);
    position: relative;
    overflow: hidden;
  }
  [data-theme="light"] .mp-card { --mp-card: #fff; --mp-border: #E2E8F0; }
  [data-theme="dark"]  .mp-card { --mp-card: #0F1D33; --mp-border: #1A2E4A; }

  .mp-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--mp-accent), transparent);
    border-radius: 20px 20px 0 0;
  }

  .mp-icon-wrap {
    width: 80px; height: 80px;
    border-radius: 22px;
    display: flex; align-items: center; justify-content: center;
    font-size: 38px;
    margin: 0 auto 24px;
    background: var(--mp-icon-bg);
    border: 1px solid var(--mp-icon-border);
    box-shadow: 0 4px 20px var(--mp-icon-shadow);
  }

  .mp-badge {
    display: inline-block;
    padding: 3px 12px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: var(--mp-badge-bg);
    color: var(--mp-accent);
    border: 1px solid var(--mp-badge-border);
    margin-bottom: 14px;
  }

  .mp-title {
    font-size: 26px;
    font-weight: 800;
    color: var(--mp-title, #E2E8F0);
    margin-bottom: 10px;
    letter-spacing: -0.4px;
  }
  [data-theme="light"] .mp-title { --mp-title: #0F172A; }
  [data-theme="dark"]  .mp-title { --mp-title: #E2E8F0; }

  .mp-desc {
    font-size: 14px;
    color: var(--mp-muted, #64748B);
    line-height: 1.6;
    margin-bottom: 28px;
  }

  .mp-divider {
    width: 48px; height: 3px;
    background: var(--mp-accent);
    border-radius: 2px;
    margin: 0 auto 28px;
    opacity: 0.5;
  }

  .mp-status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--mp-muted, #64748B);
  }

  .mp-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--mp-accent);
    animation: mp-pulse 2s ease-in-out infinite;
  }

  @keyframes mp-pulse {
    0%, 100% { opacity: 0.4; transform: scale(0.9); }
    50%       { opacity: 1;   transform: scale(1.1); }
  }
`;

export default function ModulePage({ tab }) {
  const { isDark } = useTheme();
  const meta = MODULE_META[tab] || {
    icon: "🔧",
    label: tab ? tab.charAt(0).toUpperCase() + tab.slice(1) : "Module",
    color: "#059669",
    desc: "This module is currently being developed.",
  };

  const accentRgb = meta.color;

  return (
    <>
      <style>{CSS}</style>
      <div
        className="mp-root"
        style={{
          "--mp-accent":       accentRgb,
          "--mp-icon-bg":      `${accentRgb}18`,
          "--mp-icon-border":  `${accentRgb}30`,
          "--mp-icon-shadow":  `${accentRgb}22`,
          "--mp-badge-bg":     `${accentRgb}15`,
          "--mp-badge-border": `${accentRgb}30`,
        }}
      >
        <div className="mp-card" style={{ "--mp-accent": accentRgb }}>
          <div className="mp-icon-wrap">{meta.icon}</div>
          <div className="mp-badge">Module</div>
          <div className="mp-title">{meta.label}</div>
          <div className="mp-desc">{meta.desc}</div>
          <div className="mp-divider" />
          <div className="mp-status">
            <div className="mp-dot" />
            Under Development — Coming Soon
          </div>
        </div>
      </div>
    </>
  );
}