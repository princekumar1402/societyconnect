import React, { useState, useEffect } from 'react';
import api from '../../api';

const StarRating = ({ rating, setRating }) => {
  return (
    <div style={{ display: 'flex', gap: '5px', fontSize: '24px', cursor: 'pointer' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{ color: star <= rating ? '#f59e0b' : '#334155' }}
          onClick={() => setRating(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const ReviewsView = ({ user }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    service_name: '',
    rating: 5, // Default to 5 stars
    comment: ''
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      // Fetch only approved reviews
      const res = await api.get('/api/reviews');
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/reviews', newReview);
      alert("Review submitted successfully! It will be visible after admin approval.");
      setNewReview({ service_name: '', rating: 5, comment: '' });
    } catch (err) {
      alert("Failed to submit review.");
    }
  };

  return (
    <div>
      <h2>Service Reviews & Feedback ⭐</h2>
      
      {/* Review Submission Form */}
      <div className="create-section">
        <h4 style={{marginTop: 0}}>Submit Your Feedback</h4>
        <form onSubmit={handleSubmit}>
          <input 
            placeholder="Service Name (e.g., Public Transport, Sanitation)" 
            value={newReview.service_name}
            onChange={(e) => setNewReview({...newReview, service_name: e.target.value})} 
            required 
          />
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '15px' }}>
            <label style={{ color: '#94a3b8' }}>Rating:</label>
            <StarRating 
              rating={newReview.rating} 
              setRating={(r) => setNewReview({...newReview, rating: r})} 
            />
          </div>
          <textarea 
            rows="3" 
            placeholder="Your detailed comments..." 
            value={newReview.comment}
            onChange={(e) => setNewReview({...newReview, comment: e.target.value})} 
            required 
          />
          <button type="submit" className="btn-primary">Submit Review</button>
        </form>
      </div>

      {/* Approved Reviews Feed */}
      <h3>Approved Reviews ({reviews.length})</h3>
      <div>
        {reviews.map((review) => (
          <div key={review.id} className="post-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: '#6366f1' }}>{review.service_name}</h4>
                <div style={{ fontSize: '20px', color: '#f59e0b' }}>
                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                </div>
            </div>
            <p style={{ color: '#cbd5e1', marginTop: '10px' }}>{review.comment}</p>
            <small style={{ color: '#94a3b8' }}>Reviewed by {review.username} on {new Date(review.created_at).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsView;