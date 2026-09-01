import { useEffect, useState } from "react";

import {
  Link
} from "react-router-dom";

import {
  getDashboardStats
} from "../services/api";


function Dashboard() {

  const [stats, setStats] =
    useState({
      total_communications: 0,
      total_analyzed: 0,
      suspicious_messages: 0,
      low_risk: 0,
      medium_risk: 0,
      high_risk: 0,
      critical_alerts: 0
    });

  const [loading, setLoading] =
    useState(true);


  const loadStats = async () => {

    try {

      setLoading(true);

      const data =
        await getDashboardStats();

      setStats(data);

    } catch (error) {

      console.error(
        "Failed to load dashboard statistics:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadStats();

  }, []);


  return (

    <div className="dashboard-page">

      {/* PAGE HEADER */}

      <div className="dashboard-heading">

        <div>

          <span className="page-eyebrow">
            SECURITY OVERVIEW
          </span>

          <h1>
            Security Dashboard
          </h1>

          <p>
            Monitor enterprise communication
            activity and insider threat risk.
          </p>

        </div>


        <button
          className="refresh-button"
          onClick={loadStats}
        >
          ↻ Refresh
        </button>

      </div>


      {/* STAT CARDS */}

      <div className="stats">

        <div className="stat-card">

          <div className="stat-card-top">

            <h3>
              Total Communications
            </h3>

            <span className="stat-icon">
              ▤
            </span>

          </div>

          <strong>
            {loading
              ? "..."
              : stats.total_communications}
          </strong>

          <span className="stat-description">
            Messages received
          </span>

        </div>


        <div className="stat-card">

          <div className="stat-card-top">

            <h3>
              Suspicious Messages
            </h3>

            <span className="stat-icon">
              ⚠
            </span>

          </div>

          <strong>
            {loading
              ? "..."
              : stats.suspicious_messages}
          </strong>

          <span className="stat-description">
            Medium or higher risk
          </span>

        </div>


        <div className="stat-card">

          <div className="stat-card-top">

            <h3>
              High Risk
            </h3>

            <span className="stat-icon">
              !
            </span>

          </div>

          <strong>
            {loading
              ? "..."
              : stats.high_risk}
          </strong>

          <span className="stat-description">
            High-risk communications
          </span>

        </div>


        <div className="stat-card">

          <div className="stat-card-top">

            <h3>
              Critical Alerts
            </h3>

            <span className="stat-icon">
              ⛔
            </span>

          </div>

          <strong>
            {loading
              ? "..."
              : stats.critical_alerts}
          </strong>

          <span className="stat-description">
            Immediate attention required
          </span>

        </div>

      </div>


      {/* RISK OVERVIEW */}

      <section className="risk-overview">

        <div className="section-header">

          <div>

            <span className="page-eyebrow">
              THREAT LANDSCAPE
            </span>

            <h2>
              Risk Overview
            </h2>

            <p>
              Current communication risk
              distribution.
            </p>

          </div>

          <Link
            to="/analytics"
            className="section-link"
          >
            View Analytics →
          </Link>

        </div>


        <div className="risk-grid">

          <div className="risk-item">

            <span className="risk-dot low" />

            <span>
              Low Risk
            </span>

            <strong>
              {stats.low_risk}
            </strong>

          </div>


          <div className="risk-item">

            <span className="risk-dot medium" />

            <span>
              Medium Risk
            </span>

            <strong>
              {stats.medium_risk}
            </strong>

          </div>


          <div className="risk-item">

            <span className="risk-dot high" />

            <span>
              High Risk
            </span>

            <strong>
              {stats.high_risk}
            </strong>

          </div>


          <div className="risk-item">

            <span className="risk-dot critical" />

            <span>
              Critical
            </span>

            <strong>
              {stats.critical_alerts}
            </strong>

          </div>

        </div>

      </section>


      {/* QUICK ACTIONS */}

      <section className="quick-actions">

        <div className="section-header">

          <div>

            <span className="page-eyebrow">
              OPERATIONS
            </span>

            <h2>
              Quick Actions
            </h2>

          </div>

        </div>


        <div className="action-grid">

          <Link
            to="/communications"
            className="action-card"
          >

            <span className="action-icon">
              📂
            </span>

            <div>

              <h3>
                Analyze Communications
              </h3>

              <p>
                Upload and analyze enterprise
                communication data.
              </p>

            </div>

          </Link>


          <Link
            to="/alerts"
            className="action-card"
          >

            <span className="action-icon">
              🔍
            </span>

            <div>

              <h3>
                Investigate Threats
              </h3>

              <p>
                Review suspicious activity and
                security alerts.
              </p>

            </div>

          </Link>


          <Link
            to="/analytics"
            className="action-card"
          >

            <span className="action-icon">
              📊
            </span>

            <div>

              <h3>
                View Analytics
              </h3>

              <p>
                Explore threat trends and
                model results.
              </p>

            </div>

          </Link>

        </div>

      </section>

    </div>

  );
}


export default Dashboard;