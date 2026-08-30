const { Client } = require('pg');
require('dotenv').config();

async function createDb() {
  const connectionString = 'postgresql://postgres:1234@localhost:5432/postgres';
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to postgres database.');
    
    // Check if unipam exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'unipam'");
    if (res.rowCount === 0) {
      console.log('Creating database unipam...');
      await client.query('CREATE DATABASE unipam');
      console.log('Database unipam created.');
    } else {
      console.log('Database unipam already exists.');
    }
  } catch (err) {
    console.error('Failed to create database:', err.message);
  } finally {
    await client.end();
  }
}

createDb();
