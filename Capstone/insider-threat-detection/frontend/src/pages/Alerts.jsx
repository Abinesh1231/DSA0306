import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getAlerts,
  getAlertSummary
} from "../services/api";


function Alerts() {

  const [alerts, setAlerts] =
    useState([]);

  const [summary, setSummary] =
    useState({
      total: 0,
      medium: 0,
      high: 0,
      critical: 0
    });

  const [loading, setLoading] =
    useState(true);


  const loadAlerts = async () => {

    try {

      setLoading(true);

      const [
        alertsData,
        summaryData
      ] = await Promise.all([
        getAlerts(),
        getAlertSummary()
      ]);

      setAlerts(alertsData);
      setSummary(summaryData);

    } catch (error) {

      console.error(
        "Failed to load alerts:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadAlerts();

  }, []);


  const getRiskClass = (risk) => {

    switch (risk) {

      case "MEDIUM":
        return "risk-medium";

      case "HIGH":
        return "risk-high";

      case "CRITICAL":
        return "risk-critical";

      default:
        return "risk-none";
    }
  };


  const formatCategory = (category) => {

    if (!category) {
      return "Unknown";
    }

    return category
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        char => char.toUpperCase()
      );
  };


  return (

    <div className="page">

      {/* HEADER */}

      <div className="page-header">

        <div>

          <h1>
            Security Alerts
          </h1>

          <p>
            Monitor communications requiring
            security attention.
          </p>

        </div>


        <button
          className="refresh-button"
          onClick={loadAlerts}
        >
          ↻ Refresh
        </button>

      </div>


      {/* SUMMARY */}

      <div className="alert-summary">

        <div className="alert-summary-card">

          <span>
            Total Alerts
          </span>

          <strong>
            {summary.total}
          </strong>

        </div>


        <div className="alert-summary-card medium-card">

          <span>
            Medium
          </span>

          <strong>
            {summary.medium}
          </strong>

        </div>


        <div className="alert-summary-card high-card">

          <span>
            High
          </span>

          <strong>
            {summary.high}
          </strong>

        </div>


        <div className="alert-summary-card critical-card">

          <span>
            Critical
          </span>

          <strong>
            {summary.critical}
          </strong>

        </div>

      </div>


      {/* ALERT LIST */}

      <div className="alerts-card">

        <div className="alerts-header">

          <div>

            <h2>
              Active Threat Alerts
            </h2>

            <p>
              Highest-risk communications are
              shown first.
            </p>

          </div>

          <span>
            {alerts.length} alerts
          </span>

        </div>


        {loading ? (

          <div className="loading-state">
            Loading alerts...
          </div>

        ) : alerts.length === 0 ? (

          <div className="empty-alerts">

            <div className="empty-alert-icon">
              ✓
            </div>

            <h3>
              No Active Threats
            </h3>

            <p>
              No medium, high, or critical
              communications were detected.
            </p>

          </div>

        ) : (

          <div className="alert-list">

            {alerts.map(alert => (

              <div
                className="alert-item"
                key={alert.id}
              >

                <div className="alert-severity">

                  <span
                    className={`severity-indicator ${getRiskClass(
                      alert.risk_level
                    )}`}
                  />

                  <span
                    className={`risk-badge ${getRiskClass(
                      alert.risk_level
                    )}`}
                  >
                    {alert.risk_level}
                  </span>

                </div>


                <div className="alert-main">

                  <div className="alert-title-row">

                    <h3>
                      {formatCategory(
                        alert.threat_category
                      )}
                    </h3>

                    <strong>
                      {alert.threat_score}%
                    </strong>

                  </div>


                  <p className="alert-message">

                    {alert.message}

                  </p>


                  <div className="alert-meta">

                    <span>
                      Sender:{" "}
                      <strong>
                        {alert.sender}
                      </strong>
                    </span>

                    <span>
                      {alert.timestamp
                        ? new Date(
                            alert.timestamp
                          ).toLocaleString()
                        : "Unknown time"}
                    </span>

                  </div>

                </div>


                <div className="alert-action">

                  <Link
                    to={`/threat/${alert.communication_id}`}
                    className="investigate-button"
                  >
                    Investigate
                  </Link>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );
}


export default Alerts;