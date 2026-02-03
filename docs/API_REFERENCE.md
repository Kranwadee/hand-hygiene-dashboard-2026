# 📡 API Reference - Hand Hygiene Dashboard

## 🔗 Base URL

```
YOUR_APPS_SCRIPT_DEPLOYED_URL
```

> **Note**: ใส่ URL ที่ได้จากการ Deploy Apps Script

---

## 📥 GET Endpoints

### 1. Get Dashboard Data (แนะนำ)

ดึงข้อมูลทั้งหมดสำหรับ Dashboard พร้อมสถิติ

```
GET ?action=getDashboardData
```

**Parameters** (optional):
| Parameter | Type | Description |
|-----------|------|-------------|
| activity_id | string | กรองตามกิจกรรม |
| department | string | กรองตามแผนก |
| emp_id | string | กรองตามพนักงาน |
| start_date | string | วันที่เริ่มต้น (YYYY-MM-DD) |
| end_date | string | วันที่สิ้นสุด (YYYY-MM-DD) |

**Example**:
```
?action=getDashboardData&department=ICU&activity_id=ACT-2026-01
```

**Response**:
```json
{
  "summary": {
    "total_records": 150,
    "total_employees": 25,
    "total_departments": 10,
    "avg_front_score": 85.5,
    "avg_back_score": 88.2,
    "pass_rate": 78,
    "pass_count": 117
  },
  "zone_stats": {
    "zone_1": { "dirty_count": 45, "dirty_rate": 30 },
    "zone_2": { "dirty_count": 20, "dirty_rate": 13 }
  },
  "dept_stats": {
    "ICU": {
      "dept_name": "หออภิบาลผู้ป่วยหนัก",
      "total_records": 50,
      "avg_front": 87.5,
      "avg_back": 89.0,
      "pass_rate": 82,
      "pass_count": 41
    }
  },
  "records": [...],
  "employees": [...],
  "departments": [...],
  "activities": [...]
}
```

---

### 2. Get Employees

```
GET ?action=getEmployees
```

**Response**:
```json
[
  {
    "emp_id": "EMP001",
    "name_th": "สมชาย ใจดี",
    "name_en": "Somchai Jaidee",
    "department": "ICU",
    "position": "พยาบาล",
    "status": "active"
  }
]
```

---

### 3. Get Departments

```
GET ?action=getDepartments
```

**Response**:
```json
[
  {
    "dept_code": "ICU",
    "dept_name_th": "หออภิบาลผู้ป่วยหนัก",
    "dept_name_en": "Intensive Care Unit",
    "head_id": "EMP001",
    "employee_count": 25
  }
]
```

---

### 4. Get Activities

```
GET ?action=getActivities
```

**Response**:
```json
[
  {
    "activity_id": "ACT-2026-01",
    "activity_name": "Hand Hygiene Week Q1/2026",
    "start_date": "2026-01-27",
    "end_date": "2026-01-31",
    "target_participants": 500,
    "status": "active"
  }
]
```

---

### 5. Get Records

```
GET ?action=getRecords
```

**Parameters** (optional): เหมือน getDashboardData

**Response**:
```json
[
  {
    "record_id": "REC-20260130-093000",
    "emp_id": "EMP001",
    "activity_id": "ACT-2026-01",
    "timestamp": "2026-01-30T09:30:00",
    "front_score": 85,
    "back_score": 90,
    "zone_1": true,
    "zone_2": false,
    "zone_11": false,
    "image_url": "",
    "notes": ""
  }
]
```

---

## 📤 POST Endpoints

### 1. Add Record

เพิ่มข้อมูลการล้างมือใหม่

```
POST ?action=addRecord
Content-Type: application/json
```

**Body**:
```json
{
  "emp_id": "EMP001",
  "activity_id": "ACT-2026-01",
  "front_score": 85,
  "back_score": 90,
  "zone_1": true,
  "zone_2": false,
  "zone_3": false,
  "zone_4": false,
  "zone_5": true,
  "zone_6": false,
  "zone_7": false,
  "zone_8": false,
  "zone_9": false,
  "zone_10": false,
  "zone_11": false,
  "image_url": "https://...",
  "notes": "หมายเหตุ"
}
```

**Required fields**: `emp_id`, `activity_id`, `front_score`, `back_score`

**Response**:
```json
{
  "success": true,
  "record_id": "REC-20260130-093000",
  "message": "Record added successfully"
}
```

---

### 2. Add Employee

```
POST ?action=addEmployee
Content-Type: application/json
```

**Body**:
```json
{
  "emp_id": "EMP999",
  "name_th": "ทดสอบ ระบบ",
  "name_en": "Test System",
  "department": "ICU",
  "position": "พยาบาล"
}
```

**Response**:
```json
{
  "success": true,
  "emp_id": "EMP999",
  "message": "Employee added successfully"
}
```

---

## 🔢 Zone Reference

| Zone | ตำแหน่ง (Thai) | Position (English) |
|------|---------------|---------------------|
| zone_1 | ฝ่ามือ | Palm |
| zone_2 | หลังมือ | Back of hand |
| zone_3 | ซอกนิ้ว | Between fingers |
| zone_4 | หัวแม่มือ | Thumb |
| zone_5 | ปลายนิ้ว | Fingertips |
| zone_6 | ข้อมือ | Wrist |
| zone_7 | นิ้วชี้ | Index finger |
| zone_8 | นิ้วกลาง | Middle finger |
| zone_9 | นิ้วนาง | Ring finger |
| zone_10 | นิ้วก้อย | Little finger |
| zone_11 | ใต้เล็บ | Under nails |

> **Note**: `TRUE` = มีสิ่งสกปรกเหลืออยู่ (ล้างไม่สะอาด)

---

## ⚠️ Error Responses

```json
{
  "error": "Unknown action",
  "available": ["getEmployees", "getDepartments", "getRecords", "getActivities", "getDashboardData"]
}
```

```json
{
  "success": false,
  "error": "Record not found"
}
```

---

## 💻 Code Examples

### JavaScript (Fetch API)

```javascript
// GET request
const response = await fetch(API_URL + '?action=getDashboardData&department=ICU');
const data = await response.json();
console.log(data.summary);

// POST request
const result = await fetch(API_URL + '?action=addRecord', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    emp_id: 'EMP001',
    activity_id: 'ACT-2026-01',
    front_score: 85,
    back_score: 90,
    zone_1: true
  })
});
console.log(await result.json());
```

### Python (requests)

```python
import requests

# GET request
response = requests.get(API_URL, params={
    'action': 'getDashboardData',
    'department': 'ICU'
})
data = response.json()
print(data['summary'])

# POST request
result = requests.post(API_URL, params={'action': 'addRecord'}, json={
    'emp_id': 'EMP001',
    'activity_id': 'ACT-2026-01',
    'front_score': 85,
    'back_score': 90,
    'zone_1': True
})
print(result.json())
```

---

*สร้างโดย: [ชื่อเด็กฝึกงาน] | วันที่: 30 มกราคม 2569*
