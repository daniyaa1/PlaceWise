import { execSync } from 'child_process';

console.log('[SETUP] Running database setup (migrate + seed)...');
try {
  execSync('node src/db/migrate.js', { stdio: 'inherit' });
  execSync('node src/db/seed.js', { stdio: 'inherit' });
  console.log('[SETUP] Database setup completed successfully!');
} catch (err) {
  console.error('[SETUP] Database setup failed:', err);
  process.exit(1);
}
