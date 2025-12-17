import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const AdminPanel = ({ user }) => {
  const [activeTab, setActiveTab] = useState('moderation'); // 'moderation', 'announcements', 'groups'
  const [moderationList, setModerationList] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [groups, setGroups] = useState([]);
  const [newAnnounce, setNewAnnounce] = useState({ title: '', message: '', priority: 'Normal' });
  
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role !== 'admin') {
      navigate('/dashboard'); 
      return;
    }
    // Fetch data based on the active tab
    if (activeTab === 'moderation') fetchModerationList();
    if (activeTab === 'announcements') fetchAnnouncements();
    if (activeTab === 'groups') fetchGroups();
  }, [user, activeTab]); 

  // --- DATA FETCHING ---
  
  const fetchModerationList = async () => {
    try {
      const res = await api.get('/api/admin/moderation');
      setModerationList(res.data);
    } catch (err) { console.error("Failed to fetch admin list:", err); }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/api/announcements'); // Use public get route
      setAnnouncements(res.data);
    } catch (err) { console.error("Failed to fetch announcements:", err); }
  };
  
  const fetchGroups = async () => {
    try {
      const res = await api.get('/api/groups'); // Use public get route
      setGroups(res.data);
    } catch (err) { console.error("Failed to fetch groups:", err); }
  };

  // --- ANNOUNCEMENT HANDLERS ---
  
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/announcements', newAnnounce);
      setNewAnnounce({ title: '', message: '', priority: 'Normal' });
      fetchAnnouncements();
    } catch (err) {
      alert("Failed to create announcement.");
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await api.delete(`/api/admin/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      alert("Failed to delete announcement.");
    }
  };
  
  // --- GROUP HANDLERS ---
  
  const handleDeleteGroup = async (id) => {
    if (!window.confirm("WARNING: Are you sure you want to permanently delete this group?")) return;
    try {
      await api.delete(`/api/admin/groups/${id}`);
      fetchGroups();
    } catch (err) {
      alert("Failed to delete group.");
    }
  };

  // --- MODERATION HANDLERS (Keep the existing logic) ---

  const handleDelete = async (itemId, type) => {
    // ... (keep the existing handleDelete logic here) ...
    if (!window.confirm(`Are you sure you want to DELETE this ${type}?`)) return;

    try {
      if (type === 'complaint') {
          alert("Complaints require status update, not simple deletion."); 
          return;
      }
      
      if (type === 'post') {
        await api.delete(`/api/posts/${itemId}`);
      } 
      else if (type === 'review') {
        await api.delete(`/api/admin/reviews/${itemId}`);
      } 

      fetchModerationList(); 

    } catch (err) {
      alert(`Failed to delete ${type}.`);
    }
  };

  const handleApprove = async (reviewId) => {
    // ... (keep the existing handleApprove logic here) ...
    if (!window.confirm(`Approve this review for public display?`)) return;

    try {
      await api.put(`/api/admin/reviews/${reviewId}/approve`);
      fetchModerationList();
    } catch (err) {
      alert("Failed to approve review.");
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    // ... (keep the existing handleStatusUpdate logic here) ...
    try {
      await api.put(`/api/admin/complaints/${complaintId}`, { status: newStatus });
      fetchModerationList();
    } catch (err) {
      alert("Failed to update status.");
    }
  };


  // ===================================
  // RENDER SECTIONS
  // ===================================
  
const renderModeration = () => (
    <>
      <h3 style={{marginTop: 0}}>Content Moderation Queue ({moderationList.length})</h3>
      <table className="admin-table">
        <thead>
            <tr>
              <th>Type</th>
              <th>User</th>
              <th>Title/Content</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {moderationList.map(item => (
              <tr key={item.type + item.id}>
                <td>
                    <span className={`badge ${item.type}`}>
                        {item.type === 'post' ? 'Social Post' : item.type.toUpperCase()}
                    </span>
                </td>
                <td>{item.username}</td>
                <td style={{ maxWidth: '400px', overflow: 'hidden' }}>{item.title}</td>
                <td>
                    {/* FIXED: Used !item.is_approved to catch 0, null, or false */}
                    <span className={`status-badge status-${item.status || (!item.is_approved ? 'Submitted' : 'Normal')}`}>
                        {item.status || (!item.is_approved ? 'Pending' : 'Live')}
                    </span>
                </td>
                <td>
                  {/* FIXED: Check !item.is_approved to show button for 0/null/false */}
                  {item.type === 'review' && !item.is_approved && (
                    <button 
                        onClick={() => handleApprove(item.id)} 
                        style={{ background: '#10b981', color: 'white', border: 'none', padding: '5px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                    >
                        Approve
                    </button>
                  )}
                  
                  {item.type === 'complaint' && item.status !== 'Resolved' && (
                      <select 
                        onChange={(e) => handleStatusUpdate(item.id, e.target.value)} 
                        value={item.status} 
                        style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'white', padding: '5px' }}
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="In Review">In Review</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                  )}

                  {(item.type === 'post' || item.type === 'review') && (
                    <button 
                        onClick={() => handleDelete(item.id, item.type)} 
                        style={{ background: '#f43f5e', color: 'white', border: 'none', padding: '5px', borderRadius: '4px', cursor: 'pointer', marginLeft: '5px' }}
                    >
                        Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
      </table>
      {moderationList.length === 0 && (
        <p style={{textAlign: 'center', color: 'var(--text-muted)', padding: '20px'}}>
            No items currently requiring moderation or action.
        </p>
      )}
    </>
  );
  
  const renderAnnouncements = () => (
    <>
      <h3>Create New Announcement</h3>
      <div className="create-section">
        <form onSubmit={handleCreateAnnouncement}>
          <div style={{display: 'flex', gap: '10px'}}>
            <input 
                placeholder="Title" 
                value={newAnnounce.title} 
                onChange={(e) => setNewAnnounce({...newAnnounce, title: e.target.value})} 
                required 
            />
            <select style={{width: '150px'}} value={newAnnounce.priority} onChange={(e) => setNewAnnounce({...newAnnounce, priority: e.target.value})}>
              <option value="Normal">Normal Priority</option>
              <option value="High">HIGH Priority</option>
            </select>
          </div>
          <textarea 
            rows="3" 
            placeholder="Announcement Message" 
            value={newAnnounce.message} 
            onChange={(e) => setNewAnnounce({...newAnnounce, message: e.target.value})} 
            required 
          />
          <button type="submit" className="btn-primary">Publish Announcement</button>
        </form>
      </div>

      <h3>Existing Announcements ({announcements.length})</h3>
      <div style={{marginTop: '20px'}}>
          {announcements.map(a => (
              <div key={a.id} className="post-card" style={{borderLeft: a.priority === 'High' ? '4px solid var(--danger)' : '4px solid var(--primary)'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <h4 style={{margin: 0}}>{a.title}</h4>
                      <button onClick={() => handleDeleteAnnouncement(a.id)} style={{ background: '#f43f5e', color: 'white', border: 'none', padding: '5px', borderRadius: '4px', cursor: 'pointer'}}>Delete</button>
                  </div>
                  <p>{a.message}</p>
                  <small style={{color: 'var(--text-muted)'}}>Priority: {a.priority} | {new Date(a.created_at).toLocaleDateString()}</small>
              </div>
          ))}
      </div>
    </>
  );

  const renderGroups = () => (
      <>
        <h3>Manage Community Groups ({groups.length})</h3>
        <table className="admin-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Owner ID</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {groups.map(g => (
                    <tr key={g.id}>
                        <td>{g.name}</td>
                        <td>{g.description.substring(0, 100)}...</td>
                        <td>{g.owner_id}</td>
                        <td>
                             <button onClick={() => handleDeleteGroup(g.id)} style={{ background: '#f43f5e', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>Delete Group</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </>
  );


  // ===================================
  // MAIN RENDER
  // ===================================

  return (
    <div className="container">
      <h2 style={{ color: '#f43f5e', borderBottom: '2px solid #f43f5e' }}>Admin Control Panel 🛡️</h2>
      <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '20px', padding: '10px' }}>
        ← Back to Citizen Dashboard
      </button>

      {/* Admin Tabs */}
      <div style={{display: 'flex', gap: '15px', marginBottom: '20px'}}>
        <button 
            className={activeTab === 'moderation' ? 'btn-primary' : 'btn-small'} 
            onClick={() => setActiveTab('moderation')}
        >
            Content Moderation
        </button>
        <button 
            className={activeTab === 'announcements' ? 'btn-primary' : 'btn-small'} 
            onClick={() => setActiveTab('announcements')}
        >
            Announcements
        </button>
        <button 
            className={activeTab === 'groups' ? 'btn-primary' : 'btn-small'} 
            onClick={() => setActiveTab('groups')}
        >
            Groups
        </button>
      </div>

      <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px' }}>
        {activeTab === 'moderation' && renderModeration()}
        {activeTab === 'announcements' && renderAnnouncements()}
        {activeTab === 'groups' && renderGroups()}
      </div>
    </div>
  );
};

export default AdminPanel;