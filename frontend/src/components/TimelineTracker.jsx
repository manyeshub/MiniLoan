import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle, ShieldCheck, Building2, User, FileText } from 'lucide-react';

const TimelineTracker = ({ loan }) => {
  if (!loan) return null;

  const isRejected = loan.status.includes('rejected');
  const isBranchApproved = ['subadmin_approved', 'admin_approved'].includes(loan.status);
  const isHeadApproved = loan.status === 'admin_approved';

  const steps = [
    {
      id: 'step1',
      title: '1. Application Submitted',
      sub: 'Documents Uploaded',
      done: true,
      current: loan.status === 'submitted',
      error: false,
    },
    {
      id: 'step2',
      title: '2. Branch Verification',
      sub: 'Branch Manager (Subadmin)',
      done: isBranchApproved || (isRejected && loan.status === 'admin_rejected'),
      current: loan.status === 'submitted',
      error: loan.status === 'subadmin_rejected',
    },
    {
      id: 'step3',
      title: '3. Head Branch Review',
      sub: 'Central Admin Sanction',
      done: isHeadApproved,
      current: loan.status === 'subadmin_approved',
      error: loan.status === 'admin_rejected',
    },
    {
      id: 'step4',
      title: '4. Sanction & Disbursal',
      sub: 'Funds Credited',
      done: isHeadApproved,
      current: false,
      error: isRejected,
    },
  ];

  return (
    <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
      <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Clock size={18} color="var(--primary-600)" />
        2-Tier Loan Application Status Flow
      </h4>

      {/* Stepper Progress Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.5rem',
        background: '#f8fafc',
        padding: '1.25rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        marginBottom: '1.5rem',
      }}>
        {steps.map((step, idx) => {
          let stepBg = '#ffffff';
          let borderColor = '#e2e8f0';
          let textColor = 'var(--text-muted)';
          let icon = <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#cbd5e1' }} />;

          if (step.done) {
            stepBg = '#ecfdf5';
            borderColor = '#a7f3d0';
            textColor = '#065f46';
            icon = <CheckCircle2 size={18} color="#10b981" />;
          } else if (step.error) {
            stepBg = '#fef2f2';
            borderColor = '#fecaca';
            textColor = '#991b1b';
            icon = <XCircle size={18} color="#ef4444" />;
          } else if (step.current) {
            stepBg = '#eff6ff';
            borderColor = '#bfdbfe';
            textColor = '#1d4ed8';
            icon = <Clock size={18} color="#2563eb" className="animate-spin-slow" />;
          }

          return (
            <div
              key={step.id}
              style={{
                background: stepBg,
                border: `1.5px solid ${borderColor}`,
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 0.75rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s',
              }}
            >
              {icon}
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: textColor }}>
                {step.title}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {step.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Subadmin / Branch Review Details Box if reviewed */}
      {loan.subadminReview && loan.subadminReview.reviewedAt && (
        <div style={{
          background: loan.subadminReview.status === 'approved' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${loan.subadminReview.status === 'approved' ? '#bbf7d0' : '#fecaca'}`,
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: loan.subadminReview.status === 'approved' ? '#166534' : '#991b1b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building2 size={16} />
              Branch Manager Verification ({loan.subadminReview.reviewerName || 'Branch Officer'})
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {new Date(loan.subadminReview.reviewedAt).toLocaleString()}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#334155', margin: 0 }}>
            <strong>Remarks:</strong> {loan.subadminReview.remarks}
          </p>
        </div>
      )}

      {/* Admin / Head Office Review Details Box if reviewed */}
      {loan.adminReview && loan.adminReview.reviewedAt && (
        <div style={{
          background: loan.adminReview.status === 'approved' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${loan.adminReview.status === 'approved' ? '#a7f3d0' : '#fecaca'}`,
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: loan.adminReview.status === 'approved' ? '#065f46' : '#991b1b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} />
              Head Branch Executive Decision ({loan.adminReview.reviewerName || 'Head Office Admin'})
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {new Date(loan.adminReview.reviewedAt).toLocaleString()}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#334155', margin: 0 }}>
            <strong>Remarks:</strong> {loan.adminReview.remarks}
          </p>
        </div>
      )}

      {/* Complete Audit Timeline */}
      {loan.timeline && loan.timeline.length > 0 && (
        <div style={{ marginTop: '1.25rem' }}>
          <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Application Audit History
          </h5>
          <div className="timeline">
            {loan.timeline.map((event, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-title">{event.status}</div>
                <div className="timeline-meta">
                  By {event.actionBy} ({event.role}) • {new Date(event.timestamp).toLocaleString()}
                </div>
                <div className="timeline-desc">{event.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineTracker;
