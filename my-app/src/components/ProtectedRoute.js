// ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Check for token

  if (!token) {
    // If there's no token, redirect to the login page
    return <Navigate to="/" replace />;
  }

  return children; // Render the child components if authenticated
};

export default ProtectedRoute;
    