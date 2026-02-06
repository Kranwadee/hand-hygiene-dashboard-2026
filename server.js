/**
 * Mock API Server for Hand Hygiene Dashboard
 * ==========================================
 * Run: node server.js
 * Endpoint: GET http://localhost:3000/api/scan-logs
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// ============================================================
// MOCK DATA CONFIGURATION
// ============================================================

const DEPARTMENTS = ['ICU', 'ER', 'OPD', 'Ward A', 'OR'];
const POSITIONS = ['แพทย์', 'พยาบาล', 'เจ้าหน้าที่'];
const ACTIVITIES = [
    'Before Patient Contact',
    'After Patient Contact',
    'After Fluid Exposure',
    'Sterile Procedure',
    'Morning Round',
    'General Hygiene'
];

// Thai names for random generation
const FIRST_NAMES = [
    'สมชาย', 'สมหญิง', 'สุดา', 'วิชัย', 'พรรณี', 'ประยุทธ์', 'อรุณ', 'มานี',
    'กมล', 'ชัยวัฒน์', 'ปิยะ', 'ศิริพร', 'นิภา', 'วรรณา', 'สุรชัย', 'พิมพ์ใจ',
    'อภิชาติ', 'รัตนา', 'ธนกร', 'จิราภรณ์', 'วิทยา', 'สุนทร', 'ปราณี', 'อัญชลี'
];

const LAST_NAMES = [
    'ใจดี', 'รักสะอาด', 'มีสุข', 'เจริญ', 'สมบูรณ์', 'พัฒนา', 'ศรีสุข', 'วงศ์ดี',
    'แก้วมณี', 'ทองดี', 'สุขสันต์', 'รุ่งเรือง', 'พงษ์พันธ์', 'ชัยชนะ', 'วิไลวรรณ',
    'เพชรดี', 'พลอยงาม', 'สง่างาม', 'ศักดิ์สิทธิ์', 'มงคล', 'สิริมงคล', 'ภูมิใจ'
];

// Zone names in Thai
const DIRTY_ZONES = [
    'นิ้วโป้ง', 'นิ้วชี้', 'นิ้วกลาง', 'นิ้วนาง', 'นิ้วก้อย',
    'ฝ่ามือ', 'หลังมือ', 'ข้อมือ', 'ซอกนิ้ว'
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Generate random integer between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick random item from array
 */
function randomPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate random 6-digit employee ID
 */
function generateEmployeeId() {
    return String(randomInt(100000, 999999));
}

/**
 * Generate random Thai name
 */
function generateThaiName() {
    return `${randomPick(FIRST_NAMES)} ${randomPick(LAST_NAMES)}`;
}

/**
 * Generate random timestamp within last N days
 */
function generateTimestamp(daysBack = 30) {
    const now = new Date();
    const pastDate = new Date(now.getTime() - randomInt(0, daysBack * 24 * 60 * 60 * 1000));

    // Set random hour between 7:00 - 18:00
    pastDate.setHours(randomInt(7, 18), randomInt(0, 59), randomInt(0, 59), 0);

    return pastDate.toISOString();
}

/**
 * Generate dirty zones string based on score
 * Lower score = more dirty zones
 */
function generateDirtyZones(score) {
    if (score >= 90) {
        return '-';
    }

    // Calculate number of dirty zones based on score
    let zoneCount;
    if (score >= 80) {
        zoneCount = randomInt(0, 1);
    } else if (score >= 60) {
        zoneCount = randomInt(1, 2);
    } else if (score >= 40) {
        zoneCount = randomInt(2, 3);
    } else {
        zoneCount = randomInt(3, 5);
    }

    if (zoneCount === 0) {
        return '-';
    }

    // Pick random zones
    const shuffled = [...DIRTY_ZONES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, zoneCount).join(',');
}

/**
 * Generate a single scan log record
 */
function generateScanLog() {
    // Generate scores (correlated - similar for front and back)
    const baseScore = randomInt(30, 100);
    const frontScore = Math.min(100, Math.max(0, baseScore + randomInt(-15, 15)));
    const backScore = Math.min(100, Math.max(0, baseScore + randomInt(-15, 15)));

    return {
        Timestamp: generateTimestamp(30),
        EmployeeID: generateEmployeeId(),
        EmployeeName: generateThaiName(),
        Department: randomPick(DEPARTMENTS),
        Position: randomPick(POSITIONS),
        FrontScore: frontScore,
        BackScore: backScore,
        FrontDirtyZones: generateDirtyZones(frontScore),
        BackDirtyZones: generateDirtyZones(backScore),
        ActivityName: randomPick(ACTIVITIES)
    };
}

/**
 * Generate array of scan logs
 */
function generateScanLogs(count = 500) {
    const logs = [];
    for (let i = 0; i < count; i++) {
        logs.push(generateScanLog());
    }
    // Sort by timestamp (newest first)
    return logs.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
}

// ============================================================
// API ENDPOINTS
// ============================================================

/**
 * GET /api/scan-logs
 * Returns mock scan log data
 */
app.get('/api/scan-logs', (req, res) => {
    console.log(`[${new Date().toISOString()}] GET /api/scan-logs`);

    const count = parseInt(req.query.count) || 500;
    const logs = generateScanLogs(count);

    console.log(`  → Returning ${logs.length} records`);
    res.json(logs);
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
    res.json({
        name: 'Hand Hygiene Mock API Server',
        version: '1.0.0',
        endpoints: [
            'GET /api/scan-logs - Returns mock scan log data (500 records by default)',
            'GET /api/scan-logs?count=100 - Returns specified number of records',
            'GET /api/health - Health check'
        ]
    });
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════════════');
    console.log(' 🖐️  Hand Hygiene Mock API Server');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(` ✅ Server running at: http://localhost:${PORT}`);
    console.log(` 📡 API Endpoint: http://localhost:${PORT}/api/scan-logs`);
    console.log('═══════════════════════════════════════════════════════════');
});
