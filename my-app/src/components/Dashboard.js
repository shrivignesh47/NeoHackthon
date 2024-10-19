import React from "react";
import DashboardNavbar from "./Navbar"; // Adjust the path as necessary
import QrCodeGenerator from "./Qrcode";

const Dashboard = () => {
  return (
    <div>
      <DashboardNavbar />
      <div className="dashboard-content">
          <QrCodeGenerator/>
      </div>
    </div>
  );
};

export default Dashboard;
