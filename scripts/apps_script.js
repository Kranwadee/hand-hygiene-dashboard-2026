/**
 * Hand Hygiene Dashboard - Google Apps Script API
 * ================================================
 * 
 * วิธีใช้:
 * 1. เปิด Google Sheets → Extensions → Apps Script
 * 2. Copy code นี้ไปวาง
 * 3. แก้ SPREADSHEET_ID ให้ตรงกับ Sheet ของคุณ
 * 4. Deploy → New deployment → Web app
 * 5. Copy URL ที่ได้ไปใช้ใน Dashboard
 * 
 * สร้างโดย: [ชื่อเด็กฝึกงาน]
 * วันที่: 30 มกราคม 2569
 */

// ===== CONFIG =====
// แก้ตรงนี้! เอา ID จาก URL ของ Google Sheets
// เช่น https://docs.google.com/spreadsheets/d/ABC123xyz/edit → ABC123xyz
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

// ===== MAIN FUNCTIONS =====

/**
 * รับ HTTP GET requests
 * ใช้สำหรับดึงข้อมูล
 */
function doGet(e) {
    const action = e.parameter.action;

    switch (action) {
        case 'getEmployees':
            return jsonResponse(getEmployees());
        case 'getDepartments':
            return jsonResponse(getDepartments());
        case 'getRecords':
            return jsonResponse(getRecords(e.parameter));
        case 'getActivities':
            return jsonResponse(getActivities());
        case 'getDashboardData':
            return jsonResponse(getDashboardData(e.parameter));
        default:
            return jsonResponse({ error: 'Unknown action', available: ['getEmployees', 'getDepartments', 'getRecords', 'getActivities', 'getDashboardData'] });
    }
}

/**
 * รับ HTTP POST requests
 * ใช้สำหรับเพิ่ม/แก้ไขข้อมูล
 */
function doPost(e) {
    const action = e.parameter.action;
    const data = JSON.parse(e.postData.contents);

    switch (action) {
        case 'addRecord':
            return jsonResponse(addRecord(data));
        case 'addEmployee':
            return jsonResponse(addEmployee(data));
        case 'updateRecord':
            return jsonResponse(updateRecord(data));
        default:
            return jsonResponse({ error: 'Unknown action', available: ['addRecord', 'addEmployee', 'updateRecord'] });
    }
}

// ===== HELPER FUNCTIONS =====

/**
 * สร้าง JSON response
 */
function jsonResponse(data) {
    return ContentService
        .createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}

/**
 * เปิด Sheet ตามชื่อ
 */
function getSheet(sheetName) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    return ss.getSheetByName(sheetName);
}

/**
 * แปลง Sheet data เป็น Array of Objects
 */
function sheetToObjects(sheetName) {
    const sheet = getSheet(sheetName);
    if (!sheet) {
        return [];
    }

    const data = sheet.getDataRange().getValues();
    if (data.length === 0) {
        return [];
    }

    const headers = data[0];

    return data.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, i) => {
            obj[header] = row[i];
        });
        return obj;
    });
}

// ===== DATA FUNCTIONS =====

/**
 * ดึงข้อมูลพนักงานทั้งหมด
 */
function getEmployees() {
    return sheetToObjects('employees');
}

/**
 * ดึงข้อมูลแผนก
 */
function getDepartments() {
    return sheetToObjects('departments');
}

/**
 * ดึงข้อมูลกิจกรรม
 */
function getActivities() {
    return sheetToObjects('activities');
}

/**
 * ดึงข้อมูล records (รองรับ filter)
 * 
 * params ที่รองรับ:
 * - activity_id: กรองตามกิจกรรม
 * - department: กรองตามแผนก
 * - emp_id: กรองตามพนักงาน
 * - start_date: วันที่เริ่มต้น (YYYY-MM-DD)
 * - end_date: วันที่สิ้นสุด (YYYY-MM-DD)
 */
function getRecords(params) {
    let records = sheetToObjects('records');

    // Filter by activity_id
    if (params && params.activity_id) {
        records = records.filter(r => r.activity_id === params.activity_id);
    }

    // Filter by department
    if (params && params.department) {
        const employees = getEmployees();
        const deptEmps = employees.filter(e => e.department === params.department).map(e => e.emp_id);
        records = records.filter(r => deptEmps.includes(r.emp_id));
    }

    // Filter by emp_id
    if (params && params.emp_id) {
        records = records.filter(r => r.emp_id === params.emp_id);
    }

    // Filter by date range
    if (params && params.start_date) {
        const startDate = new Date(params.start_date);
        records = records.filter(r => new Date(r.timestamp) >= startDate);
    }

    if (params && params.end_date) {
        const endDate = new Date(params.end_date);
        endDate.setHours(23, 59, 59); // Include the whole end day
        records = records.filter(r => new Date(r.timestamp) <= endDate);
    }

    return records;
}

/**
 * เพิ่ม record ใหม่
 * 
 * data ที่ต้องส่ง:
 * {
 *   emp_id: "EMP001",
 *   activity_id: "ACT-2026-01",
 *   front_score: 85,
 *   back_score: 90,
 *   zone_1: true,
 *   zone_2: false,
 *   ... (zone_3 - zone_11)
 *   image_url: "https://..." (optional),
 *   notes: "หมายเหตุ" (optional)
 * }
 */
function addRecord(data) {
    const sheet = getSheet('records');

    // สร้าง record_id อัตโนมัติ
    const recordId = 'REC-' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMdd-HHmmss');

    const row = [
        recordId,
        data.emp_id,
        data.activity_id,
        new Date(),
        data.front_score || 0,
        data.back_score || 0,
        data.zone_1 || false,
        data.zone_2 || false,
        data.zone_3 || false,
        data.zone_4 || false,
        data.zone_5 || false,
        data.zone_6 || false,
        data.zone_7 || false,
        data.zone_8 || false,
        data.zone_9 || false,
        data.zone_10 || false,
        data.zone_11 || false,
        data.image_url || '',
        data.notes || ''
    ];

    sheet.appendRow(row);

    return {
        success: true,
        record_id: recordId,
        message: 'Record added successfully'
    };
}

/**
 * เพิ่มพนักงานใหม่
 */
function addEmployee(data) {
    const sheet = getSheet('employees');

    const row = [
        data.emp_id,
        data.name_th,
        data.name_en || '',
        data.department,
        data.position || '',
        'active'
    ];

    sheet.appendRow(row);

    return {
        success: true,
        emp_id: data.emp_id,
        message: 'Employee added successfully'
    };
}

/**
 * อัพเดท record (สำหรับแก้ไข score หรือ notes)
 */
function updateRecord(data) {
    const sheet = getSheet('records');
    const allData = sheet.getDataRange().getValues();
    const headers = allData[0];

    // หา row ที่ต้องการแก้ไข
    const recordIdIndex = headers.indexOf('record_id');
    let targetRow = -1;

    for (let i = 1; i < allData.length; i++) {
        if (allData[i][recordIdIndex] === data.record_id) {
            targetRow = i + 1; // +1 because sheet rows are 1-indexed
            break;
        }
    }

    if (targetRow === -1) {
        return { success: false, error: 'Record not found' };
    }

    // อัพเดทค่าที่ส่งมา
    Object.keys(data).forEach(key => {
        const colIndex = headers.indexOf(key);
        if (colIndex !== -1 && key !== 'record_id') {
            sheet.getRange(targetRow, colIndex + 1).setValue(data[key]);
        }
    });

    return {
        success: true,
        record_id: data.record_id,
        message: 'Record updated successfully'
    };
}

/**
 * ดึงข้อมูลสำหรับ Dashboard (รวมทุกอย่าง + สถิติ)
 */
function getDashboardData(params) {
    const employees = getEmployees();
    const departments = getDepartments();
    const activities = getActivities();
    const records = getRecords(params);

    // คำนวณสถิติ
    const totalRecords = records.length;

    let avgFront = 0;
    let avgBack = 0;
    let passCount = 0;

    if (totalRecords > 0) {
        avgFront = records.reduce((sum, r) => sum + (Number(r.front_score) || 0), 0) / totalRecords;
        avgBack = records.reduce((sum, r) => sum + (Number(r.back_score) || 0), 0) / totalRecords;
        passCount = records.filter(r => r.front_score >= 80 && r.back_score >= 80).length;
    }

    // คำนวณสถิติแต่ละ zone
    const zoneStats = {};
    for (let i = 1; i <= 11; i++) {
        const zoneKey = `zone_${i}`;
        const dirtyCount = records.filter(r => r[zoneKey] === true || r[zoneKey] === 'TRUE').length;
        zoneStats[zoneKey] = {
            dirty_count: dirtyCount,
            dirty_rate: totalRecords > 0 ? Math.round((dirtyCount / totalRecords) * 100) : 0
        };
    }

    // สถิติแยกตามแผนก
    const deptStats = {};
    departments.forEach(dept => {
        const deptEmps = employees.filter(e => e.department === dept.dept_code).map(e => e.emp_id);
        const deptRecords = records.filter(r => deptEmps.includes(r.emp_id));

        if (deptRecords.length > 0) {
            const deptAvgFront = deptRecords.reduce((sum, r) => sum + (Number(r.front_score) || 0), 0) / deptRecords.length;
            const deptAvgBack = deptRecords.reduce((sum, r) => sum + (Number(r.back_score) || 0), 0) / deptRecords.length;
            const deptPassCount = deptRecords.filter(r => r.front_score >= 80 && r.back_score >= 80).length;

            deptStats[dept.dept_code] = {
                dept_name: dept.dept_name_th,
                total_records: deptRecords.length,
                avg_front: Math.round(deptAvgFront * 100) / 100,
                avg_back: Math.round(deptAvgBack * 100) / 100,
                pass_rate: Math.round((deptPassCount / deptRecords.length) * 100),
                pass_count: deptPassCount
            };
        }
    });

    return {
        summary: {
            total_records: totalRecords,
            total_employees: employees.length,
            total_departments: departments.length,
            avg_front_score: Math.round(avgFront * 100) / 100,
            avg_back_score: Math.round(avgBack * 100) / 100,
            pass_rate: totalRecords > 0 ? Math.round((passCount / totalRecords) * 100) : 0,
            pass_count: passCount
        },
        zone_stats: zoneStats,
        dept_stats: deptStats,
        records: records,
        employees: employees,
        departments: departments,
        activities: activities
    };
}

// ===== TEST FUNCTIONS (ลบก่อน Deploy) =====

/**
 * ทดสอบ API - รันใน Apps Script Editor
 */
function testGetDashboardData() {
    const result = getDashboardData({});
    Logger.log(JSON.stringify(result, null, 2));
}

function testAddRecord() {
    const testData = {
        emp_id: 'EMP001',
        activity_id: 'ACT-2026-01',
        front_score: 85,
        back_score: 90,
        zone_1: true,
        zone_2: false,
        zone_3: false,
        zone_4: false,
        zone_5: true,
        zone_6: false,
        zone_7: false,
        zone_8: false,
        zone_9: false,
        zone_10: false,
        zone_11: false,
        notes: 'Test record'
    };

    const result = addRecord(testData);
    Logger.log(JSON.stringify(result, null, 2));
}
