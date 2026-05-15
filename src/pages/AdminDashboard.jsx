import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, increment } from 'firebase/firestore';
import { Users, Gift, IndianRupee, Bell, Shield, TrendingUp, CheckCircle, XCircle, PlusCircle, Trophy, Package } from 'lucide-react';
import './Admin.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // States for Add Product
  const [productTitle, setProductTitle] = useState('');
  const [prizeAmount, setPrizeAmount] = useState('');
  const [drawDate, setDrawDate] = useState('');
  const [ticketsReq, setTicketsReq] = useState('');
  const [adsPerTicket, setAdsPerTicket] = useState('');
  
  // States for Add Draw
  const [drawProductId, setDrawProductId] = useState('');
  const [numWinners, setNumWinners] = useState('');
  const [drawPrizeAmount, setDrawPrizeAmount] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Real Data States
  const [usersList, setUsersList] = useState([]);
  const [withdrawalsList, setWithdrawalsList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [claimsList, setClaimsList] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const uSnap = await getDocs(collection(db, 'users'));
        setUsersList(uSnap.docs.map(d => ({id: d.id, ...d.data()})));
        
        const wSnap = await getDocs(query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc')));
        setWithdrawalsList(wSnap.docs.map(d => ({id: d.id, ...d.data()})));
        
        const pSnap = await getDocs(collection(db, 'products'));
        setProductsList(pSnap.docs.map(d => ({id: d.id, ...d.data()})));
        
        const cSnap = await getDocs(query(collection(db, 'claims'), orderBy('claimedAt', 'desc')));
        setClaimsList(cSnap.docs.map(d => ({id: d.id, ...d.data()})));
      } catch(e) {
        console.error("Error fetching admin data:", e);
      }
    };
    if (['users', 'withdrawals', 'overview', 'draws', 'claims'].includes(activeTab)) {
      fetchAdminData();
    }
  }, [activeTab]);

  const selectedProduct = productsList.find(p => p.id === drawProductId);
  const qualifiedUsers = usersList.filter(u => {
     if (!selectedProduct) return false;
     const target = selectedProduct.ticketsRequired || 6;
     const userTickets = u.productProgress?.[drawProductId]?.tickets || 0;
     return userTickets >= target;
  });

  const MOCK_STATS = [
    { label: 'Total Users', value: usersList.length || '0', icon: <Users /> },
    { label: 'Pending Payouts', value: withdrawalsList.filter(w=>w.status==='Pending').length, icon: <IndianRupee /> },
    { label: 'Fake Users Banned', value: '0', icon: <Shield /> }
  ];

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg('');
    try {
      await addDoc(collection(db, 'products'), {
        title: productTitle,
        prizeAmount: prizeAmount,
        drawDate: drawDate,
        ticketsRequired: parseInt(ticketsReq),
        adsRequiredPerTicket: parseInt(adsPerTicket),
        createdAt: new Date().toISOString(),
        active: true
      });
      setStatusMsg('Product added successfully!');
      setProductTitle(''); setPrizeAmount(''); setDrawDate(''); setTicketsReq(''); setAdsPerTicket('');
    } catch (err) {
      console.error(err);
      setStatusMsg('Error adding product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDraw = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    setIsSubmitting(true);
    setStatusMsg('');
    try {
      // Randomly pick numWinners
      const shuffled = [...qualifiedUsers].sort(() => 0.5 - Math.random());
      const winnersCount = Math.min(parseInt(numWinners), qualifiedUsers.length);
      const winners = shuffled.slice(0, winnersCount);
      
      const winnersData = winners.map(w => ({
        uid: w.id,
        name: w.name || 'Anonymous',
        phone: w.phone || 'Unknown'
      }));

      // Save to draws collection
      await addDoc(collection(db, 'draws'), {
        productId: selectedProduct.id,
        title: selectedProduct.title,
        prizeAmount: drawPrizeAmount || selectedProduct.prizeAmount,
        date: new Date().toISOString().split('T')[0],
        winners: winnersData,
        status: 'Completed',
        createdAt: new Date().toISOString()
      });

      // Mark product as inactive
      await updateDoc(doc(db, 'products', selectedProduct.id), {
        active: false
      });

      setStatusMsg(`Draw completed! Selected ${winners.length} winners.`);
      setDrawProductId('');
      setNumWinners('');
      setDrawPrizeAmount('');
      
      // Update local products list
      setProductsList(productsList.map(p => p.id === selectedProduct.id ? {...p, active: false} : p));
    } catch (err) {
      console.error(err);
      setStatusMsg('Error completing draw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateWithdrawal = async (id, newStatus, uid, amount) => {
    try {
      await updateDoc(doc(db, 'withdrawals', id), { status: newStatus });
      
      if (newStatus === 'Rejected' && uid && amount) {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, { coins: increment(amount) });
      }
      
      setWithdrawalsList(withdrawalsList.map(w => w.id === id ? {...w, status: newStatus} : w));
    } catch(e) {
      console.error(e);
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="admin-grid">
            {MOCK_STATS.map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div>
                  <p>{stat.label}</p>
                  <h3>{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>
        );
      case 'withdrawals':
        return (
          <div className="admin-table-container">
            <h3>Pending Withdrawals</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>UPI ID</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawalsList.map(w => (
                  <tr key={w.id}>
                    <td>{w.userName || 'User'}</td>
                    <td>{w.amount} Coins</td>
                    <td>{w.upiId}</td>
                    <td>{w.status}</td>
                    <td className="action-cell">
                      {w.status === 'Pending' && (
                        <>
                          <button className="btn-approve" onClick={() => handleUpdateWithdrawal(w.id, 'Approved', w.uid, w.amount)}><CheckCircle size={16}/></button>
                          <button className="btn-reject" onClick={() => handleUpdateWithdrawal(w.id, 'Rejected', w.uid, w.amount)}><XCircle size={16}/></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {withdrawalsList.length === 0 && <tr><td colSpan="5">No withdrawals found.</td></tr>}
              </tbody>
            </table>
          </div>
        );
      case 'users':
        return (
          <div className="admin-list-container">
            <h3>Manage Users</h3>
            {usersList.map(u => (
              <div key={u.id} className="user-item">
                <div>
                  <strong>{u.name || 'Anonymous'}</strong>
                  <p>{u.phone} • {u.coins} Coins</p>
                </div>
                <button className="btn-ban">Ban Device</button>
              </div>
            ))}
            {usersList.length === 0 && <p>No users found.</p>}
          </div>
        );
      case 'products':
        return (
          <div className="admin-form-container">
            <h3>Add New Product</h3>
            {statusMsg && <p style={{color: statusMsg.includes('Error') ? 'red' : 'green', marginBottom: '10px'}}>{statusMsg}</p>}
            <form className="admin-form" onSubmit={handleAddProduct}>
              <div className="form-group">
                <label>Product Title</label>
                <input type="text" placeholder="e.g. BookMyShow Voucher" value={productTitle} onChange={e=>setProductTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Prize Amount/Value</label>
                <input type="text" placeholder="e.g. ₹200" value={prizeAmount} onChange={e=>setPrizeAmount(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Draw Date</label>
                <input type="date" value={drawDate} onChange={e=>setDrawDate(e.target.value)} required />
              </div>
              <div className="form-group-row">
                <div className="form-group">
                  <label>Tickets Required</label>
                  <input type="number" placeholder="e.g. 6" value={ticketsReq} onChange={e=>setTicketsReq(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Ads Per Ticket</label>
                  <input type="number" placeholder="e.g. 6" value={adsPerTicket} onChange={e=>setAdsPerTicket(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="btn-submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Product'}</button>
            </form>
          </div>
        );
      case 'draws':
        return (
          <div className="admin-form-container">
            <h3>Perform Draw</h3>
            {statusMsg && <p style={{color: statusMsg.includes('Error') ? 'red' : 'green', marginBottom: '10px'}}>{statusMsg}</p>}
            <form className="admin-form" onSubmit={handleAddDraw}>
              <div className="form-group">
                <label>Select Product</label>
                <select value={drawProductId} onChange={e => setDrawProductId(e.target.value)} required>
                  <option value="">-- Select Active Product --</option>
                  {productsList.filter(p => p.active !== false).map(p => (
                    <option key={p.id} value={p.id}>{p.title} (Target: {p.ticketsRequired || 6})</option>
                  ))}
                </select>
              </div>
              
              {selectedProduct && (
                <div className="form-group" style={{background: 'rgba(247, 192, 74, 0.2)', padding: '15px', borderRadius: '8px', border: '1px solid var(--primary-orange)'}}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>Qualified Members: <span style={{ color: 'green' }}>{qualifiedUsers.length}</span></p>
                </div>
              )}

              <div className="form-group">
                <label>Number of Winners to Select</label>
                <input 
                  type="number" 
                  min="1" 
                  max={qualifiedUsers.length || 1} 
                  placeholder="e.g. 10" 
                  value={numWinners} 
                  onChange={e => setNumWinners(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Custom Prize Amount (Optional)</label>
                <input 
                  type="text" 
                  placeholder={selectedProduct ? `Current: ${selectedProduct.prizeAmount}` : "e.g. ₹500"} 
                  value={drawPrizeAmount} 
                  onChange={e => setDrawPrizeAmount(e.target.value)} 
                />
                <p style={{fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px'}}>Leave blank to use the product's default prize amount.</p>
              </div>
              
              <button type="submit" className="btn-submit" disabled={isSubmitting || !selectedProduct || qualifiedUsers.length === 0}>
                {isSubmitting ? 'Drawing...' : 'Draw Now'}
              </button>
            </form>
          </div>
        );
      case 'claims':
        return (
          <div className="admin-table-container">
            <h3>Manage Product Claims</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Product</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {claimsList.map(c => (
                  <tr key={c.id}>
                    <td>{c.userName}</td>
                    <td>{c.productTitle}</td>
                    <td>{c.userPhone}</td>
                    <td>
                      <span className={`status-badge ${c.status === 'Pending' ? 'pending' : 'approved'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="action-cell">
                      {c.status === 'Pending' && (
                        <button 
                          className="btn-approve" 
                          onClick={async () => {
                            if (window.confirm('Mark this claim as settled?')) {
                              try {
                                await updateDoc(doc(db, 'claims', c.id), { 
                                  status: 'Claimed', 
                                  settledAt: new Date().toISOString() 
                                });
                                setClaimsList(claimsList.map(item => item.id === c.id ? {...item, status: 'Claimed', settledAt: new Date().toISOString()} : item));
                              } catch(e) {
                                console.error('Error settling claim', e);
                              }
                            }
                          }}
                        >
                          <CheckCircle size={16}/> Settle
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {claimsList.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{textAlign:'center'}}>No claims yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="admin-page page-container">
      <header className="admin-header">
        <h2>Admin Panel</h2>
        <p>Manage ViewCash platform</p>
      </header>

      <div className="admin-tabs">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}><TrendingUp size={16} /> Overview</button>
        <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}><PlusCircle size={16} /> Add Product</button>
        <button className={activeTab === 'draws' ? 'active' : ''} onClick={() => setActiveTab('draws')}><Trophy size={16} /> Add Draw</button>
        <button className={activeTab === 'claims' ? 'active' : ''} onClick={() => setActiveTab('claims')}><Package size={16} /> Claims</button>
        <button className={activeTab === 'withdrawals' ? 'active' : ''} onClick={() => setActiveTab('withdrawals')}><IndianRupee size={16} /> Withdrawals</button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}><Shield size={16} /> Users</button>
      </div>

      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
