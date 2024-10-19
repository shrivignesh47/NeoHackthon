import React from "react";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaBell, FaUser, FaHome } from "react-icons/fa"; // Import icons from react-icons
import { AiOutlineHistory } from "react-icons/ai"; // Import history icon
import "../css/Navbar.css"; // Custom CSS for Navbar

const DashboardNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the JWT token
    navigate("/"); // Redirect to login page
  };

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Container className="d-flex justify-content-between align-items-center">
        {/* Logo and Title on the Left */}
        <Navbar.Brand href="/dashboard" className="d-flex align-items-center">
          <span className="ms-2">My Dashboard</span>
        </Navbar.Brand>

        {/* Navigation Links on the Right */}
        <Nav className="nav-left ms-auto">
          <Nav.Link href="/dashboard" className="navbar-icons">
            <FaHome className="nav-icon" /> Home
          </Nav.Link>
          <Nav.Link href="/qr-history" className="navbar-icons">
            <AiOutlineHistory className="nav-icon" /> QR Code History
          </Nav.Link>
          <Nav.Link href="/notifications" className="navbar-icons">
            <FaBell className="nav-icon" /> Notifications
          </Nav.Link>
          <NavDropdown
            title={
              <span className="navbar-icons">
                <FaUser className="nav-icon" /> Profile
              </span>
            }
            id="basic-nav-dropdown"
          >
            <NavDropdown.Item href="/profile">View Profile</NavDropdown.Item>
            <NavDropdown.Item href="/settings">Settings</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default DashboardNavbar;
