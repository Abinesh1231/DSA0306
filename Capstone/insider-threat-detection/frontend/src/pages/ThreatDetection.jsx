import { useEffect, useState } from "react";

function ThreatDetection() {
  const [communications, setCommunications] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [result, setResult] = useState(null);

  const [loadingCommunications, setLoadingCommunications] = useState(true);

  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const [error, setError] = useState("");

  // =========================================
  // LOAD COMMUNICATIONS
  // =========================================

  useEffect(() => {
    const loadCommunications = async () => {
      try {
        setLoadingCommunications(true);
        setError("");

        const response = await fetch(
          "http://127.0.0.1:8000/api/communications/",
        );

        if (!response.ok) {
          throw new Error("Unable to load communications");
        }

        const data = await response.json();

        setCommunications(data);

        // Select the first communication automatically
        if (data.length > 0) {
          setSelectedId(String(data[0].id));
        }
      } catch (err) {
        console.error(err);

        setError("Unable to load communications from the backend.");
      } finally {
        setLoadingCommunications(false);
      }
    };

    loadCommunications();
  }, []);

  // =========================================
  // ANALYZE SELECTED COMMUNICATION
  // =========================================

  const analyzeCommunication = async () => {
    if (!selectedId) {
      return;
    }

    try {
      setLoadingAnalysis(true);
      setResult(null);
      setError("");

      const response = await fetch(
        `http://127.0.0.1:8000/api/threat/analyze/${selectedId}`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error("Threat analysis failed");
      }

      const data = await response.json();

      setResult(data);
    } catch (err) {
      console.error(err);

      setError("Unable to analyze the selected communication.");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // =========================================
  // SELECTED COMMUNICATION
  // =========================================

  const selectedCommunication = communications.find(
    (item) => String(item.id) === String(selectedId),
  );

  // =========================================
  // RISK CSS CLASS
  // =========================================

  const getRiskClass = (risk) => {
    const value = String(risk || "").toLowerCase();

    if (value === "critical") {
      return "critical";
    }

    if (value === "high") {
      return "high";
    }

    if (value === "medium") {
      return "medium";
    }

    return "low";
  };

  return (
    <div className="page-container threat-detection-page">
      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div className="page-header">
        <div>
          <span className="page-eyebrow">NLP THREAT DETECTION</span>

          <h1>Threat Detection</h1>

          <p>
            Analyze enterprise communications for potential insider threat
            indicators.
          </p>
        </div>
      </div>

      {/* =====================================
          MAIN GRID
      ===================================== */}

      <div className="detection-grid">
        {/* ===================================
            COMMUNICATION SELECTION
        =================================== */}

        <section className="content-card detection-input-card">
          <div className="content-card-header">
            <h2>Communication Analysis</h2>

            <p>Select an existing enterprise communication for NLP analysis.</p>
          </div>

          <div className="detection-form">
            <label>Select Communication</label>

            {loadingCommunications ? (
              <div className="loading-message">Loading communications...</div>
            ) : (
              <select
                value={selectedId}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  setResult(null);
                }}
                className="communication-select"
              >
                <option value="">Select a communication</option>

                {communications.map((communication) => (
                  <option key={communication.id} value={communication.id}>
                    #{communication.id} — {communication.sender} —{" "}
                    {communication.message.substring(0, 55)}
                  </option>
                ))}
              </select>
            )}

            {/* SELECTED MESSAGE PREVIEW */}

            {selectedCommunication && (
              <div className="selected-communication">
                <div className="selected-header">
                  <span>Selected Communication</span>

                  <strong>#{selectedCommunication.id}</strong>
                </div>

                <div className="selected-sender">
                  <span>Sender</span>

                  <strong>{selectedCommunication.sender}</strong>
                </div>

                <div className="selected-message">
                  <span>Message</span>

                  <p>{selectedCommunication.message}</p>
                </div>
              </div>
            )}

            <button
              className="analyze-button"
              onClick={analyzeCommunication}
              disabled={!selectedId || loadingAnalysis || loadingCommunications}
            >
              {loadingAnalysis ? "Analyzing..." : "Analyze Communication →"}
            </button>

            {error && <div className="detection-error">{error}</div>}
          </div>
        </section>

        {/* ===================================
            THREAT ASSESSMENT
        =================================== */}

        <section className="content-card detection-result-card">
          <div className="content-card-header">
            <h2>Threat Assessment</h2>

            <p>NLP analysis results will appear here.</p>
          </div>

          {!result ? (
            <div className="detection-empty">
              <div className="detection-empty-icon">◈</div>

              <h3>Awaiting Analysis</h3>

              <p>
                Select a communication and analyze it to generate a threat
                assessment.
              </p>
            </div>
          ) : (
            <div className="assessment">
              {/* RISK SCORE */}

              <div className="risk-score-section">
                <span>Threat Score</span>

                <strong>{result.threat_score ?? 0}%</strong>
              </div>

              {/* RISK LEVEL */}

              <div
                className={`assessment-risk ${getRiskClass(result.risk_level)}`}
              >
                {String(result.risk_level || "LOW").toUpperCase()}
              </div>

              {/* THREAT CATEGORY */}

              <div className="assessment-item">
                <span>Threat Category</span>

                <strong>{result.threat_category || "normal"}</strong>
              </div>

              {/* CONFIDENCE */}

              <div className="assessment-item">
                <span>Confidence</span>

                <strong>{result.confidence ?? 0}%</strong>
              </div>

              {/* INDICATORS */}

              <div className="assessment-item">
                <span>Suspicious Indicators</span>

                {result.indicators && result.indicators.length > 0 ? (
                  <div className="indicator-list">
                    {result.indicators.map((indicator, index) => (
                      <span key={index} className="indicator">
                        {indicator}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>No suspicious indicators detected.</p>
                )}
              </div>

              {/* ANALYZED MESSAGE */}

              <div className="assessment-item">
                <span>Analyzed Communication</span>

                <p>{result.message}</p>
              </div>

              {/* SENDER */}

              <div className="assessment-item">
                <span>Sender</span>

                <strong>{result.sender}</strong>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default ThreatDetection;
