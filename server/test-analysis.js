/**
 * Test Suite for Analysis Features
 * Tests: Interdisciplinary Issues, Architecture Analysis Demo, Expanded Conflict Detection
 * 
 * Run: node test-analysis.js
 * Make sure the server is running on localhost:5000 first.
 */

const BASE = 'http://localhost:5000/api';

// ---------------------------------------------------------------------------
// Helper: make HTTP request
// ---------------------------------------------------------------------------
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
    return { status: 0, data: err.message, ok: false, networkError: true };
  }
}

function pass(name) { console.log(`  ✅ ${name}`); }
function fail(name, detail) { console.log(`  ❌ ${name}: ${detail}`); }

// ---------------------------------------------------------------------------
// Main test runner
// ---------------------------------------------------------------------------
async function run() {
  console.log('\n═══════════════════════════════════════════════');
  console.log('  Analysis Features — Test Suite');
  console.log('═══════════════════════════════════════════════\n');

  let passed = 0, failed = 0;
  function check(ok, name, detail) {
    if (ok) { pass(name); passed++; }
    else { fail(name, detail || 'unexpected'); failed++; }
  }

  // ═══════════════════════════════════════════
  // 0. Health Check (make sure server is up)
  // ═══════════════════════════════════════════
  console.log('── 0. Health Check ──');
  {
    const r = await req('GET', '/health');
    check(r.ok && r.data.status === 'ok', 'Server is running', `status=${r.status} data=${JSON.stringify(r.data)}`);
    if (!r.ok) {
      console.log('\n  ⚠️  Server is not running! Start it with: npm run dev');
      console.log('  Aborting tests.\n');
      return;
    }
  }

  // ═══════════════════════════════════════════
  // 1. INTERDISCIPLINARY ANALYSIS
  // ═══════════════════════════════════════════
  console.log('\n── 1. Interdisciplinary Analysis ──');

  // 1a. Architecture with known issues (ESP32 + HTTP + Battery)
  {
    const r = await req('POST', '/analysis/interdisciplinary', {
      device: 'ESP32',
      protocol: 'HTTP',
      database: 'MongoDB',
      powerSource: 'Battery',
      sensors: ['DHT22', 'BMP280', 'PIR'],
      cloudPlatform: 'AWS IoT',
    });
    check(r.ok && r.data.issues && r.data.issues.length > 0,
      'Detects issues for ESP32+HTTP+Battery',
      `status=${r.status} issues=${r.data?.issues?.length}`);
    
    if (r.ok) {
      // Should detect HTTP+Battery power issue
      const hasPowerIssue = r.data.issues.some(i => 
        i.category === 'power' || i.title.toLowerCase().includes('power') || i.title.toLowerCase().includes('battery')
      );
      check(hasPowerIssue, 'Found power-related issue', 
        `issues: ${r.data.issues.map(i => i.title).join(', ')}`);

      // Verify issue structure
      const firstIssue = r.data.issues[0];
      check(
        firstIssue.title && firstIssue.severity && firstIssue.disciplines && firstIssue.guidingQuestion,
        'Issue has correct structure (title, severity, disciplines, guidingQuestion)',
        `keys: ${Object.keys(firstIssue).join(', ')}`
      );

      // Verify disciplines is an array with at least 2 elements
      check(
        Array.isArray(firstIssue.disciplines) && firstIssue.disciplines.length >= 2,
        'Issue involves 2+ disciplines',
        `disciplines: ${firstIssue.disciplines}`
      );

      // Verify summary exists
      check(
        r.data.summary && typeof r.data.summary.total === 'number',
        'Response includes summary with totals',
        `total=${r.data.summary?.total}`
      );

      console.log(`    📊 Found ${r.data.issues.length} issues, summary: HIGH=${r.data.summary?.bySeverity?.HIGH}, MEDIUM=${r.data.summary?.bySeverity?.MEDIUM}, LOW=${r.data.summary?.bySeverity?.LOW}`);
    }
  }

  // 1b. Architecture with Arduino + MQTT (missing WiFi)
  {
    const r = await req('POST', '/analysis/interdisciplinary', {
      device: 'Arduino Uno',
      protocol: 'MQTT',
      database: 'Firebase',
      powerSource: 'USB Power',
      sensors: ['DHT22'],
      cloudPlatform: 'Firebase',
    });
    check(r.ok && r.data.issues.some(i => i.title.toLowerCase().includes('wifi') || i.disciplines.includes('Communication')),
      'Detects WiFi missing on Arduino Uno',
      `issues: ${r.data?.issues?.map(i => i.title).join(', ')}`);
  }

  // 1c. Clean architecture (Raspberry Pi + WebSocket + AC Power)
  {
    const r = await req('POST', '/analysis/interdisciplinary', {
      device: 'Raspberry Pi',
      protocol: 'WebSocket',
      database: 'MongoDB',
      powerSource: 'AC Power',
      sensors: ['DHT22'],
      cloudPlatform: 'Azure IoT Hub',
    });
    check(r.ok, 'Analyzes Raspberry Pi architecture',
      `status=${r.status} issues=${r.data?.issues?.length}`);
    
    // Should NOT have a battery-related HIGH issue
    if (r.ok) {
      const hasBatteryHigh = r.data.issues.some(i => 
        i.severity === 'HIGH' && i.category === 'power'
      );
      check(!hasBatteryHigh, 'No HIGH power issues for AC-powered device',
        `power issues: ${r.data.issues.filter(i => i.category === 'power').length}`);
    }
  }

  // 1d. Missing device field (validation)
  {
    const r = await req('POST', '/analysis/interdisciplinary', {
      protocol: 'MQTT',
    });
    check(r.status === 400, 'Rejects request without device field',
      `status=${r.status}`);
  }

  // 1e. Empty sensors array
  {
    const r = await req('POST', '/analysis/interdisciplinary', {
      device: 'ESP32',
      protocol: 'MQTT',
      sensors: [],
    });
    check(r.ok, 'Accepts empty sensors array',
      `status=${r.status} issues=${r.data?.issues?.length}`);
  }

  // 1f. BLE + Cloud (should detect BLE can't reach cloud)
  {
    const r = await req('POST', '/analysis/interdisciplinary', {
      device: 'ESP32',
      protocol: 'BLE',
      database: 'MongoDB',
      powerSource: 'Battery',
      sensors: ['DHT22'],
      cloudPlatform: 'AWS IoT',
    });
    check(r.ok && r.data.issues.some(i => i.title.toLowerCase().includes('ble')),
      'Detects BLE cannot reach cloud directly',
      `issues: ${r.data?.issues?.map(i => i.title).join(', ')}`);
  }

  // 1g. I2C sensor conflicts
  {
    const r = await req('POST', '/analysis/interdisciplinary', {
      device: 'ESP32',
      protocol: 'MQTT',
      database: 'InfluxDB',
      powerSource: 'USB Power',
      sensors: ['BMP280', 'MPU6050', 'DHT22'],
      cloudPlatform: 'AWS IoT',
    });
    check(r.ok && r.data.issues.some(i => i.title.toLowerCase().includes('i2c')),
      'Detects I2C bus conflicts between BMP280 and MPU6050',
      `issues: ${r.data?.issues?.map(i => i.title).join(', ')}`);
  }

  // ═══════════════════════════════════════════
  // 2. DEMO PROJECTS (Architecture Analysis)
  // ═══════════════════════════════════════════
  console.log('\n── 2. Demo Projects (Architecture Analysis) ──');

  // 2a. List all demo projects
  {
    const r = await req('GET', '/analysis/demo-projects');
    check(r.ok && Array.isArray(r.data) && r.data.length === 3,
      'Returns 3 demo projects',
      `status=${r.status} count=${r.data?.length}`);
    
    if (r.ok && r.data.length > 0) {
      const first = r.data[0];
      check(first.id && first.name && first.healthScore !== undefined,
        'Demo project has id, name, and healthScore',
        `keys: ${Object.keys(first).join(', ')}`);
      
      console.log('    📋 Demo projects:');
      r.data.forEach(p => console.log(`       - ${p.name} (${p.device}, health: ${p.healthScore}%)`));
    }
  }

  // 2b. Get specific demo project — Smart Greenhouse
  {
    const r = await req('GET', '/analysis/demo-projects/demo-greenhouse');
    check(r.ok && r.data.name === 'Smart Greenhouse Monitor',
      'Get Smart Greenhouse demo project',
      `status=${r.status} name=${r.data?.name}`);
    
    if (r.ok) {
      check(Array.isArray(r.data.layers) && r.data.layers.length > 0,
        'Has architecture layers',
        `layers=${r.data.layers?.length}`);
      check(Array.isArray(r.data.bottlenecks) && r.data.bottlenecks.length > 0,
        'Has bottlenecks identified',
        `bottlenecks=${r.data.bottlenecks?.length}`);
      check(Array.isArray(r.data.failurePoints) && r.data.failurePoints.length > 0,
        'Has failure points identified',
        `failurePoints=${r.data.failurePoints?.length}`);
      check(Array.isArray(r.data.integrationRisks) && r.data.integrationRisks.length > 0,
        'Has integration risks identified',
        `integrationRisks=${r.data.integrationRisks?.length}`);
      check(Array.isArray(r.data.dataFlow) && r.data.dataFlow.length > 0,
        'Has data flow steps',
        `dataFlow=${r.data.dataFlow?.length}`);
      check(typeof r.data.healthScore === 'number' && r.data.healthScore >= 0 && r.data.healthScore <= 100,
        'Health score is 0-100',
        `healthScore=${r.data.healthScore}`);
    }
  }

  // 2c. Get Smart Parking (should have low health score)
  {
    const r = await req('GET', '/analysis/demo-projects/demo-parking');
    check(r.ok && r.data.healthScore < 60,
      'Smart Parking has low health score (problematic architecture)',
      `healthScore=${r.data?.healthScore}`);
  }

  // 2d. Non-existent demo project
  {
    const r = await req('GET', '/analysis/demo-projects/non-existent');
    check(r.status === 404,
      'Returns 404 for non-existent demo project',
      `status=${r.status}`);
  }

  // ═══════════════════════════════════════════
  // 3. CUSTOM ARCHITECTURE ANALYSIS
  // ═══════════════════════════════════════════
  console.log('\n── 3. Custom Architecture Analysis ──');

  // 3a. Analyze a problematic architecture
  {
    const r = await req('POST', '/analysis/architecture', {
      device: 'Arduino Uno',
      protocol: 'HTTP',
      database: 'MongoDB',
      powerSource: 'Battery',
      sensors: ['DHT22', 'BMP280', 'PIR', 'Ultrasonic'],
      cloudPlatform: 'Firebase',
    });
    check(r.ok && typeof r.data.healthScore === 'number',
      'Returns health score for custom architecture',
      `healthScore=${r.data?.healthScore}`);
    
    if (r.ok) {
      check(r.data.healthScore < 50,
        'Low health score for problematic architecture',
        `healthScore=${r.data.healthScore}`);
      check(Array.isArray(r.data.dataFlow) && r.data.dataFlow.length > 0,
        'Returns data flow steps',
        `dataFlow=${r.data.dataFlow?.length}`);
      check(Array.isArray(r.data.layers) && r.data.layers.length > 0,
        'Returns layer analysis',
        `layers=${r.data.layers?.length}`);
      check(Array.isArray(r.data.issues) && r.data.issues.length > 0,
        'Returns issues list',
        `issues=${r.data.issues?.length}`);
      
      console.log(`    📊 Health: ${r.data.healthScore}%, Issues: ${r.data.issues.length}, Layers: ${r.data.layers.length}`);
    }
  }

  // 3b. Missing device field (validation)
  {
    const r = await req('POST', '/analysis/architecture', {
      protocol: 'MQTT',
    });
    check(r.status === 400, 'Rejects architecture analysis without device',
      `status=${r.status}`);
  }

  // 3c. Clean architecture should have high health score
  {
    const r = await req('POST', '/analysis/architecture', {
      device: 'ESP32',
      protocol: 'MQTT',
      database: 'InfluxDB',
      powerSource: 'USB Power',
      sensors: ['DHT22'],
      cloudPlatform: 'AWS IoT',
    });
    check(r.ok && r.data.healthScore > 50,
      'Good architecture has reasonable health score',
      `healthScore=${r.data?.healthScore}`);
  }

  // ═══════════════════════════════════════════
  // 4. EXPANDED CONFLICT DETECTION (via /bot/detect-conflicts)
  // ═══════════════════════════════════════════
  console.log('\n── 4. Expanded Conflict Detection ──');

  // 4a. Arduino + HTTP + Battery (should get many conflicts)
  {
    console.log('    ⏳ Running conflict detection...');
    const r = await req('POST', '/bot/detect-conflicts', {
      device: 'Arduino Uno',
      protocol: 'HTTP',
      database: 'MongoDB',
      powerSource: 'Battery',
      sensors: ['DHT22', 'BMP280', 'PIR', 'Ultrasonic'],
      cloudPlatform: 'AWS IoT',
    });
    check(r.ok && Array.isArray(r.data.conflicts) && r.data.conflicts.length >= 3,
      'Arduino+HTTP+Battery finds 3+ conflicts',
      `conflicts=${r.data?.conflicts?.length}`);
    
    if (r.ok) {
      // Should detect: HTTP+Battery, Arduino no WiFi, battery management, multiple sensors
      const titles = r.data.conflicts.map(c => c.title.toLowerCase());
      check(titles.some(t => t.includes('http') || t.includes('power')),
        'Detects HTTP power issue',
        `titles: ${titles.join('; ')}`);
      check(titles.some(t => t.includes('wifi') || t.includes('arduino')),
        'Detects Arduino missing WiFi',
        `titles: ${titles.join('; ')}`);
      
      console.log(`    📊 Found ${r.data.conflicts.length} conflicts:`);
      r.data.conflicts.forEach(c => console.log(`       [${c.level}] ${c.title}`));
    }
  }

  // 4b. Firebase + MQTT (new rule - should detect incompatibility)
  {
    const r = await req('POST', '/bot/detect-conflicts', {
      device: 'ESP32',
      protocol: 'MQTT',
      database: 'MongoDB',
      powerSource: 'USB Power',
      sensors: ['DHT22'],
      cloudPlatform: 'Firebase',
    });
    check(r.ok && r.data.conflicts.some(c => c.title.toLowerCase().includes('firebase')),
      'Detects Firebase + MQTT incompatibility',
      `conflicts: ${r.data?.conflicts?.map(c => c.title).join('; ')}`);
  }

  // 4c. WebSocket on ESP32 (new rule)
  {
    const r = await req('POST', '/bot/detect-conflicts', {
      device: 'ESP32',
      protocol: 'WebSocket',
      database: 'MongoDB',
      powerSource: 'USB Power',
      sensors: ['DHT22'],
      cloudPlatform: 'AWS IoT',
    });
    check(r.ok && r.data.conflicts.some(c => c.title.toLowerCase().includes('websocket')),
      'Detects WebSocket memory issues on ESP32',
      `conflicts: ${r.data?.conflicts?.map(c => c.title).join('; ')}`);
  }

  // 4d. I2C conflicts (new rule)
  {
    const r = await req('POST', '/bot/detect-conflicts', {
      device: 'ESP32',
      protocol: 'MQTT',
      database: 'MongoDB',
      powerSource: 'USB Power',
      sensors: ['BMP280', 'MPU6050', 'SHT31'],
      cloudPlatform: 'AWS IoT',
    });
    check(r.ok && r.data.conflicts.some(c => c.title.toLowerCase().includes('i2c')),
      'Detects I2C address conflicts',
      `conflicts: ${r.data?.conflicts?.map(c => c.title).join('; ')}`);
  }

  // 4e. Raspberry Pi + Battery (new rule)
  {
    const r = await req('POST', '/bot/detect-conflicts', {
      device: 'Raspberry Pi',
      protocol: 'HTTP',
      database: 'MongoDB',
      powerSource: 'Battery',
      sensors: ['DHT22'],
      cloudPlatform: '',
    });
    check(r.ok && r.data.conflicts.some(c => c.title.toLowerCase().includes('raspberry')),
      'Detects Raspberry Pi + Battery impracticality',
      `conflicts: ${r.data?.conflicts?.map(c => c.title).join('; ')}`);
  }

  // 4f. Clean architecture (should find minimal issues)
  {
    const r = await req('POST', '/bot/detect-conflicts', {
      device: 'ESP32',
      protocol: 'MQTT',
      database: 'InfluxDB',
      powerSource: 'USB Power',
      sensors: ['DHT22'],
      cloudPlatform: '',
    });
    check(r.ok && r.data.conflicts.length >= 1,
      'Returns at least 1 result even for clean architecture',
      `conflicts=${r.data?.conflicts?.length}`);
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
