async function testMe() {
  try {
    // 1. Get token
    const loginRes = await fetch('http://localhost:4000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@usl.edu.sl',
        password: 'registry2026'
      })
    });
    const { token } = await loginRes.json();

    // 2. Test /me
    const meRes = await fetch('http://localhost:4000/api/v1/auth/me', {
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await meRes.json();
    console.log('Status:', meRes.status);
    console.log('Data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Test Error:', err.message);
  }
}

testMe();
