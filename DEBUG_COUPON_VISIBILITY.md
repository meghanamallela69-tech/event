# 🔍 Debug Coupon Visibility Issues

## Current Status

✅ **Database**: SAVE10 and SAVE30 exist and are correctly configured  
✅ **Backend API**: Running on http://localhost:5000  
✅ **Frontend**: Running on http://localhost:5173  
✅ **EventBookingModal**: Updated with new coupon UI  

---

## Step-by-Step Debug Guide

### 1. Open Browser DevTools (F12)

Go to **http://localhost:5173** and press **F12**

### 2. Login as User

Use credentials:
- Email: `user@gmail.com`
- Password: `password`

### 3. Navigate to Wedding Event

Find "Grand Luxury Wedding Planning" event and click **"Book Now"**

### 4. Check Console Logs (F12 → Console tab)

You should see these logs in order:

```
🔍 Fetching coupons for event: Grand Luxury Wedding Planning Event ID: 69b799063ddecddff43583f5
🎫 Fetching coupons with amount: [some number]
📦 Coupon API Response: {success: true, coupons: [...], total: 1}
✅ Fetched available coupons: [{_id: "...", code: "SAVE30", ...}]
```

---

## What to Check If Coupons Don't Show

### Issue #1: No Console Logs at All

**Problem:** The useEffect isn't triggering

**Solution:**
1. Check if modal is actually opening
2. Verify event object has `_id` property
3. Check for JavaScript errors in console

### Issue #2: "🔍 Fetching coupons..." but no response

**Problem:** API call is failing

**Check Network Tab (F12 → Network):**
1. Look for request to: `/coupons/available?eventId=...`
2. Check status code (should be 200)
3. Check response body

**Expected Response:**
```json
{
  "success": true,
  "coupons": [
    {
      "_id": "69c506a4dd42fdefa4d56e49",
      "code": "SAVE30",
      "discountType": "percentage",
      "discountValue": 30,
      "minAmount": 1000,
      "maxDiscount": 5000,
      "description": "30% off on Wedding Planning services",
      "isActive": true,
      "expiryDate": "2026-06-24T...",
      "usedCount": 0,
      "usageLimit": 100
    }
  ],
  "total": 1
}
```

### Issue #3: API Returns Empty Array `[]`

**Possible Causes:**

#### A. Token Missing or Invalid
```javascript
// Check request headers in Network tab
Authorization: "Bearer YOUR_TOKEN_HERE"
```
**Fix:** Make sure you're logged in

#### B. Wrong Event ID
```
Request URL should be:
/coupons/available?eventId=69b799063ddecddff43583f5&totalAmount=50000
```
**Fix:** Refresh page and try again

#### C. Total Amount Too Low
For SAVE30, minimum amount is ₹1,000  
For SAVE10, minimum amount is ₹500

**Fix:** Increase booking amount (select more tickets or higher-priced option)

### Issue #4: Response Shows Coupons But UI Doesn't Display

**Problem:** Frontend state not updating

**Check:**
1. Open React DevTools (if installed)
2. Check `availableCoupons` state in EventBookingModal
3. Should show array with coupon objects

**Fix:** Try clicking dropdown arrow manually

---

## Manual Test in Browser Console

Paste this in browser console (F12) to test API directly:

```javascript
// Get your token from localStorage
const token = localStorage.getItem('token');

// Test Wedding event
fetch('http://localhost:5000/api/coupons/available?eventId=69b799063ddecddff43583f5&totalAmount=50000', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
.then(r => r.json())
.then(data => {
  console.log('Wedding Coupons:', data);
  if (data.coupons && data.coupons.length > 0) {
    console.log('✅ Found:', data.coupons[0].code);
  } else {
    console.log('❌ No coupons found');
  }
});

// Test Music event
fetch('http://localhost:5000/api/coupons/available?eventId=69b799843ddecddff4358402&totalAmount=5000', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
.then(r => r.json())
.then(data => {
  console.log('Music Coupons:', data);
  if (data.coupons && data.coupons.length > 0) {
    console.log('✅ Found:', data.coupons[0].code);
  } else {
    console.log('❌ No coupons found');
  }
});
```

---

## Backend Verification

Run this in backend terminal to verify database:

```bash
cd backend
node debug-coupon-query.js
```

**Expected Output:**
```
🎫 All Active Coupons (2):

1. SAVE30
   eventId: 69b799063ddecddff43583f5
   merchantId: 69b78d1e2070d9f0b1e09e68
   isActive: true
   
2. SAVE10
   eventId: 69b799843ddecddff4358402
   merchantId: 69b78d1e2070d9f0b1e09e68
   isActive: true
```

---

## Quick Fix Checklist

- [ ] Frontend running on port 5173
- [ ] Backend running on port 5000
- [ ] Logged in as user (not admin/merchant)
- [ ] Opening correct events (Wedding or Music)
- [ ] Browser console shows no errors
- [ ] Network tab shows 200 status for coupon API
- [ ] API response contains coupon data
- [ ] Modal shows promo code section
- [ ] Dropdown arrow visible
- [ ] Can click to expand dropdown

---

## Common Mistakes

### ❌ Testing Wrong Events
Only these events have coupons:
- Grand Luxury Wedding Planning → SAVE30
- Summer Music Concert Night → SAVE10

Other events will show "No offers available"

### ❌ Not Logging In
Coupon API requires authentication. Make sure you're logged in.

### ❌ Browser Cache
Sometimes old code is cached. Hard refresh with **Ctrl+Shift+R**

---

## Success Indicators

When everything works, you'll see:

**Console:**
```
🔍 Fetching coupons for event: Grand Luxury Wedding Planning
🎫 Fetching coupons with amount: 50000
📦 Coupon API Response: {success: true, coupons: [SAVE30], total: 1}
✅ Fetched available coupons: [SAVE30]
```

**UI:**
```
┌─────────────────────────────────────┐
│ 🎟️ Have a Promo Code?              │
├─────────────────────────────────────┤
│ Enter promo code            ▼ [Apply]│
└─────────────────────────────────────┘
```

Click ▼ to see:
```
┌─────────────────────────────────────┐
│ 🏷️ Available Offers (1)            │
├─────────────────────────────────────┤
│ SAVE30  [30% OFF]          [Apply] │
│ 30% off on orders above ₹1,000     │
└─────────────────────────────────────┘
```

---

## Still Not Working?

If you've followed all steps and coupons still don't show:

1. **Check backend terminal** for coupon query logs
2. **Check frontend terminal** for any build errors
3. **Clear browser cache** and hard refresh
4. **Try incognito mode** to rule out cache issues
5. **Verify MongoDB connection** in backend logs

---

**Last Resort - Full Restart:**

```bash
# Stop both servers (Ctrl+C in both terminals)

# Restart backend
cd backend
node app.js

# In new terminal, restart frontend
cd frontend
npm run dev
```

Then test again at http://localhost:5173
