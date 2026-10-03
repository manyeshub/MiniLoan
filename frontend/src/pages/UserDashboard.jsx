import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loanAPI } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import TimelineTracker from '../components/TimelineTracker';
import DocumentViewerModal from '../components/DocumentViewerModal';
import {
  Wallet,
  PlusCircle,
  Clock,
  Layers,
  FileText,
  AlertCircle,
  Eye,
  CreditCard,
  Building,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

const UserDashboard = () => {
  const { user, updateSavings } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoanForDocs, setSelectedLoanForDocs] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositMsg, setDepositMsg] = useState('');

  const fetchMyLoans = async () => {
    try {
      setLoading(true);
      const res = await loanAPI.getMyLoans();
      if (res.data.success) {
        setLoans(res.data.loans);
      }
    } catch (err) {
      console.error('Error fetching loans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLoans();
  }, []);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0) return;

    try {
      const res = await updateSavings(depositAmount, 'deposit');
      if (res.success) {
        setDepositMsg(`Successfully added ₹${Number(depositAmount).toLocaleString()} to your savings!`);
        setDepositAmount('');
        setTimeout(() => {
          setShowDepositModal(false);
          setDepositMsg('');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeLoan = loans.find((l) => !l.status.includes('rejected') && l.status !== 'admin_approved') || loans[0];
  const maxBorrowLimit = (user?.savingsBalance || 0) * 3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner: Member Welcome & Savings Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Member Profile Card */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#bfdbfe' }}>
                Cooperative Society Member
              </span>
              <h2 style={{ fontSize: '1.5rem', color: 'white', marginTop: '0.2rem' }}>{user?.name}</h2>
              <div style={{ fontSize: '0.85rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.3rem' }}>
                <Building size={14} /> {user?.branch || 'Downtown Mumbai Branch'} • A/C: {user?.accountNumber || 'MEM-839201'}
              </div>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={20} color="white" />
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#bfdbfe' }}>Current Savings Balance</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'white' }}>
                ₹{user?.savingsBalance?.toLocaleString() || 0}
              </div>
            </div>
            <button
              onClick={() => setShowDepositModal(true)}
              className="btn btn-sm"
              style={{ background: '#ffffff', color: '#1e3a8a', fontWeight: 700 }}
            >
              <TrendingUp size={14} /> Deposit / Top-up
            </button>
          </div>
        </div>

        {/* Borrowing Capacity & Quick Apply Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.15rem' }}>Your Loan Eligibility</h3>
              <span className="badge" style={{ background: '#dcfce7', color: '#166534' }}>
                3.0x Ratio Limit
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Based on your savings balance of ₹{user?.savingsBalance?.toLocaleString() || 0}, your standard loan borrowing limit without flag is:
            </p>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-700)', fontFamily: 'var(--font-heading)' }}>
              ₹{maxBorrowLimit.toLocaleString()}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Link to="/apply" className="btn btn-primary" style={{ flex: 1 }}>
              <PlusCircle size={18} /> Apply for Micro-Loan
            </Link>
          </div>
        </div>
      </div>

      {/* Active Loan Progress Stepper (if active loan exists) */}
      {activeLoan && (
        <div className="card" style={{ borderLeft: '4px solid var(--primary-600)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Loan Application
              </span>
              <h3 style={{ fontSize: '1.25rem', marginTop: '0.2rem' }}>
                #{activeLoan.applicationId} • ₹{activeLoan.requestedAmount?.toLocaleString()} ({activeLoan.loanPurpose})
              </h3>
            </div>
            <StatusBadge status={activeLoan.status} isExceedingRatio={activeLoan.isExceedingRatio} />
          </div>

          {/* Timeline Tracker */}
          <TimelineTracker loan={activeLoan} />

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              onClick={() => setSelectedLoanForDocs(activeLoan)}
              className="btn btn-outline btn-sm"
            >
              <Eye size={15} /> View Attached Documents ({activeLoan.documents?.length || 0})
            </button>
          </div>
        </div>
      )}

      {/* All Applications History Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>Application History & Records</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              All your submitted micro-loan requests and verification logs
            </p>
          </div>
          <button onClick={fetchMyLoans} className="btn btn-outline btn-sm">
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Loading applications...
          </div>
        ) : loans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <FileText size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
            <h4>No loan applications submitted yet</h4>
            <p style={{ fontSize: '0.88rem', marginTop: '0.25rem', marginBottom: '1.25rem' }}>
              Upload your KYC & income documents to apply for your first cooperative micro-loan.
            </p>
            <Link to="/apply" className="btn btn-primary btn-sm">
              <PlusCircle size={16} /> Apply for Loan Now
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Amount</th>
                  <th>Tenure</th>
                  <th>Monthly EMI</th>
                  <th>Savings Ratio</th>
                  <th>Status</th>
                  <th>Documents</th>
                  <th>Applied Date</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan._id}>
                    <td>
                      <strong>{loan.applicationId}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{loan.loanPurpose}</div>
                    </td>
                    <td>
                      <strong>₹{loan.requestedAmount?.toLocaleString()}</strong>
                    </td>
                    <td>{loan.tenureMonths} Mos</td>
                    <td>₹{loan.monthlyEmi?.toLocaleString()}/mo</td>
                    <td>
                      <span style={{ fontWeight: 700, color: loan.isExceedingRatio ? '#d97706' : '#059669' }}>
                        {loan.loanToSavingsRatio}x
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={loan.status} isExceedingRatio={loan.isExceedingRatio} />
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedLoanForDocs(loan)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        <Eye size={12} /> {loan.documents?.length || 0} Docs
                      </button>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {new Date(loan.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deposit Simulation Modal */}
      {showDepositModal && (
        <div className="modal-overlay" onClick={() => setShowDepositModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="card-header">
              <h3>Deposit to Savings Balance</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setShowDepositModal(false)}>✕</button>
            </div>

            {depositMsg ? (
              <div style={{ padding: '1rem', background: '#ecfdf5', color: '#065f46', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                {depositMsg}
              </div>
            ) : (
              <form onSubmit={handleDeposit}>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Simulate depositing funds to your savings balance. Increasing your savings balance will proportionally increase your safe loan borrowing capacity.
                </p>

                <div className="form-group">
                  <label className="form-label">Deposit Amount (₹)</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    className="form-input"
                    placeholder="e.g. 15000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowDepositModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Confirm Deposit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {selectedLoanForDocs && (
        <DocumentViewerModal
          documents={selectedLoanForDocs.documents}
          applicantName={selectedLoanForDocs.applicantName}
          onClose={() => setSelectedLoanForDocs(null)}
        />
      )}
    </div>
  );
};

export default UserDashboard;
