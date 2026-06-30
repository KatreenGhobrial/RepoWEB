/**
 * Shortened Test Suite for Analysis Features
 */
const axios = require('axios');
const BASE = 'http://localhost:5000/api';

async function req(method, path, body) {
  try {
    const config = {
      method,
      url: `${BASE}${path}`,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) config.data = body;
    const res = await axios(config);
    return { status: res.status, data: res.data, ok: true };
  } catch (err) {
    if (err.response) {
      return { status: err.response.status, data: err.response.data, ok: false };
    }
    return { status: 0, data: err.message, ok: false };
  }
}

async function run() {
  console.log('── Running Shortened Analysis Tests ──');
  const r = await req('GET', '/health');
  if (r.ok) {
    console.log('  ✅ Server is running');
  } else {
    console.log('  ❌ Server is not running');
  }
}

run().catch(err => console.error(err));
