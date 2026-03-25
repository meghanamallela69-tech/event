# 💰 Merchant Earnings & Withdrawals Implementation Summary

## ✅ **Implementation Complete!**

The Payments and Earnings feature has been successfully added to the Merchant Dashboard.

---

## 🎯 **Features Implemented**

### **1. Backend APIs**

#### **Get Earnings API**
- **Endpoint:** `GET /api/v1/merchant/earnings`
- **Authentication:** Merchant role required
- **Returns:**
  - `totalEarnings`: Lifetime earnings from all payments
  - `availableBalance`: Amount available for withdrawal
  - `pendingAmount`: Amount in pending withdrawal requests
  - `commissionDeducted`: Total platform fees deducted
  - `transactionList`: Array of all payment transactions

#### **Request Withdrawal API**
- **Endpoint:** `POST /api/v1/merchant/withdrawal`
- **Authentication:** Merchant role required
- **Body:** `{ amount: number }`
- **Functionality:**
  - Validates sufficient balance
  - Creates withdrawal request with "pending" status
  - Prevents over-withdrawal

#### **Get Withdrawal History API**
- **Endpoint:** `GET /api/v1/merchant/withdrawals`
- **Authentication:** Merchant role required
- **Returns:** Array of all withdrawal requests with status

---

## 📊 **Frontend UI Components**

### **Earnings Dashboard Page** (`/dashboard/merchant/earnings`)

#### **Stats Cards (4)**
1. **Total Earnings** - Lifetime earnings with green theme
2. **Available Balance** - Ready to withdraw with blue theme
3. **Pending Amount** - Withdrawal requests in progress with yellow theme
4. **Commission Deducted** - Platform fees with red theme

#### **Withdrawal Request Section**
- Toggle button to show/hide form
- Input field for withdrawal amount
- Real-time balance validation
- Submit and cancel buttons
- Loading states during submission

#### **Transaction History Table**
Columns:
- Booking ID
- Amount (merchant's share)
- Total Amount
- Commission
- Payment Method
- Status (success/pending/failed)
- Date

#### **Withdrawal Requests Table**
Columns:
- Request ID
- Amount
- Status Badge (pending/approved/rejected/completed)
- Request Date
- Processed Date

---

## 🔧 **Technical Implementation**

### **Backend Files Modified**

1. **`controller/merchantController.js`**
   - Added `getEarnings()` function
   - Added `requestWithdrawal()` function
   - Added `getWithdrawalHistory()` function
   - Imports: Payment and Withdrawal models

2. **`router/merchantRouter.js`**
   - Added 3 new routes for earnings management
   - Protected with auth and role middleware

### **Frontend Files Modified/Created**

1. **`components/merchant/MerchantSidebar.jsx`**
   - Added "Earnings" menu item with dollar icon
   - Route: `/dashboard/merchant/earnings`

2. **`App.jsx`**
   - Added import for MerchantEarnings component
   - Added route configuration

3. **`pages/dashboards/MerchantEarnings.jsx`** (NEW)
   - Complete earnings dashboard
   - Stats cards with icons
   - Transaction history table
   - Withdrawal request form
   - Withdrawal history table

---

## 🔄 **Workflow**

### **Merchant Earnings Flow**

```
1. Merchant logs in → Navigates to Earnings page
2. System fetches earnings data from backend
3. Displays 4 stat cards with financial summary
4. Shows transaction history in table format
5. Merchant can request withdrawal:
   - Click "Request Withdrawal" button
   - Enter amount (validated against available balance)
   - Submit request
   - Request saved with "pending" status
6. Withdrawal requests shown in separate table
7. Admin can review and approve/reject requests (future feature)
```

---

## 📋 **Data Models Used**

### **Payment Model** (existing)
```javascript
{
  merchantId: ObjectId,
  bookingId: ObjectId,
  totalAmount: Number,
  adminCommission: Number,
  merchantAmount: Number,
  paymentStatus: String,
  createdAt: Date
}
```

### **Withdrawal Model** (existing)
```javascript
{
  merchant: ObjectId,
  amount: Number,
  status: "pending" | "approved" | "rejected" | "processing" | "completed",
  bankDetails: Object,
  adminResponse: Object,
  createdAt: Date,
  processedDate: Date
}
```

---

## 🎨 **UI Features**

### **Design Elements**
- Clean card-based layout
- Color-coded stat cards (green, blue, yellow, red)
- Responsive tables with hover effects
- Status badges with different colors
- Loading spinners
- Toast notifications for user feedback
- Form validation

### **Icons Used**
- `FaDollarSign` - Earnings and commission
- `FaWallet` - Available balance
- `FaHourglassHalf` - Pending amount
- `FaChartLine` - Total earnings
- `FaSpinner` - Loading states

---

## 🔒 **Security & Validation**

### **Backend Validation**
- JWT token authentication required
- Role-based access control (merchant only)
- Amount validation (must be > 0)
- Balance check (cannot withdraw more than available)
- User ownership verification

### **Frontend Validation**
- Required fields enforcement
- Numeric input validation
- Real-time balance checking
- Disabled submit during loading

---

## 📈 **Calculations**

### **Total Earnings**
```javascript
Sum of all merchantAmount from payments
```

### **Available Balance**
```javascript
Total Earnings - Pending Withdrawals
```

### **Pending Amount**
```javascript
Sum of all withdrawals with status "pending" or "processing"
```

### **Commission Deducted**
```javascript
Sum of all adminCommission from payments
```

---

## 🚀 **How to Use**

### **For Merchants**

1. **Login** with merchant credentials
   - Email: `merchant@test.com`
   - Password: `Merchant@123`

2. **Navigate to Earnings**
   - Click "Earnings" in sidebar
   - View financial summary

3. **Request Withdrawal**
   - Click "Request Withdrawal" button
   - Enter amount (max: available balance)
   - Submit request
   - View request in withdrawal history table

4. **Track Transactions**
   - View all payment transactions
   - See booking details and commissions
   - Monitor withdrawal request status

---

## 🧪 **Testing**

### **Test Script Created**
File: `backend/test-merchant-earnings.js`

**Run Test:**
```bash
cd backend
node test-merchant-earnings.js
```

**Test Steps:**
1. Login as merchant
2. Fetch earnings data
3. Display summary
4. Request withdrawal (if balance available)
5. Fetch withdrawal history

---

## 📝 **API Response Examples**

### **Get Earnings Response**
```json
{
  "success": true,
  "data": {
    "totalEarnings": 5000.00,
    "availableBalance": 4500.00,
    "pendingAmount": 500.00,
    "commissionDeducted": 500.00,
    "transactionList": [
      {
        "bookingId": "67890...",
        "amount": 950.00,
        "totalAmount": 1000.00,
        "commission": 50.00,
        "date": "2026-03-25T10:00:00Z",
        "status": "success",
        "paymentMethod": "UPI"
      }
    ]
  }
}
```

### **Withdrawal Request Response**
```json
{
  "success": true,
  "message": "Withdrawal request submitted successfully",
  "withdrawal": {
    "_id": "12345...",
    "merchant": "merchant_id",
    "amount": 500.00,
    "status": "pending",
    "createdAt": "2026-03-25T10:00:00Z"
  }
}
```

---

## 🎯 **Future Enhancements**

### **Admin Features (To Implement)**
1. Admin dashboard to view all withdrawal requests
2. Approve/Reject withdrawal functionality
3. Bulk payment processing
4. Export earnings reports
5. Commission rate configuration

### **Merchant Features**
1. Bank account details management
2. Auto-withdrawal setup
3. Earnings analytics charts
4. Payment method preferences
5. Tax documentation

---

## ✅ **Checklist**

- [x] Backend API: Get earnings
- [x] Backend API: Request withdrawal
- [x] Backend API: Withdrawal history
- [x] Frontend: Earnings dashboard
- [x] Frontend: Stats cards (4)
- [x] Frontend: Transaction history table
- [x] Frontend: Withdrawal request form
- [x] Frontend: Withdrawal history table
- [x] Navigation: Sidebar menu item
- [x] Routing: App.jsx configuration
- [x] Security: Authentication & authorization
- [x] Validation: Amount and balance checks
- [x] Testing: Test script created

---

## 🎉 **Summary**

Merchants can now:
✅ Track their earnings in real-time
✅ View detailed transaction history
✅ Request withdrawals instantly
✅ Monitor withdrawal request status
✅ See commission deductions
✅ Access all financial data in one place

**The Earnings feature is fully functional and ready for use!** 🚀
