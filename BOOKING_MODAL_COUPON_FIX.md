# Fix: Promo Codes Not Showing in Booking Modal for Wedding & Summer Events

## Problem Identified
The **EventBookingModal** component was missing the functionality to fetch and display available coupon offers, unlike ServiceBookingModal and TicketSelectionModal which already had this feature.

## Root Cause
- ✅ Backend was correctly returning coupons (verified with database check)
- ✅ Coupons GRALUX75 and SUMMUS64 exist and are properly linked
- ❌ Frontend EventBookingModal wasn't fetching available coupons from backend
- ❌ No UI to display coupon offers in EventBookingModal

## Solution Applied

### Updated File: `frontend/src/components/EventBookingModal.jsx`

#### 1. Added Required Imports
```javascript
import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE, authHeaders } from "../lib/http";
```

#### 2. Added State Variables
```javascript
const [availableCoupons, setAvailableCoupons] = useState([]);
const [showCouponOffers, setShowCouponOffers] = useState(false);
const [couponLoading, setCouponLoading] = useState(false);
```

#### 3. Added useEffect Hook
Fetches coupons when modal opens:
```javascript
useEffect(() => {
  if (isOpen && event) {
    fetchAvailableCoupons();
  }
}, [isOpen, event, originalTotal]);
```

#### 4. Added Helper Functions
- `fetchAvailableCoupons()` - Calls backend API to get available coupons
- `applyCouponFromOffer(coupon)` - Applies coupon when user clicks "Apply" button

#### 5. Enhanced UI
Added coupon offers display section:
- Toggle button showing number of available offers
- Expandable list of coupon cards
- Each coupon shows: code, discount, description, and "Apply" button
- Integrated with existing CouponInput component

## What Changed in the UI

### Before:
```
┌─────────────────────────────┐
│ Book Tickets                │
├─────────────────────────────┤
│ Event: Wedding Planning     │
│ Date: [date picker]         │
│ Quantity: [number input]    │
│                             │
│ Have a coupon code?         │
│ [Enter code] [Apply]        │
│                             │
│ Total: ₹50,000              │
└─────────────────────────────┘
```

### After:
```
┌─────────────────────────────┐
│ Book Tickets                │
├─────────────────────────────┤
│ Event: Wedding Planning     │
│ Date: [date picker]         │
│ Quantity: [number input]    │
│                             │
│ 🏷️ 1 Offer Available    ▼  │ ← Click to expand
│ ┌─────────────────────────┐ │
│ │ 🏷️ Available Offers    │ │
│ │ ┌───────────────────┐   │ │
│ │ │ GRALUX75 [15% OFF]│   │ │
│ │ │ 15% off above ₹500│   │ │
│ │ │            [Apply]│   │ │
│ │ └───────────────────┘   │ │
│ └─────────────────────────┘ │
│                             │
│ Have a coupon code?         │
│ [Enter code] [Apply]        │
│                             │
│ Total: ₹50,000              │
└─────────────────────────────┘
```

## Verification Steps

### 1. Backend Check (Already Verified ✅)
```bash
cd backend
node verify-coupons-setup.js
```
Result: 
- ✅ Grand Luxury Wedding → GRALUX75 (15% off)
- ✅ Summer Music Concert → SUMMUS64 (15% off)

### 2. Frontend Test Instructions

#### Step 1: Open the App
- Navigate to http://localhost:5174
- Login as a user

#### Step 2: Test Wedding Event
1. Find "Grand Luxury Wedding Planning" event
2. Click "Book Now"
3. Look for "🏷️ 1 Offer Available" text
4. Click on it to expand
5. Should see: GRALUX75 - 15% OFF
6. Click "Apply" button
7. Should see: "Coupon applied! 15% discount"

#### Step 3: Test Summer Music Event
1. Find "Summer Music Concert Night" event
2. Click "Book Now"
3. Look for "🏷️ 1 Offer Available" text
4. Click on it to expand
5. Should see: SUMMUS64 - 15% OFF
6. Click "Apply" button
7. Should see: "Coupon applied! 15% discount"

### 3. Browser Console Debug

If coupons still don't show, open browser DevTools (F12) and check:

#### Network Tab:
Look for request to:
```
GET http://localhost:5000/api/coupons/available?eventId=XXX&totalAmount=YYY
```

Response should be:
```json
{
  "success": true,
  "coupons": [
    {
      "_id": "...",
      "code": "GRALUX75",
      "discountValue": 15,
      "minAmount": 500,
      ...
    }
  ],
  "total": 1
}
```

#### Console Tab:
Look for log:
```
✅ Fetched available coupons: [...]
```

If empty array, check backend logs.

## Files Modified

1. ✅ `frontend/src/components/EventBookingModal.jsx` - Added coupon fetching and display
2. ✅ `backend/models/couponSchema.js` - Added eventId and merchantId fields
3. ✅ `backend/controller/marketingController.js` - Updated createPromoCode
4. ✅ `backend/controller/eventController.js` - Updated listEvents coupon query
5. ✅ `backend/controller/couponController.js` - Updated getAvailableCoupons

## Expected Behavior After Fix

### For Users:
1. Open any event booking modal
2. See "X Offer(s) Available" if coupons exist
3. Click to expand and view coupon details
4. Click "Apply" to use the coupon
5. See discount applied to total amount

### For Merchants:
1. Create coupon for specific event
2. Coupon automatically shows in booking modal for that event
3. Only users can apply the coupon

## Testing Checklist

- [ ] Restart frontend server (if needed)
- [ ] Open Wedding event booking modal
- [ ] Verify GRALUX75 coupon shows
- [ ] Apply GRALUX75 and verify 15% discount
- [ ] Open Summer Music event booking modal
- [ ] Verify SUMMUS64 coupon shows
- [ ] Apply SUMMUS64 and verify 15% discount
- [ ] Test manual coupon code entry still works
- [ ] Test removing coupon works
- [ ] Verify no console errors

## Troubleshooting

### Issue: "No Offers Available" shows even though coupons exist

**Solution:**
1. Check browser console for errors
2. Check Network tab for API response
3. Verify token is valid
4. Check backend terminal for coupon query logs

### Issue: Coupon shows but doesn't apply

**Solution:**
1. Check if coupon is expired
2. Check if minimum amount is met
3. Check if usage limit reached
4. Check backend validation logs

### Issue: Console shows "Failed to fetch available coupons"

**Solution:**
1. Verify backend is running on port 5000
2. Check Authorization header has valid token
3. Verify eventId is correct in API call
4. Check MongoDB connection in backend

## Success Criteria

✅ Wedding event shows GRALUX75 coupon
✅ Summer Music event shows SUMMUS64 coupon  
✅ Clicking "Apply" successfully applies discount
✅ Discount amount calculated correctly
✅ Coupon can be removed
✅ Manual coupon code entry still works
✅ No JavaScript errors in console
✅ No backend errors in terminal

## Next Steps

1. **Test in Browser**: Follow verification steps above
2. **Monitor Logs**: Watch both frontend and backend consoles
3. **Report Results**: Confirm if coupons now appear correctly

---

## Summary

The issue was NOT with the backend data or queries. The coupons were properly configured in the database. The problem was that the **EventBookingModal** component was missing the UI and logic to fetch and display available coupon offers.

This fix brings the EventBookingModal in line with ServiceBookingModal and TicketSelectionModal, providing a consistent user experience across all booking types.

**Status: READY FOR TESTING** 🚀
