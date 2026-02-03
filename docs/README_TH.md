# 🧴 Hand Hygiene Dashboard - คู่มือการใช้งาน

## 📋 ภาพรวมระบบ

ระบบ Dashboard สำหรับแสดงผลข้อมูลการล้างมือของบุคลากรในโรงพยาบาล ประกอบด้วย:

| Dashboard | หน้าที่ |
|-----------|--------|
| **Hospital Dashboard** | ภาพรวมทั้งโรงพยาบาล สำหรับ IC |
| **Department Dashboard** | ภาพรวมแต่ละแผนก สำหรับหัวหน้าแผนก |
| **Personal Dashboard** | ผลรายบุคคล สำหรับพนักงาน |

---

## 🔗 Links สำคัญ

| รายการ | Link |
|--------|------|
| Google Sheets (Database) | [ใส่ link ที่นี่] |
| Hospital Dashboard | [index.html](../index.html) |
| API URL | [ใส่ Apps Script URL] |

---

## 📊 วิธีเพิ่มข้อมูลใน Google Sheets

### 1. เปิด Google Sheets
ไปที่ link: [ใส่ link Google Sheets]

### 2. เลือก Sheet ที่ต้องการแก้ไข

#### Sheet: `employees` (ข้อมูลพนักงาน)
| Column | คำอธิบาย | ตัวอย่าง |
|--------|----------|---------|
| emp_id | รหัสพนักงาน | EMP001 |
| name_th | ชื่อภาษาไทย | สมชาย ใจดี |
| name_en | ชื่อภาษาอังกฤษ | Somchai Jaidee |
| department | รหัสแผนก | ICU |
| position | ตำแหน่ง | พยาบาล |
| status | สถานะ | active |

#### Sheet: `records` (ข้อมูลการล้างมือ)
| Column | คำอธิบาย | ตัวอย่าง |
|--------|----------|---------|
| record_id | รหัสอัตโนมัติ | REC-20260130-001 |
| emp_id | รหัสพนักงาน | EMP001 |
| activity_id | รหัสกิจกรรม | ACT-2026-01 |
| timestamp | วันเวลา | 2026-01-30 09:30 |
| front_score | คะแนนฝ่ามือ (0-100) | 85 |
| back_score | คะแนนหลังมือ (0-100) | 90 |
| zone_1 - zone_11 | จุดที่ไม่สะอาด | TRUE/FALSE |

---

## 🔄 วิธี Export CSV

1. เปิด Google Sheets
2. ไปที่ **File** → **Download** → **Comma-separated values (.csv)**
3. เลือก Sheet ที่ต้องการ
4. ไฟล์ CSV จะถูก download อัตโนมัติ

---

## 🛠️ สำหรับ Developer

### โครงสร้างโปรเจค

```
📁 hand-hygiene-dashboard-2026/
├── 📄 index.html                 ← หน้าแรก
├── 📄 hospital-dashboard.html    ← Dashboard ระดับ รพ.
├── 📄 department-dashboard.html  ← Dashboard ระดับแผนก
├── 📄 personal-dashboard.html    ← Dashboard รายบุคคล
├── 📁 docs/                      ← เอกสาร
│   ├── 📄 README_TH.md           ← คู่มือภาษาไทย (ไฟล์นี้)
│   ├── 📄 IMPLEMENTATION_PLAN.md ← แผนการพัฒนา
│   └── 📄 API_REFERENCE.md       ← เอกสาร API
└── 📁 scripts/                   ← Code สำคัญ
    ├── 📄 apps_script.js         ← Google Apps Script
    └── 📄 dashboard_api.js       ← API integration code
```

### วิธี Setup ระบบใหม่

1. สร้าง Google Sheets ตาม format ใน [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
2. Copy code จาก `scripts/apps_script.js` ไปใส่ใน Apps Script
3. แก้ `SPREADSHEET_ID` ให้ตรง
4. Deploy เป็น Web App
5. Copy URL มาใส่ใน `scripts/dashboard_api.js`

---

## 📞 ติดต่อ

- **พัฒนาโดย**: [ชื่อเด็กฝึกงาน]
- **แผนก**: IC (Infection Control)
- **ปี**: 2569

---

## 📝 Change Log

| วันที่ | เวอร์ชัน | รายละเอียด |
|--------|---------|------------|
| 30/01/2569 | 1.0 | สร้าง documentation เริ่มต้น |

---

*อัพเดทล่าสุด: 30 มกราคม 2569*
