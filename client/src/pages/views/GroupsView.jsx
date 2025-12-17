import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';

const GroupsView = ({ user }) => {
  // VIEW STATES: 'list' (all groups) or 'chat' (inside a group)
  const [viewMode, setViewMode] = useState('list'); 
  const [selectedGroup, setSelectedGroup] = useState(null);

  // DATA STATES
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  
  // FORM STATES
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [msgInput, setMsgInput] = useState('');
  
  // Ref for auto-scrolling chat
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  // Poll for messages if inside a chat (simple real-time simulation)
  useEffect(() => {
    let interval;
    if (viewMode === 'chat' && selectedGroup) {
        fetchGroupDetails(selectedGroup.id);
        interval = setInterval(() => fetchMessages(selectedGroup.id), 3000); // Poll every 3 seconds
    }
    return () => clearInterval(interval);
  }, [viewMode, selectedGroup]);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  // --- API CALLS ---

  const fetchGroups = async () => {
    try {
        const res = await api.get('/api/groups');
        setGroups(res.data);
    } catch (err) { console.error("Error fetching groups"); }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    try {
        await api.post('/api/groups', { ...newGroup, owner_id: user.id });
        setNewGroup({ name: '', description: '' });
        fetchGroups();
    } catch (err) { alert("Failed to create group"); }
  };

  const joinGroup = async (groupId) => {
    try {
        await api.post(`/api/groups/${groupId}/join`, { userId: user.id });
        alert("Joined!");
        // Automatically open chat after joining
        const group = groups.find(g => g.id === groupId);
        openChat(group);
    } catch (err) { alert("Already joined or error"); }
  };

  const fetchMessages = async (groupId) => {
    try {
        const res = await api.get(`/api/groups/${groupId}/messages`);
        setMessages(res.data);
    } catch (err) { console.error("Error fetching messages"); }
  };

  const fetchGroupDetails = async (groupId) => {
    fetchMessages(groupId);
    try {
        const res = await api.get(`/api/groups/${groupId}/members`);
        setMembers(res.data);
    } catch (err) { console.error("Error fetching members"); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    try {
        await api.post(`/api/groups/${selectedGroup.id}/messages`, {
            userId: user.id,
            username: user.name,
            message: msgInput
        });
        setMsgInput('');
        fetchMessages(selectedGroup.id); // Refresh immediately
    } catch (err) { alert("Failed to send"); }
  };

  // --- ACTIONS ---

  const openChat = (group) => {
    setSelectedGroup(group);
    setViewMode('chat');
  };

  // --- RENDER HELPERS ---

  const renderGroupList = () => (
    <div className="group-list-container">
        <h2>Available Groups</h2>
        
        {/* CREATE GROUP FORM */}
        <div className="create-section" style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
            <h4 style={{marginTop:0}}>Start a New Group</h4>
            <input 
                placeholder="Group Name" 
                value={newGroup.name} 
                onChange={e => setNewGroup({...newGroup, name: e.target.value})} 
                style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius:'8px', border:'1px solid #334155', background:'#0f172a', color:'white'}}
            />
            <input 
                placeholder="Description" 
                value={newGroup.description} 
                onChange={e => setNewGroup({...newGroup, description: e.target.value})}
                style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius:'8px', border:'1px solid #334155', background:'#0f172a', color:'white'}}
            />
            <button onClick={createGroup} style={{ width: '100%', padding: '10px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Create Group</button>
        </div>

        {/* LIST OF GROUPS */}
        <div className="groups-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
            {groups.map(g => (
                <div key={g.id} style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#6366f1' }}>{g.name}</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '15px' }}>{g.description}</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => joinGroup(g.id)} style={{ flex:1, padding: '8px', background: 'transparent', border: '1px solid #10b981', color: '#10b981', borderRadius: '6px', cursor: 'pointer' }}>
                            Join
                        </button>
                        <button onClick={() => openChat(g)} style={{ flex:1, padding: '8px', background: '#6366f1', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>
                            Open Chat
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  const renderChatRoom = () => (
    <div className="chat-interface" style={{ display: 'flex', height: '80vh', gap: '20px' }}>
        
        {/* LEFT: CHAT AREA */}
        <div className="chat-area" style={{ flex: 3, display: 'flex', flexDirection: 'column', background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '15px', borderBottom: '1px solid #334155', background: '#0f172a' }}>
                <button onClick={() => setViewMode('list')} style={{ marginRight: '10px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>← Back</button>
                <strong style={{ fontSize: '1.2rem' }}>{selectedGroup.name}</strong>
            </div>

            {/* Messages */}
            <div className="messages-box" style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{ 
                        marginBottom: '10px', 
                        textAlign: msg.user_id === user.id ? 'right' : 'left' 
                    }}>
                        <div style={{ 
                            display: 'inline-block', 
                            padding: '10px 15px', 
                            borderRadius: '12px', 
                            background: msg.user_id === user.id ? '#6366f1' : '#334155',
                            color: 'white',
                            maxWidth: '70%'
                        }}>
                            <small style={{ display: 'block', fontSize: '0.7rem', opacity: 0.7, marginBottom: '4px' }}>{msg.username}</small>
                            {msg.message}
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} style={{ padding: '15px', borderTop: '1px solid #334155', display: 'flex', gap: '10px' }}>
                <input 
                    value={msgInput} 
                    onChange={e => setMsgInput(e.target.value)} 
                    placeholder="Type a message..."
                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#0f172a', color: 'white' }}
                />
                <button type="submit" style={{ padding: '0 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Send</button>
            </form>
        </div>

        {/* RIGHT: MEMBER LIST */}
        <div className="members-area" style={{ flex: 1, background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '20px' }}>
            <h4 style={{ marginTop: 0, borderBottom: '1px solid #334155', paddingBottom: '10px' }}>Members ({members.length})</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {members.map((m, i) => (
                    <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid #334155', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '30px', height: '30px', background: '#475569', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem' }}>
                            {m.name.charAt(0).toUpperCase()}
                        </div>
                        {m.name} {m.id === user.id && '(You)'}
                    </li>
                ))}
            </ul>
        </div>

    </div>
  );

  return viewMode === 'list' ? renderGroupList() : renderChatRoom();
};

export default GroupsView;