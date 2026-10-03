import React from 'react';
import { CheckCircle, Clock, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

const StatusBadge = ({ status, isExceedingRatio }) => {
  let badgeClass = 'badge-submitted';
  let icon = <Clock size={13} />;
  let label = 'Submitted';

  switch (status) {
    case 'submitted':
      badgeClass = 'badge-submitted';
      icon = <Clock size={13} />;
      label = 'Pending Branch Review';
      break;
    case 'subadmin_approved':
      badgeClass = 'badge-subadmin_approved';
      icon = <ShieldCheck size={13} />;
      label = 'Branch Verified (Sent to Head Office)';
      break;
    case 'admin_approved':
      badgeClass = 'badge-admin_approved';
      icon = <CheckCircle size={13} />;
      label = 'Sanctioned & Disbursed';
      break;
    case 'subadmin_rejected':
      badgeClass = 'badge-rejected';
      icon = <XCircle size={13} />;
      label = 'Branch Rejected';
      break;
    case 'admin_rejected':
      badgeClass = 'badge-rejected';
      icon = <XCircle size={13} />;
      label = 'Head Office Rejected';
      break;
    default:
      label = status;
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
      <span className={`badge ${badgeClass}`}>
        {icon}
        {label}
      </span>
      {isExceedingRatio && (
        <span className="badge badge-flagged" title="Exceeds 3.0x standard loan-to-savings ratio">
          <AlertTriangle size={13} />
          High Ratio Flagged
        </span>
      )}
    </div>
  );
};

export default StatusBadge;
