import { useEffect, useState } from "react";
import {
  Link,
  useParams
} from "react-router-dom";

import {
  getThreatDetails
} from "../services/api";


function ThreatInvestigation() {

  const { id } = useParams();

  const [threat, setThreat] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const loadThreat = async () => {

    try {

      setLoading(true);
      setError("");

      const data =
        await getThreatDetails(id);

      setThreat(data);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Unable to load threat details."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadThreat();

  }, [id]);


  const getRiskClass = (risk) => {

    switch (risk) {

      case "LOW":
        return "risk-low";

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
        (char) => char.toUpperCase()
      );
  };


  if (loading) {

    return (
      <div className="page">
        <div className="loading-state">
          Loading threat investigation...
        </div>
      </div>
    );
  }


  if (error) {

    return (
      <div className="page">

        <div className="error-panel">

          <h2>
            Investigation Unavailable
          </h2>

          <p>
            {error}
          </p>

          <Link
            to="/communications"
            className="back-link"
          >
            ← Back to Communications
          </Link>

        </div>

      </div>
    );
  }


  return (

    <div className="page">

      {/* HEADER */}

      <div className="investigation-header">

        <div>

          <Link
            to="/communications"
            className="back-link"
          >
            ← Back to Communications
          </Link>

          <h1>
            Threat Investigation
          </h1>

          <p>
            Detailed analysis of communication
            #{threat.communication_id}
          </p>

        </div>

        <span
          className={`risk-badge large ${getRiskClass(
            threat.risk_level
          )}`}
        >
          {threat.risk_level}
        </span>

      </div>


      {/* SUMMARY */}

      <div className="investigation-summary">

        <div className="investigation-card">

          <span className="detail-label">
            Threat Score
          </span>

          <strong className="threat-score">
            {threat.threat_score}%
          </strong>

          <span className="detail-description">
            Model-generated risk score
          </span>

        </div>


        <div className="investigation-card">

          <span className="detail-label">
            Confidence
          </span>

          <strong>
            {threat.confidence}%
          </strong>

          <span className="detail-description">
            Classification confidence
          </span>

        </div>


        <div className="investigation-card">

          <span className="detail-label">
            Threat Category
          </span>

          <strong className="category-text">
            {formatCategory(
              threat.threat_category
            )}
          </strong>

          <span className="detail-description">
            ML classification
          </span>

        </div>


        <div className="investigation-card">

          <span className="detail-label">
            Sender
          </span>

          <strong>
            {threat.sender}
          </strong>

          <span className="detail-description">
            Communication source
          </span>

        </div>

      </div>


      {/* COMMUNICATION */}

      <section className="investigation-section">

        <div className="section-title">

          <div>

            <h2>
              Communication
            </h2>

            <p>
              Original enterprise communication
            </p>

          </div>

        </div>


        <div className="message-panel">

          <div className="message-meta">

            <span>
              Sender: <strong>
                {threat.sender}
              </strong>
            </span>

            <span>
              {threat.timestamp
                ? new Date(
                    threat.timestamp
                  ).toLocaleString()
                : "Unknown time"}
            </span>

          </div>


          <div className="message-content">

            {threat.message}

          </div>

        </div>

      </section>


      {/* INDICATORS */}

      <section className="investigation-section">

        <div className="section-title">

          <div>

            <h2>
              Detected Indicators
            </h2>

            <p>
              NLP-based indicators identified
              in the communication
            </p>

          </div>

        </div>


        {threat.indicators &&
        threat.indicators.length > 0 ? (

          <div className="indicator-list">

            {threat.indicators.map(
              (indicator, index) => (

                <div
                  className="indicator-item"
                  key={index}
                >

                  <span className="indicator-icon">
                    ⚠
                  </span>

                  <span>
                    {indicator}
                  </span>

                </div>

              )
            )}

          </div>

        ) : (

          <div className="no-indicators">
            No specific indicators detected.
          </div>

        )}

      </section>


      {/* MODEL INFORMATION */}

      <section className="investigation-section">

        <div className="section-title">

          <div>

            <h2>
              Model Assessment
            </h2>

            <p>
              Machine learning classification
              result
            </p>

          </div>

        </div>


        <div className="model-assessment">

          <div>

            <span>
              Model Prediction
            </span>

            <strong>
              {formatCategory(
                threat.model_prediction
              )}
            </strong>

          </div>


          <div>

            <span>
              Risk Level
            </span>

            <strong
              className={`risk-text ${getRiskClass(
                threat.risk_level
              )}`}
            >
              {threat.risk_level}
            </strong>

          </div>


          <div>

            <span>
              Threat Score
            </span>

            <strong>
              {threat.threat_score} / 100
            </strong>

          </div>

        </div>

      </section>

    </div>
  );
}


export default ThreatInvestigation;