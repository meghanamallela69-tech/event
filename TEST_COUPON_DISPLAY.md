# How to Test Coupon Display in Booking Modal

## Current Status
✅ Backend is working correctly - returns GRALUX75 for Wedding event  
✅ Database has correct coupon data  
✅ Frontend EventBookingModal updated with coupon fetching  

## Testing Steps

### 1. Open the Application
- Navigate to: http://localhost:5174
- Login as a user (not merchant/admin)

### 2. Find Wedding Event
- Scroll to find "Grand Luxury Wedding Planning" event
- Click "Book Now" button

### 3. Check Browser Console (F12)
Open DevTools → Console tab and look for these logs:

```
🔍 Fetching coupons for event: Grand Luxury Wedding Planning Event ID: 69b799063ddecddff43583f5
🎫 Fetching coupons with amount: 50000
📦 Coupon API Response: {success: true, coupons: [...], total: 1}
✅ Fetched available coupons: [{code: "GRALUX75", ...}]
```

### 4. What You Should See in Modal

The booking modal should show:

```
┌─────────────────────────────────┐
│ Book Tickets                    │
├─────────────────────────────────┤
│ Event: Grand Luxury Wedding     │
│                                 │
│ 🏷️ 1 Offer Available       ▼  │ ← CLICK THIS
│ ┌─────────────────────────────┐ │
│ │ 🏷️ Available Offers        │ │
│ │                             │ │
│ │ GRALUX75      [15% OFF]     │ │
│ │ 15% off on orders above ₹500│ │
│ │               [Apply]       │ │
│ └─────────────────────────────┘ │
│                                 │
│ Have a coupon code?             │
│ [Enter code] [Apply]            │
└─────────────────────────────────┘
```

### 5. Click "Apply" Button
- Click the "Apply" button next to GRALUX75
- You should see: "Coupon applied! 15% discount"
- Total amount should decrease by 15%

### 6. Test Summer Music Event
- Close the Wedding modal
- Find "Summer Music Concert Night" event
- Click "Book Now"
- Should see SUMMUS64 coupon (15% off)

## Troubleshooting

### If you see "0 Offers Available":

**Check Console Logs:**
1. Look for error messages in red
2. Check if Event ID is being logged
3. Verify API response

**Common Issues:**

#### Issue 1: No Token
```
Error: User authentication required
```
**Fix:** Make sure you're logged in

#### Issue 2: Wrong Event ID
```
Event ID: undefined
```
**Fix:** Refresh the page and try again

#### Issue 3: API Not Called
If you don't see "🔍 Fetching coupons..." log:
- Modal might not be opening properly
- Event object might be null

### If coupons show but don't apply:

**Check Console for:**
```
Coupon validation error: ...
```

**Possible Reasons:**
- Minimum amount not met (should be ₹500 for our coupons)
- Coupon expired (check expiry date)
- Usage limit reached (currently 0/50 used)

## Expected Results

### Wedding Event:
- ✅ Shows GRALUX75 coupon
- ✅ 15% discount
- ✅ Minimum amount: ₹500

### Summer Music Event:
- ✅ Shows SUMMUS64 coupon  
- ✅ 15% discount
- ✅ Minimum amount: ₹500

### Other Events:
- ❌ No coupons shown (because merchant didn't create any)

## Important Notes

1. **Only Merchant-Created Coupons**: The system now ONLY shows coupons created by the event's merchant. No default/admin coupons.

2. **Event-Specific**: Coupons only show for the specific event they were created for.

3. **One-Time Use Per User**: If you apply a coupon and complete a booking, you can't use it again.

## Debug Commands

If issues persist, run these in browser console (F12):

```javascript
// Test API directly
fetch('http://localhost:5000/api/coupons/available?eventId=69b799063ddecddff43583f5&totalAmount=1000', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
}).then(r => r.json()).then(console.log);
```

This should return:
```json
{
  "success": true,
  "coupons": [
    {
      "_id": "...",
      "code": "GRALUX75",
      "discountValue": 15,
      ...
    }
  ],
  "total": 1
}
```

## Success Indicators

✅ Console shows "🔍 Fetching coupons for event..."  
✅ Console shows "📦 Coupon API Response: {success: true...}"  
✅ Console shows "✅ Fetched available coupons: [...]"  
✅ Modal shows "1 Offer Available"  
✅ Clicking expand shows coupon card  
✅ Clicking "Apply" applies discount  
✅ Total amount updates correctly  

If ALL of the above are true, the fix is working perfectly! 🎉
