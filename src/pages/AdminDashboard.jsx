import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
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
  const [drawProduct, setDrawProduct] = useState('');
  const [drawWinner, setDrawWinner] = useState('');
  const [drawPhone, setDrawPhone] = useState('');
  const [drawResultDate, setDrawResultDate] = useState('');
  const [drawStatus, setDrawStatus] = useState('Processing');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Real Data States
  const [usersList, setUsersList] = useState([]);
  const [withdrawalsList, setWithdrawalsList] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const uSnap = await getDocs(collection(db, 'users'));
        setUsersList(uSnap.docs.map(d => ({id: d.id, ...d.data()})));
        
        const wSnap = await getDocs(query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc')));
        setWithdrawalsList(wSnap.docs.map(d => ({id: d.id, ...d.data()})));
      } catch(e) {
        console.error("Error fetching admin data:", e);
      }
    };
    if (activeTab === 'users' || activeTab === 'withdrawals' || activeTab === 'overview') {
      fetchAdminData();
    }
  }, [activeTab]);

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
    setIsSubmitting(true);
    setStatusMsg('');
    try {
      await addDoc(collection(db, 'draws'), {
        title: drawProduct,
        winner: drawWinner,
        winnerPhone: drawPhone,
        date: drawResultDate,
        status: drawStatus,
        createdAt: new Date().toISOString()
      });
      setStatusMsg('Draw result published successfully!');
      setDrawProduct(''); setDrawWinner(''); setDrawPhone(''); setDrawResultDate(''); setDrawStatus('Processing');
    } catch (err) {
      console.error(err);
      setStatusMsg('Error publishing draw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateWithdrawal = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'withdrawals', id), { status: newStatus });
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
                          <button className="btn-approve" onClick={() => handleUpdateWithdrawal(w.id, 'Approved')}><CheckCircle size={16}/></button>
                          <button className="btn-reject" onClick={() => handleUpdateWithdrawal(w.id, 'Rejected')}><XCircle size={16}/></button>
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
            <h3>Add Draw Result</h3>
            {statusMsg && <p style={{color: statusMsg.includes('Error') ? 'red' : 'green', marginBottom: '10px'}}>{statusMsg}</p>}
            <form className="admin-form" onSubmit={handleAddDraw}>
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" placeholder="e.g. BookMyShow ₹200 Voucher" value={drawProduct} onChange={e=>setDrawProduct(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Winner Name</label>
                <input type="text" placeholder="e.g. Rahul M." value={drawWinner} onChange={e=>setDrawWinner(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Winner Phone (Masked)</label>
                <input type="text" placeholder="e.g. XXXXX-XX892" value={drawPhone} onChange={e=>setDrawPhone(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Draw Date</label>
                <input type="date" value={drawResultDate} onChange={e=>setDrawResultDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={drawStatus} onChange={e=>setDrawStatus(e.target.value)} required>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Claimed">Claimed</option>
                </select>
              </div>
              <button type="submit" className="btn-submit" disabled={isSubmitting}>{isSubmitting ? 'Publishing...' : 'Publish Result'}</button>
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
                  <th>Address/Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="5" style={{textAlign:'center'}}>No claims yet.</td>
                </tr>
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
