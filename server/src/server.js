import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';
import pool from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = parseInt(process.env.PORT || '5000', 10);

async function startServer() {
  try {
    // Verify database connection
    const conn = await pool.getConnection();
    console.log('[DATABASE] Successfully connected to MySQL pool at', `${process.env.DB_HOST}:${process.env.DB_PORT}`);
    conn.release();

    app.listen(PORT, () => {
      console.log(`[SERVER] PlaceWise API Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[SERVER] Failed to connect to MySQL database:', err.message);
    process.exit(1);
  }
}

startServer();
