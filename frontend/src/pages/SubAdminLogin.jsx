import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building, LogIn, AlertCircle, Shield } from 'lucide-react';

const SubAdminLogin = () => {
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
      await login(email, password, 'subadmin');
      navigate('/subadmin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Branch Manager login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail('subadmin@microloan.com');
    setPassword('subadmin123');
  };

  return (
    <div style={{ maxWidth: '440px', margin: '2rem auto' }}>
      <div className="card" style={{ padding: '2.25rem', borderTop: '4px solid #2563eb' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#dbeafe',
            color: '#1e40af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <Building size={24} />
          </div>
          <span className="badge badge-subadmin_approved" style={{ marginBottom: '0.4rem' }}>
            Branch Officer Portal
          </span>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Branch Manager Login</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Document verification & branch credit assessment desk
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
            <label className="form-label">Branch Officer Email</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="e.g. subadmin@microloan.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
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
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {loading ? 'Verifying Branch Access...' : (
              <>
                <LogIn size={18} /> Access Branch Desk
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
            ⚡ Auto-Fill Demo Branch Manager (subadmin@microloan.com)
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Looking for Head Office? <Link to="/admin" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Head Branch Login (/admin)</Link>
        </div>
      </div>
    </div>
  );
};

export default SubAdminLogin;
