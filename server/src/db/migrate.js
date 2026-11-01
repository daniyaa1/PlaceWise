import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('[MIGRATE] Starting database migrations...');
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    const [appliedRows] = await connection.query('SELECT filename FROM schema_migrations');
    const appliedFiles = new Set(appliedRows.map(r => r.filename));

    for (const file of files) {
      if (appliedFiles.has(file)) {
        console.log(`[MIGRATE] Already executed: ${file}`);
        continue;
      }

      console.log(`[MIGRATE] Executing migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      await connection.query(sql);

      await connection.query('INSERT INTO schema_migrations (filename) VALUES (?)', [file]);
      console.log(`[MIGRATE] Successfully applied: ${file}`);
    }

    console.log('[MIGRATE] All migrations completed successfully.');
  } catch (err) {
    console.error('[MIGRATE] Migration failed:', err);
    process.exit(1);
  } finally {
    connection.release();
    await pool.end();
  }
}

runMigrations();
