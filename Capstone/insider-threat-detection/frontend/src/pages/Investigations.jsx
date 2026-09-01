import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCommunications } from "../services/api";


function Investigations() {

  const navigate = useNavigate();

  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    const loadCommunications = async () => {

      try {

        const data = await getCommunications();

        setCommunications(data || []);

      } catch (error) {

        console.error(
          "Unable to load communications:",
          error
        );

      } finally {

        setLoading(false);

      }

    };

    loadCommunications();

  }, []);


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

    <div className="page-container">


      {/* HEADER */}

      <div className="page-header">

        <div>

          <span className="page-eyebrow">
            INVESTIGATION CENTER
          </span>

          <h1>
            Threat Investigations
          </h1>

          <p>
            Review suspicious enterprise communications
            and investigate potential insider threats.
          </p>

        </div>


        <button
          className="refresh-button"
          onClick={() => window.location.reload()}
        >
          ↻ Refresh
        </button>

      </div>


      {/* SUMMARY */}

      <div className="stats-grid">

        <div className="stat-card">

          <span>
            Suspicious Communications
          </span>

          <strong>
            {communications.length}
          </strong>

        </div>


        <div className="stat-card">

          <span>
            Under Investigation
          </span>

          <strong>
            {communications.filter(
              item =>
                ["high", "critical"].includes(
                  String(item.risk_level || item.risk || "")
                    .toLowerCase()
                )
            ).length}
          </strong>

        </div>


        <div className="stat-card">

          <span>
            Investigation Status
          </span>

          <strong>
            Active
          </strong>

        </div>

      </div>


      {/* INVESTIGATION TABLE */}

      <div className="content-card">

        <div className="content-card-header">

          <div>

            <h2>
              Suspicious Activity
            </h2>

            <p>
              Communications requiring analyst review.
            </p>

          </div>

        </div>


        {loading ? (

          <div className="empty-state">
            Loading investigation data...
          </div>

        ) : communications.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              ✓
            </div>

            <h3>
              No suspicious communications
            </h3>

            <p>
              There are currently no communications
              requiring investigation.
            </p>

          </div>

        ) : (

          <div className="investigation-list">

            {communications.map((item, index) => {

              const risk =
                item.risk_level ||
                item.risk ||
                "Low";

              const message =
                item.message ||
                item.content ||
                "No message content available";

              const sender =
                item.sender ||
                item.username ||
                "Unknown";

              return (

                <div
                  className="investigation-row"
                  key={item.id || index}
                >

                  <div className="investigation-risk">

                    <span
                      className={`risk-dot ${getRiskClass(risk)}`}
                    />

                    <span
                      className={`risk-badge ${getRiskClass(risk)}`}
                    >
                      {String(risk).toUpperCase()}
                    </span>

                  </div>


                  <div className="investigation-content">

                    <strong>
                      {sender}
                    </strong>

                    <p>
                      {message}
                    </p>

                  </div>


                  <div className="investigation-action">

                    <button
                      onClick={() =>
                        navigate(
                          `/threat/${item.id || index + 1}`
                        )
                      }
                    >
                      Investigate →
                    </button>

                  </div>

                </div>

              );

            })}

          </div>

        )}

      </div>

    </div>

  );

}


export default Investigations;