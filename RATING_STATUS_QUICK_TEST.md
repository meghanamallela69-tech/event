# 🧪 Quick Test Guide - Rating & Status Update System

## 🎯 What Was Implemented

1. **User Rating System** - Users can rate completed events
2. **Merchant Status Update** - Merchants can update booking status (pending → processing → completed)
3. **Integration** - When merchant marks "completed", user can rate

---

## ✅ Step-by-Step Testing

### Test 1: Merchant Status Update

#### As Merchant:
```bash
1. Login as merchant
   Email: merchant@example.com
   Password: password123

2. Navigate to "Bookings" in dashboard

3. Find a confirmed/paid booking

4. Should see status dropdown showing:
   [Status: Confirmed ▼]

5. Change status to "Processing"
   - Dropdown should update immediately
   - Toast: "Booking status updated to processing"

6. Change status to "Completed"
   - Dropdown updates
   - Toast: "Booking status updated to completed"
   - User can now rate this booking
```

**Expected Result:**
✅ Status updates successfully
✅ No errors in console
✅ Booking reflects new status

---

### Test 2: User Rating (Full Service)

#### As User:
```bash
1. Login as user who booked full-service event
   Email: user@example.com
   Password: password123

2. Go to "My Bookings"

3. Find booking with status "completed"

4. Should see "Rate Event" button (amber color)

5. Click "Rate Event"
   - Opens rating modal

6. Select stars (e.g., 5 stars)

7. Write review (optional): "Amazing experience!"

8. Click "Submit Rating"

9. Should see:
   - Toast: "Rating submitted successfully"
   - Modal closes
   - Button disappears (already rated)
```

**Expected Result:**
✅ Rating button visible for completed bookings
✅ Modal opens correctly
✅ Can submit rating without errors
✅ Cannot rate twice

---

### Test 3: User Rating (Ticketed Event)

#### As User:
```bash
1. Login as user who bought tickets

2. Go to "My Bookings"

3. Find ticketed booking with status "paid" or "confirmed"

4. Should see "Rate Event" button

5. Click and rate (same as above)
```

**Expected Result:**
✅ Ticketed events can be rated after payment
✅ Same rating flow works

---

## 🔍 Verification Checklist

### Backend Checks:
- [ ] Backend server restarted (`npm start`)
- [ ] New endpoint accessible: `PUT /api/bookings/merchant/:id/status`
- [ ] Rating endpoint working: `POST /api/bookings/:id/rate`
- [ ] No console errors in terminal

### Frontend Checks (Merchant):
- [ ] Status dropdown appears for confirmed bookings
- [ ] Can select different statuses
- [ ] Dropdown disabled during update
- [ ] Success toast appears
- [ ] Page refreshes with new status

### Frontend Checks (User):
- [ ] "Rate Event" button appears for completed full-service
- [ ] "Rate Event" button appears for paid/confirmed ticketed
- [ ] Button doesn't appear if already rated
- [ ] Rating modal opens
- [ ] Can select 1-5 stars
- [ ] Can write review text
- [ ] Submit works
- [ ] Success toast appears

---

## 🐛 Common Issues & Solutions

### Issue 1: Status dropdown not appearing
**Check:**
- Booking status must be "confirmed", "paid", or "processing"
- Must be full-service event type
- Refresh page after merchant confirms booking

**Solution:**
```javascript
// In browser console, check booking data:
console.log(bookings[0].status, bookings[0].eventType);
// Should show: "confirmed" or "paid", "full-service"
```

### Issue 2: Rate button not appearing
**Check:**
- For full-service: Status must be "completed"
- For ticketed: Status must be "paid", "confirmed", or "completed"
- User must not have already rated (no `booking.rating.score`)

**Solution:**
```javascript
// In browser console:
console.log("Status:", booking.status);
console.log("Event Type:", booking.eventType);
console.log("Has Rating:", !!booking.rating?.score);
// All should match criteria
```

### Issue 3: Rating modal error
**Check:**
- User must be logged in
- Token must be valid
- Booking must exist in database

**Solution:**
```bash
# Logout and login again
# Clear localStorage if needed
localStorage.clear();
# Then login fresh
```

### Issue 4: "Cannot read property of undefined"
**Check:**
- Backend server running
- API_BASE URL correct
- Auth headers being sent

**Solution:**
```bash
# Restart backend
cd backend
npm start

# Check API responds:
curl http://localhost:5000/api/bookings/my-bookings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Expected Data Flow

### Merchant Updates Status:
```
Merchant clicks dropdown → Selects "completed"
    ↓
Frontend sends: PUT /api/bookings/merchant/:id/status
Body: { status: "completed" }
    ↓
Backend validates:
- Merchant owns event ✓
- Valid status ✓
- Booking exists ✓
    ↓
Updates database: booking.status = "completed"
    ↓
Returns: { success: true, booking: {...} }
    ↓
Frontend shows toast + refreshes list
    ↓
User now sees "Rate Event" button
```

### User Submits Rating:
```
User clicks "Rate Event" → Modal opens
    ↓
Selects 5 stars + writes review
    ↓
Clicks "Submit"
    ↓
Frontend sends: POST /api/bookings/:id/rate
Body: { score: 5, review: "Great!" }
    ↓
Backend validates:
- User booked this event ✓
- Status is completed ✓
- Hasn't rated before ✓
- Score is 1-5 ✓
    ↓
Saves to database: booking.rating = { score: 5, review: "Great!" }
    ↓
Returns: { success: true, booking: {...} }
    ↓
Frontend shows toast + closes modal + refreshes list
    ↓
Button disappears (already rated)
```

---

## 🎯 Test Scenarios

### Scenario 1: Complete Full-Service Workflow
```
1. User books full-service event
2. Merchant accepts
3. User pays
4. Merchant confirms → Generates ticket
5. Merchant updates: confirmed → processing
6. After event: Merchant updates: processing → completed
7. User rates event: 5 stars + "Excellent service!"
8. Rating saved and displayed
```

### Scenario 2: Complete Ticketed Workflow
```
1. User buys 2 VIP tickets
2. User pays immediately
3. Merchant confirms → Generates tickets
4. After event date passes
5. User rates event: 4 stars + "Good concert!"
6. Rating saved
```

### Scenario 3: Multiple Status Updates
```
1. Booking confirmed (after payment)
2. Merchant changes to "processing" (preparing event)
3. Merchant changes to "pending" (delayed)
4. Merchant changes back to "processing"
5. Event happens
6. Merchant changes to "completed"
7. User can now rate
```

### Scenario 4: Rating Prevention
```
1. User rates event once ✓
2. Refreshes page
3. "Rate Event" button should NOT appear
4. Cannot rate twice
```

---

## 🚀 Quick Commands

### Check Backend Logs:
```bash
# Terminal running backend
tail -f logs/error.log  # if using logging
# Or just watch console during actions
```

### Check Frontend Console:
```bash
# Browser DevTools (F12) → Console tab
# Look for:
- "Rating submitted successfully"
- "Status updated to completed"
- Any error messages
```

### Database Check (MongoDB Compass):
```javascript
// Find recent bookings
db.bookings.find().sort({createdAt: -1}).limit(5)

// Should see:
{
  status: "completed",
  rating: {
    score: 5,
    review: "Great event!",
    createdAt: ISODate(...)
  }
}
```

### Test API Directly:
```bash
# Merchant updates status
curl -X PUT http://localhost:5000/api/bookings/merchant/BOOKING_ID/status \
  -H "Authorization: Bearer MERCHANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'

# User submits rating
curl -X POST http://localhost:5000/api/bookings/BOOKING_ID/rate \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"score": 5, "review": "Amazing!"}'
```

---

## 📋 Success Indicators

### You'll know it's working when:

✅ Merchant sees status dropdown
✅ Can change status without errors
✅ User sees "Rate Event" button after completion
✅ Can submit rating successfully
✅ Rating saved in database
✅ No console errors
✅ Toast notifications appear
✅ UI updates automatically
✅ Works on mobile responsive
✅ Both service types work

---

## ❌ If Something Fails

1. **Restart Backend Server**
   ```bash
   cd backend
   # Ctrl+C to stop
   npm start
   ```

2. **Clear Browser Cache**
   - Press Ctrl+Shift+Delete
   - Clear cached images/files
   - Or use Incognito mode

3. **Check Authentication**
   - Logout
   - Login again
   - Verify token in localStorage

4. **Run Debug Script**
   ```bash
   cd backend
   node debug-booking-creation.js
   ```

5. **Check MongoDB**
   ```bash
   net start MongoDB
   ```

---

## 🎉 Final Checklist

After testing all scenarios:

- [ ] Merchant can update status
- [ ] Status dropdown works smoothly
- [ ] User can rate completed events
- [ ] Rating modal functions properly
- [ ] Ratings saved to database
- [ ] No duplicate ratings allowed
- [ ] Works for full-service events
- [ ] Works for ticketed events
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Toast notifications show
- [ ] UI updates correctly

**If all checked: SUCCESS!** ✅

---

## 📞 Need Help?

Share these details:
1. Screenshot of browser console (F12)
2. Backend terminal output
3. Which step failed
4. Current booking status from database
5. Error message received

This will help diagnose the issue quickly!
