import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../css/QrCode.css"; // Your custom styles here

const QrCodeGenerator = () => {
  const [url, setUrl] = useState("");
  const [qrData, setQrData] = useState(null);
  const [fgColor, setFgColor] = useState("#000000"); // Foreground color for dynamic QR
  const [bgColor, setBgColor] = useState("#ffffff"); // Background color for dynamic QR
  const [dynamicUrl, setDynamicUrl] = useState(""); // Dynamic URL input
  const [pattern, setPattern] = useState("default"); // Pattern selection for dynamic QR
  const [isDynamic, setIsDynamic] = useState(false); // Toggle between dynamic and custom QR

  // Validate URL format
  const isValidUrl = (string) => {
    const res = string.match(/(http|https):\/\/[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+(:[0-9]{1,5})?(\/.*)?/);
    return res !== null;
  };

  // Function to get user location
  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }, reject);
      } else {
        reject(new Error("Geolocation is not supported by this browser."));
      }
    });
  };

  // Handle QR code generation
  const handleGenerateQrCode = async () => {
    if (isValidUrl(dynamicUrl.trim())) {
      const { latitude, longitude } = await getUserLocation();
      const trackingUrl = `http://192.168.29.46:5000/api/track?url=${encodeURIComponent(dynamicUrl)}&latitude=${latitude}&longitude=${longitude}`;
      setQrData(trackingUrl); // Set the QR code data to the tracking URL
    } else {
      alert("Please enter a valid URL (starting with http:// or https://)");
    }
  };

  // Handle QR code download
  const downloadQRCode = async (format) => {
    const qrCodeElement = document.getElementById("qrCode");
    if (!qrCodeElement) return;
    const canvas = await html2canvas(qrCodeElement);
    if (format === "png") {
      const link = document.createElement("a");
      link.download = "qr-code.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } else if (format === "pdf") {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, "PNG", 15, 40, 180, 160);
      pdf.save("qr-code.pdf");
    }
  };

  // Save QR code to the database
  const saveQRCodeToDB = async (qrImage) => {
    try {
      const response = await fetch("http://localhost:5000/api/qrcodes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ url, qrImage }),
      });

      if (!response.ok) {
        throw new Error("Failed to save QR code");
      }

      alert("QR Code saved successfully!");
    } catch (error) {
      alert(`Error saving QR Code: ${error.message}`);
    }
  };

  // Generate QR code and save it to DB
  const handleGenerateAndSave = async () => {
    if (isValidUrl(url.trim())) {
      const { latitude, longitude } = await getUserLocation();
      const trackingUrl = `http://192.168.29.46:5000/api/track?url=${encodeURIComponent(url)}&latitude=${latitude}&longitude=${longitude}`;
      setQrData(trackingUrl);

      // Capture QR code as image
      const qrCodeElement = document.getElementById("qrCode");
      if (qrCodeElement) {
        const canvas = await html2canvas(qrCodeElement);
        const qrImage = canvas.toDataURL("image/png");
        await saveQRCodeToDB(qrImage);
      }
    } else {
      alert("Please enter a valid URL (starting with http:// or https://)");
    }
  };

  return (
    <div className="qr-container">
      <h2 className="qr-title">QR Code Generator</h2>

      {/* Toggle Switch for Dynamic and Custom QR */}
      <div className="qr-toggle">
        <label>
          <input
            type="checkbox"
            checked={isDynamic}
            onChange={() => setIsDynamic(!isDynamic)}
          />
          {isDynamic ? "Switch to Custom QR Code" : "Switch to Dynamic QR Code"}
        </label>
      </div>

      {/* Conditional Rendering based on isDynamic */}
      {isDynamic ? (
        <div className="dynamic-qr-container">
          <input
            type="text"
            placeholder="Enter Dynamic URL (http:// or https://)"
            value={dynamicUrl}
            onChange={(e) => setDynamicUrl(e.target.value)}
            className="qr-input"
          />
          <div className="pattern-selection">
            <label>Choose a Pattern:</label>
            <select value={pattern} onChange={(e) => setPattern(e.target.value)}>
              <option value="default">Default</option>
              <option value="stripes">Stripes</option>
              <option value="dots">Dots</option>
              <option value="waves">Waves</option>
              <option value="checkerboard">Checkerboard</option>
              <option value="gradient">Gradient</option>
            </select>
          </div>
          <div className="qr-color-picker">
            <label>Foreground Color:</label>
            <input
              type="color"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
            />
          </div>
          <button className="qr-generate-btn" onClick={handleGenerateQrCode}>
            Generate Dynamic QR Code
          </button>
        </div>
      ) : (
        <div className="custom-qr-container">
          <input
            type="text"
            placeholder="Enter Custom URL (http:// or https://)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="qr-input"
          />
          <button className="qr-generate-btn" onClick={handleGenerateAndSave}>
            Generate and Save Custom QR Code
          </button>
        </div>
      )}

      {/* Show QR result and download options if QR is generated */}
      {qrData && (
        <div className="qr-result">
          <div id="qrCode" className={`qr-display pattern-${pattern}`}>
            <QRCodeCanvas 
              value={qrData} 
              size={256} 
              bgColor={bgColor} 
              fgColor={fgColor} 
            />
          </div>
          <div className="qr-download-buttons">
            <button className="qr-download-btn" onClick={() => downloadQRCode("png")}>
              Download as PNG
            </button>
            <button className="qr-download-btn" onClick={() => downloadQRCode("pdf")}>
              Download as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QrCodeGenerator;
