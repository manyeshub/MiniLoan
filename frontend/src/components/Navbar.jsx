import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Landmark, User, LogOut, FileText, PlusCircle, ShieldCheck, Building, Wallet, Layers } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return (
        <span className="badge" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
          <ShieldCheck size={12} /> Head Admin
        </span>
      );
    }
    if (role === 'subadmin') {
      return (
        <span className="badge" style={{ background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' }}>
          <Building size={12} /> Branch Manager
        </span>
      );
    }
    return (
      <span className="badge" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
        <User size={12} /> Member
      </span>
    );
  };

  return (
    <header className="navbar">
      <div className="nav-inner">
        {/* Brand */}
        <Link to="/" className="brand-logo">
          <div className="brand-icon">
            <Landmark size={22} />
          </div>
          <div>
            <div>MicroLoan Track</div>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              COOPERATIVE CREDIT SOCIETY
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>

          {/* Member Links */}
          {isAuthenticated && user?.role === 'user' && (
            <>
              <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                <Layers size={16} /> My Dashboard
              </Link>
              <Link to="/apply" className={`nav-link ${location.pathname === '/apply' ? 'active' : ''}`}>
                <PlusCircle size={16} /> Apply Loan
              </Link>
            </>
          )}

          {/* Subadmin Links */}
          {isAuthenticated && user?.role === 'subadmin' && (
            <Link to="/subadmin/dashboard" className={`nav-link ${location.pathname === '/subadmin/dashboard' ? 'active' : ''}`}>
              <Building size={16} /> Branch Review Desk
            </Link>
          )}

          {/* Admin Links */}
          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin/dashboard" className={`nav-link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}>
              <ShieldCheck size={16} /> Head Branch Panel
            </Link>
          )}

          {/* User Profile / Portal Switchers / Auth Actions */}
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginLeft: '0.5rem' }}>
              {/* Savings Pill for Member */}
              {user.role === 'user' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'var(--primary-50)',
                  border: '1px solid var(--primary-200)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--primary-800)',
                }}>
                  <Wallet size={15} color="var(--primary-600)" />
                  Savings: ₹{user.savingsBalance?.toLocaleString() || 0}
                </div>
              )}

              {/* User Name & Role */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{user.name}</span>
                {getRoleBadge(user.role)}
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                title="Log Out"
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Member Login
              </Link>
              <Link to="/subadmin" className="btn btn-outline btn-sm" style={{ borderColor: '#bfdbfe', color: '#1e40af' }}>
                Branch Manager (/subadmin)
              </Link>
              <Link to="/admin" className="btn btn-primary btn-sm">
                Head Admin (/admin)
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
