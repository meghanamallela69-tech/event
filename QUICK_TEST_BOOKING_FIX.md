# 🧪 Quick Test - Booking Fix Verification

## Step 1: Restart Backend Server

```bash
cd backend
npm start
```

**Expected Output:**
```
Server running on port 5000
MongoDB connected
```

## Step 2: Open Browser DevTools

1. Press `F12` or right-click → Inspect
2. Go to **Console** tab
3. Keep console open for viewing logs

## Step 3: Test the Booking Flow

### Navigate to Full-Service Event
1. Go to your frontend app
2. Browse events
3. Find a **full-service** event (not ticketed)
4. Click on it to see details

### Submit Booking
1. Click **"Book Service"** button
2. Fill in the form:
   - **Event Date**: Select any date
   - **Time Slot**: Select any time
   - **Location**: Enter address or use current location
   - **Add-ons**: Optional (can skip)
3. Click **"Request Booking"**

## Step 4: Check Console Logs

### ✅ Success Indicators

**Frontend Console:**
```
=== FULL SERVICE BOOKING ===
Service ID: 67e2a8f0e5b4c3d2a1b9c8d8
Event Date: 2026-03-25
Time Slot: 10:00 AM
...
Sending booking data: { ... }
✅ Booking Response: {
  success: true,
  message: "Booking request sent successfully",
  booking: { ... }
}
```

**Backend Console (Terminal):**
```
Creating booking with data: {
  "user": "67e2a8f0e5b4c3d2a1b9c8d7",
  "serviceId": "67e2a8f0e5b4c3d2a1b9c8d8",
  "serviceTitle": "Wedding Photography",
  "eventType": "full-service",
  "status": "pending",
  "payment": {
    "paid": false,
    "amount": 5000
  }
}
✅ Booking created successfully: 67e2a8f0e5b4c3d2a1b9c8d9
```

**Browser Toast Notification:**
```
✅ "Booking request sent. Waiting for merchant approval."
```

### ❌ Error Indicators (Should NOT See)

**Frontend Console:**
```
❌ Failed to load resource: 500 (Internal Server Error)
❌ Booking Error: AxiosError
❌ Response: { message: "..." }
❌ Status: 500
```

**Backend Console:**
```
❌ Booking creation error: ...
❌ Error details: ...
```

**Browser Toast:**
```
❌ "Failed to create booking"
❌ Any error message
```

## Step 5: Verify Database (Optional)

### Using MongoDB Compass:
1. Connect to MongoDB
2. Navigate to database
3. Open `bookings` collection
4. Find latest booking (sort by date descending)
5. Verify structure:

```javascript
{
  "_id": ObjectId("..."),
  "user": ObjectId("..."),
  "serviceId": "67e2a8f0e5b4c3d2a1b9c8d8",  // ← String type
  "serviceTitle": "Wedding Photography",
  "eventType": "full-service",
  "status": "pending",
  "payment": {
    "paid": false,
    "amount": 5000
  },
  "addons": [],
  "totalPrice": 5000,
  "bookingDate": ISODate("2026-03-25T...")
}
```

### Using Backend Script:
```bash
cd backend
node test-full-service-booking.js
```

Should show:
```
✅ Connected to MongoDB
✅ Test 1: Minimal required fields
✅ Booking created successfully!
✅ Booking ID: ...
✅ Status: pending
✅ Payment Status: undefined (uses payment.paid instead)
✅ Addons: []
```

## Step 6: Test Multiple Bookings

Try booking the **same event** again with different details:

1. Different date
2. Different time
3. Different location

**Expected Result:**
- ✅ Both bookings should succeed
- ✅ No "duplicate booking" errors
- ✅ Each booking gets unique ID

## Common Issues & Solutions

### Issue 1: Still Getting 500 Error

**Check Backend Logs:**
```bash
# Look for actual error message
tail -f backend/logs/error.log  # if using logging
# Or watch console during booking
```

**Possible Causes:**
- MongoDB not running → Start MongoDB
- Invalid token → Logout and login again
- Event doesn't exist → Check event ID

### Issue 2: "User authentication required"

**Solution:**
1. Make sure you're logged in
2. Check token is being sent in headers
3. Token might be expired → Refresh/login again

### Issue 3: "Service ID or Event ID is required"

**Solution:**
- Frontend not sending serviceId properly
- Check Network tab in DevTools
- Verify request payload includes `serviceId`

### Issue 4: MongoDB Connection Error

**Solution:**
```bash
# Windows - Restart MongoDB service
net stop MongoDB
net start MongoDB

# Or use the project script
start-mongodb.bat
```

## Success Criteria Checklist

After testing, you should have:

- [x] No 500 errors in console
- [x] Success toast appears
- [x] Backend logs show "✅ Booking created successfully"
- [x] Booking stored in database
- [x] `serviceId` is String type (not ObjectId)
- [x] `payment.paid` is false
- [x] `status` is "pending"
- [x] Multiple bookings allowed for same event

## 🎉 If All Tests Pass

Congratulations! The booking API is working correctly.

### Next Steps:
1. Test with addons selected
2. Test with discount/promo code
3. Test merchant accepting/rejecting booking
4. Test payment flow for accepted bookings

## 📞 Need Help?

If tests fail:

1. **Check these files first:**
   - `BOOKING_500_ERROR_FIX.md` - Detailed fix explanation
   - `FULL_SERVICE_BOOKING_API_FIX.md` - Complete API documentation
   - `BOOKING_API_QUICK_REFERENCE.md` - Quick troubleshooting

2. **Run diagnostic scripts:**
   ```bash
   cd backend
   node test-full-service-booking.js  # Database test
   node test-booking-api.js           # API test
   ```

3. **Verify server status:**
   ```bash
   # Check if backend is running
   curl http://localhost:5000/api/events
   
   # Check MongoDB connection
   mongosh --eval "db.runCommand({connectionStatus:1})"
   ```

## 📊 Expected vs Actual Results

| Aspect | Before Fix | After Fix |
|--------|-----------|-----------|
| HTTP Status | 500 Error | 201 Created |
| Frontend Message | "Failed to create booking" | "Booking request sent successfully" |
| Backend Logs | Error stack trace | "✅ Booking created successfully" |
| Database | No booking created | Booking document created |
| serviceId Type | ObjectId (wrong) | String (correct) |
| Payment Field | Missing | `payment.paid: false` |
| Multiple Bookings | Blocked by errors | Allowed |
