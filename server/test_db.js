const { Pool } = require('pg');

async function test(url) {
  const maskedUrl = url.replace(/:([^@]+)@/, ':****@');
  console.log(`Testing: ${maskedUrl}`);
  const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 2000 });
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('--- SUCCESS! ---');
    console.log('Result:', res.rows[0]);
    return true;
  } catch (err) {
    console.error('Failed:', err.message);
    return false;
  } finally {
    await pool.end();
  }
}

async function run() {
  const passwords = ['', 'postgres', 'password', 'admin', 'root', '123456', '1234', '12345678'];
  const users = ['postgres', 'admin'];
  
  for (const user of users) {
    for (const pw of passwords) {
      const url = `postgresql://${user}:${pw}@localhost:5432/postgres`;
      if (await test(url)) {
        console.log(`\n>>> FOUND WORKING CREDENTIALS: user=${user}, password=${pw}`);
        process.exit(0);
      }
    }
  }
  console.log('\nCould not find working credentials.');
}

run();
