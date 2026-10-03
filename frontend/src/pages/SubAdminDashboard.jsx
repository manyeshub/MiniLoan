import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { loanAPI } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import DocumentViewerModal from '../components/DocumentViewerModal';
import TimelineTracker from '../components/TimelineTracker';
import {
  Building,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  FileCheck,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Send,
} from 'lucide-react';

const SubAdminDashboard = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('submitted'); // Default: show pending branch review
  const [selectedLoanForDocs, setSelectedLoanForDocs] = useState(null);
  const [selectedLoanForTimeline, setSelectedLoanForTimeline] = useState(null);

  // Review modal state
  const [reviewingLoan, setReviewingLoan] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('approve'); // 'approve' | 'reject'
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  const fetchBranchLoans = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus && filterStatus !== 'all') {
        params.status = filterStatus;
      }
      const res = await loanAPI.getBranchLoans(params);
      if (res.data.success) {
        setLoans(res.data.loans);
      }
    } catch (err) {
      console.error('Error fetching branch loans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranchLoans();
  }, [filterStatus]);

  const handleOpenReview = (loan, decision) => {
    setReviewingLoan(loan);
    setReviewDecision(decision);
    setReviewRemarks(
      decision === 'approve'
        ? `All submitted documents (KYC, income proof, bank statement) verified at ${user?.branch || 'Branch'}. Found authentic and compliant. Forwarded to Head Branch.`
        : 'Application rejected due to incomplete or unverified income documents.'
    );
  };

  const handleConfirmReview = async (e) => {
    e.preventDefault();
    if (!reviewingLoan) return;

    setSubmittingReview(true);
    try {
      const res = await loanAPI.subadminReview(reviewingLoan._id, {
        decision: reviewDecision,
        remarks: reviewRemarks,
      });

      if (res.data.success) {
        setAlertMsg({
          type: 'success',
          text: reviewDecision === 'approve'
            ? `Loan #${reviewingLoan.applicationId} verified! File has been forwarded to Head Branch for final sanction.`
            : `Loan #${reviewingLoan.applicationId} rejected at branch level.`,
        });
        setReviewingLoan(null);
        fetchBranchLoans();
        setTimeout(() => setAlertMsg({ type: '', text: '' }), 4000);
      }
    } catch (err) {
      setAlertMsg({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to submit review.',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const pendingCount = loans.filter((l) => l.status === 'submitted').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Branch Header Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1e3a8a, #0284c7)', color: 'white', padding: '1.75rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#bfdbfe', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
              <Building size={16} /> Tier 1: Branch Review & Document Verification Desk
            </div>
            <h2 style={{ fontSize: '1.75rem', color: 'white', marginTop: '0.25rem' }}>
              {user?.branch || 'Downtown Mumbai Branch'} Desk
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#e0f2fe', marginTop: '0.2rem' }}>
              Logged in as Branch Manager: <strong>{user?.name}</strong> ({user?.email})
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: '#bfdbfe' }}>Pending Verifications</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>{pendingCount}</div>
          </div>
        </div>
      </div>

      {alertMsg.text && (
        <div style={{
          background: alertMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${alertMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: alertMsg.type === 'success' ? '#065f46' : '#991b1b',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          {alertMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {alertMsg.text}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setFilterStatus('submitted')}
          className={`btn btn-sm ${filterStatus === 'submitted' ? 'btn-primary' : 'btn-outline'}`}
        >
          <FileCheck size={15} /> Awaiting Branch Verification ({pendingCount})
        </button>
        <button
          onClick={() => setFilterStatus('subadmin_approved')}
          className={`btn btn-sm ${filterStatus === 'subadmin_approved' ? 'btn-primary' : 'btn-outline'}`}
        >
          Forwarded to Head Office
        </button>
        <button
          onClick={() => setFilterStatus('all')}
          className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline'}`}
        >
          All Applications
        </button>
      </div>

      {/* Applications List */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>Branch Loan Application Queue</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Inspect uploaded document proofs, check member savings ratio, and forward verified files to Head Office.
            </p>
          </div>
          <button onClick={fetchBranchLoans} className="btn btn-outline btn-sm">
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading branch applications...
          </div>
        ) : loans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <FileCheck size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
            <h4>No applications found matching this status</h4>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              All branch applications have been processed or none are assigned.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Application / Member</th>
                  <th>Loan Amount & Purpose</th>
                  <th>Savings & Ratio</th>
                  <th>Proofs Attached</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan._id}>
                    <td>
                      <strong>#{loan.applicationId}</strong>
                      <div style={{ fontWeight: 600, color: 'var(--primary-800)', marginTop: '0.2rem' }}>
                        {loan.applicantName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {loan.applicantEmail} • {loan.applicantPhone || 'No Phone'}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                        ₹{loan.requestedAmount?.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {loan.tenureMonths} Mos @ {loan.interestRate || 8.5}% (EMI: ₹{loan.monthlyEmi?.toLocaleString()})
                      </div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 500, color: '#475569', marginTop: '0.15rem' }}>
                        Purpose: {loan.loanPurpose}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        Savings: <strong>₹{loan.savingsBalanceAtApply?.toLocaleString() || 0}</strong>
                      </div>
                      <div style={{ marginTop: '0.25rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: loan.isExceedingRatio ? '#fef3c7' : '#d1fae5',
                            color: loan.isExceedingRatio ? '#92400e' : '#065f46',
                          }}
                        >
                          {loan.isExceedingRatio ? <ShieldAlert size={13} /> : null}
                          {loan.loanToSavingsRatio}x Ratio {loan.isExceedingRatio ? '(High)' : '(Safe)'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <button
                        onClick={() => setSelectedLoanForDocs(loan)}
                        className="btn btn-outline btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Eye size={14} /> View {loan.documents?.length || 0} Documents
                      </button>
                    </td>

                    <td>
                      <StatusBadge status={loan.status} isExceedingRatio={loan.isExceedingRatio} />
                    </td>

                    <td>
                      {loan.status === 'submitted' ? (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleOpenReview(loan, 'approve')}
                            className="btn btn-success btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }}
                            title="Verify documents and escalate to Head Office"
                          >
                            <Send size={13} /> Verify & Approve
                          </button>
                          <button
                            onClick={() => handleOpenReview(loan, 'reject')}
                            className="btn btn-danger btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }}
                            title="Reject at branch level"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedLoanForTimeline(loan)}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.78rem' }}
                        >
                          View Logs
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Approve / Reject Modal */}
      {reviewingLoan && (
        <div className="modal-overlay" onClick={() => setReviewingLoan(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {reviewDecision === 'approve' ? (
                  <CheckCircle size={22} color="#10b981" />
                ) : (
                  <XCircle size={22} color="#ef4444" />
                )}
                {reviewDecision === 'approve'
                  ? 'Verify Documents & Forward to Head Branch'
                  : 'Branch Level Application Rejection'}
              </h3>
              <button className="btn btn-outline btn-sm" onClick={() => setReviewingLoan(null)}>✕</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                <span>Applicant: <strong>{reviewingLoan.applicantName}</strong></span>
                <span>Amount: <strong>₹{reviewingLoan.requestedAmount?.toLocaleString()}</strong></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>Savings: ₹{reviewingLoan.savingsBalanceAtApply?.toLocaleString()}</span>
                <span>Ratio: <strong>{reviewingLoan.loanToSavingsRatio}x</strong></span>
              </div>
            </div>

            <form onSubmit={handleConfirmReview}>
              <div className="form-group">
                <label className="form-label">
                  Branch Officer Remarks / Document Verification Notes:
                </label>
                <textarea
                  rows={4}
                  required
                  className="form-textarea"
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setReviewingLoan(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className={`btn ${reviewDecision === 'approve' ? 'btn-success' : 'btn-danger'}`}
                >
                  {submittingReview
                    ? 'Processing...'
                    : reviewDecision === 'approve'
                    ? 'Confirm & Forward to Head Office'
                    : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      {selectedLoanForTimeline && (
        <div className="modal-overlay" onClick={() => setSelectedLoanForTimeline(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <h3>Application Audit Logs (#{selectedLoanForTimeline.applicationId})</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedLoanForTimeline(null)}>✕</button>
            </div>
            <TimelineTracker loan={selectedLoanForTimeline} />
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

export default SubAdminDashboard;
