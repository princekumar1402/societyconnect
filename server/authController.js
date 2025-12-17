import pool from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'cityconnect_secret_key'; // Use the same key across files

// =======================
// REGISTER
// =======================
export const register = async (req, res) => {
  // IMPORTANT: Destructure 'name' along with email and password
  const { name, email, password } = req.body; 
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // SQL query must use 'name' as a column
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role",
      [name, email, hashedPassword]
    );

    // After success, generate a token and return it
    const user = newUser.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
    
    res.json({ user, token });

  } catch (err) {
    console.error("Registration Error:", err.message);
    res.status(500).send("Registration failed. Check server logs.");
  }
};

// =======================
// LOGIN
// =======================
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) return res.status(401).json("User not found");

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) return res.status(401).json("Incorrect password");

    // Ensure 'role' is included in the token payload
    const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, SECRET_KEY, { expiresIn: '24h' });
    
    // Return user info including ROLE to the frontend
    const { password: pwd, ...userInfo } = user.rows[0];
    res.json({ user: userInfo, token });

  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).send("Server Error during login.");
  }
};