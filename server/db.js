import { Pool } from 'pg'; // You can use destructuring like the tutorial
import dotenv from 'dotenv';

dotenv.config(); // This MUST be called before creating the Pool

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" 
    ? { rejectUnauthorized: false } 
    : false,
});

export default pool;