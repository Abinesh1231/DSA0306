import { useEffect, useState } from "react";

import {
  getAnalytics
} from "../services/api";


function Analytics() {

  const [analytics, setAnalytics] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const loadAnalytics = async () => {

    try {

      setLoading(true);
      setError("");

      const data =
        await getAnalytics();

      setAnalytics(data);

    } catch (err) {

      console.error(err);

      setError(
        "Unable to load analytics."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadAnalytics();

  }, []);


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


  const riskData = analytics
    ? [
        {
          label: "Low",
          value:
            analytics.risk_distribution.LOW,
          className: "analytics-low"
        },
        {
          label: "Medium",
          value:
            analytics.risk_distribution.MEDIUM,
          className: "analytics-medium"
        },
        {
          label: "High",
          value:
            analytics.risk_distribution.HIGH,
          className: "analytics-high"
        },
        {
          label: "Critical",
          value:
            analytics.risk_distribution.CRITICAL,
          className: "analytics-critical"
        }
      ]
    : [];


  const maxRisk = Math.max(
    ...riskData.map(
      item => item.value
    ),
    1
  );


  const maxCategory = analytics
    ? Math.max(
        ...analytics.threat_categories.map(
          item => item.count
        ),
        1
      )
    : 1;


  const maxTrend = analytics
    ? Math.max(
        ...analytics.time_trend.map(
          item => item.count
        ),
        1
      )
    : 1;


  if (loading) {

    return (
      <div className="page">

        <div className="loading-state">
          Loading security analytics...
        </div>

      </div>
    );
  }


  if (error) {

    return (
      <div className="page">

        <div className="error-panel">

          <h2>
            Analytics Unavailable
          </h2>

          <p>
            {error}
          </p>

          <button
            className="refresh-button"
            onClick={loadAnalytics}
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }


  return (

    <div className="page">

      {/* PAGE HEADER */}

      <div className="page-header">

        <div>

          <h1>
            Security Analytics
          </h1>

          <p>
            Analyze threat patterns and
            communication risk.
          </p>

        </div>


        <button
          className="refresh-button"
          onClick={loadAnalytics}
        >
          ↻ Refresh
        </button>

      </div>


      {/* KPI CARDS */}

      <div className="analytics-kpis">

        <div className="analytics-kpi">

          <span>
            Total Communications
          </span>

          <strong>
            {analytics.total_communications}
          </strong>

        </div>


        <div className="analytics-kpi">

          <span>
            Analyzed
          </span>

          <strong>
            {analytics.total_analyzed}
          </strong>

        </div>


        <div className="analytics-kpi">

          <span>
            Average Threat Score
          </span>

          <strong>
            {analytics.average_threat_score}%
          </strong>

        </div>


        <div className="analytics-kpi">

          <span>
            High Risk
          </span>

          <strong>
            {analytics.high_risk_percentage}%
          </strong>

        </div>

      </div>


      {/* RISK DISTRIBUTION */}

      <section className="analytics-section">

        <div className="analytics-section-header">

          <div>

            <h2>
              Risk Distribution
            </h2>

            <p>
              Distribution of analyzed
              communications by risk level.
            </p>

          </div>

        </div>


        <div className="risk-chart">

          {riskData.map(item => (

            <div
              className="risk-chart-row"
              key={item.label}
            >

              <div className="chart-label">
                <span>
                  {item.label}
                </span>

                <strong>
                  {item.value}
                </strong>
              </div>


              <div className="chart-track">

                <div
                  className={`chart-bar ${item.className}`}
                  style={{
                    width: `${
                      (
                        item.value
                        / maxRisk
                      ) * 100
                    }%`
                  }}
                />

              </div>

            </div>

          ))}

        </div>

      </section>


      {/* TWO COLUMN */}

      <div className="analytics-two-column">


        {/* THREAT CATEGORIES */}

        <section className="analytics-section">

          <div className="analytics-section-header">

            <div>

              <h2>
                Threat Categories
              </h2>

              <p>
                Most frequently detected
                threat types.
              </p>

            </div>

          </div>


          <div className="category-chart">

            {analytics.threat_categories.length === 0 ? (

              <div className="no-data">
                No threat categories available.
              </div>

            ) : (

              analytics.threat_categories.map(
                item => (

                  <div
                    className="category-row"
                    key={item.category}
                  >

                    <div className="category-label">

                      <span>
                        {formatCategory(
                          item.category
                        )}
                      </span>

                      <strong>
                        {item.count}
                      </strong>

                    </div>


                    <div className="chart-track">

                      <div
                        className="category-bar"
                        style={{
                          width: `${
                            (
                              item.count
                              / maxCategory
                            ) * 100
                          }%`
                        }}
                      />

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </section>


        {/* MODEL PERFORMANCE */}

        <section className="analytics-section">

          <div className="analytics-section-header">

            <div>

              <h2>
                Model Assessment
              </h2>

              <p>
                Summary of threat model
                confidence.
              </p>

            </div>

          </div>


          <div className="model-metrics">

            <div className="model-metric">

              <span>
                Average Confidence
              </span>

              <strong>
                {analytics.average_confidence}%
              </strong>

            </div>


            <div className="model-metric">

              <span>
                Highest Threat Score
              </span>

              <strong>
                {analytics.highest_threat_score}%
              </strong>

            </div>


            <div className="model-metric">

              <span>
                Analyzed Communications
              </span>

              <strong>
                {analytics.total_analyzed}
              </strong>

            </div>

          </div>

        </section>

      </div>


      {/* TIME TREND */}

      <section className="analytics-section">

        <div className="analytics-section-header">

          <div>

            <h2>
              Communication Activity
            </h2>

            <p>
              Number of analyzed communications
              over time.
            </p>

          </div>

        </div>


        {analytics.time_trend.length === 0 ? (

          <div className="no-data">
            No timestamp data available.
          </div>

        ) : (

          <div className="trend-chart">

            {analytics.time_trend.map(
              item => (

                <div
                  className="trend-column"
                  key={item.date}
                >

                  <div className="trend-value">
                    {item.count}
                  </div>


                  <div className="trend-bar-container">

                    <div
                      className="trend-bar"
                      style={{
                        height: `${
                          (
                            item.count
                            / maxTrend
                          ) * 100
                        }%`
                      }}
                    />

                  </div>


                  <div className="trend-date">
                    {item.date}
                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>


    </div>

  );
}


export default Analytics;