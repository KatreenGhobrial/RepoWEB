/**
 * Shortened Test Suite for API Features
 */
const BASE = 'http://localhost:5000/api';

async function req(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(`${BASE}${path}`, opts);
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return { status: res.status, data, ok: res.ok };
  } catch (err) {
    return { status: 0, data: err.message, ok: false };
  }
}

async function run() {
  console.log('── Running Shortened API Tests ──');
  const r = await req('GET', '/health');
  if (r.ok) {
    console.log('  ✅ Server is running');
  } else {
    console.log('  ❌ Server is not running');
  }
}

run().catch(err => console.error(err));
