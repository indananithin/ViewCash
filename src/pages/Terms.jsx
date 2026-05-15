import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gavel } from 'lucide-react';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="terms-page page-container">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h2>Terms & Conditions</h2>
      </header>

      <div className="page-divider-strip"></div>

      <div className="page-content-inner" style={{ paddingBottom: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Gavel size={48} color="var(--primary-orange)" style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Effective Date: Oct 2026</p>
        </div>

        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '10px', color: 'var(--text-main)' }}>1. Acceptance of Terms</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6' }}>
            By accessing or using ViewCash, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the application.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '10px', color: 'var(--text-main)' }}>2. User Conduct & Device Policy</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6' }}>
            To maintain a fair ecosystem, we enforce the following rules:
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li><strong>One Account Per Device:</strong> Strictly only one account is allowed per mobile device. Multiple accounts on a single device will result in a permanent ban.</li>
              <li><strong>No Automation:</strong> Use of scripts, bots, or automated ad-watching tools is strictly prohibited.</li>
              <li><strong>Fraudulent Referrals:</strong> Creating fake accounts to gain referral bonuses will lead to forfeiture of all earnings.</li>
            </ul>
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '10px', color: 'var(--text-main)' }}>3. Earnings & Withdrawals</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6' }}>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li>Coins earned in the app have a 1:1 ratio to INR (₹1 = 1 Coin).</li>
              <li>Withdrawals require a minimum of 50 coins.</li>
              <li>Manual verification is performed for every withdrawal. Processing time is typically 24-48 hours.</li>
              <li>We reserve the right to cancel any withdrawal request suspected of fraudulent earning.</li>
            </ul>
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '10px', color: 'var(--text-main)' }}>4. Termination</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6' }}>
            ViewCash reserves the right to suspend or terminate accounts that violate these terms without prior notice or refund of any accumulated coins.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
