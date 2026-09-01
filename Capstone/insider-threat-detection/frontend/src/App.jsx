import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Communications from "./pages/Communications";
import ThreatInvestigation from "./pages/ThreatInvestigation";
import Alerts from "./pages/Alerts";
import Analytics from "./pages/Analytics";
import Investigations from "./pages/Investigations";
import ThreatDetection from "./pages/ThreatDetection";

import AppLayout from "./layouts/AppLayout";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}

        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* PROTECTED APPLICATION */}

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/communications" element={<Communications />} />

          <Route path="/threat/:id" element={<ThreatInvestigation />} />

          <Route path="/alerts" element={<Alerts />} />

          <Route path="/analytics" element={<Analytics />} />
          <Route path="/investigations" element={<Investigations />} />
          <Route path="/threat-detection" element={<ThreatDetection />} />
        </Route>

        {/* FALLBACK */}

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
