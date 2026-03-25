# 🔧 Booking Creation Failure - Troubleshooting Guide

## Common Causes & Solutions

### ❌ Error 1: serviceId Type Mismatch
**Problem:** Sending ObjectId instead of String
```javascript
// WRONG ❌
serviceId: service._id  // This is an ObjectId

// CORRECT ✅
serviceId: (service._id || service.id).toString()
```

**Solution:** Already fixed in controller, but verify frontend sends it correctly

---

### ❌ Error 2: eventDate Format Invalid
**Problem:** Schema expects Date object, but might receive string
```javascript
// Schema expects:
eventDate: { type: Date }

// Frontend might send:
eventDate: "2026-03-30"  // String from <input type="date">
```

**Solution:** Convert string to Date object
```javascript
const bookingData = {
  eventDate: eventDate ? new Date(eventDate) : new Date(),
  // ... other fields
}
```

---

### ❌ Error 3: Missing Required Fields
**Schema requires:**
- user (ObjectId) ✓ Auth provides this
- serviceId (String) ✓ Should convert
- serviceTitle (String) ✓ From service.title
- serviceCategory (String) ✓ From service.category
- servicePrice (Number) ✓ From basePrice
- bookingDate (Date) ✓ new Date()

**Check all required fields are present!**

---

### ❌ Error 4: Authentication Issue
**Problem:** Token expired or not sent
```javascript
headers: {
  Authorization: `Bearer ${token}`  // Must be valid JWT
}
```

**Solution:** 
1. Logout and login again
2. Check token exists in localStorage
3. Verify token not expired

---

### ❌ Error 5: MongoDB Connection
**Problem:** Database not connected
```bash
# Check MongoDB status
net start MongoDB  # Windows
# or
mongod --version   # Check if running
```

**Solution:** Start MongoDB service

---

## 🔍 Debug Steps

### Step 1: Check Browser Console
Press F12 → Console tab → Look for errors like:
```
❌ Failed to load resource: 500 (Internal Server Error)
❌ Booking Error: AxiosError
Response: { message: "Actual error here" }
```

### Step 2: Check Backend Terminal
Look for logs like:
```
❌ Booking creation error: [Error details]
Error details: [Specific message]
Stack trace: [Full stack]
```

### Step 3: Check Network Tab
F12 → Network tab → Click on bookings request → Check:
- **Request URL:** http://localhost:5000/api/bookings
- **Request Method:** POST
- **Status Code:** Should be 201, not 500 or 400
- **Request Payload:** See what data was sent
- **Response:** See actual error message

### Step 4: Run Debug Script
```bash
cd backend
node debug-booking-creation.js
```

This will tell you:
- ✅ If database connection works
- ✅ If serviceId type is correct
- ✅ If eventDate format is valid
- ✅ What's actually failing

---

## 🛠️ Quick Fixes to Try

### Fix 1: Ensure Proper Date Conversion
Update BookingModal.jsx line 306:
```javascript
// OLD
eventDate: eventDate,

// NEW
eventDate: eventDate ? new Date(eventDate) : new Date(),
```

### Fix 2: Ensure serviceId is String
Update BookingModal.jsx line 301:
```javascript
// OLD
serviceId: service._id || service.id,

// NEW
serviceId: (service._id || service.id).toString(),
```

### Fix 3: Add More Detailed Logging
Add before axios.post (line 324):
```javascript
console.log("Detailed booking data:");
console.log("- serviceId:", typeof bookingData.serviceId, bookingData.serviceId);
console.log("- eventDate:", typeof bookingData.eventDate, bookingData.eventDate);
console.log("- eventTime:", typeof bookingData.eventTime, bookingData.eventTime);
console.log("- totalPrice:", typeof bookingData.totalPrice, bookingData.totalPrice);
```

---

## 📋 Expected Data Structure

Frontend should send:
```javascript
{
  serviceId: "67e2a8f0e5b4c3d2a1b9c8d8",  // String!
  serviceTitle: "Wedding Photography",
  serviceCategory: "photography",
  servicePrice: 5000,
  eventType: "full-service",
  eventDate: "2026-03-30T00:00:00.000Z",  // ISO string or Date object
  eventTime: "14:30",  // 24-hour format string
  selectedAddOns: [{ name: "Extra Hours", price: 500 }],
  addons: [{ name: "Extra Hours", price: 500 }],
  location: "123 Main St",
  locationType: "custom",
  totalAmount: 5500,
  discount: 0,
  promoCode: null,
  status: "pending",
  notes: "",
  guestCount: 1
}
```

Backend creates:
```javascript
{
  user: ObjectId("67e2a8f0e5b4c3d2a1b9c8d7"),
  serviceId: "67e2a8f0e5b4c3d2a1b9c8d8",  // Stored as String
  serviceTitle: "Wedding Photography",
  serviceCategory: "photography",
  servicePrice: 5000,
  eventType: "full-service",
  eventDate: ISODate("2026-03-30T00:00:00.000Z"),  // Stored as Date
  eventTime: "14:30",  // Stored as String
  guestCount: 1,
  totalPrice: 5500,
  status: "pending",
  payment: {
    paid: false,
    amount: 5500
  },
  addons: [{ name: "Extra Hours", price: 500 }],
  location: "123 Main St",
  locationType: "custom",
  bookingDate: ISODate("2026-03-25T10:30:00.000Z")
}
```

---

## 🎯 Most Likely Issue

Based on the pattern, the most likely issue is:

### **eventDate needs to be converted to Date object**

The HTML `<input type="date">` returns a string like "2026-03-30", but MongoDB expects a Date object.

**Quick Test:**
Check browser console for this error:
```
Cast to date failed for value "2026-03-30" at path "eventDate"
```

If you see this, the fix is:

**In BookingModal.jsx, change line 306:**
```javascript
// FROM
eventDate: eventDate,

// TO
eventDate: eventDate ? new Date(eventDate) : new Date(),
```

---

## 🚨 Critical Issues Checklist

If booking still fails, check these in order:

1. **MongoDB Running?**
   ```bash
   net start MongoDB
   ```

2. **Backend Server Restarted?**
   ```bash
   # Stop current server (Ctrl+C)
   # Then restart
   npm start
   ```

3. **User Logged In?**
   - Logout and login again
   - Check token in localStorage

4. **Event Exists?**
   - Verify the event/service exists in database
   - Check event _id is valid

5. **All Required Fields Present?**
   - serviceId ✓
   - serviceTitle ✓
   - serviceCategory ✓
   - servicePrice ✓
   - eventDate ✓
   - eventTime ✓

6. **Correct Data Types?**
   - serviceId: String (not ObjectId)
   - eventDate: Date object or ISO string
   - eventTime: String ("HH:MM")
   - servicePrice: Number
   - totalPrice: Number

---

## 💡 Next Steps

1. **Run debug script:**
   ```bash
   cd backend
   node debug-booking-creation.js
   ```

2. **Check console logs** and share the exact error message

3. **Try the quick fix** for eventDate conversion

4. **Restart backend server** to apply any code changes

5. **Test again** and monitor both frontend console and backend terminal

---

## 📞 Need More Help?

Provide these details:
1. Exact error message from browser console
2. Backend terminal logs when booking fails
3. Output from debug-booking-creation.js
4. Network tab screenshot showing request payload
5. When the error started happening

This information will help pinpoint the exact issue!
