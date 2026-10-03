import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import UserLogin from './pages/UserLogin';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import ApplyLoan from './pages/ApplyLoan';
import SubAdminLogin from './pages/SubAdminLogin';
import SubAdminDashboard from './pages/SubAdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { useAuth } from './context/AuthContext';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Verifying authorization credentials...
      </div>
    );
  }

  if (!isAuthenticated) {
    if (allowedRoles?.includes('admin')) {
      return <Navigate to="/admin" replace />;
    }
    if (allowedRoles?.includes('subadmin')) {
      return <Navigate to="/subadmin" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If admin is accessing subadmin dashboard, allow; otherwise redirect to role home
    if (user.role === 'admin' && allowedRoles.includes('subadmin')) {
      return children;
    }
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'subadmin') return <Navigate to="/subadmin/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Home */}
          <Route path="/" element={<Home />} />

          {/* Member / User Routes */}
          <Route path="/login" element={<UserLogin />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/apply"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <ApplyLoan />
              </ProtectedRoute>
            }
          />

          {/* Subadmin / Branch Manager Routes */}
          <Route path="/subadmin" element={<SubAdminLogin />} />
          <Route
            path="/subadmin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['subadmin', 'admin']}>
                <SubAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin / Head Office Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-light)',
        background: '#ffffff',
        padding: '1.5rem',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
      }}>
        <div>
          <strong>Micro-Loan Application & Tracking System</strong> • ITM Skills University B.Tech CSE Project
        </div>
        <div style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>
          Real-Time 2-Tier Hierarchy: Member &rarr; Branch Manager (/subadmin) &rarr; Head Office (/admin) • Node.js, Express.js, MongoDB & React
        </div>
      </footer>
    </div>
  );
}

export default App;
