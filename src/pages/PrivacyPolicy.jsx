import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="policy-page page-container">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h2>Privacy Policy</h2>
      </header>

      <div className="page-divider-strip"></div>

      <div className="page-content-inner" style={{ paddingBottom: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Shield size={48} color="var(--primary-orange)" style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Last Updated: Oct 2026</p>
        </div>

        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '10px', color: 'var(--text-main)' }}>1. Information We Collect</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6' }}>
            We collect minimal information to ensure the security of your rewards and the integrity of our platform:
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li><strong>Mobile Number:</strong> Used for account creation and unique identification.</li>
              <li><strong>Device ID:</strong> We link your account to a specific device to prevent fraudulent activity and multiple account creation.</li>
              <li><strong>Payment Details:</strong> UPI IDs are collected only when you request a withdrawal.</li>
            </ul>
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '10px', color: 'var(--text-main)' }}>2. How We Use Your Data</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6' }}>
            Your data is used solely for the operation of ViewCash:
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li>To track your ad-watching progress and reward tickets accurately.</li>
              <li>To process your withdrawal requests to your provided UPI ID.</li>
              <li>To communicate important updates via in-app notifications.</li>
            </ul>
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '10px', color: 'var(--text-main)' }}>3. Data Security</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6' }}>
            We use industry-standard encryption and Firebase security protocols to protect your information. Your data is never sold to third parties. We only share necessary data with payment processors to complete your redemptions.
          </p>
        </section>

        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '10px', color: 'var(--text-main)' }}>4. Contact Us</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6' }}>
            If you have any questions about this Privacy Policy, please contact us through the Help & Support section in the app.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
