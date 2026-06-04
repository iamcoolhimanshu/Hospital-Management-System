import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useTheme } from "../../hooks/useTheme";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { isDark } = useTheme();

  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: isDark ? "#0A1628" : "#F0F4FA",
      transition: "background 0.25s ease",
    }}>
      {/* Fixed Topbar spans full width */}
      <Topbar sidebarWidth={sidebarWidth} />

      {/* Fixed Sidebar (starts below topbar via CSS top:52px) */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Spacer so main content doesn't go under sidebar */}
      <div style={{
        width: sidebarWidth,
        flexShrink: 0,
        transition: "width 0.25s ease",
      }} />

      {/* Main content area — padded for topbar */}
      <main style={{
        flex: 1,
        minWidth: 0,
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        paddingTop: 52,
        background: isDark ? "#0A1628" : "#F0F4FA",
        transition: "background 0.25s ease",
      }}>
        <Outlet />
      </main>
    </div>
  );
}