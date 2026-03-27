# Fix: Only Merchant-Created Coupons Visible in Booking Modal

## Problem
Coupons were showing in the booking modal even when they weren't properly linked to the event or created by the event's merchant. The system needed to ensure that only coupons created by the merchant for their specific events would appear.

## Root Cause
1. **Coupon Schema** was using `applicableEvents` array without a dedicated `eventId` field
2. **Merchant ID** wasn't being stored explicitly in coupons
3. **Backend queries** weren't filtering by both eventId AND merchantId together
4. No validation to ensure coupons were created by the event owner

## Solution Implemented

### 1. Backend Changes

#### A. Updated Coupon Schema (`backend/models/couponSchema.js`)
Added two new fields:
- `eventId`: Single ObjectId reference to the event (primary field)
- `merchantId`: Reference to the merchant who created the coupon

```javascript
// Event this coupon is linked to (primary field for merchant coupons)
eventId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Event"
},
// Merchant who created this coupon (for filtering)
merchantId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
}
```

#### B. Updated Marketing Controller (`backend/controller/marketingController.js`)
Modified `createPromoCode` function to:
- Accept `eventId` from request body
- Store both `eventId` and `merchantId` when creating coupons
- Maintain backward compatibility with `applicableEvents` array

```javascript
const couponData = {
  code: code.toUpperCase(),
  discountType,
  discountValue,
  maxDiscount,
  minAmount: minAmount || 0,
  expiryDate,
  usageLimit,
  description,
  createdBy: merchantId,
  merchantId: merchantId, // Store merchant ID for filtering
  eventId: eventId || null, // Primary event link
  applicableEvents: applicableEvents || []
};

// If eventId is provided, also add it to applicableEvents for backward compatibility
if (eventId && (!applicableEvents || applicableEvents.length === 0)) {
  couponData.applicableEvents = [eventId];
}
```

#### C. Updated Event Controller (`backend/controller/eventController.js`)
Modified `listEvents` function to fetch coupons with strict filtering:

```javascript
const validCoupons = await Coupon.find({
  $or: [
    { eventId: event._id }, // Primary field for merchant coupons
    { applicableEvents: { $in: [event._id] } } // Legacy support
  ],
  merchantId: event.createdBy, // Must match event merchant
  isActive: true,
  expiryDate: { $gt: new Date() }
});
```

#### D. Updated Coupon Controller (`backend/controller/couponController.js`)
Modified `getAvailableCoupons` function to:
- Fetch the event to get merchant ID
- Filter coupons by both eventId AND merchantId
- Support both `eventId` and `applicableEvents` fields

```javascript
if (eventId) {
  const event = await Event.findById(eventId);
  
  if (event) {
    query.$or = [
      { 
        eventId: eventId,
        merchantId: event.createdBy
      },
      { 
        applicableEvents: eventId,
        merchantId: event.createdBy
      }
    ];
  }
}
```

### 2. Database Migration

Created and executed `update-coupons-fields.js` to update existing coupons:
- Migrated 3 existing coupons successfully
- Added `eventId` and `merchantId` to all coupons
- Maintained backward compatibility

### 3. Verification Tools

Created `verify-coupons-setup.js` to validate:
- All coupons have proper eventId and merchantId
- Only merchant-created coupons show for their events
- No orphaned coupons in the system

## Test Results

### Verified Events with Coupons:
✅ **Grand Luxury Wedding Planning**
- Coupon: GRALUX75 (15% off)
- Merchant: Dileep
- Properly linked ✓

✅ **Summer Music Concert Night**
- Coupon: SUMMUS64 (15% off)
- Merchant: Dileep
- Properly linked ✓

✅ **Future Tech Summit 2026**
- Coupon: FUTTEC14 (15% off)
- Merchant: Dileep
- Properly linked ✓

### Events Without Coupons (Expected):
- Birthday Party Event Management
- Stand-Up Comedy Night
- Test Event for Booking
- Test Ticketed Event
- Test Full-Service Event
- Completed Music Concert

## Frontend Behavior

The frontend components automatically benefit from these backend fixes:

### ServiceBookingModal.jsx
```javascript
const fetchAvailableCoupons = async () => {
  const response = await axios.get(
    `${API_BASE}/coupons/available?eventId=${event._id}&totalAmount=${basePrice}`,
    { headers: authHeaders(token) }
  );
  
  if (response.data.success) {
    setAvailableCoupons(response.data.coupons || []);
  }
};
```

Now receives ONLY merchant-created coupons for the specific event.

### TicketSelectionModal.jsx
Same behavior - receives filtered coupons based on eventId and merchantId.

## How It Works

### Creating a Coupon (Merchant):
1. Merchant creates event → Gets `eventId`
2. Merchant creates coupon → Sends `eventId` in request
3. Backend stores:
   - `eventId`: Links to specific event
   - `merchantId`: Same as `event.createdBy`
   - `createdBy`: Merchant's user ID

### Fetching Coupons (User Booking):
1. User opens booking modal for event
2. Frontend calls `/coupons/available?eventId=XYZ`
3. Backend queries:
   ```javascript
   {
     $or: [
       { eventId: event._id, merchantId: event.createdBy },
       { applicableEvents: event._id, merchantId: event.createdBy }
     ],
     isActive: true,
     expiryDate: { $gt: new Date() }
   }
   ```
4. Returns ONLY coupons created by the event's merchant

## Debugging Steps

If coupons still don't show correctly:

### 1. Check Database:
```bash
cd backend
node verify-coupons-setup.js
```

### 2. Check Console Logs:
- Backend: Look for coupon query logs when loading events
- Frontend: Check network tab for `/coupons/available` response

### 3. Verify Coupon Document:
In MongoDB Compass or CLI:
```javascript
db.coupons.findOne({ code: "SAVE30" })
```

Should have:
- ✅ `eventId`: ObjectId of the event
- ✅ `merchantId`: ObjectId matching event's createdBy
- ✅ `isActive`: true
- ✅ `expiryDate`: Future date
- ✅ `usedCount` < `usageLimit`

## Testing Checklist

- [x] Schema updated with eventId and merchantId
- [x] Create coupon stores both fields
- [x] List events filters by merchantId
- [x] Get available coupons filters by merchantId
- [x] Existing coupons migrated
- [x] Verification script confirms setup
- [ ] Test in UI: Open booking modal for event with coupon
- [ ] Test in UI: Verify only merchant coupons show
- [ ] Test in UI: Verify coupon applies correctly

## Files Modified

1. `backend/models/couponSchema.js` - Added eventId and merchantId fields
2. `backend/controller/marketingController.js` - Updated createPromoCode
3. `backend/controller/eventController.js` - Updated listEvents coupon query
4. `backend/controller/couponController.js` - Updated getAvailableCoupons
5. `backend/update-coupons-fields.js` - Migration script (can be deleted)
6. `backend/verify-coupons-setup.js` - Verification script (keep for debugging)

## Result

✅ Only merchant-created coupons (SAVE30, SAVE10, etc.) will show in booking modal
✅ Default/admin coupons won't appear unless specifically linked to event
✅ Proper merchant-event-coupon relationship enforced
✅ Backward compatible with existing data

## Next Steps

1. **Restart Backend Server** to apply changes:
   ```bash
   cd backend
   # Stop current server (Ctrl+C)
   npm start
   ```

2. **Test in Browser**:
   - Open http://localhost:5174
   - Login as user
   - Click "Book Now" on events with coupons
   - Verify only merchant coupons show
   - Test applying coupon codes

3. **Optional Cleanup**:
   - Delete `update-coupons-fields.js` after verification
   - Keep `verify-coupons-setup.js` for future debugging
