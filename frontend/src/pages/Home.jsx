import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Landmark, ShieldCheck, FileCheck, ArrowRight, TrendingUp, Users, CheckCircle2, Building, DollarSign, Calculator } from 'lucide-react';
import SavingsRatioIndicator from '../components/SavingsRatioIndicator';

const Home = () => {
  const [calcSavings, setCalcSavings] = useState(30000);
  const [calcLoan, setCalcLoan] = useState(75000);
  const [calcTenure, setCalcTenure] = useState(12);

  const interestRate = 8.5;
  const monthlyRate = interestRate / 12 / 100;
  const emi = Math.round((calcLoan * monthlyRate * Math.pow(1 + monthlyRate, calcTenure)) / (Math.pow(1 + monthlyRate, calcTenure) - 1));
  const totalPayment = emi * calcTenure;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)',
        color: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: '3.5rem 2.5rem',
        boxShadow: 'var(--shadow-xl)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            padding: '0.4rem 0.9rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
          }}>
            <Landmark size={16} /> Cooperative Credit Society Automation
          </div>

          <h1 style={{ fontSize: '2.75rem', lineHeight: 1.15, color: 'white', marginBottom: '1.25rem' }}>
            Micro-Loan Application & Real-Time Tracking System
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#e0e7ff', lineHeight: 1.6, marginBottom: '2rem' }}>
            Empowering cooperative society members with instant digital loan applications, automated loan-to-savings ratio risk validation, multi-proof document uploads, and a seamless 2-tier approval hierarchy (Branch Manager &rarr; Head Office).
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/apply" className="btn btn-lg" style={{ background: '#ffffff', color: '#1e3a8a', fontWeight: 700 }}>
              Apply for Loan <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-lg btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)' }}>
              Member Portal
            </Link>
            <Link to="/subadmin" className="btn btn-lg btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)' }}>
              Branch Desk (/subadmin)
            </Link>
            <Link to="/admin" className="btn btn-lg btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)' }}>
              Head Office (/admin)
            </Link>
          </div>
        </div>
      </section>

      {/* 2-Tier Real-Time Loan Workflow Highlights */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>
            Real-Time 2-Tier Approval Architecture
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Transparent credit appraisal workflow engineered for cooperative banking
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ borderTop: '4px solid var(--primary-600)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>1. Member Application</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Member submits loan request and uploads supporting proofs (Aadhar, Income Certificate, Bank Statement) via Multer document engine.
            </p>
          </div>

          <div className="card" style={{ borderTop: '4px solid #0284c7' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Building size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>2. Branch Verification (/subadmin)</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Branch Manager inspects documents, verifies applicant savings ratio, and approves application file to Head Branch or rejects with remarks.
            </p>
          </div>

          <div className="card" style={{ borderTop: '4px solid #10b981' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>3. Head Branch Sanction (/admin)</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Central Admin conducts final credit assessment, reviews high-risk ratio flags, executes final sanction & disbursement, and manages subadmins.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Live Eligibility & Ratio Calculator */}
      <section className="card" style={{ background: '#ffffff', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
          <Calculator size={26} color="var(--primary-600)" />
          <div>
            <h2 style={{ fontSize: '1.35rem' }}>Interactive Loan Eligibility & Ratio Simulator</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Test how requested loan amount and savings balance calculate the loan-to-savings ratio and monthly EMI.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div>
            <div className="form-group">
              <label className="form-label">Member Savings Balance (₹): {calcSavings.toLocaleString()}</label>
              <input
                type="range"
                min="5000"
                max="200000"
                step="5000"
                value={calcSavings}
                onChange={(e) => setCalcSavings(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Requested Loan Amount (₹): {calcLoan.toLocaleString()}</label>
              <input
                type="range"
                min="5000"
                max="500000"
                step="5000"
                value={calcLoan}
                onChange={(e) => setCalcLoan(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tenure: {calcTenure} Months</label>
              <input
                type="range"
                min="3"
                max="36"
                step="1"
                value={calcTenure}
                onChange={(e) => setCalcTenure(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <SavingsRatioIndicator requestedAmount={calcLoan} savingsBalance={calcSavings} maxAllowedRatio={3.0} />

            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Monthly EMI (approx at 8.5% p.a.):</span>
                <strong style={{ color: 'var(--primary-700)', fontSize: '1.1rem' }}>₹{emi.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Repayment:</span>
                <strong>₹{totalPayment.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Credentials Section */}
      <section className="card" style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} color="var(--primary-600)" />
          Default Login Portals & Access Credentials (for testing / viva):
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <span className="badge badge-admin_approved" style={{ marginBottom: '0.5rem' }}>Central Admin</span>
            <div style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>URL: <code>/admin</code></div>
            <div style={{ fontSize: '0.85rem' }}>Email: <code>admin@microloan.com</code></div>
            <div style={{ fontSize: '0.85rem' }}>Password: <code>admin123</code></div>
          </div>

          <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <span className="badge badge-subadmin_approved" style={{ marginBottom: '0.5rem' }}>Branch Manager</span>
            <div style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>URL: <code>/subadmin</code></div>
            <div style={{ fontSize: '0.85rem' }}>Email: <code>subadmin@microloan.com</code></div>
            <div style={{ fontSize: '0.85rem' }}>Password: <code>subadmin123</code></div>
          </div>

          <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <span className="badge badge-submitted" style={{ marginBottom: '0.5rem' }}>Member / Borrower</span>
            <div style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>URL: <code>/login</code></div>
            <div style={{ fontSize: '0.85rem' }}>Email: <code>rahul@gmail.com</code></div>
            <div style={{ fontSize: '0.85rem' }}>Password: <code>user123</code></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
