/**
 * Mock API Server for Hand Hygiene Dashboard
 * ==========================================
 * Run: node server.js
 * Endpoint: GET http://localhost:3000/api/scan-logs
 * Endpoint: GET http://localhost:3000/api/employees/:id
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

const HOSPITALS = ['BDMS Phuket', 'Bangkok Hospital', 'Samitivej', 'Bumrungrad'];
const DEPARTMENTS = ['ICU', 'ER', 'OPD', 'Ward A', 'OR', 'Medical Informatics Development'];
const POSITIONS = ['แพทย์', 'พยาบาล', 'เจ้าหน้าที่', 'Trainee', 'นักศึกษาฝึกงาน'];
const ACTIVITIES = [
    'Before Patient Contact',
    'After Patient Contact',
    'After Fluid Exposure',
    'Sterile Procedure',
    'Morning Round',
    'General Hygiene',
    'กิจกรรมสองมือให้โลกรู้',
    'กิจกรรมล้างมือประจำวัน'
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
    'ฝ่ามือ', 'หลังมือ', 'ข้อมือ', 'ซอกนิ้ว', 'เล็บ'
];

// ============================================================
// MOCK EMPLOYEE DATABASE
// ============================================================

const EMPLOYEE_DATABASE = {};

// Pre-generate some fixed employees for consistency
function generateEmployeeDatabase() {
    const fixedEmployees = [
        { id: '620913', name: 'สมชาย ใจดี', dept: 'ER', pos: 'แพทย์', hospital: 'BDMS Phuket', age: 35, tenure: 8 },
        { id: '620914', name: 'สมหญิง รักเรียน', dept: 'ICU', pos: 'พยาบาล', hospital: 'BDMS Phuket', age: 28, tenure: 3 },
        { id: '620915', name: 'วิชัย มานะ', dept: 'OPD', pos: 'แพทย์', hospital: 'BDMS Phuket', age: 42, tenure: 15 },
        { id: '620916', name: 'นภา สดใส', dept: 'Ward A', pos: 'พยาบาล', hospital: 'BDMS Phuket', age: 31, tenure: 6 },
        { id: '620917', name: 'พิชัย เก่งกาจ', dept: 'OR', pos: 'แพทย์', hospital: 'BDMS Phuket', age: 45, tenure: 18 },
        { id: '620918', name: 'รัตนา สุขสันต์', dept: 'ICU', pos: 'พยาบาล', hospital: 'BDMS Phuket', age: 29, tenure: 4 },
        { id: '620919', name: 'ธนกร พัฒนา', dept: 'Medical Informatics Development', pos: 'Trainee', hospital: 'BDMS Phuket', age: 24, tenure: 1 },
        { id: '620920', name: 'จิราภรณ์ วงศ์ดี', dept: 'ER', pos: 'เจ้าหน้าที่', hospital: 'BDMS Phuket', age: 26, tenure: 2 },
    ];

    fixedEmployees.forEach(emp => {
        EMPLOYEE_DATABASE[emp.id] = emp;
    });
}

generateEmployeeDatabase();

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateEmployeeId() {
    // Use fixed employees 70% of the time for consistency
    if (Math.random() < 0.7) {
        const ids = Object.keys(EMPLOYEE_DATABASE);
        return randomPick(ids);
    }
    return String(randomInt(620900, 620999));
}

function generateThaiName() {
    return `${randomPick(FIRST_NAMES)} ${randomPick(LAST_NAMES)}`;
}

function generateTimestamp(daysBack = 30) {
    const now = new Date();
    const pastDate = new Date(now.getTime() - randomInt(0, daysBack * 24 * 60 * 60 * 1000));
    pastDate.setHours(randomInt(7, 18), randomInt(0, 59), randomInt(0, 59), 0);
    return pastDate.toISOString();
}

/**
 * Generate dirty zones string based on score
 * Also returns spot count
 */
function generateDirtyZonesAndSpots(score) {
    if (score >= 95) {
        return { zones: '-', spots: 0 };
    }

    // Calculate spots based on score (inverse relationship)
    const maxSpots = Math.round((100 - score) * 2);
    const spots = randomInt(Math.max(1, maxSpots - 20), maxSpots);

    // Calculate number of dirty zones
    let zoneCount;
    if (score >= 85) {
        zoneCount = randomInt(0, 1);
    } else if (score >= 70) {
        zoneCount = randomInt(1, 2);
    } else if (score >= 50) {
        zoneCount = randomInt(2, 3);
    } else {
        zoneCount = randomInt(3, 5);
    }

    if (zoneCount === 0) {
        return { zones: '-', spots: spots };
    }

    const shuffled = [...DIRTY_ZONES].sort(() => 0.5 - Math.random());
    return {
        zones: shuffled.slice(0, zoneCount).join(','),
        spots: spots
    };
}

/**
 * Determine status based on average score
 */
function determineStatus(frontScore, backScore) {
    const avgScore = (frontScore + backScore) / 2;
    return avgScore >= 80 ? 'PASS' : 'WARNING';
}

/**
 * Generate a single scan log record (UPDATED SCHEMA)
 */
function generateScanLog() {
    const empId = generateEmployeeId();
    const employee = EMPLOYEE_DATABASE[empId];

    // Generate scores (correlated - similar for front and back)
    const baseScore = randomInt(30, 100);
    const frontScore = Math.min(100, Math.max(0, baseScore + randomInt(-15, 15)));
    const backScore = Math.min(100, Math.max(0, baseScore + randomInt(-15, 15)));

    const frontData = generateDirtyZonesAndSpots(frontScore);
    const backData = generateDirtyZonesAndSpots(backScore);

    return {
        // Basic Info
        Timestamp: generateTimestamp(30),
        EmployeeID: empId,
        EmployeeName: employee ? employee.name : generateThaiName(),
        Department: employee ? employee.dept : randomPick(DEPARTMENTS),
        Position: employee ? employee.pos : randomPick(POSITIONS),
        Hospital: employee ? employee.hospital : randomPick(HOSPITALS),

        // Employee Demographics (NEW)
        Age: employee ? employee.age : randomInt(22, 55),
        Tenure: employee ? employee.tenure : randomInt(0, 20),

        // Front Hand Scores
        FrontScore: parseFloat(frontScore.toFixed(2)),
        FrontSpots: frontData.spots,
        FrontDirtyZones: frontData.zones,

        // Back Hand Scores
        BackScore: parseFloat(backScore.toFixed(2)),
        BackSpots: backData.spots,
        BackDirtyZones: backData.zones,

        // Result
        Status: determineStatus(frontScore, backScore),
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
 * GET /api/employees/:id
 * Returns employee information by ID
 */
app.get('/api/employees/:id', (req, res) => {
    const empId = req.params.id;
    console.log(`[${new Date().toISOString()}] GET /api/employees/${empId}`);

    const employee = EMPLOYEE_DATABASE[empId];

    if (employee) {
        res.json({
            EmployeeID: employee.id,
            EmployeeName: employee.name,
            Department: employee.dept,
            Position: employee.pos,
            Hospital: employee.hospital,
            Age: employee.age,
            Tenure: employee.tenure
        });
    } else {
        res.status(404).json({ error: 'Employee not found', employeeId: empId });
    }
});

/**
 * GET /api/employees
 * Returns all employees
 */
app.get('/api/employees', (req, res) => {
    console.log(`[${new Date().toISOString()}] GET /api/employees`);

    const employees = Object.values(EMPLOYEE_DATABASE).map(emp => ({
        EmployeeID: emp.id,
        EmployeeName: emp.name,
        Department: emp.dept,
        Position: emp.pos,
        Hospital: emp.hospital,
        Age: emp.age,
        Tenure: emp.tenure
    }));

    res.json(employees);
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
        version: '2.0.0',
        endpoints: [
            'GET /api/scan-logs - Returns mock scan log data (500 records by default)',
            'GET /api/scan-logs?count=100 - Returns specified number of records',
            'GET /api/employees - Returns all employees',
            'GET /api/employees/:id - Returns employee by ID',
            'GET /api/health - Health check'
        ],
        schema: {
            scanLog: {
                Timestamp: 'ISO date string',
                EmployeeID: 'string (6 digits)',
                EmployeeName: 'string',
                Department: 'string',
                Position: 'string',
                Hospital: 'string',
                Age: 'number (years)',
                Tenure: 'number (years)',
                FrontScore: 'number (0-100)',
                FrontSpots: 'number (count)',
                FrontDirtyZones: 'string (comma-separated Thai zones)',
                BackScore: 'number (0-100)',
                BackSpots: 'number (count)',
                BackDirtyZones: 'string (comma-separated Thai zones)',
                Status: 'PASS | WARNING',
                ActivityName: 'string'
            }
        }
    });
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════════════');
    console.log(' 🖐️  Hand Hygiene Mock API Server v2.0');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(` ✅ Server running at: http://localhost:${PORT}`);
    console.log(` 📡 Scan Logs:  http://localhost:${PORT}/api/scan-logs`);
    console.log(` 👤 Employees:  http://localhost:${PORT}/api/employees`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log(' 📋 New Schema Fields:');
    console.log('    - FrontSpots, BackSpots (จำนวนจุดสกปรก)');
    console.log('    - Status (PASS/WARNING)');
    console.log('    - Hospital, Age, Tenure (ข้อมูลพนักงาน)');
    console.log('═══════════════════════════════════════════════════════════');
});
