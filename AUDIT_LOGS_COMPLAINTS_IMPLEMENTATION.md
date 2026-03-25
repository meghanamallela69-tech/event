# Audit Logs & Complaints Management - Complete Implementation

## Overview

This implementation adds two critical admin management features:
1. **Audit Logs** - Track all admin activities and system actions for security and compliance
2. **Complaints Management** - Handle user complaints with full workflow from submission to resolution

---

## 📋 Part 1: Audit Logs System

### Purpose
Track every significant action performed by admins in the system for:
- Security monitoring
- Compliance requirements
- Activity auditing
- Change tracking
- Accountability

### Backend Implementation

#### 1. Database Schema

**File:** `backend/models/auditLogSchema.js`

**Fields:**
```javascript
{
  action: String (enum: create, update, delete, view, login, logout, accept_booking, reject_booking, process_payment, issue_refund, resolve_complaint, other),
  entity: String (e.g., 'User', 'Event', 'Booking', 'Payment'),
  entityId: ObjectId,
  performedBy: ObjectId (ref: User),
  userEmail: String,
  userName: String,
  details: String,
  changes: {
    before: Mixed,
    after: Mixed
  },
  ipAddress: String,
  userAgent: String,
  timestamps: true
}
```

**Indexes:**
- `createdAt: -1` (for efficient sorting)
- `performedBy: 1` (for user-specific queries)
- `entity: 1` (for entity filtering)

#### 2. API Endpoints

**Router:** `backend/router/adminManagementRouter.js`

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin-management/audit-logs` | Get all audit logs with pagination & filters |
| GET | `/api/v1/admin-management/audit-logs/:id` | Get single audit log details |
| POST | `/api/v1/admin-management/audit-logs` | Create new audit log (internal use) |

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `action` - Filter by action type
- `entity` - Filter by entity type
- `search` - Search in user name, email, or details

#### 3. Controller Functions

**File:** `backend/controller/adminManagementController.js`

**Functions:**

**a) `getAuditLogs()`**
- Retrieves paginated audit logs
- Supports filtering by action, entity, and search
- Populates user information
- Returns formatted response with pagination metadata

**b) `getAuditLog(id)`**
- Retrieves single audit log by ID
- Populates performedBy user details

**c) `createAuditLog(data)`**
- Creates new audit log entry
- Automatically sets performedBy from authenticated user
- Stores IP address and user agent

### Frontend Implementation

#### 1. UI Component

**File:** `frontend/src/pages/dashboards/AdminAuditLogs.jsx`

**Features:**

**Summary Card:**
- Total log entries count
- Visual icon representation

**Filters Section:**
- **Search Input** - Search by user name, email, or details
- **Action Type Dropdown** - Filter by specific action
- **Entity Type Dropdown** - Filter by entity type
- **Search Button** - Apply filters
- **Reset Button** - Clear all filters

**Data Table:**
Shows 5 columns:
1. **Action** - Color-coded badge showing action type
2. **User** - Admin name + email
3. **Entity** - Entity type + ID (last 8 chars)
4. **Details** - Action description
5. **Date & Time** - Formatted timestamp with calendar icon

**Pagination:**
- Shows current page of total pages
- Previous/Next navigation buttons
- Disabled state for boundary pages

**Visual Features:**
- Color-coded action badges:
  - 🟢 Green: create, accept_booking
  - 🔵 Blue: update, process_payment
  - 🔴 Red: delete
  - ⚪ Gray: view, other
  - 🟣 Purple: login
  - 🟠 Orange: logout
  - 🟡 Yellow: reject_booking
  - 🩷 Pink: issue_refund
  - 🔵 Teal: resolve_complaint

**Loading State:**
- Spinner animation while fetching data

**Empty State:**
- Icon and message when no logs found

---

## 📋 Part 2: Complaints Management System

### Purpose
Enable admins to efficiently manage and resolve user complaints:
- Centralized complaint tracking
- Status management workflow
- Priority-based handling
- Admin collaboration via notes
- Resolution documentation

### Backend Implementation

#### 1. Database Schema

**File:** `backend/models/complaintSchema.js`

**Fields:**
```javascript
{
  userId: ObjectId (ref: User),
  userName: String,
  userEmail: String,
  subject: String,
  description: String,
  category: String (enum: payment, booking, event, service_quality, technical_issue, refund, other),
  relatedEntity: {
    entityType: String,
    entityId: ObjectId
  },
  status: String (enum: pending, in_review, resolved, closed),
  priority: String (enum: low, medium, high, urgent),
  adminNotes: [{
    note: String,
    addedBy: ObjectId (ref: User),
    addedAt: Date
  }],
  resolution: {
    resolvedBy: ObjectId (ref: User),
    resolvedAt: Date,
    resolutionText: String
  },
  attachments: [{
    url: String,
    filename: String
  }],
  timestamps: true
}
```

**Indexes:**
- `createdAt: -1` (for sorting)
- `status: 1` (for status filtering)
- `userId: 1` (for user-specific queries)

#### 2. API Endpoints

**Router:** `backend/router/adminManagementRouter.js`

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin-management/complaints` | Get all complaints with filters |
| GET | `/api/v1/admin-management/complaints/:id` | Get single complaint details |
| POST | `/api/v1/admin-management/complaints/:id/note` | Add admin note |
| PUT | `/api/v1/admin-management/complaints/:id/status` | Update complaint status |
| POST | `/api/v1/admin-management/complaints/:id/resolve` | Resolve complaint |
| DELETE | `/api/v1/admin-management/complaints/:id` | Delete complaint |

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `status` - Filter by status
- `category` - Filter by category
- `priority` - Filter by priority
- `search` - Search in user name, subject, or description

#### 3. Controller Functions

**File:** `backend/controller/adminManagementController.js`

**Functions:**

**a) `getComplaints()`**
- Retrieves paginated complaints
- Supports multiple filters
- Populates user information
- Returns pagination metadata

**b) `getComplaint(id)`**
- Retrieves full complaint details
- Populates all references (user, admin notes, resolution info)

**c) `addAdminNote(id, note)`**
- Adds note to complaint
- Tracks which admin added it
- Creates audit log entry

**d) `updateComplaintStatus(id, status)`**
- Updates complaint status
- Logs status change in audit logs

**e) `resolveComplaint(id, resolutionText)`**
- Marks complaint as resolved
- Records who resolved it and when
- Creates detailed audit log

**f) `deleteComplaint(id)`**
- Permanently deletes complaint
- Logs deletion in audit trail

### Frontend Implementation

#### 1. UI Component

**File:** `frontend/src/pages/dashboards/AdminComplaints.jsx`

**Features:**

**Summary Cards (4 cards):**
1. **Total Complaints** - All time count
2. **Pending** - Awaiting review (yellow)
3. **In Review** - Being handled (blue)
4. **Resolved** - Successfully resolved (green)

**Filters Section:**
- **Search Input** - Search by user or subject
- **Status Dropdown** - Filter by status
- **Category Dropdown** - Filter by complaint type
- **Priority Dropdown** - Filter by urgency
- **Search/Reset Buttons**

**Data Table:**
Shows 7 columns:
1. **User** - Name + email
2. **Issue** - Subject + description preview
3. **Category** - With emoji icon
4. **Priority** - Color-coded badge
5. **Status** - Color-coded badge
6. **Created At** - Formatted date/time
7. **Actions** - "View Details" button

**Color Coding:**

**Priority Badges:**
- ⚪ Gray: low
- 🔵 Blue: medium
- 🟠 Orange: high
- 🔴 Red: urgent

**Status Badges:**
- 🟡 Yellow: pending
- 🔵 Blue: in_review
- 🟢 Green: resolved
- ⚪ Gray: closed

**Modal Dialog (View Details):**

**Information Sections:**
1. **Basic Info Grid**
   - User details
   - Category
   - Priority badge
   - Status badge

2. **Subject & Description**
   - Full complaint text

3. **Admin Notes Section**
   - List of all admin notes with author/timestamp
   - Textarea to add new note
   - "Add Note" button

4. **Resolution Section**
   - Shows resolution details if resolved
   - Displays who resolved and when

5. **Actions Panel**
   - **Status Update Buttons:**
     - Set Pending (yellow)
     - Set In Review (blue)
     - Mark Resolved (green)
     - Close (gray)
   
   - **Resolve Complaint:**
     - Textarea for resolution text
     - "Resolve & Close" button

**Workflow Integration:**
- Every status change creates audit log
- Adding notes creates audit log
- Resolving complaint creates audit log
- All actions tracked for accountability

---

## 🎨 Admin Sidebar Navigation

### Updated Menu Structure

**File:** `frontend/src/components/admin/AdminSidebar.jsx`

**New Menu Items Added:**

```
Dashboard
Users
Merchants
Events
Bookings
Payments
🆕 Audit Logs (clipboard icon)
🆕 Complaints (warning triangle icon)
Profile
Notifications
Settings
Logout
```

**Icons:**
- Audit Logs: `FaClipboardCheck` (clipboard with checkmark)
- Complaints: `FaExclamationTriangle` (warning triangle)

---

## 🛣️ Routes Configuration

### Frontend Routes

**File:** `frontend/src/App.jsx`

**New Routes Added:**

```javascript
// Audit Logs
GET  /dashboard/admin/audit-logs

// Complaints
GET  /dashboard/admin/complaints
```

Both routes protected by:
- PrivateRoute (authentication required)
- RoleRoute (admin role required)

### Backend Routes

**File:** `backend/app.js`

**New Router Mounted:**
```javascript
app.use("/api/v1/admin-management", adminManagementRouter);
```

---

## 🔄 Workflow Examples

### Audit Log Workflow

**Scenario: Admin accepts a booking**

1. Admin clicks "Accept" on booking
2. Backend updates booking status
3. Simultaneously creates audit log:
   ```javascript
   {
     action: "accept_booking",
     entity: "Booking",
     entityId: booking._id,
     performedBy: admin._id,
     userEmail: admin.email,
     userName: admin.name,
     details: `Accepted booking #${booking._id.toString().slice(-8)}`
   }
   ```
4. Audit log appears in Audit Logs table
5. Can be filtered/search by future admins

### Complaint Resolution Workflow

**Scenario: User reports payment issue**

1. User submits complaint (payment category, high priority)
2. Admin sees it in Complaints table with red "High" badge
3. Admin clicks "View Details"
4. Reviews complaint information
5. Changes status to "In Review" (creates audit log)
6. Adds admin note: "Investigating with payment gateway" (creates audit log)
7. After investigation, resolves with text: "Refunded customer, gateway issue fixed" (creates audit log)
8. Complaint marked as "Resolved"
9. Full history preserved for future reference

---

## 📊 Data Flow Diagrams

### Audit Logs Data Flow

```
Admin Action
    ↓
Backend Handler
    ↓
Perform Action + Create Audit Log
    ↓
Save to MongoDB
    ↓
API Response
    ↓
Frontend Fetches Logs
    ↓
Displays in Table
```

### Complaints Management Flow

```
User Submits Complaint
    ↓
Saved to Database
    ↓
Admin Views Complaints List
    ↓
Clicks "View Details"
    ↓
Modal Opens
    ↓
Admin Takes Action:
  - Update Status → Audit Log
  - Add Note → Audit Log
  - Resolve → Audit Log
    ↓
Changes Saved
    ↓
UI Refreshed
```

---

## 🔒 Security & Privacy

### Audit Logs Security
- Only accessible to admin users
- All admin actions logged
- Immutable records (no edit/delete endpoints)
- IP address tracking
- User agent recording

### Complaints Security
- Admin-only access
- User data protected
- Audit trail for all admin actions
- Resolution requires admin authentication

---

## 📁 Files Created/Modified

### Backend Files Created:
1. `models/auditLogSchema.js` (67 lines)
2. `models/complaintSchema.js` (94 lines)
3. `controller/adminManagementController.js` (289 lines)
4. `router/adminManagementRouter.js` (31 lines)

### Frontend Files Created:
1. `pages/dashboards/AdminAuditLogs.jsx` (303 lines)
2. `pages/dashboards/AdminComplaints.jsx` (624 lines)

### Files Modified:
1. `app.js` - Added adminManagementRouter
2. `components/admin/AdminSidebar.jsx` - Added 2 menu items
3. `App.jsx` - Added 2 new routes

---

## ✨ Key Features Summary

### Audit Logs Features:
✅ Track all admin activities  
✅ Multiple action types  
✅ Entity-based filtering  
✅ User activity tracking  
✅ Searchable logs  
✅ Pagination support  
✅ Color-coded UI  
✅ Timestamp logging  
✅ IP address recording  

### Complaints Features:
✅ Complete complaint management  
✅ Status workflow (pending → in_review → resolved/closed)  
✅ Priority levels (low, medium, high, urgent)  
✅ Category organization  
✅ Admin notes collaboration  
✅ Resolution tracking  
✅ Modal-based detailed view  
✅ Real-time status updates  
✅ Audit trail integration  
✅ Search and filter capabilities  

---

## 🧪 Testing Checklist

### Audit Logs Testing:
- [ ] Navigate to Audit Logs page
- [ ] Verify summary card shows correct count
- [ ] Test search functionality
- [ ] Test action type filter
- [ ] Test entity type filter
- [ ] Verify pagination works
- [ ] Check color-coded badges display correctly
- [ ] Verify date formatting
- [ ] Test loading state
- [ ] Test empty state

### Complaints Testing:
- [ ] Navigate to Complaints page
- [ ] Verify all 4 summary cards show correct counts
- [ ] Test all filter combinations
- [ ] Click "View Details" on a complaint
- [ ] Verify modal displays all information
- [ ] Add an admin note
- [ ] Update complaint status
- [ ] Resolve a complaint with resolution text
- [ ] Verify audit logs are created for each action
- [ ] Test pagination
- [ ] Test search functionality

---

## 💡 Usage Tips

### For Audit Logs:
1. Use filters to find specific actions
2. Search by user email to track individual activity
3. Check entity type to see all actions on bookings/events
4. Use date range to investigate specific time periods

### For Complaints:
1. Prioritize by urgency (red = urgent)
2. Use status workflow for organized handling
3. Add notes to collaborate with other admins
4. Document resolutions thoroughly
5. Use categories to identify common issues

---

## 🎯 Benefits Delivered

### Security Tracking:
- ✅ Complete audit trail of admin actions
- ✅ Accountability through user tracking
- ✅ IP address logging for investigations
- ✅ Immutable records

### Issue Resolution:
- ✅ Centralized complaint management
- ✅ Priority-based handling
- ✅ Collaborative admin notes
- ✅ Resolution documentation
- ✅ Status transparency

### Operational Efficiency:
- ✅ Quick filtering and searching
- ✅ Visual organization (colors, badges)
- ✅ Pagination for large datasets
- ✅ Modal-based detailed views
- ✅ Real-time updates

---

## 🚀 Next Steps

### Future Enhancements:
1. Export audit logs to CSV/PDF
2. Advanced analytics dashboard
3. Automated alerts for urgent complaints
4. Bulk status updates
5. Email notifications for complaint updates
6. Attachment upload for complaints
7. Complaint templates
8. Scheduled audit log cleanup

---

## 📝 Summary

**Implementation Complete!**

✅ **Audit Logs System** - Full security tracking with filtering, search, and pagination  
✅ **Complaints Management** - Complete workflow from submission to resolution  
✅ **Admin Sidebar** - New menu items added  
✅ **Routes Configured** - Both frontend and backend  
✅ **UI/UX** - Professional design with color-coding and icons  
✅ **Security** - Admin-only access with full audit trail  

**Result:** Admins now have powerful tools for security monitoring and complaint handling! 🎉
