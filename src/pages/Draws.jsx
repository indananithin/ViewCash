import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, orderBy, query, where, addDoc, onSnapshot } from 'firebase/firestore';
import { Trophy, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Draws.css';

const Draws = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userClaims, setUserClaims] = useState([]);
  const [claimingDrawId, setClaimingDrawId] = useState(null);
  const [claimSuccess, setClaimSuccess] = useState(false);

  useEffect(() => {
    // Listen to draws
    const unsubDraws = onSnapshot(query(collection(db, 'draws'), orderBy('createdAt', 'desc')), (snap) => {
      const drawsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDraws(drawsList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching draws:", error);
      setLoading(false);
    });

    // Listen to user's claims
    let unsubClaims = () => {};
    if (user) {
      unsubClaims = onSnapshot(query(collection(db, 'claims'), where('uid', '==', user.uid)), (snap) => {
        setUserClaims(snap.docs.map(d => ({id: d.id, ...d.data()})));
      }, (e) => {
        console.error("Error fetching claims", e);
      });
    }
    
    return () => {
      unsubDraws();
      unsubClaims();
    };
  }, [user]);

  const handleClaim = async (draw) => {
    if (!user) return;
    setClaimingDrawId(draw.id);
    try {
      const claimData = {
        drawId: draw.id,
        productId: draw.productId || 'unknown',
        productTitle: draw.title,
        prizeAmount: draw.prizeAmount || 'N/A',
        uid: user.uid,
        userName: user.name || 'Anonymous',
        userPhone: user.phone || 'Unknown',
        status: 'Not Done',
        claimedAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'claims'), claimData);
      setUserClaims([...userClaims, { id: docRef.id, ...claimData }]);
      setClaimSuccess(true);
    } catch(e) {
      console.error("Error claiming product", e);
      alert("Error submitting claim.");
    } finally {
      setClaimingDrawId(null);
    }
  };

  if (loading) {
    return <div className="page-container" style={{padding: '20px', textAlign: 'center'}}>Loading results...</div>;
  }

  return (
    <div className="draws-container page-container">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={24} />
        </button>
        <h2>Draws & Results</h2>
      </header>

      <div className="page-divider-strip"></div>

      <div className="page-content-inner">
        <div style={{background: 'rgba(247, 192, 74, 0.2)', padding: '15px', borderRadius: '8px', border: '1px solid var(--primary-orange)', marginBottom: '20px'}}>
          <p style={{margin: 0, fontSize: '13px', lineHeight: '1.4'}}>
            <strong>Disclaimer:</strong> The draw is based on luck. You may win or lose. Hope you will win for the next draw!
          </p>
        </div>

      <div className="draws-list">
        {draws.length === 0 ? (
          <p>No draw results available yet.</p>
        ) : (
          draws.map(draw => {
            const isMultiple = Array.isArray(draw.winners);
            const numWinners = isMultiple ? draw.winners.length : 1;
            
            const maskPhone = (phone) => {
              if (!phone) return 'Unknown';
              return phone.substring(0, 5) + '*****';
            };
            
            const isWinner = isMultiple && user && draw.winners.find(w => w.uid === user.uid);
            const userClaim = userClaims.find(c => c.drawId === draw.id);
            
            return (
              <div key={draw.id} style={{ background: 'white', borderRadius: '16px', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: isWinner ? '#FEF3C7' : '#E0F2FE', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px' }}>
                      {isWinner ? '🏆' : '🎁'}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1F2937' }}>{draw.title}</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#9CA3AF' }}>Draw: {draw.date}</p>
                    </div>
                  </div>
                  {isWinner && (
                    <div style={{ background: '#FEF3C7', color: '#D97706', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #FDE68A' }}>
                      🏆 WINNER
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '16px 0', background: '#FAFAFA', borderRadius: '12px', marginBottom: '16px' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px' }}>🎁</span>
                      <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Prize</span>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#D97706' }}>{draw.prizeAmount?.startsWith('₹') ? draw.prizeAmount : `₹${draw.prizeAmount}`}</div>
                  </div>
                  <div style={{ width: '1px', height: '40px', background: '#E5E7EB' }}></div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#8B5CF6' }}>👥</span>
                      <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Winners</span>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#8B5CF6' }}>{numWinners}</div>
                  </div>
                </div>
                
                {isWinner ? (
                  <>
                    <div style={{ border: '1px solid #F3F4F6', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '16px' }}>🏆</span>
                        <h5 style={{ margin: 0, fontSize: '15px', color: '#065F46', fontWeight: 'bold' }}>Winners</h5>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#DCFCE7', color: '#166534', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginBottom: '12px', border: '1px solid #BBF7D0' }}>
                        ✅ You are a winner!
                      </div>
                      <p style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '14px' }}>You have won {draw.prizeAmount?.startsWith('₹') ? draw.prizeAmount : `₹${draw.prizeAmount}`}!</p>
                      <p style={{ margin: 0, color: '#6B7280', fontSize: '13px' }}>Total winners announced: {numWinners} participants</p>
                    </div>
                    
                    {!userClaim ? (
                      <button 
                        className="btn-buy" 
                        onClick={() => handleClaim(draw)}
                        disabled={claimingDrawId === draw.id}
                        style={{ width: '100%', background: '#16a34a', color: 'white', padding: '14px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
                      >
                        {claimingDrawId === draw.id ? 'Submitting...' : 'Claim The Product'}
                      </button>
                    ) : (
                      <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F97316', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', flexShrink: 0 }}>
                          <span style={{ fontSize: '14px', letterSpacing: '2px', marginLeft: '2px', fontWeight: 'bold', transform: 'translateY(-2px)' }}>...</span>
                        </div>
                        <p style={{ margin: 0, color: '#D97706', fontSize: '14px', fontWeight: '500' }}>
                          {userClaim.status === 'Done' 
                            ? `Claimed successfully on ${new Date(userClaim.settledAt || userClaim.claimedAt).toLocaleDateString()}`
                            : "Prize claim submitted! Waiting for admin approval."
                          }
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ border: '1px solid #F3F4F6', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '16px' }}>🏆</span>
                      <h5 style={{ margin: 0, fontSize: '15px', color: '#065F46', fontWeight: 'bold' }}>Winners</h5>
                    </div>
                    <p style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '14px' }}>
                      {numWinners} participants won this product
                    </p>
                    <p style={{ margin: 0, color: '#9CA3AF', fontSize: '13px', fontStyle: 'italic' }}>
                      Phone numbers hidden for privacy
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      </div>

      {claimSuccess && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 11000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '28px',
            width: '100%',
            maxWidth: '340px',
            padding: '32px 24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
            animation: 'modalSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            position: 'relative',
            textAlign: 'center',
            border: '2px solid #D1FAE5'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #34D399, #10B981)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)',
            }}>
              <span style={{ fontSize: '40px' }}>🎁</span>
            </div>

            <h3 style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              color: '#065F46', 
              marginBottom: '12px',
            }}>
              Gift Claimed!
            </h3>

            <p style={{ 
              fontSize: '15px', 
              color: '#4B5563', 
              lineHeight: '1.6', 
              marginBottom: '24px' 
            }}>
              You have successfully claimed the gift and waiting for admin approval to send your gift.
            </p>

            <button 
              onClick={() => setClaimSuccess(false)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                border: 'none',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Draws;
