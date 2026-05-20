import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Mail, HelpCircle, ChevronRight, ExternalLink } from 'lucide-react';

const Support = () => {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const faqs = [
    { q: "How do I earn tickets?", a: "Go to the Products section and watch the required number of ads. Once complete, you automatically get a ticket for that draw." },
    { q: "When will I get my withdrawal?", a: "Withdrawals are processed manually and usually take 24 to 48 hours to reflect in your UPI account." },
    { q: "Can I use multiple accounts?", a: "No. We have a strict one-account-per-device policy. Using multiple accounts will lead to a ban." },
    { q: "Is ViewCash real?", a: "Yes! ViewCash is a rewards platform that shares ad revenue with users through draws and coins." }
  ];

  return (
    <div className="support-page page-container">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h2>Help & Support</h2>
      </header>

      <div className="page-divider-strip"></div>

      <div className="page-content-inner" style={{ paddingBottom: '40px' }}>
        <div style={{ background: 'var(--primary-gradient)', padding: '24px', borderRadius: '16px', color: 'white', marginBottom: '24px', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '8px' }}>Need Assistance?</h3>
          <p style={{ opacity: 0.9, fontSize: '14px' }}>Our support team is here to help you 24/7.</p>
        </div>

        <div className="support-options" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          <a href="https://wa.me/911234567890" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '40px', height: '40px', background: '#25D366', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <MessageCircle size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ color: 'var(--text-main)', margin: 0 }}>WhatsApp Support</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0 0' }}>Chat with us instantly</p>
              </div>
              <ExternalLink size={18} color="#9CA3AF" />
            </div>
          </a>

          {/* Email Support - Showcase Mode */}
          <div 
            onClick={() => setToastMessage("Email support is coming soon! Please use WhatsApp.")}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px', 
              background: 'var(--bg-card)', 
              padding: '16px', 
              borderRadius: '12px', 
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'transform 0.2s ease, background-color 0.2s ease'
            }}
            className="support-card-showcase"
          >
            <div style={{ width: '40px', height: '40px', background: '#3B82F6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Mail size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ color: 'var(--text-main)', margin: 0 }}>Email Support</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0 0' }}>Coming Soon (Get a response within 24h)</p>
            </div>
            <ChevronRight size={18} color="#9CA3AF" />
          </div>
        </div>

        <section className="faq-section">
          <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={20} color="var(--primary-orange)" /> Frequently Asked Questions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                <h4 style={{ fontSize: '15px', color: 'var(--text-main)', marginBottom: '6px' }}>{faq.q}</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.85)',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '30px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          zIndex: 1000,
          textAlign: 'center',
          animation: 'fadeInUp 0.3s ease-out',
          backdropFilter: 'blur(5px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {toastMessage}
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .support-card-showcase:active {
          transform: scale(0.97);
        }
      `}</style>
    </div>
  );
};

export default Support;
