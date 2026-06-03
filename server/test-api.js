/**
 * Comprehensive API Test Suite for BridgeBot
 * Tests all endpoints: Auth, Projects, Tasks, Bot Chat, Mentor
 */

const BASE = 'http://localhost:5000/api';
let TOKEN = '';
let USER_ID = '';
let PROJECT_ID = '';
let SESSION_ID = '';
let TASK_ID = '';

const UNIQUE = Date.now();

async function req(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  
  try {
    const res = await fetch(`${BASE}${path}`, opts);
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return { status: res.status, data, ok: res.ok };
  } catch (err) {
    return { status: 0, data: err.message, ok: false, networkError: true };
  }
}

function pass(name) { console.log(`  ✅ ${name}`); }
function fail(name, detail) { console.log(`  ❌ ${name}: ${detail}`); }

async function run() {
  console.log('\n═══════════════════════════════════════════════');
  console.log('  BridgeBot Comprehensive API Test Suite');
  console.log('═══════════════════════════════════════════════\n');

  let passed = 0, failed = 0;
  function check(ok, name, detail) {
    if (ok) { pass(name); passed++; } 
    else { fail(name, detail || 'unexpected'); failed++; }
  }

  // ═══════════════════════════════════════════
  // 1. HEALTH CHECK
  // ═══════════════════════════════════════════
  console.log('── 1. Health Check ──');
  {
    const r = await req('GET', '/health');
    check(r.ok && r.data.status === 'ok', 'Health endpoint returns ok', JSON.stringify(r.data));
  }

  // ═══════════════════════════════════════════
  // 2. AUTH - REGISTER
  // ═══════════════════════════════════════════
  console.log('\n── 2. Auth: Register ──');
  {
    // 2a. Successful registration
    const r = await req('POST', '/auth/register', {
      username: `testuser_${UNIQUE}`,
      email: `test_${UNIQUE}@example.com`,
      password: 'TestPass123!'
    });
    check(r.ok && r.data.token && r.data.user, 'Register new user', `status=${r.status} ${JSON.stringify(r.data).slice(0,100)}`);
    if (r.ok) {
      TOKEN = r.data.token;
      USER_ID = r.data.user.id;
    }

    // 2b. Duplicate registration
    const r2 = await req('POST', '/auth/register', {
      username: `testuser_${UNIQUE}`,
      email: `test_${UNIQUE}@example.com`,
      password: 'TestPass123!'
    });
    check(r2.status === 400, 'Reject duplicate registration', `status=${r2.status} ${JSON.stringify(r2.data).slice(0,100)}`);

    // 2c. Missing fields
    const r3 = await req('POST', '/auth/register', { username: 'x' });
    check(!r3.ok, 'Reject registration with missing fields', `status=${r3.status}`);

    // 2d. Empty body
    const r4 = await req('POST', '/auth/register', {});
    check(!r4.ok, 'Reject empty registration body', `status=${r4.status}`);
  }

  // ═══════════════════════════════════════════
  // 3. AUTH - LOGIN
  // ═══════════════════════════════════════════
  console.log('\n── 3. Auth: Login ──');
  {
    // 3a. Login with username
    const r = await req('POST', '/auth/login', {
      usernameOrEmail: `testuser_${UNIQUE}`,
      password: 'TestPass123!'
    });
    check(r.ok && r.data.token, 'Login with correct username', `status=${r.status}`);
    if (r.ok) TOKEN = r.data.token;

    // 3b. Login with email
    const r2 = await req('POST', '/auth/login', {
      usernameOrEmail: `test_${UNIQUE}@example.com`,
      password: 'TestPass123!'
    });
    check(r2.ok && r2.data.token, 'Login with correct email', `status=${r2.status}`);

    // 3c. Wrong password
    const r3 = await req('POST', '/auth/login', {
      usernameOrEmail: `testuser_${UNIQUE}`,
      password: 'WrongPassword!'
    });
    check(r3.status === 400, 'Reject wrong password', `status=${r3.status}`);

    // 3d. Non-existent user
    const r4 = await req('POST', '/auth/login', {
      usernameOrEmail: 'nonexistent_user_xyz',
      password: 'anything'
    });
    check(r4.status === 400, 'Reject non-existent user', `status=${r4.status}`);

    // 3e. Empty credentials
    const r5 = await req('POST', '/auth/login', {});
    check(!r5.ok, 'Reject empty login body', `status=${r5.status}`);
  }

  // ═══════════════════════════════════════════
  // 4. AUTH - PROTECTED ROUTES
  // ═══════════════════════════════════════════
  console.log('\n── 4. Auth: Protected Routes ──');
  {
    // 4a. GET /me with valid token
    const r = await req('GET', '/auth/me', null, TOKEN);
    check(r.ok && r.data.username, 'GET /me with valid token', `status=${r.status}`);

    // 4b. GET /me without token
    const r2 = await req('GET', '/auth/me');
    check(r2.status === 401, 'GET /me without token returns 401', `status=${r2.status}`);

    // 4c. GET /me with invalid token
    const r3 = await req('GET', '/auth/me', null, 'invalid.jwt.token');
    check(r3.status === 401, 'GET /me with invalid token returns 401', `status=${r3.status}`);

    // 4d. GET /me with expired/fake token
    const r4 = await req('GET', '/auth/me', null, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmYWtlIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMDAwMX0.invalid');
    check(r4.status === 401, 'GET /me with tampered token returns 401', `status=${r4.status}`);
  }

  // ═══════════════════════════════════════════
  // 5. PROJECTS
  // ═══════════════════════════════════════════
  console.log('\n── 5. Projects ──');
  {
    // 5a. Create project
    const r = await req('POST', '/projects', {
      name: `Test IoT Project ${UNIQUE}`,
      description: 'A test smart greenhouse project',
      device: 'ESP32',
      protocol: 'MQTT',
      database: 'MongoDB',
      powerSource: 'Battery',
      sensors: ['DHT22', 'BMP280'],
      cloudPlatform: 'AWS IoT'
    }, TOKEN);
    check(r.ok && r.data._id, 'Create new project', `status=${r.status} id=${r.data._id}`);
    if (r.ok) PROJECT_ID = r.data._id;

    // 5b. List projects
    const r2 = await req('GET', '/projects', null, TOKEN);
    check(r2.ok && Array.isArray(r2.data) && r2.data.length > 0, 'List projects returns array', `count=${r2.data?.length}`);

    // 5c. Get single project
    if (PROJECT_ID) {
      const r3 = await req('GET', `/projects/${PROJECT_ID}`, null, TOKEN);
      check(r3.ok && r3.data.name, 'Get single project by ID', `name=${r3.data.name}`);
    }

    // 5d. Update project
    if (PROJECT_ID) {
      const r4 = await req('PUT', `/projects/${PROJECT_ID}`, {
        device: 'Raspberry Pi',
        protocol: 'HTTP'
      }, TOKEN);
      check(r4.ok && r4.data.device === 'Raspberry Pi', 'Update project', `device=${r4.data?.device}`);
    }

    // 5e. Create project without auth
    const r5 = await req('POST', '/projects', { name: 'Hack' });
    check(r5.status === 401, 'Reject project creation without auth', `status=${r5.status}`);

    // 5f. Get non-existent project
    const r6 = await req('GET', '/projects/000000000000000000000000', null, TOKEN);
    check(r6.status === 404, 'Return 404 for non-existent project', `status=${r6.status}`);

    // 5g. Invalid project ID format
    const r7 = await req('GET', '/projects/invalid-id', null, TOKEN);
    check(!r7.ok, 'Handle invalid project ID format', `status=${r7.status}`);
  }

  // ═══════════════════════════════════════════
  // 6. TASKS
  // ═══════════════════════════════════════════
  console.log('\n── 6. Tasks ──');
  {
    // 6a. Create task
    if (PROJECT_ID) {
      const r = await req('POST', '/tasks', {
        project: PROJECT_ID,
        title: 'Setup DHT22 sensor wiring',
        description: 'Connect DHT22 data pin to GPIO4',
        status: 'todo',
        priority: 'high',
        discipline: 'hardware'
      }, TOKEN);
      check(r.ok && r.data._id, 'Create new task', `status=${r.status}`);
      if (r.ok) TASK_ID = r.data._id;
    }

    // 6b. Get tasks for project
    if (PROJECT_ID) {
      const r2 = await req('GET', `/tasks/${PROJECT_ID}`, null, TOKEN);
      check(r2.ok && Array.isArray(r2.data), 'Get tasks for project', `count=${r2.data?.length}`);
    }

    // 6c. Update task status
    if (TASK_ID) {
      const r3 = await req('PUT', `/tasks/${TASK_ID}`, {
        status: 'in-progress'
      }, TOKEN);
      check(r3.ok && r3.data.status === 'in-progress', 'Update task status', `status=${r3.data?.status}`);
    }

    // 6d. Create task without auth
    const r4 = await req('POST', '/tasks', { title: 'Hack' });
    check(r4.status === 401, 'Reject task creation without auth', `status=${r4.status}`);
  }

  // ═══════════════════════════════════════════
  // 7. BOT CHAT (Core Feature)
  // ═══════════════════════════════════════════
  console.log('\n── 7. Bot Chat (Socratic AI) ──');
  {
    // 7a. Chat without auth
    const r1 = await req('POST', '/bot/chat', { message: 'hello' });
    check(r1.status === 401, 'Bot rejects unauthenticated requests', `status=${r1.status}`);

    // 7b. Chat with empty message
    const r2 = await req('POST', '/bot/chat', { message: '' }, TOKEN);
    check(r2.status === 400, 'Bot rejects empty message', `status=${r2.status} data=${JSON.stringify(r2.data)}`);

    // 7c. Chat with null message
    const r2b = await req('POST', '/bot/chat', {}, TOKEN);
    check(r2b.status === 400, 'Bot rejects missing message field', `status=${r2b.status}`);

    // 7d. Basic chat - WITHOUT projectId (general session)
    console.log('    ⏳ Sending first message to AI (may take a few seconds)...');
    const r3 = await req('POST', '/bot/chat', {
      message: 'My ESP32 keeps disconnecting from WiFi every 5 minutes when sending sensor data.'
    }, TOKEN);
    check(r3.ok && r3.data.reply && r3.data.sessionId, 'Bot chat - general session (no project)', `status=${r3.status} reply_len=${r3.data?.reply?.length}`);
    if (r3.ok) {
      SESSION_ID = r3.data.sessionId;
      console.log(`    📝 Bot reply preview: "${r3.data.reply?.slice(0, 120)}..."`);
    }

    // 7e. Follow-up in same session
    if (SESSION_ID) {
      console.log('    ⏳ Sending follow-up message...');
      const r4 = await req('POST', '/bot/chat', {
        message: 'I am using a battery and the WiFi module draws a lot of power during transmission.',
        sessionId: SESSION_ID
      }, TOKEN);
      check(r4.ok && r4.data.reply, 'Bot chat - follow-up in same session', `status=${r4.status} msgs=${r4.data?.messageCount}`);
      if (r4.ok) {
        console.log(`    📝 Follow-up reply preview: "${r4.data.reply?.slice(0, 120)}..."`);
      }
    }

    // 7f. Chat WITH projectId
    if (PROJECT_ID) {
      console.log('    ⏳ Sending message with project context...');
      const r5 = await req('POST', '/bot/chat', {
        message: 'The temperature readings from my DHT22 sensor are way too high, showing 80C indoors.',
        projectId: PROJECT_ID
      }, TOKEN);
      check(r5.ok && r5.data.reply, 'Bot chat - with project context', `status=${r5.status}`);
      if (r5.ok) {
        console.log(`    📝 Context-aware reply preview: "${r5.data.reply?.slice(0, 120)}..."`);
      }
    }

    // 7g. Get session by ID
    if (SESSION_ID) {
      const r6 = await req('GET', `/bot/session/${SESSION_ID}`, null, TOKEN);
      check(r6.ok && r6.data.messages && r6.data.messages.length >= 2, 'Get chat session persisted in DB', `msgs=${r6.data?.messages?.length}`);
    }

    // 7h. Get history for project
    if (PROJECT_ID) {
      const r7 = await req('GET', `/bot/history/${PROJECT_ID}`, null, TOKEN);
      check(r7.ok && Array.isArray(r7.data), 'Get chat history for project', `sessions=${r7.data?.length}`);
    }

    // 7i. Get non-existent session
    const r8 = await req('GET', '/bot/session/non_existent_session_id', null, TOKEN);
    check(r8.status === 404, 'Return 404 for non-existent session', `status=${r8.status}`);
  }

  // ═══════════════════════════════════════════
  // 8. BOT - CONFLICT DETECTION
  // ═══════════════════════════════════════════
  console.log('\n── 8. Bot: Conflict Detection ──');
  {
    console.log('    ⏳ Running AI conflict detection...');
    const r = await req('POST', '/bot/detect-conflicts', {
      device: 'ESP32',
      protocol: 'HTTP',
      database: 'MongoDB',
      powerSource: 'Battery',
      sensors: ['DHT22', 'BMP280', 'ultrasonic'],
      cloudPlatform: 'AWS IoT'
    }, TOKEN);
    check(r.ok && Array.isArray(r.data.conflicts), 'Detect conflicts returns array', `conflicts=${r.data?.conflicts?.length}`);
    if (r.ok && r.data.conflicts?.length > 0) {
      console.log(`    📝 First conflict: "${r.data.conflicts[0]?.title}" [${r.data.conflicts[0]?.level}]`);
    }
  }

  // ═══════════════════════════════════════════
  // 9. MENTOR ROUTES (Role-based access)
  // ═══════════════════════════════════════════
  console.log('\n── 9. Mentor Routes (Role Access) ──');
  {
    // 9a. Student trying to access mentor routes
    const r = await req('GET', '/mentor/dashboard', null, TOKEN);
    check(r.status === 403, 'Student cannot access mentor dashboard', `status=${r.status}`);

    // 9b. Student trying to access mentor projects
    const r2 = await req('GET', '/mentor/projects', null, TOKEN);
    check(r2.status === 403, 'Student cannot access mentor projects', `status=${r2.status}`);

    // 9c. Register a mentor and test
    const mentorR = await req('POST', '/auth/register', {
      username: `mentor_${UNIQUE}`,
      email: `mentor_${UNIQUE}@example.com`,
      password: 'MentorPass123!',
      role: 'mentor'
    });
    if (mentorR.ok) {
      const mentorToken = mentorR.data.token;
      
      const r3 = await req('GET', '/mentor/dashboard', null, mentorToken);
      check(r3.ok, 'Mentor CAN access dashboard', `status=${r3.status} projects=${r3.data?.totalProjects}`);
      
      const r4 = await req('GET', '/mentor/projects', null, mentorToken);
      check(r4.ok && Array.isArray(r4.data), 'Mentor CAN list all projects', `status=${r4.status}`);
    } else {
      console.log(`    ⚠️  Could not create mentor user: ${JSON.stringify(mentorR.data)}`);
    }
  }

  // ═══════════════════════════════════════════
  // 10. PROFILE UPDATE
  // ═══════════════════════════════════════════
  console.log('\n── 10. Profile Update ──');
  {
    const r = await req('PUT', '/auth/profile', {
      username: `testuser_${UNIQUE}`,
      bio: 'IoT enthusiast working on smart greenhouse',
      expertise: ['ESP32', 'MQTT', 'Python'],
      discipline: 'Electrical Engineering'
    }, TOKEN);
    check(r.ok && r.data.bio, 'Update profile successfully', `bio="${r.data?.bio?.slice(0,30)}"`);

    // Verify change persisted
    const r2 = await req('GET', '/auth/me', null, TOKEN);
    check(r2.ok && r2.data.bio === 'IoT enthusiast working on smart greenhouse', 'Profile changes persisted in DB', `bio="${r2.data?.bio?.slice(0,30)}"`);
  }

  // ═══════════════════════════════════════════
  // 11. CLEANUP
  // ═══════════════════════════════════════════
  console.log('\n── 11. Cleanup ──');
  {
    // Delete task
    if (TASK_ID) {
      const r = await req('DELETE', `/tasks/${TASK_ID}`, null, TOKEN);
      check(r.ok, 'Delete test task', `status=${r.status}`);
    }
    // Delete project
    if (PROJECT_ID) {
      const r2 = await req('DELETE', `/projects/${PROJECT_ID}`, null, TOKEN);
      check(r2.ok, 'Delete test project', `status=${r2.status}`);
    }
    // Verify project is gone
    if (PROJECT_ID) {
      const r3 = await req('GET', `/projects/${PROJECT_ID}`, null, TOKEN);
      check(r3.status === 404, 'Deleted project returns 404', `status=${r3.status}`);
    }
  }

  // ═══════════════════════════════════════════
  // RESULTS
  // ═══════════════════════════════════════════
  console.log('\n═══════════════════════════════════════════════');
  console.log(`  RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log('═══════════════════════════════════════════════\n');
  
  if (failed > 0) {
    console.log('  ⚠️  Some tests failed! Review the output above.');
  } else {
    console.log('  🎉 All tests passed!');
  }
}

run().catch(err => { console.error('Test runner error:', err); });
