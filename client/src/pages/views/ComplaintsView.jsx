import React, { useState, useEffect } from 'react';
import api from '../../api';

const ComplaintsView = () => {
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ category: 'Pothole', description: '', location: '' });
  const [file, setFile] = useState(null);

  useEffect(() => { fetchComplaints() }, []);

  const fetchComplaints = async () => {
    const res = await api.get('/api/complaints/my');
    setComplaints(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('category', form.category);
    formData.append('description', form.description);
    formData.append('location', form.location);
    if (file) formData.append('image', file);

    await api.post('/api/complaints', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    fetchComplaints();
    setForm({ category: 'Pothole', description: '', location: '' });
  };

  return (
    <div>
      <h2>Complaint Management</h2>
      <div className="create-section">
        <form onSubmit={handleSubmit}>
          <select onChange={(e) => setForm({...form, category: e.target.value})}>
            <option>Pothole</option>
            <option>Garbage</option>
            <option>Water Leak</option>
          </select>
          <input placeholder="Location" onChange={(e) => setForm({...form, location: e.target.value})} />
          <textarea placeholder="Describe the issue..." onChange={(e) => setForm({...form, description: e.target.value})} />
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button className="btn-primary">Submit Complaint</button>
        </form>
      </div>

      <div className="grid">
        {complaints.map(c => (
          <div key={c.id} className="post-card">
            <div className="post-header">
              <span className={`status-badge status-${c.status}`}>{c.status}</span>
              <span>{c.category}</span>
            </div>
            <h4>{c.location}</h4>
            <p>{c.description}</p>
            {c.image_url && <img src={`http://localhost:5000/uploads/${c.image_url}`} width="100%" style={{marginTop: 10, borderRadius: 8}} />}
          </div>
        ))}
      </div>
    </div>
  );
};
export default ComplaintsView;