import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "./hooks/useTheme";
import PrivateRoute from "./components/layout/PrivateRoute";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { useAuth } from "./hooks/useAuth";

// ── Eagerly loaded pages ───────────────────────────────────────────────────
import DashboardPage from "./pages/HospitalManagement/Dashboard";
import ModulePage    from "./pages/HospitalManagement/ModulePage";

// ── Tab → component map ───────────────────────────────────────────────────
// Add real page imports here as you build them out.
// Anything not in this map falls through to ModulePage (Coming Soon).
const PAGE_MAP = {
  dashboard: DashboardPage,
  // hospitals:    lazy(() => import("./pages/HospitalManagement/Hospitals")),
  // departments:  lazy(() => import("./pages/HospitalManagement/Departments")),
  // staff:        lazy(() => import("./pages/HospitalManagement/Staff")),
  // doctors:      lazy(() => import("./pages/HospitalManagement/Doctors")),
  // patients:     lazy(() => import("./pages/HospitalManagement/Patients")),
  // wards:        lazy(() => import("./pages/HospitalManagement/Wards")),
  // ipd:          lazy(() => import("./pages/HospitalManagement/IPD")),
  // opd:          lazy(() => import("./pages/HospitalManagement/OPD")),
  // prescription: lazy(() => import("./pages/HospitalManagement/Prescription")),
  // lab:          lazy(() => import("./pages/HospitalManagement/Lab")),
  // pharmacy:     lazy(() => import("./pages/HospitalManagement/Pharmacy")),
  // emergency:    lazy(() => import("./pages/HospitalManagement/Emergency")),
  // ot:           lazy(() => import("./pages/HospitalManagement/OT")),
  // nursing:      lazy(() => import("./pages/HospitalManagement/Nursing")),
  // discharge:    lazy(() => import("./pages/HospitalManagement/Discharge")),
  // billing:      lazy(() => import("./pages/HospitalManagement/Billing")),
  // insurance:    lazy(() => import("./pages/HospitalManagement/Insurance")),
  // advancepay:   lazy(() => import("./pages/HospitalManagement/AdvancePay")),
  // relationship: lazy(() => import("./pages/HospitalManagement/Relationship")),
  // reports:      lazy(() => import("./pages/HospitalManagement/Reports")),
  // admin:        lazy(() => import("./pages/HospitalManagement/Admin")),
};

// ── Root redirect ─────────────────────────────────────────────────────────
function RootRedirect() {
  const { token } = useAuth();
  return <Navigate to={token ? "/hospital/dashboard" : "/login"} replace />;
}

// ── Per-tab renderer ──────────────────────────────────────────────────────
function HospitalTabRenderer() {
  const { tab } = useParams();
  const Page = PAGE_MAP[tab];

  if (Page) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Page />
      </Suspense>
    );
  }

  // No real page yet → styled "Coming Soon" stub
  return <ModulePage tab={tab} />;
}

// ── Loading screen ────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      minHeight: "calc(100vh - 52px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0A1628",
      color: "#34D399",
      fontSize: 14,
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 600,
      gap: 10,
    }}>
      <span>⏳</span> Loading module…
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/hospital"
              element={
                <PrivateRoute>
                  <AppLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path=":tab"   element={<HospitalTabRenderer />} />
              <Route path=":tab/*" element={<HospitalTabRenderer />} />
            </Route>

            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}