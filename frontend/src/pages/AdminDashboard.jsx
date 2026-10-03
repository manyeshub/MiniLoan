import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { loanAPI, adminAPI } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import DocumentViewerModal from '../components/DocumentViewerModal';
import TimelineTracker from '../components/TimelineTracker';
import {
  ShieldCheck,
  Building,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileCheck,
  Search,
  Filter,
  DollarSign,
  UserPlus,
  Trash2,
  Power,
  Eye,
  CreditCard,
  Layers,
  Sparkles,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();

  // Navigation tab: 'loans' | 'subadmins'
  const [activeTab, setActiveTab] = useState('loans');

  // Stats state
  const [stats, setStats] = useState(null);

  // Loans state
  const [loans, setLoans] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [statusFilter, setStatusFilter] = useState('subadmin_approved'); // Default: show verified files awaiting final sanction
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Subadmins state
  const [subadmins, setSubadmins] = useState([]);
  const [loadingSubadmins, setLoadingSubadmins] = useState(false);
  const [showAddSubadminModal, setShowAddSubadminModal] = useState(false);
  const [newSubadmin, setNewSubadmin] = useState({
    name: '',
    email: '',
    password: '',
    branch: 'Downtown Mumbai Branch',
    phone: '',
  });

  // Modal inspection states
  const [selectedLoanForDocs, setSelectedLoanForDocs] = useState(null);
  const [selectedLoanForTimeline, setSelectedLoanForTimeline] = useState(null);

  // Final Review Modal
  const [reviewingLoan, setReviewingLoan] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('approve'); // 'approve' | 'reject'
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Notification Banner
  const [banner, setBanner] = useState({ type: '', message: '' });

  // Load dashboard stats
  const fetchStats = async () => {
    try {
      const res = await adminAPI.getStats();
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  // Load all loans
  const fetchLoans = async () => {
    try {
      setLoadingLoans(true);
      const params = {};
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (flaggedOnly) params.flaggedOnly = 'true';
      if (searchTerm) params.search = searchTerm;

      const res = await loanAPI.getAllLoans(params);
      if (res.data.success) {
        setLoans(res.data.loans);
      }
    } catch (err) {
      console.error('Loans fetch error:', err);
    } finally {
      setLoadingLoans(false);
    }
  };

  // Load subadmins
  const fetchSubadmins = async () => {
    try {
      setLoadingSubadmins(true);
      const res = await adminAPI.getSubadmins();
      if (res.data.success) {
        setSubadmins(res.data.subadmins);
      }
    } catch (err) {
      console.error('Subadmins fetch error:', err);
    } finally {
      setLoadingSubadmins(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'loans') {
      fetchLoans();
    } else if (activeTab === 'subadmins') {
      fetchSubadmins();
    }
  }, [activeTab, statusFilter, flaggedOnly, searchTerm]);

  // Handle final sanction / reject
  const handleOpenSanctionModal = (loan, decision) => {
    setReviewingLoan(loan);
    setReviewDecision(decision);
    setReviewRemarks(
      decision === 'approve'
        ? `Final sanction approved. Branch verification verified. Amount ₹${loan.requestedAmount.toLocaleString()} authorized for immediate bank credit.`
        : 'Application rejected due to credit risk policy non-conformance.'
    );
  };

  const handleConfirmSanction = async (e) => {
    e.preventDefault();
    if (!reviewingLoan) return;

    setSubmittingReview(true);
    try {
      const res = await loanAPI.adminReview(reviewingLoan._id, {
        decision: reviewDecision,
        remarks: reviewRemarks,
      });

      if (res.data.success) {
        if (reviewDecision === 'approve') {
          // Trigger confetti explosion
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }

        setBanner({
          type: 'success',
          message: reviewDecision === 'approve'
            ? `🎉 Loan #${reviewingLoan.applicationId} officially Sanctioned & Disbursed!`
            : `Loan #${reviewingLoan.applicationId} has been rejected by Head Office.`,
        });

        setReviewingLoan(null);
        fetchLoans();
        fetchStats();
        setTimeout(() => setBanner({ type: '', message: '' }), 5000);
      }
    } catch (err) {
      setBanner({
        type: 'danger',
        message: err.response?.data?.message || 'Error processing sanction',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle create subadmin
  const handleCreateSubadmin = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAPI.createSubadmin(newSubadmin);
      if (res.data.success) {
        setBanner({
          type: 'success',
          message: `Branch Officer ${newSubadmin.name} (${newSubadmin.branch}) created successfully!`,
        });
        setShowAddSubadminModal(false);
        setNewSubadmin({
          name: '',
          email: '',
          password: '',
          branch: 'Downtown Mumbai Branch',
          phone: '',
        });
        fetchSubadmins();
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create subadmin');
    }
  };

  // Toggle subadmin active/inactive
  const handleToggleSubadmin = async (id) => {
    try {
      const res = await adminAPI.toggleSubadminStatus(id);
      if (res.data.success) {
        fetchSubadmins();
      }
    } catch (err) {
      alert('Failed to toggle status');
    }
  };

  // Delete subadmin
  const handleDeleteSubadmin = async (id) => {
    if (!window.confirm('Are you sure you want to revoke and delete this Subadmin account?')) return;
    try {
      const res = await adminAPI.deleteSubadmin(id);
      if (res.data.success) {
        fetchSubadmins();
        fetchStats();
      }
    } catch (err) {
      alert('Failed to delete subadmin');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', color: 'white', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fde68a', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <ShieldCheck size={18} /> Central Head Branch Executive Portal
            </div>
            <h1 style={{ fontSize: '2rem', color: 'white', marginTop: '0.35rem' }}>
              Head Office Operations & Sanction Authority
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
              Director: <strong>{user?.name}</strong> • Head Office Central
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setActiveTab('loans')}
              className={`btn btn-sm ${activeTab === 'loans' ? 'btn-primary' : 'btn-outline'}`}
              style={{ color: activeTab === 'loans' ? 'white' : '#ffffff', borderColor: 'rgba(255,255,255,0.4)', background: activeTab === 'loans' ? 'var(--primary-600)' : 'rgba(255,255,255,0.1)' }}
            >
              <CreditCard size={15} /> Loan Sanctions
            </button>
            <button
              onClick={() => setActiveTab('subadmins')}
              className={`btn btn-sm ${activeTab === 'subadmins' ? 'btn-primary' : 'btn-outline'}`}
              style={{ color: activeTab === 'subadmins' ? 'white' : '#ffffff', borderColor: 'rgba(255,255,255,0.4)', background: activeTab === 'subadmins' ? 'var(--primary-600)' : 'rgba(255,255,255,0.1)' }}
            >
              <Users size={15} /> Subadmin Authorization
            </button>
          </div>
        </div>
      </div>

      {banner.message && (
        <div style={{
          background: banner.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${banner.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: banner.type === 'success' ? '#065f46' : '#991b1b',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600,
        }}>
          {banner.type === 'success' ? <Sparkles size={20} color="#10b981" /> : <AlertTriangle size={20} />}
          {banner.message}
        </div>
      )}

      {/* System Metrics Grid */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
              <Layers size={24} />
            </div>
            <div>
              <div className="stat-val">{stats.totalApplications}</div>
              <div className="stat-lbl">Total Loan Requests</div>
            </div>
          </div>

          <div className="stat-card" style={{ borderLeft: '4px solid #0284c7' }}>
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <Building size={24} />
            </div>
            <div>
              <div className="stat-val">{stats.pendingBranchReview}</div>
              <div className="stat-lbl">Pending at Branch</div>
            </div>
          </div>

          <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <FileCheck size={24} />
            </div>
            <div>
              <div className="stat-val">{stats.pendingHeadOfficeReview}</div>
              <div className="stat-lbl">Awaiting Final Sanction</div>
            </div>
          </div>

          <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <div className="stat-val">₹{stats.totalDisbursedAmount?.toLocaleString() || 0}</div>
              <div className="stat-lbl">Total Disbursed Amount</div>
            </div>
          </div>

          <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
            <div className="stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="stat-val">{stats.flaggedLoansCount}</div>
              <div className="stat-lbl">High Ratio Flagged</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: LOAN SANCTIONS DESK */}
      {activeTab === 'loans' && (
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Central Loan Sanction Desk</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Final executive review for files verified and forwarded by Branch Managers
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input
                  type="text"
                  placeholder="Search App ID / Name..."
                  className="form-input"
                  style={{ paddingLeft: '32px', fontSize: '0.85rem', width: '210px' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button
                onClick={() => setFlaggedOnly(!flaggedOnly)}
                className={`btn btn-sm ${flaggedOnly ? 'btn-danger' : 'btn-outline'}`}
                style={{ fontSize: '0.8rem' }}
              >
                <AlertTriangle size={14} /> Flagged High Ratio Only
              </button>

              <button onClick={fetchLoans} className="btn btn-outline btn-sm">
                Refresh
              </button>
            </div>
          </div>

          {/* Status Sub-filter pills */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            <button
              onClick={() => setStatusFilter('subadmin_approved')}
              className={`btn btn-sm ${statusFilter === 'subadmin_approved' ? 'btn-primary' : 'btn-outline'}`}
            >
              Awaiting Final Sanction ({stats?.pendingHeadOfficeReview || 0})
            </button>
            <button
              onClick={() => setStatusFilter('submitted')}
              className={`btn btn-sm ${statusFilter === 'submitted' ? 'btn-primary' : 'btn-outline'}`}
            >
              At Branch Verification ({stats?.pendingBranchReview || 0})
            </button>
            <button
              onClick={() => setStatusFilter('admin_approved')}
              className={`btn btn-sm ${statusFilter === 'admin_approved' ? 'btn-primary' : 'btn-outline'}`}
            >
              Sanctioned & Disbursed ({stats?.approvedLoansCount || 0})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            >
              All Files ({stats?.totalApplications || 0})
            </button>
          </div>

          {loadingLoans ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Loading applications...
            </div>
          ) : loans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <FileCheck size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
              <h4>No loan applications found in this queue</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Try adjusting your search filters or status queue.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Loan / Applicant</th>
                    <th>Amount & Tenure</th>
                    <th>Branch & Officer Note</th>
                    <th>Ratio & Flag</th>
                    <th>Documents</th>
                    <th>Status</th>
                    <th>Sanction Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <tr key={loan._id}>
                      <td>
                        <strong>#{loan.applicationId}</strong>
                        <div style={{ fontWeight: 600, color: 'var(--primary-800)', marginTop: '0.15rem' }}>
                          {loan.applicantName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {loan.applicantEmail}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                          ₹{loan.requestedAmount?.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {loan.tenureMonths} Mos (EMI: ₹{loan.monthlyEmi?.toLocaleString()})
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                          {loan.loanPurpose}
                        </div>
                      </td>

                      <td style={{ maxWidth: '200px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-900)' }}>
                          <Building size={12} style={{ display: 'inline', marginRight: '3px' }} />
                          {loan.branch || 'Branch'}
                        </div>
                        {loan.subadminReview && loan.subadminReview.remarks && (
                          <div style={{ fontSize: '0.75rem', color: '#475569', background: '#f8fafc', padding: '0.3rem', borderRadius: '4px', marginTop: '0.2rem' }}>
                            <strong>Officer Note:</strong> {loan.subadminReview.remarks}
                          </div>
                        )}
                      </td>

                      <td>
                        <div style={{ fontSize: '0.82rem' }}>
                          Savings: ₹{loan.savingsBalanceAtApply?.toLocaleString()}
                        </div>
                        <div style={{ marginTop: '0.2rem' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              background: loan.isExceedingRatio ? '#fef3c7' : '#d1fae5',
                              color: loan.isExceedingRatio ? '#92400e' : '#065f46',
                            }}
                          >
                            {loan.isExceedingRatio && <AlertTriangle size={12} />}
                            {loan.loanToSavingsRatio}x Ratio
                          </span>
                        </div>
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

                      <td>
                        <StatusBadge status={loan.status} isExceedingRatio={loan.isExceedingRatio} />
                      </td>

                      <td>
                        {loan.status === 'subadmin_approved' ? (
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button
                              onClick={() => handleOpenSanctionModal(loan, 'approve')}
                              className="btn btn-success btn-sm"
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
                            >
                              <CheckCircle size={12} /> Sanction & Disburse
                            </button>
                            <button
                              onClick={() => handleOpenSanctionModal(loan, 'reject')}
                              className="btn btn-danger btn-sm"
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedLoanForTimeline(loan)}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.75rem' }}
                          >
                            Audit Trail
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
      )}

      {/* TAB 2: SUBADMIN AUTHORIZATION & BRANCH MANAGERS */}
      {activeTab === 'subadmins' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Subadmin Authorization & Branch Access Management</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Create, authorize, and manage Branch Manager accounts across cooperative society branches
              </p>
            </div>
            <button
              onClick={() => setShowAddSubadminModal(true)}
              className="btn btn-primary btn-sm"
            >
              <UserPlus size={16} /> Authorize New Subadmin
            </button>
          </div>

          {loadingSubadmins ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Loading subadmins...
            </div>
          ) : subadmins.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Users size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
              <h4>No Subadmin / Branch Officer Accounts Found</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Click 'Authorize New Subadmin' above to assign a Branch Manager.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Officer Name</th>
                    <th>Email Address</th>
                    <th>Assigned Branch</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Created On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subadmins.map((sub) => (
                    <tr key={sub._id}>
                      <td>
                        <strong>{sub.name}</strong>
                      </td>
                      <td>{sub.email}</td>
                      <td>
                        <span className="badge" style={{ background: '#dbeafe', color: '#1e40af' }}>
                          <Building size={12} /> {sub.branch}
                        </span>
                      </td>
                      <td>{sub.phone || 'N/A'}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: sub.isActive ? '#ecfdf5' : '#fef2f2',
                            color: sub.isActive ? '#065f46' : '#991b1b',
                          }}
                        >
                          {sub.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleToggleSubadmin(sub._id)}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                            title={sub.isActive ? 'Deactivate Account' : 'Activate Account'}
                          >
                            <Power size={13} color={sub.isActive ? '#d97706' : '#10b981'} />
                            {sub.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteSubadmin(sub._id)}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#dc2626' }}
                            title="Delete Subadmin Account"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Subadmin Modal */}
      {showAddSubadminModal && (
        <div className="modal-overlay" onClick={() => setShowAddSubadminModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="card-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={20} color="var(--primary-600)" />
                Authorize New Subadmin (Branch Officer)
              </h3>
              <button className="btn btn-outline btn-sm" onClick={() => setShowAddSubadminModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateSubadmin}>
              <div className="form-group">
                <label className="form-label">Officer Full Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Priya Sharma"
                  value={newSubadmin.name}
                  onChange={(e) => setNewSubadmin({ ...newSubadmin, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Officer Email (Login username)</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="e.g. priya.branch@microloan.com"
                  value={newSubadmin.email}
                  onChange={(e) => setNewSubadmin({ ...newSubadmin, email: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="form-input"
                    placeholder="Min 6 chars"
                    value={newSubadmin.password}
                    onChange={(e) => setNewSubadmin({ ...newSubadmin, password: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="98XXXXXXXX"
                    value={newSubadmin.phone}
                    onChange={(e) => setNewSubadmin({ ...newSubadmin, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Branch</label>
                <select
                  className="form-select"
                  value={newSubadmin.branch}
                  onChange={(e) => setNewSubadmin({ ...newSubadmin, branch: e.target.value })}
                >
                  <option value="Downtown Mumbai Branch">Downtown Mumbai Branch</option>
                  <option value="North Suburb Branch">North Suburb Branch</option>
                  <option value="Navi Mumbai Branch">Navi Mumbai Branch</option>
                  <option value="Pune Rural Branch">Pune Rural Branch</option>
                  <option value="Thane Regional Branch">Thane Regional Branch</option>
                  <option value="All Branches">All Branches (Regional Inspector)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddSubadminModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Authorize & Create Subadmin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Head Office Sanction / Reject Modal */}
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
                  ? 'Head Office Final Sanction & Fund Disbursal'
                  : 'Head Office Loan Rejection'}
              </h3>
              <button className="btn btn-outline btn-sm" onClick={() => setReviewingLoan(null)}>✕</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
                <span>Applicant: <strong>{reviewingLoan.applicantName}</strong></span>
                <span style={{ fontSize: '1.1rem', color: 'var(--primary-800)', fontWeight: 800 }}>
                  ₹{reviewingLoan.requestedAmount?.toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>Branch: {reviewingLoan.branch}</span>
                <span>Savings: ₹{reviewingLoan.savingsBalanceAtApply?.toLocaleString()} ({reviewingLoan.loanToSavingsRatio}x Ratio)</span>
              </div>
              {reviewingLoan.isExceedingRatio && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#92400e', background: '#fef3c7', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                  ⚠️ <strong>Ratio Risk Note:</strong> Loan is {reviewingLoan.loanToSavingsRatio}x of member savings (exceeds 3.0x standard threshold).
                </div>
              )}
            </div>

            <form onSubmit={handleConfirmSanction}>
              <div className="form-group">
                <label className="form-label">
                  Executive Sanction Order / Remarks:
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
                    ? 'Authorize Sanction & Disburse'
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
              <h3>Full Application Audit Trail (#{selectedLoanForTimeline.applicationId})</h3>
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

export default AdminDashboard;
