import pool from './db.js';

export const createPost = async (req, res) => {
  const { type, title, content, city } = req.body;
  try {
    const newPost = await pool.query(
      "INSERT INTO posts (user_id, type, title, content, city_name) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [req.userId, type, title, content, city]
    );
    res.json(newPost.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

export const getAllPosts = async (req, res) => {
  const currentUserId = req.query.userId || 0;
  try {
    const query = `
      SELECT 
        p.*, 
        u.username,
        (SELECT COUNT(*)::int FROM supports s WHERE s.post_id = p.id) as support_count,
        EXISTS(SELECT 1 FROM supports s WHERE s.post_id = p.id AND s.user_id = $1) as is_supported,
        COALESCE(
          (SELECT json_agg(json_build_object('id', c.id, 'username', cu.username, 'content', c.content))
           FROM comments c
           JOIN users cu ON c.user_id = cu.id
           WHERE c.post_id = p.id), 
          '[]'
        ) as comments
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      ORDER BY p.created_at DESC
    `;
    const allPosts = await pool.query(query, [currentUserId]);
    res.json(allPosts.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

export const toggleSupport = async (req, res) => {
  const { postId } = req.body;
  try {
    const check = await pool.query("SELECT * FROM supports WHERE user_id = $1 AND post_id = $2", [req.userId, postId]);
    if (check.rows.length > 0) {
      await pool.query("DELETE FROM supports WHERE user_id = $1 AND post_id = $2", [req.userId, postId]);
      res.json({ action: 'unsupported' });
    } else {
      await pool.query("INSERT INTO supports (user_id, post_id) VALUES ($1, $2)", [req.userId, postId]);
      res.json({ action: 'supported' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

export const addComment = async (req, res) => {
  const { postId, content } = req.body;
  try {
    await pool.query("INSERT INTO comments (user_id, post_id, content) VALUES ($1, $2, $3)", [req.userId, postId, content]);
    res.json({ message: "Comment added" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// ... existing imports

// NEW: Delete Post Function
export const deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    // First delete comments and supports related to this post (Foreign Key constraints)
    await pool.query("DELETE FROM comments WHERE post_id = $1", [id]);
    await pool.query("DELETE FROM supports WHERE post_id = $1", [id]);
    
    // Then delete the post
    await pool.query("DELETE FROM posts WHERE id = $1", [id]);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// ... keep createPost, getAllPosts, etc.