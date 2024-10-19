import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "../css/QrHistory.css"; // Your custom styles here

const QrHistory = () => {
  const [qrCodes, setQrCodes] = useState([]); // Initialize as an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  // Fetch QR codes from the server
  const fetchQrCodes = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/qrcodes", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include the token for authorization
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch QR codes");
      }

      const data = await response.json();
      console.log("Fetched data:", data); // Log the fetched data

      if (Array.isArray(data)) {
        setQrCodes(data); // Set qrCodes to data directly if it is an array
      } else {
        console.warn("Warning: Unexpected data structure", data);
        throw new Error("Unexpected data structure");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQrCodes();
  }, []);

  const handleBack = () => {
    navigate("/dashboard"); // Navigate back to dashboard
  };

  if (loading) {
    return <p className="loading">Loading...</p>;
  }

  if (error) {
    return <p className="error">Error: {error}</p>;
  }

  return (
    <div className="qr-history-container">
      <h2 className="qr-history-title">QR Code History</h2>
      <button className="back-button" onClick={handleBack}>
        Back to Dashboard
      </button>
      <table className="qr-history-table">
        <thead>
          <tr>
            <th>QR Code</th>
            <th>URL</th>
            <th>IP Address</th>
            <th>User Agent</th>
            <th>Location</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {qrCodes.length === 0 ? (
            <tr>
              <td colSpan="6">No QR codes found.</td>
            </tr>
          ) : (
            qrCodes.map((qr) => (
              <tr key={qr._id}>
                <td>
                  {/* Ensure qr.qrImage is a base64 string */}
                  <img src={`data:image/png;base64,${qr.qrImage}`} alt="QR Code" className="qr-code-img" />
                </td>
                <td>{qr.url}</td>
                {/* Display the latest scan details for each QR code */}
                {qr.scans && qr.scans.length > 0 ? (
                  qr.scans.map((scan, index) => (
                    <React.Fragment key={index}>
                      <td>{scan.ip}</td>
                      <td>{scan.userAgent}</td>
                      <td>{`${scan.latitude}, ${scan.longitude}`}</td>
                      <td>{new Date(scan.timestamp).toLocaleString()}</td>
                    </React.Fragment>
                  ))
                ) : (
                  <td colSpan="4">No scans recorded.</td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default QrHistory;
