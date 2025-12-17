import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Import your views
import AnnouncementsView from './views/AnnouncementsView';
import ComplaintsView from './views/ComplaintsView';
import ReviewsView from './views/ReviewsView';
import GroupsView from './views/GroupsView';
import AdminPanel from './AdminPanel';

const Dashboard = ({ user, handleLogout }) => {
  // 'home' means showing the cards. Otherwise it shows the specific component.
  const [currentView, setCurrentView] = useState('home'); 
  const navigate = useNavigate();

  const onLogout = () => {
    handleLogout();
    navigate('/login');
  };

  // Helper to go back to card menu
  const goHome = () => setCurrentView('home');

  // RENDER THE CARD MENU
  const renderHome = () => (
    <div className="dashboard-home">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1>Welcome, {user?.name} 👋</h1>
        <button onClick={onLogout} style={{ background: '#f43f5e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
            Logout
        </button>
      </header>

      <div className="card-grid">
        {/* Card 1: Announcements */}
        <div className="menu-card" onClick={() => setCurrentView('announcements')}>
            <div className="icon">📢</div>
            <h3>Announcements</h3>
            <p>See latest news and updates</p>
        </div>

        {/* Card 2: Complaints */}
        <div className="menu-card" onClick={() => setCurrentView('complaints')}>
            <div className="icon">⚠️</div>
            <h3>Complaints</h3>
            <p>Report issues and track status</p>
        </div>

        {/* Card 3: Reviews */}
        <div className="menu-card" onClick={() => setCurrentView('reviews')}>
            <div className="icon">⭐</div>
            <h3>City Reviews</h3>
            <p>Rate and review services</p>
        </div>

        {/* Card 4: Groups */}
        <div className="menu-card" onClick={() => setCurrentView('groups')} style={{ border: '2px solid #6366f1' }}>
            <div className="icon">👥</div>
            <h3>Community Groups</h3>
            <p>Join chats and meet neighbors</p>
        </div>

        {/* Admin Card */}
        {user?.role === 'admin' && (
            <div className="menu-card admin" onClick={() => setCurrentView('admin')}>
                <div className="icon">🛡️</div>
                <h3>Admin Panel</h3>
                <p>Moderate content and users</p>
            </div>
        )}
      </div>

      {/* Internal CSS for this page specifically */}
      <style>{`
        .dashboard-home { max-width: 1000px; margin: 0 auto; padding: 40px; }
        .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .menu-card { 
            background: #1e293b; padding: 30px; border-radius: 16px; 
            border: 1px solid #334155; cursor: pointer; transition: transform 0.2s, border-color 0.2s; 
            text-align: center;
        }
        .menu-card:hover { transform: translateY(-5px); border-color: #6366f1; }
        .menu-card .icon { font-size: 3rem; margin-bottom: 15px; }
        .menu-card h3 { margin-bottom: 10px; color: #f8fafc; }
        .menu-card p { color: #94a3b8; }
        .menu-card.admin { border-color: #f43f5e; }
        .menu-card.admin:hover { background: rgba(244, 63, 94, 0.1); }
      `}</style>
    </div>
  );

  // RENDER THE ACTIVE VIEW (with a Back button)
  const renderContent = () => {
    let ComponentToRender;
    switch (currentView) {
        case 'announcements': ComponentToRender = AnnouncementsView; break;
        case 'complaints': ComponentToRender = ComplaintsView; break;
        case 'reviews': ComponentToRender = ReviewsView; break;
        case 'groups': ComponentToRender = GroupsView; break;
        case 'admin': ComponentToRender = AdminPanel; break;
        default: return renderHome();
    }

    return (
        <div className="view-container" style={{ padding: '20px', minHeight: '100vh' }}>
            <button onClick={goHome} style={{ marginBottom: '20px', background: 'transparent', border: '1px solid #6366f1', color: '#6366f1', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                ← Back to Dashboard
            </button>
            <ComponentToRender user={user} />
        </div>
    );
  };

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', color: 'white' }}>
        {currentView === 'home' ? renderHome() : renderContent()}
    </div>
  );
};

export default Dashboard;