# ✅ EVENT-WISE & ALL EVENTS COUPON CREATION - Complete Implementation

## 🎯 Feature Overview

Merchants now have full control over coupon targeting with two options:
1. **All Events** - Coupon applies to ALL events created by merchant
2. **Specific Event** - Coupon applies only to selected event

---

## 🔧 Backend Changes

### 1. Schema Update (`models/couponSchema.js`)

**Added Fields:**
```javascript
applyTo: {
  type: String,
  enum: ["ALL", "EVENT"],
  required: true,
  default: "ALL"
}

eventId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Event",
  default: null
}
```

**Key Points:**
- `applyTo` determines coupon scope
- `eventId` is required when `applyTo = "EVENT"`
- `eventId` is null when `applyTo = "ALL"`

---

### 2. Controller Update (`controller/marketingController.js`)

**Create Promo Code Validation:**
```javascript
// Validate applyTo field
const validApplyToValues = ["ALL", "EVENT"];
const couponApplyTo = applyTo || "ALL";

if (!validApplyToValues.includes(couponApplyTo)) {
  return res.status(400).json({
    success: false,
    message: "Invalid applyTo value"
  });
}

// Validate eventId when applyTo is EVENT
if (couponApplyTo === "EVENT" && !eventId) {
  return res.status(400).json({
    success: false,
    message: "eventId is required when applyTo is 'EVENT'"
  });
}

// Verify event exists and belongs to merchant
if (couponApplyTo === "EVENT" && eventId) {
  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }
  if (event.createdBy.toString() !== merchantId.toString()) {
    return res.status(403).json({ 
      success: false, 
      message: "You can only create coupons for your own events" 
    });
  }
}
```

**Coupon Creation Payload:**
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
  merchantId: merchantId,
  applyTo: couponApplyTo,
  eventId: couponApplyTo === "EVENT" ? eventId : null,
  applicableEvents: applicableEvents || []
};
```

---

### 3. Event Controller Update (`controller/eventController.js`)

**Fetch Coupons Logic:**
```javascript
// Fetch valid coupons for this event
const validCoupons = await Coupon.find({
  merchantId: event.createdBy, // Must match event merchant
  isActive: true,
  expiryDate: { $gt: new Date() },
  $or: [
    { applyTo: "ALL" }, // Applies to all events
    { applyTo: "EVENT", eventId: event._id } // Applies to this specific event
  ]
})
.select('code discountType discountValue maxDiscount minAmount expiryDate description usedCount usageLimit')
.populate('createdBy', 'name');
```

**How It Works:**
- Query matches coupons where `applyTo = "ALL"` OR (`applyTo = "EVENT"` AND `eventId` matches)
- Ensures merchant created the coupon
- Filters expired and inactive coupons

---

### 4. Coupon Controller Update (`controller/couponController.js`)

**Get Available Coupons Logic:**
```javascript
if (eventId) {
  const event = await Event.findById(eventId);
  
  if (event) {
    const merchantId = event.createdBy;
    
    query.merchantId = merchantId;
    query.$or = [
      { applyTo: "ALL" }, // Coupons for all events
      { applyTo: "EVENT", eventId: eventId } // Coupons for this specific event
    ];
  }
}
```

---

## 🎨 Frontend Changes

### File: `frontend/src/pages/dashboards/MerchantMarketing.jsx`

#### 1. Form State Update
```javascript
const [promoForm, setPromoForm] = useState({
  code: "",
  discountType: "percentage",
  discountValue: "",
  maxDiscount: "",
  minAmount: "",
  expiryDate: "",
  usageLimit: "",
  description: "",
  applyTo: "ALL", // Default to ALL
  eventId: null
});
```

#### 2. New UI Fields

**"Apply To" Dropdown:**
```jsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Apply To *</label>
  <select
    value={promoForm.applyTo}
    onChange={(e) => setPromoForm({ 
      ...promoForm, 
      applyTo: e.target.value,
      eventId: e.target.value === "ALL" ? null : eventId 
    })}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
  >
    <option value="ALL">All Events</option>
    <option value="EVENT">Specific Event</option>
  </select>
</div>
```

**"Select Event" Dropdown (Conditional):**
```jsx
{promoForm.applyTo === "EVENT" && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Select Event *</label>
    <select
      value={promoForm.eventId || ""}
      onChange={(e) => setPromoForm({ ...promoForm, eventId: e.target.value })}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      required
    >
      <option value="">Choose an event...</option>
      {events.map(event => (
        <option key={event._id} value={event._id}>
          {event.title}
        </option>
      ))}
    </select>
  </div>
)}
```

#### 3. Validation Update
```javascript
// Validate eventId when applyTo is EVENT
if (promoForm.applyTo === "EVENT" && !promoForm.eventId) {
  toast.error("Please select an event");
  return;
}
```

#### 4. Form Reset
```javascript
setPromoForm({
  code: "",
  discountType: "percentage",
  discountValue: "",
  maxDiscount: "",
  minAmount: "",
  expiryDate: "",
  usageLimit: "",
  description: "",
  applyTo: "ALL",
  eventId: null
});
```

---

## 📊 Submit Payload

### When "All Events" Selected:
```json
{
  "code": "SAVEALL",
  "discountType": "percentage",
  "discountValue": 20,
  "maxDiscount": 5000,
  "minAmount": 1000,
  "expiryDate": "2026-12-31",
  "usageLimit": 100,
  "description": "20% off on all events",
  "applyTo": "ALL",
  "eventId": null
}
```

### When "Specific Event" Selected:
```json
{
  "code": "SAVEWEDDING",
  "discountType": "percentage",
  "discountValue": 30,
  "maxDiscount": 5000,
  "minAmount": 1000,
  "expiryDate": "2026-12-31",
  "usageLimit": 100,
  "description": "30% off on wedding planning",
  "applyTo": "EVENT",
  "eventId": "69b799063ddecddff43583f5"
}
```

---

## 🧪 How to Test

### Step 1: Login as Merchant
Navigate to Merchant Dashboard → Marketing

### Step 2: Create "All Events" Coupon

1. Click **"Create Promo Code"**
2. Fill form:
   - Code: `SAVEALL`
   - Discount Type: `Percentage`
   - Discount Value: `20`
   - Max Discount: `5000`
   - Min Amount: `1000`
   - Expiry Date: Future date
   - Usage Limit: `100`
   - **Apply To: `All Events`** ← SELECT THIS
3. Click **"Create Promo Code"**

**Expected Result:**
- Success message
- Coupon saved with `applyTo: "ALL"`, `eventId: null`

### Step 3: Create "Specific Event" Coupon

1. Click **"Create Promo Code"** again
2. Fill form:
   - Code: `SAVEWEDDING`
   - Discount Type: `Percentage`
   - Discount Value: `30`
   - Max Discount: `5000`
   - Min Amount: `1000`
   - Expiry Date: Future date
   - Usage Limit: `100`
   - **Apply To: `Specific Event`** ← SELECT THIS
   - **Select Event: `Grand Luxury Wedding Planning`** ← CHOOSE EVENT
3. Click **"Create Promo Code"**

**Expected Result:**
- Success message
- Coupon saved with `applyTo: "EVENT"`, `eventId: [wedding_event_id]`

### Step 4: Test Customer Visibility

#### For "All Events" Coupon (SAVEALL):
1. Open customer app (http://localhost:5173)
2. Browse ANY event created by same merchant
3. Click "Book Now"
4. Should see `SAVEALL` coupon

#### For "Specific Event" Coupon (SAVEWEDDING):
1. Open customer app
2. Browse "Grand Luxury Wedding Planning"
3. Click "Book Now"
4. Should see `SAVEWEDDING` coupon
5. Browse "Summer Music Concert" (different event)
6. Should NOT see `SAVEWEDDING` coupon

---

## ✅ Expected Behavior

### Merchant Creates Coupon with "All Events":
- ✅ Visible in ALL merchant's events
- ✅ Works for any event created by this merchant
- ✅ eventId is null in database

### Merchant Creates Coupon with "Specific Event":
- ✅ Visible ONLY in selected event
- ✅ Not visible in other events
- ✅ eventId points to specific event in database

### Backend Query Results:

**For Event A (Merchant X):**
```javascript
// Will return:
// - Coupons with applyTo: "ALL" by Merchant X
// - Coupons with applyTo: "EVENT" AND eventId: Event_A
```

**For Event B (Merchant X):**
```javascript
// Will return:
// - Coupons with applyTo: "ALL" by Merchant X
// - Coupons with applyTo: "EVENT" AND eventId: Event_B
```

**For Event C (Merchant Y):**
```javascript
// Will return:
// - Coupons with applyTo: "ALL" by Merchant Y
// - Coupons with applyTo: "EVENT" AND eventId: Event_C
// - WILL NOT include Merchant X's coupons
```

---

## 🔍 Database Verification

### Check Created Coupons:
```javascript
db.coupons.find({}).pretty()

// Should show:
{
  _id: ObjectId("..."),
  code: "SAVEALL",
  applyTo: "ALL",
  eventId: null,  // ← Null for all events
  merchantId: ObjectId("..."),
  isActive: true,
  ...
}

{
  _id: ObjectId("..."),
  code: "SAVEWEDDING",
  applyTo: "EVENT",
  eventId: ObjectId("69b799063ddecddff43583f5"),  // ← Points to specific event
  merchantId: ObjectId("..."),
  isActive: true,
  ...
}
```

---

## 🎯 Use Cases

### Scenario 1: Merchant-wide Sale
**Use Case:** "Summer Sale - 20% off on everything!"

**Action:**
- Create coupon with `applyTo: "ALL"`
- Discount: 20%
- Applies to: All merchant events automatically

**Result:**
- Customers see coupon in ANY merchant event
- One coupon covers entire catalog

---

### Scenario 2: Event-specific Promotion
**Use Case:** "Wedding Special - 30% off on wedding planning!"

**Action:**
- Create coupon with `applyTo: "EVENT"`
- Select: "Grand Luxury Wedding Planning"
- Discount: 30%

**Result:**
- Only visible in wedding event
- Doesn't appear in music concert or other events
- Targeted promotion

---

### Scenario 3: Launch Different Campaigns
**Use Case:** Different discounts for different event types

**Action:**
- Wedding Event → `WEDDING30` (30% off, applyTo: EVENT)
- Music Event → `MUSIC20` (20% off, applyTo: EVENT)
- Site-wide → `SUMMER25` (25% off, applyTo: ALL)

**Result:**
- Each event has its own targeted coupon
- Site-wide coupon works everywhere
- Maximum flexibility

---

## 🛠️ Troubleshooting

### Issue 1: "All Events" Coupon Not Showing in Some Events

**Check:**
1. Are both events created by SAME merchant?
2. Is coupon `isActive: true`?
3. Has coupon expired?
4. Has usage limit been reached?

**Backend Logs:**
```
🎫  Event: [Event Name]
   Event Merchant ID: [merchant_id]
   
   Coupons Query with $or:
   {
     "merchantId": "...",
     "$or": [
       {"applyTo": "ALL"},
       {"applyTo": "EVENT", "eventId": "..."}
     ]
   }
   
   Found X raw coupons from DB
```

If count is 0 → Check database for matching coupons

---

### Issue 2: "Specific Event" Coupon Shows in Wrong Event

**Check:**
1. Is `eventId` correctly stored in coupon?
2. Does `eventId` match the event `_id`?
3. Are you testing the correct event?

**Database Check:**
```javascript
// Find coupon
db.coupons.findOne({code: "SAVEWEDDING"})

// Verify eventId
printjson({
  coupon_eventId: coupon.eventId,
  event_id: db.events.findOne({title: "Grand Luxury Wedding Planning"})._id
})
```

Should match exactly.

---

### Issue 3: Frontend Doesn't Show "Select Event" Dropdown

**Check:**
1. Is `applyTo` state set to "EVENT"?
2. Are events loaded in the component?
3. Check browser console for errors

**Debug:**
```javascript
console.log('Apply To:', promoForm.applyTo);
console.log('Events loaded:', events.length);
console.log('Show dropdown:', promoForm.applyTo === "EVENT");
```

---

## 📝 Files Modified

### Backend:
1. **models/couponSchema.js**
   - Added `applyTo` field
   - Updated `eventId` field with default null

2. **controller/marketingController.js**
   - Added validation for `applyTo`
   - Added event ownership verification
   - Updated coupon creation logic

3. **controller/eventController.js**
   - Updated coupon fetch query with `$or` logic
   - Supports both "ALL" and "EVENT" types

4. **controller/couponController.js**
   - Updated `getAvailableCoupons` with new query logic

### Frontend:
1. **pages/dashboards/MerchantMarketing.jsx**
   - Added `applyTo` and `eventId` to form state
   - Added "Apply To" dropdown
   - Added conditional "Select Event" dropdown
   - Updated validation logic
   - Updated form reset logic

---

## ✅ Summary

**Before:**
- ❌ Coupons only worked with specific events
- ❌ No way to create merchant-wide coupons
- ❌ Limited flexibility

**After:**
- ✅ Merchants can create "All Events" coupons
- ✅ Merchants can create event-specific coupons
- ✅ Full control over coupon targeting
- ✅ Flexible marketing campaigns
- ✅ Better customer experience

---

**Test it now! Login as merchant and try creating both types of coupons!** 🎉✨
