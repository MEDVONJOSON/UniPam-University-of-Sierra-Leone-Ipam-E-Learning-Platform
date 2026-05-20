const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

async function runMigrations() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to idw database.');

  const migrationsDir = path.join(__dirname, 'db', 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (!file.endsWith('.sql')) continue;
    
    console.log(`Running migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    
    try {
      await client.query(sql);
      console.log(`  Completed: ${file}`);
    } catch (err) {
      if (err.message.includes('already exists') || err.message.includes('duplicate key')) {
        console.warn(`  [Info] Skipping some parts of ${file}: ${err.message}`);
      } else {
        console.error(`  [Error] Migration ${file} failed:`, err.message);
        throw err;
      }
    }
  }

  await client.end();
  console.log('All migrations completed.');
}

runMigrations().catch(err => {
  console.error('Migrations failed:', err);
  process.exit(1);
});
