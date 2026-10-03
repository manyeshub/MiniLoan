import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogIn, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, 'admin');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Head Admin login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail('admin@microloan.com');
    setPassword('admin123');
  };

  return (
    <div style={{ maxWidth: '440px', margin: '2rem auto' }}>
      <div className="card" style={{ padding: '2.25rem', borderTop: '4px solid #1e3a8a' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#fef3c7',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <ShieldCheck size={26} />
          </div>
          <span className="badge badge-admin_approved" style={{ marginBottom: '0.4rem' }}>
            Head Office Central Authority
          </span>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Central Admin Login</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Head branch final loan sanction, risk oversight & subadmin authorization
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Head Office Admin Email</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="e.g. admin@microloan.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Admin Password</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', background: '#1e3a8a' }}
          >
            {loading ? 'Authenticating Head Office...' : (
              <>
                <LogIn size={18} /> Sign In as Head Admin
              </>
            )}
          </button>
        </form>

        {/* Quick fill demo credentials */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ width: '100%', fontSize: '0.82rem' }}
            onClick={handleQuickDemo}
          >
            ⚡ Auto-Fill Central Admin (admin@microloan.com)
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Branch Manager? <Link to="/subadmin" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Branch Login (/subadmin)</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
