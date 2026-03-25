# Merchants & Users Management - Complete Implementation

## Overview

This implementation adds comprehensive admin management for **Merchants** and **Users** with full CRUD operations, status management, and advanced features.

---

## 📋 Part 1: Merchants Management

### Features Delivered

✅ **Create Merchant** - Admin creates merchant account  
✅ **Edit Merchant** - Update name and phone  
✅ **Suspend/Activate** - Toggle merchant status  
✅ **Reset Password** - Generate new password  
✅ **Delete Merchant** - Remove merchant account  
✅ **Search** - Filter by name or email  

### Backend Implementation

#### API Endpoints Added

**Router:** `backend/router/adminRouter.js`

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| GET | `/api/v1/admin/merchants` | `listMerchants` | Get all merchants |
| POST | `/api/v1/admin/create-merchant` | `createMerchant` | Create new merchant |
| PUT | `/api/v1/admin/merchants/:id` | `updateMerchant` | Edit merchant details |
| PUT | `/api/v1/admin/merchants/:id/suspend` | `suspendMerchant` | Suspend/activate merchant |
| POST | `/api/v1/admin/merchants/:id/reset-password` | `resetMerchantPassword` | Reset password |
| DELETE | `/api/v1/admin/users/:id` | `deleteUser` | Delete merchant |

#### Controller Functions

**File:** `backend/controller/adminController.js`

**1. `createMerchant(req, res)`**
```javascript
// Creates merchant with auto-generated password
// Sends credentials via email
// Fields: name, email, phone, (auto-password)
```

**2. `updateMerchant(req, res)`**
```javascript
// Updates name and phone only
// Email cannot be changed
// Returns updated merchant
```

**3. `suspendMerchant(req, res)`**
```javascript
// Toggles status: 'active' ↔ 'suspended'
// Updates merchant status field
// Returns success message
```

**4. `resetMerchantPassword(req, res)`**
```javascript
// Generates random 8-char password
// Hashes and saves to database
// Emails new password to merchant
```

### Frontend Implementation

**File:** `frontend/src/pages/dashboards/AdminMerchants.jsx`

#### UI Components

**Summary Cards (3 cards):**
1. **Total Merchants** - Count of all merchants
2. **Active** - Count with active status
3. **Inactive** - Count with suspended/blocked status

**Search Bar:**
- Real-time search by name or email
- Filters table results dynamically

**Data Table (5 columns):**
1. **Merchant Name** - Full name
2. **Email** - With envelope icon
3. **Phone** - Phone number or '-'
4. **Status** - Color-coded badge
5. **Actions** - 4 action buttons

**Action Buttons:**

| Icon | Action | Color | Confirmation |
|------|--------|-------|--------------|
| ✏️ Edit | Open edit modal | Blue | None |
| 🚫 Suspend/Activate | Toggle status | Yellow/Green | Yes |
| 🔑 Reset Password | Generate new password | Purple | Yes |
| 🗑️ Delete | Remove merchant | Red | Yes |

#### Modal Dialog

**Create/Edit Merchant Form:**
- **Name** (required)
- **Email** (required, disabled on edit)
- **Phone** (optional)
- Info box about auto-generated password (create mode only)
- Submit/Cancel buttons

#### Status Badges

**Active:**
```jsx
🟢 Green badge with checkmark icon
```

**Suspended:**
```jsx
🟡 Yellow badge with ban icon
```

**Blocked:**
```jsx
🔴 Red badge with ban icon
```

---

## 📋 Part 2: Users Management

### Features Delivered

✅ **View All Users** - List all user accounts  
✅ **Search** - Filter by name or email  
✅ **Block/Unblock** - Toggle user status  
✅ **Role Display** - Show user role badges  

### Backend Implementation

#### API Endpoints

**Router:** `backend/router/adminRouter.js`

| Method | Endpoint | Function | Description |
|--------|----------|----------|-------------|
| GET | `/api/v1/admin/users` | `listUsers` | Get all users |
| PUT | `/api/v1/admin/users/:id/status` | `updateUserStatus` | Block/unblock user |
| DELETE | `/api/v1/admin/users/:id` | `deleteUser` | Delete user |

#### Controller Functions

**File:** `backend/controller/adminController.js`

**`updateUserStatus(req, res)`**
```javascript
// Updates user status field
// Accepts: 'active' or 'blocked'
// Validates status value
// Returns updated user
```

### Frontend Implementation

**File:** `frontend/src/pages/dashboards/AdminUsers.jsx`

#### UI Components

**Summary Cards (3 cards):**
1. **Total Users** - All users count
2. **Active Users** - Active status count
3. **Blocked Users** - Blocked status count

**Search Bar:**
- Real-time search by name or email
- Filters table results

**Data Table (6 columns):**
1. **User Name** - Full name
2. **Email** - With envelope icon
3. **Phone** - Phone number or '-'
4. **Role** - Color-coded role badge
5. **Status** - Color-coded status badge
6. **Actions** - Block/Unblock button

**Role Badges:**

| Role | Color | Badge |
|------|-------|-------|
| Admin | Purple | `bg-purple-100 text-purple-700` |
| Merchant | Blue | `bg-blue-100 text-blue-700` |
| User | Gray | `bg-gray-100 text-gray-700` |

**Status Badges:**

| Status | Color | Badge |
|--------|-------|-------|
| Active | Green | `bg-green-100 text-green-700` |
| Blocked | Red | `bg-red-100 text-red-700` |

**Action Button:**
- **Block** (yellow text) - When user is active
- **Unblock** (green text) - When user is blocked
- Requires confirmation

---

## 🎨 Visual Design

### Color Coding System

**Status Colors:**
- 🟢 **Green** - Active/Good state
- 🔴 **Red** - Blocked/Bad state
- 🟡 **Yellow** - Suspended/Warning
- 🟣 **Purple** - Admin role
- 🔵 **Blue** - Merchant role

**Action Colors:**
- 🔵 **Blue** - Primary action (create, edit)
- 🟡 **Yellow** - Warning action (suspend)
- 🟢 **Green** - Positive action (activate)
- 🟣 **Purple** - Special action (reset password)
- 🔴 **Red** - Destructive action (delete)

### Icons Used

**Merchants Page:**
- `FaStore` - Store icon for total count
- `FaEnvelope` - Email icon
- `FaCheckCircle` - Active status
- `FaBan` - Inactive status / Suspend
- `FaEdit` - Edit action
- `FaTrash` - Delete action
- `FaKey` - Reset password
- `FaPlus` - Add new
- `FaSearch` - Search

**Users Page:**
- `FaUser` - User icon
- `FaEnvelope` - Email icon
- `FaCheckCircle` - Active status
- `FaBan` - Blocked status
- `FaEye` - View (if needed)
- `FaSearch` - Search

---

## 🔄 Workflows

### Create Merchant Workflow

```
Admin clicks "Add Merchant"
    ↓
Modal opens with empty form
    ↓
Admin enters: name, email, phone
    ↓
Submits form
    ↓
Backend validates data
    ↓
Checks if email exists
    ↓
Generates random password (8 chars + A1)
    ↓
Hashes password
    ↓
Creates merchant with role="merchant"
    ↓
Sends email with credentials
    ↓
Success toast displayed
    ↓
Table refreshes
    ↓
New merchant appears in list
```

### Suspend Merchant Workflow

```
Admin clicks Suspend button (ban icon)
    ↓
Confirmation dialog appears
    ↓
Admin confirms
    ↓
API call: PUT /admin/merchants/:id/suspend
    ↓
Backend updates status to 'suspended'
    ↓
Returns success response
    ↓
Toast notification: "Merchant suspended successfully"
    ↓
Table refreshes
    ↓
Badge changes to yellow "Suspended"
```

### Reset Password Workflow

```
Admin clicks Reset Password button (key icon)
    ↓
Confirmation: "New password will be sent to email"
    ↓
Admin confirms
    ↓
API call: POST /admin/merchants/:id/reset-password
    ↓
Backend generates random password
    ↓
Hashes password
    ↓
Updates database
    ↓
Sends email with new password
    ↓
Toast: "Password reset! New password sent to email"
    ↓
Merchant receives email with temporary password
    ↓
Merchant logs in and changes password
```

### Block User Workflow

```
Admin views Users page
    ↓
Sees user with "Active" badge
    ↓
Clicks "Block" button
    ↓
Confirmation dialog
    ↓
Admin confirms
    ↓
API call: PUT /admin/users/:id/status
    ↓
Body: { status: 'blocked' }
    ↓
Backend updates user status
    ↓
Returns updated user
    ↓
Toast: "User blocked successfully"
    ↓
Badge changes to red "Blocked"
    ↓
Button text changes to "Unblock"
```

---

## 📊 Data Flow Diagrams

### Merchants Management Flow

```
Page Load
    ↓
GET /admin/merchants
    ↓
Backend queries User collection (role="merchant")
    ↓
Returns merchants array
    ↓
Frontend stores in state
    ↓
Maps to table rows
    ↓
Displays with action buttons
    ↓
[Action Triggered]
    ↓
Specific API endpoint called
    ↓
Database updated
    ↓
Success response
    ↓
Toast notification
    ↓
Refresh table
```

### Users Management Flow

```
Page Load
    ↓
GET /admin/users
    ↓
Backend queries User collection
    ↓
Excludes password field
    ↓
Returns users array
    ↓
Frontend displays in table
    ↓
[Search Input]
    ↓
Filters client-side
    ↓
Shows matching results
    ↓
[Block/Unblock Clicked]
    ↓
PUT /admin/users/:id/status
    ↓
Backend updates status
    ↓
Returns updated user
    ↓
UI updates badge
```

---

## 🛣️ Routes Configuration

### Backend Routes

**File:** `backend/router/adminRouter.js`

```javascript
// Merchants
GET    /api/v1/admin/merchants              // List all
POST   /api/v1/admin/create-merchant        // Create
PUT    /api/v1/admin/merchants/:id          // Update
PUT    /api/v1/admin/merchants/:id/suspend  // Suspend/Activate
POST   /api/v1/admin/merchants/:id/reset-password // Reset pwd

// Users
GET    /api/v1/admin/users                  // List all
PUT    /api/v1/admin/users/:id/status       // Block/Unblock
DELETE /api/v1/admin/users/:id              // Delete
```

### Frontend Routes

**File:** `frontend/src/App.jsx`

```javascript
/dashboard/admin/merchants → AdminMerchants component
/dashboard/admin/users     → AdminUsers component
```

Both protected by:
- PrivateRoute (authentication required)
- RoleRoute (admin role required)

---

## 📁 Files Modified/Created

### Backend Files Modified:

**1. `controller/adminController.js`**
- Added `updateUserStatus()` function (30 lines)
- Enhanced `createMerchant()` with better error handling
- Added `updateMerchant()` function (27 lines)
- Added `suspendMerchant()` function (24 lines)
- Added `resetMerchantPassword()` function (38 lines)

**2. `router/adminRouter.js`**
- Imported new functions
- Added 5 new routes

### Frontend Files Created:

**1. `pages/dashboards/AdminMerchants.jsx`** (378 lines)
- Complete merchant management UI
- Modal for create/edit
- Search functionality
- Summary cards
- Action buttons with confirmations

**2. `pages/dashboards/AdminUsers.jsx`** (203 lines)
- Complete user management UI
- Search functionality
- Summary cards
- Block/Unblock functionality

---

## ✨ Key Features Summary

### Merchants Management:

✅ **Full CRUD Operations**
- Create with email credentials
- Edit name and phone
- Suspend/Activate toggle
- Password reset with email
- Delete with confirmation

✅ **Smart Features**
- Auto-generated secure passwords
- Email notification on creation
- Email notification on password reset
- Email cannot be changed (security)
- Search filters in real-time

✅ **User Experience**
- Color-coded status badges
- Icon-based actions
- Confirmation dialogs
- Toast notifications
- Loading states
- Empty states

### Users Management:

✅ **Essential Controls**
- View all users
- Search functionality
- Block/Unblock toggle
- Role display

✅ **Visual Feedback**
- Color-coded role badges
- Status indicators
- Icon integration
- Responsive design

---

## 🔒 Security Features

### Authentication & Authorization:
- ✅ Admin-only access (protected routes)
- ✅ JWT token required
- ✅ Role verification middleware

### Password Management:
- ✅ Auto-generated strong passwords (8 chars + alphanumeric)
- ✅ Bcrypt hashing (10 rounds)
- ✅ Never store plain text
- ✅ Email delivery (secure transmission)

### Data Protection:
- ✅ Email immutable after creation
- ✅ Password excluded from responses
- ✅ Confirmation for destructive actions
- ✅ Validation on all inputs

---

## 🧪 Testing Checklist

### Merchants Testing:
- [ ] Navigate to Merchants page
- [ ] Verify summary cards show correct counts
- [ ] Search by name works
- [ ] Search by email works
- [ ] Click "Add Merchant" opens modal
- [ ] Create merchant with valid data
- [ ] Verify email sent with credentials
- [ ] Edit merchant name
- [ ] Edit merchant phone
- [ ] Try to change email (should be disabled)
- [ ] Suspend active merchant
- [ ] Activate suspended merchant
- [ ] Reset password
- [ ] Delete merchant
- [ ] Verify all confirmations work
- [ ] Check toast notifications

### Users Testing:
- [ ] Navigate to Users page
- [ ] Verify summary cards
- [ ] Search functionality
- [ ] Role badges display correctly
- [ ] Status badges display correctly
- [ ] Block active user
- [ ] Unblock blocked user
- [ ] Verify confirmation dialogs
- [ ] Check toast notifications
- [ ] Verify table updates immediately

---

## 💡 Usage Tips

### For Merchants:

**Creating Merchant:**
1. Click "Add Merchant" button
2. Fill in name, email, phone
3. Click "Create"
4. Credentials sent to merchant email
5. Merchant can login immediately

**Managing Merchants:**
1. Use search to find specific merchant
2. Edit button to update details
3. Ban icon to suspend/activate
4. Key icon to reset password
5. Trash icon to delete

**Best Practices:**
- Always confirm before suspending
- Notify merchant before password reset
- Double-check before deleting
- Use search for large lists

### For Users:

**Blocking Users:**
1. Find user via search
2. Click "Block" button
3. Confirm action
4. User cannot login anymore

**Unblocking Users:**
1. Find blocked user
2. Click "Unblock" button
3. Confirm action
4. User can login again

---

## 📊 Response Examples

### Create Merchant Response:
```json
{
  "success": true,
  "message": "Merchant created and credentials sent to email",
  "merchant": {
    "id": "ObjectId",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "merchant",
    "status": "active"
  }
}
```

### Update Merchant Response:
```json
{
  "success": true,
  "message": "Merchant updated successfully",
  "merchant": {
    "_id": "ObjectId",
    "name": "John Updated",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "merchant",
    "status": "active"
  }
}
```

### Suspend Merchant Response:
```json
{
  "success": true,
  "message": "Merchant suspended successfully",
  "merchant": {
    "_id": "ObjectId",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "suspended"
  }
}
```

### Reset Password Response:
```json
{
  "success": true,
  "message": "Password reset successfully. New password sent to email.",
  "merchant": {
    "_id": "ObjectId",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Update User Status Response:
```json
{
  "success": true,
  "message": "User blocked successfully",
  "user": {
    "_id": "ObjectId",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "status": "blocked"
  }
}
```

---

## 🎯 Benefits Delivered

### Administrative Control:
✅ Complete merchant lifecycle management  
✅ User account control  
✅ Real-time status updates  
✅ Secure password management  
✅ Email notifications  

### Operational Efficiency:
✅ One-click actions  
✅ Search and filter capabilities  
✅ Visual status indicators  
✅ Confirmation dialogs prevent errors  
✅ Toast feedback for all actions  

### Security:
✅ Admin-only access  
✅ Password hashing  
✅ Immutable emails  
✅ Status validation  
✅ Protected endpoints  

---

## 🚀 Next Steps

### Future Enhancements:
1. Bulk actions (select multiple merchants/users)
2. Export to CSV/PDF
3. Advanced filtering (by date, status, etc.)
4. Activity history per merchant/user
5. Notes/annotations on accounts
6. Batch import functionality
7. Custom roles/permissions
8. Two-factor authentication toggle

---

## 📝 Summary

**Implementation Complete!**

✅ **Merchants Management** - Full CRUD with suspend, password reset, email notifications  
✅ **Users Management** - Complete user control with block/unblock functionality  
✅ **Backend APIs** - 6 new endpoints with proper validation  
✅ **Frontend UI** - Professional tables with search, modals, and actions  
✅ **Security** - Admin-only access, password hashing, confirmations  
✅ **UX** - Color-coding, icons, toast notifications, loading states  

**Result:** Admins now have powerful tools to manage merchants and users efficiently with professional UI, complete workflows, and robust security! 🎉

---

## 📞 Quick Reference

### API Base URL:
```
http://localhost:5000/api/v1/admin
```

### Frontend Routes:
```
/dashboard/admin/merchants
/dashboard/admin/users
```

### Common Actions:
- **Create Merchant:** POST + email sent
- **Suspend Merchant:** PUT status
- **Reset Password:** POST + email sent
- **Block User:** PUT status
- **All require:** Admin token in headers

---

**Status:** ✅ **COMPLETE!** Both Merchants and Users management systems are fully implemented and ready to use! The admin dashboard now has comprehensive tools for managing all user accounts with professional UI and complete API support! 🎉
