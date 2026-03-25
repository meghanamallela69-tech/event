# 500 Error Fix - ServiceId Type Mismatch

## 🐛 Issue Identified

**Error:** `Failed to load resource: the server responded with a status of 500 (Internal Server Error)`

### Root Cause

The booking schema defines `serviceId` as a **String** type:
```javascript
// bookingSchema.js line 10-13
serviceId: { 
  type: String,  // ← Must be String
  required: true 
}
```

But the controller was passing an **ObjectId** directly:
```javascript
// OLD CODE - WRONG ❌
const finalServiceId = serviceId || eventId;  // ObjectId
const bookingData = {
  serviceId: finalServiceId,  // Passing ObjectId to String field
}
```

This caused a **type mismatch error** when trying to save to MongoDB.

## ✅ Solution Applied

### Fixed in `backend/controller/bookingController.js`

Convert ObjectId to String before saving:

```javascript
// NEW CODE - CORRECT ✅
const finalServiceId = serviceId || eventId;
const bookingData = {
  serviceId: finalServiceId.toString(),  // ← Convert to String
  // ... other fields
}
```

Also added payment object for full-service bookings:

```javascript
// Set payment object for full-service (schema uses payment.paid, not paymentStatus)
bookingData.payment = {
  paid: false,
  amount: finalTotalPrice
};
```

## 🔍 Why This Happened

The schema was designed this way for consistency:
- Some parts of the code store ObjectId references as strings
- MongoDB can still query string IDs efficiently
- Easier to work with in frontend applications

## 🧪 How to Verify the Fix

### 1. Restart Backend Server
```bash
cd backend
npm start
```

Look for these logs:
```
Server running on port 5000
MongoDB connected
```

### 2. Test Booking Flow
1. Open browser DevTools → Console
2. Navigate to a full-service event
3. Click "Book Service"
4. Fill in the form
5. Click "Request Booking"

### 3. Check Console Logs

**Backend console should show:**
```
Creating booking with data: {
  "user": "67e2a8f0e5b4c3d2a1b9c8d7",
  "serviceId": "67e2a8f0e5b4c3d2a1b9c8d8",  // ← String now
  "serviceTitle": "Wedding Photography",
  ...
}
✅ Booking created successfully: 67e2a8f0e5b4c3d2a1b9c8d9
```

**Frontend console should show:**
```
=== FULL SERVICE BOOKING ===
Service ID: 67e2a8f0e5b4c3d2a1b9c8d8
...
✅ Booking Response: Object { success: true, message: "Booking request sent successfully", ... }
```

### 4. Verify No More 500 Error

**Before Fix:**
```
❌ Failed to load resource: 500 (Internal Server Error)
❌ Booking Error: AxiosError
❌ Status: 500
```

**After Fix:**
```
✅ Booking Response: { success: true, ... }
✅ Toast: "Booking request sent. Waiting for merchant approval."
```

## 📊 Complete Fix Summary

### Changes Made:

1. **Convert serviceId to String**
   ```javascript
   serviceId: finalServiceId.toString()
   ```

2. **Add payment object for full-service**
   ```javascript
   bookingData.payment = {
     paid: false,
     amount: finalTotalPrice
   };
   ```

3. **Enhanced logging**
   ```javascript
   console.log("Creating booking with data:", JSON.stringify(bookingData, null, 2));
   console.log("✅ Booking created successfully:", booking._id);
   ```

### Why These Changes Work:

1. **Type Compatibility**: String matches schema definition
2. **Payment Tracking**: Schema uses `payment.paid`, not `paymentStatus`
3. **Better Debugging**: Detailed logs help identify issues quickly

## 🎯 Expected Behavior Now

### Success Flow:
```
User clicks "Request Booking"
    ↓
Frontend sends POST /api/bookings
    ↓
Backend receives data
    ↓
Converts serviceId to String
    ↓
Adds payment object
    ↓
Logs booking data for debugging
    ↓
Creates booking in database ✅
    ↓
Returns: { success: true, message: "Booking request sent successfully" }
    ↓
Toast notification shown ✅
```

### What You Should See:

**Frontend:**
- ✅ Success toast: "Booking request sent. Waiting for merchant approval."
- ✅ Modal closes
- ✅ Redirected to bookings page (if implemented)

**Backend Console:**
- ✅ "Creating booking with data: ..."
- ✅ "✅ Booking created successfully: [booking_id]"

**Database:**
- ✅ New booking document created
- ✅ `serviceId` stored as String
- ✅ `payment.paid: false`
- ✅ `status: "pending"`

## 🔍 Additional Debugging

If you still see errors, check:

### 1. Authentication
```javascript
// Make sure token is valid and sent
headers: {
  Authorization: `Bearer ${token}`
}
```

### 2. Required Fields
Minimum required:
- `serviceId` or `eventId`
- User must be authenticated

### 3. MongoDB Connection
Check backend logs for:
```
MongoDB connected
```

If not connected, restart MongoDB:
```bash
# Windows
net stop MongoDB
net start MongoDB

# Or use the batch file
start-mongodb.bat
```

### 4. Event Exists
Verify the event/service exists:
```javascript
const event = await Event.findById(finalServiceId);
console.log("Event found:", event?.title);
```

## 📝 Files Modified

- `backend/controller/bookingController.js`
  - Line ~136: Convert serviceId to String
  - Line ~179-183: Add payment object
  - Line ~185-186: Enhanced logging

## 🚀 Testing Checklist

- [ ] Backend server restarted
- [ ] Navigate to full-service event
- [ ] Click "Book Service"
- [ ] Fill in date, time, location
- [ ] Click "Request Booking"
- [ ] No 500 error in console
- [ ] Success toast appears
- [ ] Check backend logs show "✅ Booking created successfully"
- [ ] Verify booking in database (optional)

## 💡 Key Learnings

1. **Always match schema types**: If schema says String, pass String
2. **Use .toString() for ObjectId conversion**: Don't pass ObjectId to String fields
3. **Check schema definitions**: Before assuming field types
4. **Add detailed logging**: Helps debug issues quickly
5. **Test end-to-end**: Frontend → Backend → Database

## 📞 Related Documentation

- `FULL_SERVICE_BOOKING_API_FIX.md` - Complete API fix documentation
- `BOOKING_API_QUICK_REFERENCE.md` - Quick reference guide
- `backend/models/bookingSchema.js` - Schema definition
