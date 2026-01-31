# School Health Information System (SHIS) - Wireframe Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [User Roles & Access](#user-roles--access)
3. [Page Structure & Navigation](#page-structure--navigation)
4. [Detailed Page Wireframes](#detailed-page-wireframes)
5. [Component Library](#component-library)
6. [User Flows](#user-flows)
7. [API Integration Points](#api-integration-points)

---

## 🎯 System Overview

The School Health Information System (SHIS) is a comprehensive web application for managing student health records, vaccinations, emergency information, and blood bank coordination. The system is built with React, TypeScript, and shadcn/ui components.

### Key Features
- ✅ Complete student health management
- ✅ Vaccination tracking and compliance
- ✅ Emergency student lookup (lightning-fast)
- ✅ National Blood Bank API integration
- ✅ Comprehensive reporting and analytics
- ✅ Multi-role access (Admin, Doctor, Parent)
- ✅ Real-time alerts and notifications
- ✅ Document management

---

## 👥 User Roles & Access

### 1. School Admin (PRIMARY FOCUS)
**Full system administration and comprehensive student health management**

**Access Level**: Full system access

**Key Capabilities**:
- Complete CRUD operations on all student data
- Schedule and manage health checkups
- Track vaccinations and compliance
- Generate comprehensive reports
- Manage blood bank integration
- User management (staff, doctors, parents)
- System configuration

### 2. Doctor/Nurse
**Medical records access for assigned students**

**Access Level**: Medical records access

**Key Capabilities**:
- View assigned students
- Record health checkups
- Access emergency student information
- Generate health reports
- Messaging with parents
- Appointment calendar

### 3. Parent
**View-only access to own child's records**

**Access Level**: View-only (own children)

**Key Capabilities**:
- View child's health records
- View vaccination status
- View appointments
- Receive notifications
- Download reports
- Update emergency contacts (with approval)
- Message school/doctor

---

## 📐 Page Structure & Navigation

### Admin Portal Navigation Structure

```
🏠 Dashboard
├── 👨‍🎓 Student Management
│   ├── All Students (List/Grid view with search & filters)
│   ├── Add New Student (Multi-step enrollment form)
│   ├── Bulk Upload (CSV import with validation)
│   └── Student Detail (12 comprehensive tabs)
│
├── 🏥 Health Management
│   ├── Schedule Checkups (Calendar view)
│   ├── Record Checkup (Quick entry form)
│   ├── Health Records Overview (School-wide statistics)
│   └── Medical Conditions Tracking
│
├── 💉 Vaccination Management
│   ├── Vaccination Campaigns (Schedule mass drives)
│   ├── Individual Tracking (Per student)
│   └── Compliance Dashboard (School-wide compliance)
│
├── 🔍 Emergency Lookup
│   └── Global search (Ctrl+K) with critical info display
│
├── 🩸 Blood Bank Integration
│   ├── School Distribution (Blood group charts)
│   ├── Find Blood (Search availability via API)
│   ├── Request Blood (Emergency requests)
│   ├── Donor Registry (Eligible students)
│   └── API Logs (Request history)
│
├── 📊 Reports & Analytics
│   ├── Pre-built Reports
│   ├── Custom Report Builder
│   └── Visual Analytics (Charts & graphs)
│
├── 🔔 Alerts & Notifications
│   ├── Active Alerts Dashboard
│   ├── Create Alert
│   └── Notification History
│
├── 💬 Messages
│   ├── Inbox
│   ├── Compose
│   └── Broadcasts
│
├── 📅 Appointments
│   ├── Calendar View
│   ├── Book Appointment
│   └── Manage Appointments
│
├── 👥 User Management
│   ├── Staff Accounts
│   ├── Parent Accounts
│   └── Role Management
│
├── 📁 Documents
│   ├── Upload Documents
│   ├── Document Library
│   └── Templates
│
└── ⚙️ Settings
    ├── School Configuration
    ├── Health Parameters
    ├── API Configuration
    └── System Settings
```

---

## 🎨 Detailed Page Wireframes

### 1. Admin Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ SHIS - School Admin Portal    [Search] [Alerts🔔] [User▼]   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌──────────┐       │
│ │👨‍🎓 Total  │ │📅 Today's │ │⚠️ Critical│ │💉 Vaccine│       │
│ │ Students  │ │ Checkups  │ │  Alerts   │ │Compliance│       │
│ │   1,247   │ │    23     │ │     5     │ │   92%    │       │
│ │ ↑ 45 new  │ │ 5 pending │ │ View →    │ │ ↑ 3%     │       │
│ └───────────┘ └───────────┘ └───────────┘ └──────────┘       │
│                                                               │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌──────────┐     │
│ │📋 Pending │ │⏰ Vaccines│ │🩸 Blood   │ │🔔 Active  │     │
│ │ Checkups  │ │   Due     │ │  Donors   │ │  Alerts  │     │
│ │    42     │ │    12     │ │    187    │ │    8     │     │
│ └───────────┘ └───────────┘ └───────────┘ └──────────┘     │
│                                                               │
│ ┌─────────────────────────────┐ ┌────────────────────┐     │
│ │ 📊 BMI Distribution          │ │ 🩸 Blood Group     │     │
│ │                              │ │   Distribution     │     │
│ │ [Donut Chart]               │ │                    │     │
│ │  - Normal: 65%              │ │ [Bar Chart]        │     │
│ │  - Overweight: 20%          │ │ O+: 280            │     │
│ │  - Underweight: 15%         │ │ A+: 220            │     │
│ │                             │ │ B+: 180            │     │
│ │ [View Detailed Report]      │ │ AB+: 90 ... etc    │     │
│ └─────────────────────────────┘ └────────────────────┘     │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 👨‍🎓 Recent Student Activities                          │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Student ID   Name          Action      Time         │ │ │
│ │ ├─────────────────────────────────────────────────────┤ │ │
│ │ │ SCH20065-022 Rajesh Kumar  Checkup Done 2h ago      │ │ │
│ │ │ SCH20065-078 Priya Singh   Vaccine Adm. 3h ago      │ │ │
│ │ │ SCH20065-134 Amit Patel    New Enrollment 5h ago    │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ [View All Activities]                                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌──────────────────────┐ ┌──────────────────────────┐      │
│ │ ⏰ Vaccination Due    │ │ 🏥 National Blood Bank   │      │
│ │                      │ │    API Status            │      │
│ │ • Class 10A: 12      │ │ 🟢 Operational          │      │
│ │ • Class 9B: 8        │ │ Last sync: 5 min ago    │      │
│ │ • Class 8C: 5        │ │                         │      │
│ │                      │ │ [Check Availability]    │      │
│ │ [Send Reminders]     │ │ [Request Blood]         │      │
│ └──────────────────────┘ └──────────────────────────┘      │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⚡ Quick Actions                                         │ │
│ │ [Enroll New Student] [View All Students]                │ │
│ │ [Schedule Checkup] [Schedule Campaign]                   │ │
│ │ [Generate Reports] [Blood Bank Integration]              │ │
│ │ [Emergency Lookup] [View Analytics]                      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2. Student Detail Page (12 Tabs)

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Back to Students    Rajesh Kumar - Class 10A     [Actions▼]  │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────┐  SCH20065-156 | Roll: 10A-025 | Age: 17           │
│ │ [Photo] │  Blood Group: B+ | DOB: 15/05/2008                 │
│ │         │  Parent: +91-9876543210 | Email: father@email.com   │
│ └─────────┘                                                     │
├─────────────────────────────────────────────────────────────────┤
│ [Overview] [Health Records] [Vaccinations] [Vision Tests]      │
│ [Appointments] [Blood Donation] [Reports] [Emergency]         │
│ [Alerts] [Messages] [Activity Log] [Settings]                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ TAB CONTENT AREA (Changes based on selected tab)                │
│                                                                  │
│ Overview Tab:                                                   │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│ │💪 Health │ │💉 Vaccines│ │📅 Next   │ │🩸 Blood  │           │
│ │  Score   │ │ Status   │ │Checkup   │ │ Group    │           │
│ │   85%    │ │ ✅ 12/14 │ │ 5 Days   │ │   B+     │           │
│ │  Good    │ │ On Track │ │  Away    │ │ Eligible │           │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                  │
│ ┌───────────────────────────┐ ┌───────────────────────────┐    │
│ │ 📊 Health Trends          │ │ ⏰ Upcoming                │    │
│ │                           │ │                           │    │
│ │ [BMI Line Chart]          │ │ • Feb 5: Annual Checkup   │    │
│ │  - Current: 22.5 (Normal) │ │ • Feb 20: Tdap Vaccine    │    │
│ │  - 6mo ago: 21.8          │ │ • Mar 10: Vision Test     │    │
│ │  - Trend: ↗ Slightly up   │ │                           │    │
│ │                           │ │ [View All]                │    │
│ │ [Height/Weight Chart]     │ └───────────────────────────┘    │
│ └───────────────────────────┘                                  │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ 📋 Quick Actions                                           │ │
│ │ [Schedule Checkup] [Record Vaccination] [Send Message]     │ │
│ │ [Generate Report] [Print Emergency Card] [View Full Record] │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ Health Records Tab:                                             │
│ - Complete health history timeline                              │
│ - Growth charts (height, weight, BMI over time)                │
│ - Medical conditions list                                       │
│ - Allergy information                                           │
│ - Add new health record button                                   │
│                                                                  │
│ Vaccinations Tab:                                               │
│ - Visual vaccination timeline                                   │
│ - Completed/Pending/Overdue status                              │
│ - Vaccine details with certificates                             │
│ - Mark vaccine as administered                                  │
│                                                                  │
│ Blood Donation Tab:                                             │
│ - Student's blood group (prominent)                            │
│ - Eligibility checker                                           │
│ - Find Blood Banks (API integration)                           │
│ - Request Blood (Emergency)                                     │
│ - Register as Donor                                             │
│ - Donation history                                               │
│                                                                  │
│ ... (Other tabs follow similar pattern)                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Emergency Lookup

```
┌─────────────────────────────────────────────────────────┐
│ 🚨 Emergency Student Lookup    [Print] [Call Parent]    │
├─────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────┐         │
│ │ Enter Roll Number or Name    [Search] ⌘K  │         │
│ └───────────────────────────────────────────┘         │
│                                                          │
│ Recent searches:                                        │
│ • 10A-025 (Rajesh Kumar)                                │
│ • 9B-012 (Priya Singh)                                  │
├─────────────────────────────────────────────────────────┤
│ Student Emergency Info                                  │
├─────────────────────────────────────────────────────────┤
│ ┌─────────┐  Rajesh Kumar                              │
│ │ [Photo] │  Class 10A | Roll: 10A-025                 │
│ │ Large   │  Age: 17 years                             │
│ └─────────┘  Student ID: SCH20065-156                  │
│                                                          │
│ 🩸 BLOOD GROUP: B+ (Extra Large Font)                   │
│                                                          │
│ ⚠️  CRITICAL ALLERGIES:                                 │
│ ┌─────────────────────────────────────────────────────┐│
│ │ 🔴 PENICILLIN ALLERGY (SEVERE)                      ││
│ │    Reaction: Rash, difficulty breathing             ││
│ │    Status: ACTIVE                                   ││
│ └─────────────────────────────────────────────────────┘│
│                                                          │
│ 🏥 ACTIVE MEDICAL CONDITIONS:                           │
│ • Asthma (Mild) - Uses inhaler (blue, as needed)       │
│                                                          │
│ 💊 CURRENT MEDICATIONS:                                 │
│ • Salbutamol inhaler (as needed for asthma)            │
│                                                          │
│ 📞 EMERGENCY CONTACTS:                                  │
│ ┌─────────────────────────────────────────────────────┐│
│ │ 👨 Primary: Father (Ramesh Kumar)                   ││
│ │ 📱 +91-9876543210                                   ││
│ │ [📞 Call Now] [📧 Email]                            ││
│ └─────────────────────────────────────────────────────┘│
│                                                          │
│ Last Checkup: 31 Jan 2026 (Today)                      │
│ Next Appointment: 5 Feb 2026                            │
│                                                          │
│ [🚨 Alert Doctor] [📋 View Full Record]                │
│ [🖨️ Print Emergency Card] [📄 Generate Emergency Report]│
└─────────────────────────────────────────────────────────┘
```

### 4. Student Enrollment (Multi-step Form)

```
┌─────────────────────────────────────────────────────────┐
│ Enroll New Student                    [Back to Students] │
├─────────────────────────────────────────────────────────┤
│ Step 1 of 4: Personal Information        [Progress: 25%]│
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                       │
│ │  ✓  │ │  •  │ │     │ │     │                       │
│ └─────┘ └─────┘ └─────┘ └─────┘                       │
│                                                          │
│ ┌────────────────────────────────────────────────────┐│
│ │ Personal Information                                 ││
│ │ Enter the student's basic personal information      ││
│ ├────────────────────────────────────────────────────┤│
│ │ First Name *        [________________]              ││
│ │ Last Name *         [________________]              ││
│ │ Date of Birth *     [📅 _____________]              ││
│ │ Gender *            [▼ Male          ]              ││
│ │ Blood Group *       [▼ O+            ]              ││
│ │ Class *             [▼ Class 10      ]              ││
│ │ Section *           [▼ A            ]              ││
│ │ Admission Date *    [📅 _____________]              ││
│ │ Profile Photo       [📁 Choose File  ]              ││
│ │                                                    ││
│ │ [← Back]                    [Next →]              ││
│ └────────────────────────────────────────────────────┘│
│                                                          │
│ Step 2: Medical Information (Optional)                  │
│ Step 3: Emergency Contacts                               │
│ Step 4: Review & Submit                                  │
└─────────────────────────────────────────────────────────┘
```

### 5. Blood Bank Integration

```
┌─────────────────────────────────────────────────────────┐
│ 🩸 Blood Bank Integration                               │
├─────────────────────────────────────────────────────────┤
│ ┌──────────────────────┐ ┌──────────────────────────┐ │
│ │ School Distribution   │ │ API Status               │ │
│ │                       │ │ 🟢 Operational          │ │
│ │ [Pie Chart]           │ │ Last sync: 5 min ago    │ │
│ │ O+: 280 (37%)        │ │                         │ │
│ │ A+: 220 (28%)        │ │ [Test Connection]        │ │
│ │ B+: 180 (22%)        │ └──────────────────────────┘ │
│ │ ...                  │                             │
│ └──────────────────────┘                             │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Search Blood Availability                          │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ Blood Group: [▼ B+        ]                       │ │
│ │ Location:   [📍 Chennai   ]                       │ │
│ │ Radius:      [━━━━━━━━━━━━] 10 km                 │ │
│ │                                                    │ │
│ │ [Search API]                                       │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ Results:                                                 │
│ ┌────────────────────────────────────────────────────┐ │
│ │ City Blood Bank                 2.5km             │ │
│ │ 123 Main St, Chennai                               │ │
│ │ 📞 +91-44-12345678                                 │ │
│ │ 🩸 B+ Available: 15 units                         │ │
│ │ ⏰ Open: 24/7                                      │ │
│ │ [View on Map] [Get Directions] [Call]            │ │
│ │ [Request Blood from this bank]                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Request Blood (Emergency)                          │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ Blood Group Needed: [▼ B+        ]                │ │
│ │ Units Required:    [__2__]                        │ │
│ │ Urgency:           [○ Normal ○ Urgent ● Critical]│ │
│ │ Patient Name:      [________________]              │ │
│ │ Hospital:          [________________]              │ │
│ │ Contact:           [________________]              │ │
│ │                                                    │ │
│ │ [Submit Request]                                 │ │
│ └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Library

### Core Components (shadcn/ui)
- **Button**: Primary, secondary, ghost variants
- **Card**: Dashboard widgets, info cards
- **Dialog**: Modals for forms, confirmations
- **Form**: Data entry with validation
- **Table**: Sortable, filterable data tables
- **Tabs**: Multi-tab interfaces
- **Toast**: Success/error notifications
- **Badge**: Status indicators
- **Calendar**: Date picker
- **Avatar**: Profile pictures
- **Command**: Global search (Cmd+K)

### Custom Components
1. **StudentCard**: Student info card with quick actions
2. **StatCard**: Dashboard metric cards
3. **BMIChart**: Donut chart for BMI distribution
4. **GrowthChart**: Line chart for height/weight trends
5. **VaccinationTimeline**: Visual vaccine timeline
6. **EmergencyInfoCard**: Critical info display
7. **BloodGroupBadge**: Visual blood type indicator
8. **BloodBankMap**: Google Maps integration
9. **AvailabilityTable**: Blood bank results table
10. **APIStatusIndicator**: API connection status

---

## 🔄 User Flows

### Flow 1: Admin Enrolling New Student
1. Admin clicks "Enroll New Student"
2. Multi-step form opens
3. Step 1: Enter personal information
4. Step 2: Add medical conditions/allergies (optional)
5. Step 3: Add emergency contacts
6. Step 4: Review and submit
7. Student ID and Roll Number auto-generated
8. Redirect to student detail page

### Flow 2: Emergency Student Lookup
1. Admin presses Ctrl+K (or clicks Emergency Lookup)
2. Search bar appears
3. Admin types roll number or name
4. Results appear instantly (<1 second)
5. Critical info displayed:
   - Large photo
   - Blood group (extra large)
   - Allergies (red highlights)
   - Medical conditions
   - Emergency contacts with call buttons
6. Quick actions: Call parent, Alert doctor, Print card

### Flow 3: Blood Bank API Integration
1. Admin navigates to Blood Bank Integration
2. Searches for blood availability by group and location
3. API call to National Blood Bank
4. Results displayed in table with map
5. Admin can request blood or view on map
6. Request tracked and status updated

---

## 🔌 API Integration Points

### National Blood Bank API (Mock)
- **Base URL**: `https://api.nationalbloodbank.gov.in/v1`
- **Endpoints**:
  - `GET /blood/availability` - Search blood availability
  - `POST /blood/request` - Request blood
  - `GET /blood/request/{id}/status` - Check request status
  - `GET /blood-banks/nearby` - Find nearby banks
  - `GET /camps/upcoming` - Get donation camps
  - `POST /donors/register` - Register donor

### Mock Implementation
- All API calls simulated with delays
- Mock data for blood banks in Chennai area
- Success/failure scenarios handled
- Error handling and retry logic

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 767px
  - Stacked layout
  - Hamburger menu
  - Single column cards
  - Simplified tables

- **Tablet**: 768px - 1023px
  - Two-column layout
  - Side drawer navigation
  - Condensed tables

- **Desktop**: 1024px+
  - Full sidebar navigation
  - Multi-column dashboards
  - Full data tables

---

## 🎨 Color Scheme

```css
Primary Blue: #2563eb
Secondary Blue: #3b82f6
Success Green: #10b981
Warning Orange: #f59e0b
Danger Red: #ef4444
Info Cyan: #06b6d4
Blood Red: #dc2626
Background: #f8fafc
Card Background: #ffffff
Text Primary: #1e293b
Text Secondary: #64748b
```

---

## ✅ Implementation Status

### Completed ✅
- Admin Dashboard (comprehensive)
- Student Enrollment (multi-step form)
- Mock Blood Bank API service
- Navigation menu updated
- Routing structure

### In Progress 🚧
- Enhanced StudentDetail with 12 tabs
- Emergency Lookup enhancements
- Blood Bank Integration UI

### Pending 📋
- Bulk Upload functionality
- Health Management pages
- Vaccination Campaigns
- Reports & Analytics
- Alerts & Notifications
- Messaging system
- Appointments Management
- User Management
- Document Management
- System Settings

---

## 📝 Notes

- All endpoints are currently mocked (no backend)
- Data persists in sessionStorage
- Components use shadcn/ui library
- Responsive design for all screen sizes
- Accessibility: WCAG 2.1 AA compliance target
- Performance: <2s page load, <1s search results

---

*Last Updated: January 2026*

