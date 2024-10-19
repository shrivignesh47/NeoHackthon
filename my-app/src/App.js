// App.js
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import 'bootstrap/dist/css/bootstrap.min.css';
import ProtectedRoute from "./components/ProtectedRoute"; // Import the protected route
import QrHistory from "./components/Qrhistory";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
<Route
path="/qr-history"
element={
  <ProtectedRoute>
  <QrHistory />
  </ProtectedRoute>
  }
  />
      </Routes>
    </Router>
  );
};

export default App;
