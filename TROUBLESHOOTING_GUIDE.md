# Troubleshooting Guide

## Issue: Admin Bookings Page Shows "No bookings found"

### Solution 1: Create Test Bookings
```bash
cd backend
node create-test-bookings.js
```

### Solution 2: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check if API call is being made

### Solution 3: Check Backend Logs
1. Look for "Admin: Found X bookings" message
2. Check for any error messages
3. Verify admin user ID is correct

### Solution 4: Verify Database
```javascript
// In MongoDB shell
db.bookings.find({ type: "event" }).count()
```

---

## Issue: Merchant Bookings Page Shows "No bookings found"

### Solution 1: Verify Merchant Has Events
```javascript
// In MongoDB shell
db.events.find({ createdBy: ObjectId("merchant_id") }).count()
```

### Solution 2: Create Bookings for Merchant Events
```bash
cd backend
node create-test-bookings.js
```

### Solution 3: Check API Response
1. Open browser DevTools
2. Go to Network tab
3. Look for `/event-bookings/merchant/bookings` request
4. Check response data structure

---

## Issue: Merchant Name Not Showing in Admin Dashboard

### Solution: Verify Merchant Data
```javascript
// In MongoDB shell
db.bookings.findOne({ type: "event" }).merchant
// Should return merchant ObjectId
```

---

## Issue: Ratings Not Showing

### Solution 1: Verify Rating Exists
```javascript
// In MongoDB shell
db.ratings.find({ event: ObjectId("event_id") })
```

### Solution 2: Check Booking Has Rating Field
```javascript
// In MongoDB shell
db.bookings.findOne({ _id: ObjectId("booking_id") }).rating
```

---

## Issue: API Returns 401 Unauthorized

### Solution: Check Authentication
1. Verify token is being sent in headers
2. Check token is not expired
3. Verify user role is correct (merchant/admin)

---

## Issue: API Returns 500 Error

### Solution: Check Backend Logs
1. Look for error message in console
2. Check MongoDB connection
3. Verify all required fields are present

---

## Debug Commands

### Check Merchant Bookings Count
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4001/api/v1/event-bookings/merchant/bookings
```

### Check Admin Bookings Count
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4001/api/v1/admin/bookings
```

### Check Database Bookings
```javascript
// In MongoDB shell
db.bookings.find({ type: "event" }).pretty()
```

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| No bookings showing | No data in database | Run create-test-bookings.js |
| Merchant name missing | Merchant not populated | Check booking.merchant reference |
| Rating not showing | No rating record | Create rating via API |
| API error 401 | Invalid token | Re-login and get new token |
| API error 500 | Server error | Check backend logs |
| Empty event name | Event not populated | Verify eventId reference |

---

## Quick Checklist

- [ ] Backend server running on port 4001
- [ ] Frontend running on port 5173
- [ ] MongoDB connected
- [ ] Test bookings created
- [ ] Logged in as merchant/admin
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API calls
- [ ] Database has booking records

---

## Getting Help

1. Check browser console for errors
2. Check backend logs for errors
3. Verify database has data
4. Check API response structure
5. Verify authentication token
6. Run create-test-bookings.js to populate data