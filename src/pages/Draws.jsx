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
        status: 'Pending',
        claimedAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'claims'), claimData);
      setUserClaims([...userClaims, { id: docRef.id, ...claimData }]);
      alert("Claim submitted successfully!");
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
              <div key={draw.id} className="draw-card" style={isWinner ? {borderColor: '#4ade80', borderWidth: '2px'} : {}}>
                <div className="draw-header">
                  <div>
                    <h4>{draw.title}</h4>
                  </div>
                  <div className="draw-date-badge">
                    <Calendar size={12} /> {draw.date}
                  </div>
                </div>

                <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '15px', background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #eee'}}>
                  <div style={{textAlign: 'center'}}>
                    <span style={{display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px'}}>Prize Amount</span>
                    <span style={{fontSize: '16px', fontWeight: 'bold', color: 'var(--primary-orange)'}}>{draw.prizeAmount || '-'}</span>
                  </div>
                  <div style={{width: '1px', height: '30px', background: '#eee'}}></div>
                  <div style={{textAlign: 'center'}}>
                    <span style={{display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px'}}>Players Won</span>
                    <span style={{fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)'}}>{numWinners}</span>
                  </div>
                </div>
                
                {isWinner && (
                  <div style={{background: '#dcfce7', border: '1px solid #4ade80', padding: '15px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center'}}>
                    <h4 style={{color: '#166534', margin: '0 0 10px 0', fontSize: '16px'}}>🎉 Congratulations! You won this product!</h4>
                    
                    {!userClaim ? (
                      <button 
                        className="btn-buy" 
                        onClick={() => handleClaim(draw)}
                        disabled={claimingDrawId === draw.id}
                        style={{background: '#16a34a', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold'}}
                      >
                        {claimingDrawId === draw.id ? 'Submitting...' : 'Claim The Product'}
                      </button>
                    ) : (
                      <div style={{fontWeight: 'bold', fontSize: '14px', color: userClaim.status === 'Pending' ? '#ca8a04' : '#16a34a', background: 'white', padding: '8px', borderRadius: '6px'}}>
                        {userClaim.status === 'Pending' 
                          ? "Status: Pending claim (We will contact you shortly)" 
                          : `Status: Claimed successfully on ${new Date(userClaim.settledAt || userClaim.claimedAt).toLocaleDateString()}`
                        }
                      </div>
                    )}
                  </div>
                )}

                <div style={{marginBottom: '15px', color: 'var(--text-main)', background: '#f5f5f5', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px dashed #ccc'}}>
                  <p style={{margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold'}}>
                    🎉 {numWinners} numbers won
                  </p>
                  <p style={{margin: 0, fontSize: '12px', color: 'var(--text-muted)'}}>
                    Phone numbers are hidden for privacy.
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      </div>
    </div>
  );
};

export default Draws;
