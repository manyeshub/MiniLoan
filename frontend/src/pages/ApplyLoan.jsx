import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loanAPI } from '../api/client';
import SavingsRatioIndicator from '../components/SavingsRatioIndicator';
import { PlusCircle, UploadCloud, FileCheck2, AlertCircle, ArrowLeft, Landmark, CheckCircle } from 'lucide-react';

const ApplyLoan = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requestedAmount, setRequestedAmount] = useState(60000);
  const [tenureMonths, setTenureMonths] = useState(12);
  const [loanPurpose, setLoanPurpose] = useState('Small Business Expansion');
  const [branch, setBranch] = useState(user?.branch || 'Downtown Mumbai Branch');

  // File states
  const [idProof, setIdProof] = useState(null);
  const [incomeProof, setIncomeProof] = useState(null);
  const [bankStatement, setBankStatement] = useState(null);
  const [addressProof, setAddressProof] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const savings = user?.savingsBalance || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!idProof && !incomeProof && !bankStatement) {
      setError('Please attach at least one supporting document (e.g., ID Proof or Income Slip).');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('requestedAmount', requestedAmount);
      formData.append('tenureMonths', tenureMonths);
      formData.append('loanPurpose', loanPurpose);
      formData.append('branch', branch);

      if (idProof) formData.append('idProof', idProof);
      if (incomeProof) formData.append('incomeProof', incomeProof);
      if (bankStatement) formData.append('bankStatement', bankStatement);
      if (addressProof) formData.append('addressProof', addressProof);

      const res = await loanAPI.applyLoan(formData);

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit loan application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/dashboard')}
        className="btn btn-outline btn-sm"
        style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlusCircle size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>Micro-Loan Application Form</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Cooperative Credit Society • Digital Verification & Instant Tracking
            </p>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', textAlign: 'center' }}>
            <CheckCircle size={32} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
            <h3 style={{ fontSize: '1.15rem' }}>Loan Application Successfully Submitted!</h3>
            <p style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Your file has been assigned to <strong>{branch}</strong> for document verification. Redirecting to your dashboard...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Loan Details */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary-900)' }}>
              1. Loan Requirements
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Requested Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="5000"
                  max="1000000"
                  step="1000"
                  className="form-input"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Repayment Tenure (Months)</label>
                <select
                  className="form-select"
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(Number(e.target.value))}
                >
                  <option value={6}>6 Months (Half-Yearly)</option>
                  <option value={12}>12 Months (1 Year)</option>
                  <option value={18}>18 Months (1.5 Years)</option>
                  <option value={24}>24 Months (2 Years)</option>
                  <option value={36}>36 Months (3 Years)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Loan Purpose / Category</label>
                <select
                  className="form-select"
                  value={loanPurpose}
                  onChange={(e) => setLoanPurpose(e.target.value)}
                >
                  <option value="Small Business Expansion">Small Business Expansion</option>
                  <option value="Agricultural Equipment & Seeds">Agricultural Equipment & Seeds</option>
                  <option value="Home Renovation / Repair">Home Renovation / Repair</option>
                  <option value="Education / Skill Training">Education / Skill Training</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Handicraft & Artisan Workshop">Handicraft & Artisan Workshop</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Processing Branch</label>
                <input
                  type="text"
                  className="form-input"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                />
              </div>
            </div>

            {/* Savings Ratio Indicator */}
            <SavingsRatioIndicator requestedAmount={requestedAmount} savingsBalance={savings} maxAllowedRatio={3.0} />
          </div>

          {/* Section 2: Document Uploads (Multer) */}
          <div style={{ marginBottom: '2rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary-900)' }}>
              2. Supporting Document Proofs (Multer Upload)
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Upload required verification proofs (PDF, JPG, PNG). These will be scrutinized by the Branch Manager before escalation.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {/* ID Proof */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Aadhar Card / PAN Card (ID Proof) *
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="form-input"
                  onChange={(e) => setIdProof(e.target.files[0])}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                  {idProof ? `Selected: ${idProof.name}` : 'Govt issued identity proof'}
                </span>
              </div>

              {/* Income Proof */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Income Proof / Salary Slip / ITR
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="form-input"
                  onChange={(e) => setIncomeProof(e.target.files[0])}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                  {incomeProof ? `Selected: ${incomeProof.name}` : 'Monthly income proof / certificate'}
                </span>
              </div>

              {/* Bank Statement */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Bank Statement (Last 6 Months)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="form-input"
                  onChange={(e) => setBankStatement(e.target.files[0])}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                  {bankStatement ? `Selected: ${bankStatement.name}` : 'Recent banking transactions'}
                </span>
              </div>

              {/* Address Proof */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Address Proof (Electricity/Ration)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="form-input"
                  onChange={(e) => setAddressProof(e.target.files[0])}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                  {addressProof ? `Selected: ${addressProof.name}` : 'Residential verification proof'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="btn btn-primary"
            >
              {loading ? 'Submitting & Uploading Files...' : 'Submit Loan Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLoan;
