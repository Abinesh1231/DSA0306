import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { getAlertSummary } from "../services/api";

function AppLayout() {
  const navigate = useNavigate();

  const [alertCount, setAlertCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // =========================================
  // LOAD ALERT COUNT
  // =========================================

  const loadAlertCount = async () => {
    try {
      const data = await getAlertSummary();

      setAlertCount((data?.critical || 0) + (data?.high || 0));
    } catch (error) {
      console.error("Unable to load alert count:", error);
    }
  };

  useEffect(() => {
    loadAlertCount();

    const interval = setInterval(loadAlertCount, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =========================================
  // LOGOUT
  // =========================================

  const logout = () => {
    localStorage.removeItem("access_token");

    localStorage.removeItem("user");

    navigate("/");
  };

  // =========================================
  // NAVIGATION STYLE
  // =========================================

  const getNavClass = ({ isActive }) => {
    return isActive ? "sidebar-link active" : "sidebar-link";
  };

  return (
    <div className="app-layout">
      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside className="sidebar">
        {/* BRAND */}

        <div className="sidebar-brand">
          <div className="brand-icon">🛡️</div>

          <div>
            <h2>Insider Threat</h2>

            <span>Security Monitor</span>
          </div>
        </div>

        {/* ===================================
            MONITORING
        =================================== */}

        <div className="sidebar-section">
          <span className="sidebar-section-title">MONITORING</span>

          <NavLink to="/dashboard" end className={getNavClass}>
            <span className="nav-icon">◈</span>

            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/threat-detection" end className={getNavClass}>
            <span className="nav-icon">▤</span>

            <span>Communications</span>
          </NavLink>

          <NavLink to="/alerts" end className={getNavClass}>
            <span className="nav-icon">⚠</span>

            <span>Alerts</span>

            {alertCount > 0 && (
              <span className="alert-badge">{alertCount}</span>
            )}
          </NavLink>

          <NavLink to="/analytics" end className={getNavClass}>
            <span className="nav-icon">▥</span>

            <span>Analytics</span>
          </NavLink>
        </div>

        {/* ===================================
            INVESTIGATION
        =================================== */}

        <div className="sidebar-section">
          <span className="sidebar-section-title">INVESTIGATION</span>

          <NavLink to="/communications" end className={getNavClass}>
            <span className="nav-icon">⌕</span>

            <span>Threat Detection</span>
          </NavLink>

          <NavLink to="/investigations" end className={getNavClass}>
            <span className="nav-icon">◉</span>

            <span>Investigations</span>
          </NavLink>
        </div>

        {/* ===================================
            SIDEBAR USER
        =================================== */}

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-avatar">
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="user-info">
              <strong>{user?.username || "User"}</strong>

              <span>{user?.role || "Analyst"}</span>
            </div>
          </div>

          <button className="sidebar-logout" onClick={logout}>
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* =====================================
          MAIN APPLICATION
      ===================================== */}

      <div className="app-main">
        {/* HEADER */}

        <header className="app-header">
          <div className="header-title">
            <span className="system-status-dot" />

            <span>System Operational</span>
          </div>

          <div className="header-actions">
            {/* NOTIFICATIONS */}

            <button
              className="notification-button"
              onClick={() => navigate("/alerts")}
              title="View security alerts"
            >
              🔔
              {alertCount > 0 && (
                <span className="notification-count">{alertCount}</span>
              )}
            </button>

            {/* USER */}

            <div className="header-user">
              <div className="header-avatar">
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <span>{user?.username || "User"}</span>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
