import React from 'react';
import { AlertCircle, CheckCircle2, TrendingUp, ShieldAlert } from 'lucide-react';

const SavingsRatioIndicator = ({ requestedAmount, savingsBalance, maxAllowedRatio = 3.0 }) => {
  const amount = Number(requestedAmount) || 0;
  const savings = Number(savingsBalance) || 0;

  const ratio = savings > 0 ? (amount / savings).toFixed(2) : amount > 0 ? 99 : 0;
  const isExceeded = Number(ratio) > maxAllowedRatio;
  const maxSafeLoan = savings * maxAllowedRatio;

  // Percentage for progress bar (capped at 100% of 5x scale)
  const percentage = Math.min(Math.round((Number(ratio) / 5) * 100), 100);

  return (
    <div style={{
      background: isExceeded ? '#fffbeb' : '#f8fafc',
      border: `1.5px solid ${isExceeded ? '#fde68a' : '#e2e8f0'}`,
      borderRadius: 'var(--radius-md)',
      padding: '1rem 1.25rem',
      marginTop: '0.75rem',
      marginBottom: '1rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', color: isExceeded ? '#92400e' : '#1e3a8a' }}>
          {isExceeded ? <ShieldAlert size={18} color="#d97706" /> : <TrendingUp size={18} color="#2563eb" />}
          Loan-to-Savings Ratio Eligibility Check
        </div>
        <div style={{
          fontSize: '1rem',
          fontWeight: 800,
          color: isExceeded ? '#b45309' : '#059669',
          background: isExceeded ? '#fef3c7' : '#d1fae5',
          padding: '0.2rem 0.6rem',
          borderRadius: '6px'
        }}>
          {ratio}x
        </div>
      </div>

      {/* Progress meter */}
      <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', margin: '0.5rem 0' }}>
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            background: isExceeded
              ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
              : 'linear-gradient(90deg, #10b981, #3b82f6)',
            transition: 'width 0.4s ease',
            borderRadius: '999px',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
        <span>Member Savings: ₹{savings.toLocaleString()}</span>
        <span>Standard Max (3.0x): ₹{maxSafeLoan.toLocaleString()}</span>
        <span>Requested: ₹{amount.toLocaleString()}</span>
      </div>

      <div style={{
        marginTop: '0.6rem',
        fontSize: '0.82rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        color: isExceeded ? '#92400e' : '#065f46',
        fontWeight: 500,
      }}>
        {isExceeded ? (
          <>
            <AlertCircle size={15} color="#d97706" />
            <span>
              <strong>Application Flagged:</strong> Requested amount is {ratio}x of your savings balance (exceeds standard 3x limit). Branch & Head Office will review with scrutiny.
            </span>
          </>
        ) : (
          <>
            <CheckCircle2 size={15} color="#059669" />
            <span>
              <strong>Eligible:</strong> Within the standard safe limit ({ratio}x ≤ {maxAllowedRatio}x). Instant eligibility verified!
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default SavingsRatioIndicator;
