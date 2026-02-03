/**
 * Hand Hygiene Dashboard - API Integration
 * =========================================
 * 
 * วิธีใช้:
 * 1. Copy code นี้ไปใส่ใน script ของแต่ละ Dashboard
 * 2. แก้ API_URL ให้ตรงกับ Apps Script URL ที่ Deploy แล้ว
 * 3. เรียกใช้ fetchDashboardData() แทน mock data
 * 
 * สร้างโดย: [ชื่อเด็กฝึกงาน]
 * วันที่: 30 มกราคม 2569
 */

// ===== CONFIG =====
// แก้ตรงนี้! ใส่ URL จาก Apps Script ที่ Deploy แล้ว
const API_URL = 'YOUR_APPS_SCRIPT_DEPLOYED_URL_HERE';

// ===== FETCH DATA FUNCTIONS =====

/**
 * ดึงข้อมูลสำหรับ Dashboard หลัก
 * 
 * @param {Object} params - ตัวกรองข้อมูล
 * @param {string} params.activity_id - กรองตามกิจกรรม
 * @param {string} params.department - กรองตามแผนก
 * @param {string} params.emp_id - กรองตามพนักงาน
 * @returns {Promise<Object>} - ข้อมูล Dashboard
 */
async function fetchDashboardData(params = {}) {
    const url = new URL(API_URL);
    url.searchParams.append('action', 'getDashboardData');

    // เพิ่ม filters
    if (params.activity_id) url.searchParams.append('activity_id', params.activity_id);
    if (params.department) url.searchParams.append('department', params.department);
    if (params.emp_id) url.searchParams.append('emp_id', params.emp_id);
    if (params.start_date) url.searchParams.append('start_date', params.start_date);
    if (params.end_date) url.searchParams.append('end_date', params.end_date);

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return null;
    }
}

/**
 * ดึงข้อมูลพนักงานทั้งหมด
 */
async function fetchEmployees() {
    const url = new URL(API_URL);
    url.searchParams.append('action', 'getEmployees');

    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Error fetching employees:', error);
        return [];
    }
}

/**
 * ดึงข้อมูลแผนกทั้งหมด
 */
async function fetchDepartments() {
    const url = new URL(API_URL);
    url.searchParams.append('action', 'getDepartments');

    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Error fetching departments:', error);
        return [];
    }
}

/**
 * ดึงข้อมูลกิจกรรมทั้งหมด
 */
async function fetchActivities() {
    const url = new URL(API_URL);
    url.searchParams.append('action', 'getActivities');

    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Error fetching activities:', error);
        return [];
    }
}

/**
 * เพิ่ม record ใหม่ (สำหรับ UV Camera App)
 * 
 * @param {Object} recordData - ข้อมูล record
 */
async function addRecord(recordData) {
    const url = new URL(API_URL);
    url.searchParams.append('action', 'addRecord');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(recordData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error adding record:', error);
        return { success: false, error: error.message };
    }
}

// ===== REAL-TIME POLLING =====

/**
 * เริ่ม auto-refresh ข้อมูลทุกๆ N วินาที
 * 
 * @param {Function} updateCallback - function ที่จะเรียกเมื่อมีข้อมูลใหม่
 * @param {number} intervalSeconds - ระยะห่างการ refresh (วินาที)
 * @param {Object} params - ตัวกรองข้อมูล
 * @returns {number} - interval ID (ใช้สำหรับ stop)
 */
function startRealTimePolling(updateCallback, intervalSeconds = 30, params = {}) {
    // ดึงข้อมูลครั้งแรก
    fetchDashboardData(params).then(data => {
        if (data) updateCallback(data);
    });

    // ตั้ง interval
    const intervalId = setInterval(async () => {
        const data = await fetchDashboardData(params);
        if (data) {
            updateCallback(data);
            console.log('Dashboard data refreshed at:', new Date().toLocaleTimeString());
        }
    }, intervalSeconds * 1000);

    return intervalId;
}

/**
 * หยุด auto-refresh
 * 
 * @param {number} intervalId - ID จาก startRealTimePolling
 */
function stopRealTimePolling(intervalId) {
    clearInterval(intervalId);
    console.log('Real-time polling stopped');
}

// ===== EXAMPLE USAGE =====

/*
// ตัวอย่างการใช้งาน:

// 1. ดึงข้อมูล Dashboard (ครั้งเดียว)
const data = await fetchDashboardData();
console.log('Summary:', data.summary);
console.log('Records:', data.records);

// 2. ดึงข้อมูลเฉพาะแผนก
const icuData = await fetchDashboardData({ department: 'ICU' });

// 3. ดึงข้อมูลเฉพาะพนักงาน
const empData = await fetchDashboardData({ emp_id: 'EMP001' });

// 4. เปิด real-time polling
const pollingId = startRealTimePolling((data) => {
  // อัพเดท UI ตรงนี้
  updateDashboardUI(data);
}, 30); // refresh ทุก 30 วินาที

// 5. หยุด polling
stopRealTimePolling(pollingId);

// 6. เพิ่ม record ใหม่ (UV Camera App)
const result = await addRecord({
  emp_id: 'EMP001',
  activity_id: 'ACT-2026-01',
  front_score: 85,
  back_score: 90,
  zone_1: true,
  zone_5: true
});
console.log('Add result:', result);
*/

// ===== HELPER: UPDATE DASHBOARD UI =====

/**
 * ตัวอย่าง function อัพเดท UI
 * แก้ไขตาม HTML element IDs ของแต่ละ dashboard
 */
function updateDashboardUI(data) {
    if (!data) return;

    // อัพเดท summary cards
    if (data.summary) {
        // แก้ ID ตาม HTML ของคุณ
        const avgScoreEl = document.getElementById('avgScore');
        if (avgScoreEl) {
            avgScoreEl.textContent = ((data.summary.avg_front_score + data.summary.avg_back_score) / 2).toFixed(1) + '%';
        }

        const passRateEl = document.getElementById('passRate');
        if (passRateEl) {
            passRateEl.textContent = data.summary.pass_rate + '%';
        }

        const totalRecordsEl = document.getElementById('totalRecords');
        if (totalRecordsEl) {
            totalRecordsEl.textContent = data.summary.total_records;
        }
    }

    // TODO: อัพเดท charts, tables, etc.
    // ดู code เดิมใน dashboard แล้วแก้ไขให้ใช้ data จาก API
}
