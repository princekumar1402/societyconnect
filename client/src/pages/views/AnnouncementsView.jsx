import React, { useEffect, useState } from 'react';
import api from '../../api';

const AnnouncementsView = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    api.get('/api/announcements').then(res => setNews(res.data));
  }, []);

  return (
    <div>
      <h2>City Announcements 📢</h2>
      {news.map(n => (
        <div key={n.id} className="post-card" style={{borderLeft: n.priority === 'High' ? '4px solid #f43f5e' : '4px solid #6366f1'}}>
          <h3>{n.title}</h3>
          <p>{n.message}</p>
          <small>{new Date(n.created_at).toLocaleDateString()}</small>
        </div>
      ))}
    </div>
  );
};
export default AnnouncementsView;