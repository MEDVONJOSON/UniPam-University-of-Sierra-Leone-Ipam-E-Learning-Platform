const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  const filePath = path.join(__dirname, 'db', 'migrations', '004_lms_and_roles.sql');
  const sql = fs.readFileSync(filePath, 'utf8');

  // Split by simple rules (this is a bit naive but should work for this migration)
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log('Running migration: 004_lms_and_roles.sql');
  const client = await pool.connect();
  try {
    for (const statement of statements) {
      if (statement.toUpperCase() === 'BEGIN' || statement.toUpperCase() === 'COMMIT') continue;
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await client.query(statement);
    }
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
