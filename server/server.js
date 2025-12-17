import express from 'express';
import cors from 'cors';
import routes from './routes.js'; 
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pool from './db.js'; // Ensure you import your database pool
import dotenv from 'dotenv';
dotenv.config();

// --- Setup for ES Modules to get __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ======================================
// 1. MIDDLEWARE (MUST COME FIRST)
// ======================================

// Enable CORS for all requests
app.use(cors(
    origin: "https://client-sowd.onrender.com"
));

// Parse incoming JSON payloads (required for handling requests)
app.use(express.json());

// ======================================
// 2. STATIC FILE SERVER (for uploaded images)
// This makes files in the 'uploads' folder accessible via the URL /uploads
// The path.join is necessary to go up one directory (from server/ to cityconnect/) 
// and then into the 'uploads' folder.
// ======================================
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'))); 

// ======================================
// 3. DATABASE CONNECTION CHECK (Optional, but good for debugging)
// ======================================
async function checkDatabaseConnection() {
    try {
        await pool.query('SELECT 1');
        console.log("Database connected successfully.");
    } catch (err) {
        console.error("Database connection failed:", err.message);
        // CRITICAL: We log the error but do NOT call process.exit() here, 
        // allowing the server to attempt to start anyway (for better debugging).
    }
}
checkDatabaseConnection();


// ======================================
// 4. ROUTING
// All routes defined in routes.js are prefixed with /api
// ======================================
app.use('/api', routes); 

// ======================================
// 5. SERVER LISTEN (CRITICAL BLOCK)
// This function keeps the Node process running.
// ======================================
try {
    app.listen(PORT, () => {
        console.log(`Server running and listening on port ${PORT}`);
    });
} catch (error) {
    console.error("Failed to start Express server:", error.message);
}
