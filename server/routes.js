import express from 'express';
import upload from './uploadMiddleware.js';
import { verifyToken, verifyAdmin } from './authMiddleware.js';
import { register, login } from './authController.js';
import pool from './db.js'; // We use 'pool' for all database queries

const router = express.Router();

// Helper for error logging
const logError = (route, err) => {
    console.error(`❌ [${route}] Error:`, err.message);
};

// ==========================
// 1. AUTHENTICATION
// ==========================
router.post('/register', register);
router.post('/login', login);

router.get('/auth/me', verifyToken, async (req, res) => {
  try {
    const user = await pool.query("SELECT id, name, email, role FROM users WHERE id = $1", [req.userId]);
    res.json(user.rows[0]);
  } catch (err) { res.status(500).send("Server Error"); }
});

// ==========================
// 2. HAPPINESS POSTS 
// ==========================
router.post('/posts', verifyToken, upload, async (req, res) => {
  const { content } = req.body;
  const image_url = req.file ? req.file.filename : null;
  try {
    const newPost = await pool.query(
      "INSERT INTO posts (user_id, content, image_url) VALUES ($1, $2, $3) RETURNING *",
      [req.userId, content, image_url]
    );
    res.json(newPost.rows[0]);
  } catch (err) { res.status(500).send(err.message); }
});

router.get('/posts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT posts.*, users.name as username 
      FROM posts 
      JOIN users ON posts.user_id = users.id 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).send("Server Error"); }
});

router.put('/posts/:id/like', verifyToken, async (req, res) => {
  try {
    await pool.query("UPDATE posts SET likes = likes + 1 WHERE id = $1", [req.params.id]);
    res.json({ message: "Post liked" });
  } catch (err) { res.status(500).send("Server Error"); }
});

router.delete('/posts/:id', verifyToken, async (req, res) => {
  try {
    if (req.userRole === 'admin') {
      await pool.query("DELETE FROM posts WHERE id = $1", [req.params.id]);
      return res.json({ message: "Deleted by Admin" });
    }
    const checkOwner = await pool.query("SELECT * FROM posts WHERE id = $1 AND user_id = $2", [req.params.id, req.userId]);
    if (checkOwner.rows.length === 0) return res.status(403).json("Unauthorized");

    await pool.query("DELETE FROM posts WHERE id = $1", [req.params.id]);
    res.json({ message: "Post deleted" });
  } catch (err) { res.status(500).send("Server Error"); }
});

// ==========================
// 3. COMPLAINTS
// ==========================
router.post('/complaints', verifyToken, upload, async (req, res) => {
  const { category, description, location } = req.body;
  const image_url = req.file ? req.file.filename : null;
  try {
    const newComplaint = await pool.query(
      "INSERT INTO complaints (user_id, category, description, location, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [req.userId, category, description, location, image_url]
    );
    res.json(newComplaint.rows[0]);
  } catch (err) { res.status(500).send(err.message); }
});

router.get('/complaints/my', verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM complaints WHERE user_id = $1 ORDER BY created_at DESC", [req.userId]);
    res.json(result.rows);
  } catch (err) { res.status(500).send("Server Error"); }
});

router.put('/admin/complaints/:id', verifyAdmin, async (req, res) => {
  const { status } = req.body;
  await pool.query("UPDATE complaints SET status = $1 WHERE id = $2", [status, req.params.id]);
  res.json({ message: "Status updated" });
});

// ==========================
// 4. REVIEWS
// ==========================
router.post('/reviews', verifyToken, async (req, res) => {
  const { service_name, rating, comment } = req.body;
  try {
    await pool.query("INSERT INTO reviews (user_id, service_name, rating, comment) VALUES ($1, $2, $3, $4)", 
      [req.userId, service_name, rating, comment]);
    res.json({ message: "Review submitted" });
  } catch (err) { res.status(500).send("Server Error"); }
});

router.get('/reviews', async (req, res) => {
  try {
    const result = await pool.query("SELECT reviews.*, users.name as username FROM reviews JOIN users ON reviews.user_id = users.id WHERE is_approved = TRUE");
    res.json(result.rows);
  } catch (err) { res.status(500).send("Server Error"); }
});

// ==========================
// 5. ANNOUNCEMENTS
// ==========================
router.get('/announcements', async (req, res) => {
  const result = await pool.query("SELECT * FROM announcements ORDER BY created_at DESC LIMIT 5");
  res.json(result.rows);
});

router.post('/admin/announcements', verifyAdmin, async (req, res) => {
  const { title, message, priority } = req.body;
  await pool.query("INSERT INTO announcements (title, message, priority) VALUES ($1, $2, $3)", [title, message, priority]);
  res.json({ message: "Announcement posted" });
});

// ==========================
// 6. GROUPS & CHAT (Merged & Fixed)
// ==========================

// Get all groups
router.get('/groups', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM groups");
        res.json(result.rows);
    } catch (err) { logError("GET GROUPS", err); res.status(500).json({error: err.message}); }
});

// Create Group
router.post('/groups', verifyToken, async (req, res) => {
  const { name, description } = req.body;
  try {
    // 1. Create the group
    const group = await pool.query("INSERT INTO groups (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *", 
      [name, description, req.userId]);
      
    // 2. Automatically add the creator to the 'group_members' table
    await pool.query("INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)", [group.rows[0].id, req.userId]);
    
    res.json(group.rows[0]);
  } catch (err) { logError("CREATE GROUP", err); res.status(500).send(err.message); }
});

// Join Group
router.post('/groups/:id/join', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        // Check if already a member
        const check = await pool.query("SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2", [id, req.userId]);
        if (check.rows.length > 0) return res.json({ message: "Already a member" });

        await pool.query("INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)", [id, req.userId]);
        res.json({ message: "Joined successfully" });
    } catch (err) { logError("JOIN GROUP", err); res.status(500).json({ error: err.message }); }
});

// Get Messages
router.get('/groups/:groupId/messages', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM group_messages WHERE group_id = $1 ORDER BY created_at ASC", [req.params.groupId]);
        res.json(result.rows);
    } catch (err) { logError("GET MESSAGES", err); res.status(500).json({ error: err.message }); }
});

// Send Message
router.post('/groups/:groupId/messages', async (req, res) => {
    const { groupId } = req.params;
    const { userId, username, message } = req.body;

    // Safety checks for missing data
    const safeUserId = userId || null;
    const safeUsername = username || 'Anonymous';
    const safeMessage = message || '';

    try {
        const result = await pool.query(
            "INSERT INTO group_messages (group_id, user_id, username, message) VALUES ($1, $2, $3, $4) RETURNING *", 
            [groupId, safeUserId, safeUsername, safeMessage]
        );
        res.json(result.rows[0]);
    } catch (err) { 
        logError("SEND MESSAGE", err); 
        res.status(500).json({ error: err.message }); 
    }
});

// Get Group Members
router.get('/groups/:groupId/members', async (req, res) => {
    try {
        // NOTE: This assumes your users table has a 'name' column
        const result = await pool.query(`
            SELECT users.name, users.id 
            FROM group_members 
            JOIN users ON group_members.user_id = users.id 
            WHERE group_members.group_id = $1
        `, [req.params.groupId]);
        res.json(result.rows);
    } catch (err) { logError("GET MEMBERS", err); res.status(500).json({ error: err.message }); }
});


// ==========================
// 7. ADMIN MODERATION
// ==========================
router.get('/admin/moderation', verifyAdmin, async (req, res) => {
  try {
    const complaints = await pool.query(`
      SELECT c.id, c.description, c.category, c.status, u.name AS username, 'complaint' as type
      FROM complaints c JOIN users u ON c.user_id = u.id WHERE c.status != 'Resolved' ORDER BY c.created_at DESC
    `);
    
    const pendingReviews = await pool.query(`
      SELECT r.id, r.comment, r.service_name, r.rating, u.name AS username, 'review' as type
      FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.is_approved = FALSE ORDER BY r.created_at DESC
    `);
    
    const happinessPosts = await pool.query(`
      SELECT p.id, p.content, u.name AS username, 'post' as type
      FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC
    `);

    const moderationList = [
      ...complaints.rows.map(item => ({ ...item, title: item.description.substring(0, 50) + '...' })),
      ...pendingReviews.rows.map(item => ({ ...item, title: `Review: ${item.service_name} (${item.rating} Star)` })),
      ...happinessPosts.rows.map(item => ({ ...item, title: item.content.substring(0, 50) + '...' })),
    ];
    res.json(moderationList);
  } catch (err) {
    console.error("Admin Moderation Fetch Error:", err);
    res.status(500).send("Error fetching moderation content.");
  }
});

router.put('/admin/reviews/:id/approve', verifyAdmin, async (req, res) => {
    try {
        await pool.query("UPDATE reviews SET is_approved = TRUE WHERE id = $1", [req.params.id]);
        res.json({ message: "Review approved." });
    } catch (err) { res.status(500).send("Server Error"); }
});

router.delete('/admin/reviews/:id', verifyAdmin, async (req, res) => {
    try {
        await pool.query("DELETE FROM reviews WHERE id = $1", [req.params.id]);
        res.json({ message: "Review deleted." });
    } catch (err) { res.status(500).send("Server Error"); }
});

export default router;
