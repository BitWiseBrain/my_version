import React, { Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TorchApp from './torch/TorchApp';
import DashboardApp from './dashboard/DashboardApp';
import Login from './pages/Login';

// --- 1. Robust Error Boundary ---
// Prevents the "Blank Page" if any sub-component crashes
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("[ANKURAH CRASH]", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={errorContainerStyle}>
          <h2 style={{ color: '#ef4444' }}>⚠️ SYSTEM CRITICAL ERROR</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            The application encountered a runtime error. 
            Redirecting to safety...
          </p>
          <button 
            style={errorButtonStyle}
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
          >
            RESET & RETURN TO LOGIN
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const errorContainerStyle = {
  backgroundColor: '#05070a',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  fontFamily: 'sans-serif'
};

const errorButtonStyle = {
  padding: '12px 24px',
  backgroundColor: '#1e40af',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer'
};

// --- 2. Deterministic Routing Logic ---

const ProtectedRoute = ({ children, allowedRole }) => {
  const currentRole = localStorage.getItem("ankurah_role");
  
  if (!currentRole) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRole && currentRole !== allowedRole) {
    const target = currentRole === "police" ? "/dashboard" : "/torch";
    return <Navigate to={target} replace />;
  }
  
  return children;
};

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Explicit Login Page */}
          <Route path="/login" element={<Login />} />

          {/* Victim Stealth Interface */}
          <Route 
            path="/torch" 
            element={
              <ProtectedRoute allowedRole="victim">
                <TorchApp />
              </ProtectedRoute>
            } 
          />

          {/* Police Command Center */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRole="police">
                <DashboardApp />
              </ProtectedRoute>
            } 
          />

          {/* Root Redirect based on Auth State */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
