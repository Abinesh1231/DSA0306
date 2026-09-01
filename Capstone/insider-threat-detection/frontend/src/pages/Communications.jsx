import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  uploadCommunications,
  getCommunications,
  analyzeAllCommunications,
} from "../services/api";


function Communications() {

  const [communications, setCommunications] =
    useState([]);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");


  const loadCommunications = async () => {

    try {

      const data =
        await getCommunications();

      setCommunications(data);

    } catch (error) {

      console.error(
        "Failed to load communications:",
        error
      );
    }
  };


  useEffect(() => {

    loadCommunications();

  }, []);


  const handleUpload = async () => {

    if (!selectedFile) {

      setMessage(
        "Please select a CSV file first."
      );

      return;
    }

    try {

      setLoading(true);
      setMessage("");

      const result =
        await uploadCommunications(
          selectedFile
        );

      setMessage(
        `${result.records_inserted} communications uploaded successfully.`
      );

      setSelectedFile(null);

      await loadCommunications();

    } catch (error) {

      setMessage(
        error.response?.data?.detail ||
        "Upload failed."
      );

    } finally {

      setLoading(false);
    }
  };


  const handleAnalyze = async () => {

    try {

      setLoading(true);
      setMessage("");

      const result =
        await analyzeAllCommunications();

      setMessage(
        `${result.analyzed} communications analyzed successfully.`
      );

      await loadCommunications();

    } catch (error) {

      setMessage(
        error.response?.data?.detail ||
        "Threat analysis failed."
      );

    } finally {

      setLoading(false);
    }
  };


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


  return (

    <div className="page">

      <div className="page-header">

        <div>

          <h1>
            Communications
          </h1>

          <p>
            Manage and analyze enterprise
            communications.
          </p>

        </div>

      </div>


      {/* Upload Section */}

      <div className="control-card">

        <div className="upload-area">

          <input
            type="file"
            accept=".csv"
            onChange={(e) =>
              setSelectedFile(
                e.target.files[0]
              )
            }
          />

          <button
            onClick={handleUpload}
            disabled={loading}
          >
            Upload CSV
          </button>

          <button
            className="analyze-button"
            onClick={handleAnalyze}
            disabled={loading}
          >
            Analyze All
          </button>

        </div>


        {message && (

          <div className="system-message">
            {message}
          </div>

        )}

      </div>


      {/* Statistics */}

      <div className="mini-stats">

        <div className="mini-card">

          <span>
            Total
          </span>

          <strong>
            {communications.length}
          </strong>

        </div>


        <div className="mini-card">

          <span>
            High Risk
          </span>

          <strong>

            {
              communications.filter(
                (item) =>
                  item.risk_level ===
                  "HIGH"
              ).length
            }

          </strong>

        </div>


        <div className="mini-card">

          <span>
            Critical
          </span>

          <strong>

            {
              communications.filter(
                (item) =>
                  item.risk_level ===
                  "CRITICAL"
              ).length
            }

          </strong>

        </div>

      </div>


      {/* Communication Table */}

      <div className="table-card">

        <div className="table-header">

          <h2>
            Communication Analysis
          </h2>

          <span>
            {communications.length} records
          </span>

        </div>


        <div className="table-container">

          <table>

            <thead>

              <tr>

                <th>ID</th>

                <th>Sender</th>

                <th>Message</th>

                <th>Risk Score</th>

                <th>Risk Level</th>

                <th>Category</th>
                <th>Action</th>

              </tr>

            </thead>


            <tbody>

              {communications.map(
                (item) => (

                  <tr key={item.id}>

                    <td>
                      #{item.id}
                    </td>

                    <td>
                      {item.sender}
                    </td>

                    <td className="message-cell">
                      {item.message}
                    </td>

                    <td>

                      {item.threat_score !==
                      null
                        ? `${item.threat_score}%`
                        : "—"}

                    </td>

                    <td>

                      <span
                        className={`risk-badge ${getRiskClass(
                          item.risk_level
                        )}`}
                      >
                        {item.risk_level}
                      </span>

                    </td>

                    <td>
                      {item.threat_category ||
                        "—"}
                    </td>
                    <td>

                      {item.threat_score !== null ? (

                        <Link
                          to={`/threat/${item.id}`}
                          className="investigate-button"
                        >
                          Investigate
                        </Link>

                      ) : (

                        <span className="not-analyzed">
                          Pending
                        </span>

                      )}

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>


          {communications.length === 0 && (

            <div className="empty-state">

              No communications found.

            </div>

          )}

        </div>

      </div>

    </div>
  );
}


export default Communications;