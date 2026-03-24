# Complete Booking Workflow Verification Guide

## Overview
This guide verifies that the complete booking workflow has been implemented correctly across all dashboards (Merchant, User, and Admin) with proper field names and logic.

## Key Fixes Applied

### 1. Backend Field Names Standardization
- **Fixed**: `paymentsController.js` - Changed from `booking.status` to `booking.bookingStatus`
- **Fixed**: `paymentsController.js` - Changed from `booking.paymentStatus = "Paid"` to `booking.paymentStatus = "paid"` (lowercase)
- **Schema**: `bookingSchema.js` uses correct field names:
  - `bookingStatus`: enum ["pending", "confirmed", "completed", "cancelled"]
  - `paymentStatus`: enum ["pending", "paid"]

### 2. Frontend Field Names Standardization
- **Fixed**: `UserMyEvents.jsx` - Changed from `booking.status` to `booking.bookingStatus`
- **Fixed**: `UserMyEvents.jsx` - Changed from `booking.paymentStatus === "Paid"` to `booking.paymentStatus === "paid"`
- **Fixed**: `UserMyEvents.jsx` - Updated stats and filters to use correct field names

## Booking Workflow Logic

### Full-Service Events
```
User Books Event
  ↓
bookingStatus = "pending"
paymentStatus = "pending"
  ↓
Merchant Dashboard: Shows "Accept" / "Reject" buttons
  ↓
Merchant Accepts
  ↓
bookingStatus = "confirmed"
paymentStatus = "pending"
  ↓
User Dashboard: Shows "Pay Now" button
  ↓
User Pays
  ↓
bookingStatus = "confirmed"
paymentStatus = "paid"
  ↓
Merchant Dashboard: Shows "Mark Completed" button
  ↓
Merchant Marks Completed
  ↓
bookingStatus = "completed"
paymentStatus = "paid"
  ↓
User Dashboard: Shows "Rate Event" button
  ↓
User Rates Event
  ↓
booking.rating = 1-5
booking.review = text
```

### Ticketed Events
```
User Books Event
  ↓
bookingStatus = "confirmed" (auto-confirmed)
paymentStatus = "pending"
  ↓
User Dashboard: Shows "Pay Now" button immediately
  ↓
User Pays
  ↓
bookingStatus = "confirmed"
paymentStatus = "paid"
ticketGenerated = true
  ↓
User Dashboard: Shows "Download Ticket" button
  ↓
Merchant Dashboard: Shows booking with "Mark Completed" button
  ↓
Merchant Marks Completed
  ↓
bookingStatus = "completed"
  ↓
User Dashboard: Shows "Rate Event" button
  ↓
User Rates Event
```

## API Endpoints

### Booking Creation
- `POST /api/v1/event-bookings/create` - Routes to appropriate handler based on eventType
- `POST /api/v1/event-bookings/full-service` - Full-service booking
- `POST /api/v1/event-bookings/ticketed` - Ticketed booking

### Merchant Actions
- `PUT /api/v1/event-bookings/:id/accept` - Accept pending booking
- `PUT /api/v1/event-bookings/:id/reject` - Reject pending booking
- `PUT /api/v1/event-bookings/:id/complete` - Mark confirmed+paid booking as completed

### Payment
- `POST /api/v1/payments/pay-service` - Pay for full-service booking
- `POST /api/v1/payments/booking/:bookingId/pay-ticket` - Pay for ticketed booking

### Rating
- `POST /api/v1/event-bookings/:bookingId/rating` - Submit rating for completed booking

### Retrieval
- `GET /api/v1/event-bookings/my-bookings` - Get user's bookings
- `GET /api/v1/event-bookings/merchant/bookings` - Get merchant's bookings
- `GET /api/v1/admin/bookings` - Get all bookings (admin only)

## Frontend Components

### User Dashboard (UserMyEvents.jsx)
**Displays:**
- Event title, merchant name, date, ticket count, total price
- Event type badge (Ticketed Event / Full Service Event)
- Booking status badge
- Ticket ID (for confirmed ticketed bookings)

**Action Buttons:**
- "Pay Now" - Shows for:
  - Ticketed events with `paymentStatus === "pending"`
  - Full-service events with `bookingStatus === "confirmed"` AND `paymentStatus === "pending"`
- "Download Ticket" - Shows for:
  - Ticketed events with `paymentStatus === "paid"` AND `ticketId` exists
- "Rate Event" - Shows for:
  - Bookings with `bookingStatus === "completed"` AND no rating yet
- Rating display - Shows for:
  - Bookings with existing rating

**Status Displays:**
- "Awaiting Approval" - Full-service with `bookingStatus === "pending"`
- "Approved - Payment Pending" - Full-service with `bookingStatus === "confirmed"` AND `paymentStatus === "pending"`
- "Payment Completed" - Full-service with `paymentStatus === "paid"`
- "Ticket Confirmed" - Ticketed with `paymentStatus === "paid"`
- "Booking Cancelled" - `bookingStatus === "cancelled"`

### Merchant Dashboard (MerchantBookings.jsx)
**Displays:**
- Customer name and email
- Event name
- Location
- Date & Time
- Booking status badge
- Payment status badge
- Rating (if available)

**Action Buttons:**
- "Accept" + "Reject" - Shows for `bookingStatus === "pending"`
- "Mark Completed" - Shows for `bookingStatus === "confirmed"` AND `paymentStatus === "paid"`
- "Completed" badge - Shows for `bookingStatus === "completed"`
- "Awaiting payment" text - Shows for `bookingStatus === "confirmed"` AND `paymentStatus === "pending"`

### Admin Dashboard (AdminBookings.jsx)
**Displays:**
- Event name with date
- Merchant name
- Customer name and email
- Booking status badge
- Payment status badge
- Rating (if available)
- Revenue (total price)

**Stats:**
- Total bookings
- Pending bookings
- Confirmed bookings
- Completed bookings
- Paid bookings
- Average rating

### Rating Modal (BookingRatingModal.jsx)
**Features:**
- 1-5 star rating selector with hover effects
- Optional review text area
- Rating labels (Poor, Fair, Good, Very Good, Excellent)
- Submit and cancel buttons

## Testing Checklist

### 1. Full-Service Event Workflow
- [ ] User books full-service event → `bookingStatus = "pending"`, `paymentStatus = "pending"`
- [ ] Booking appears in merchant dashboard with "Accept" and "Reject" buttons
- [ ] Merchant accepts → `bookingStatus = "confirmed"`
- [ ] Booking appears in user dashboard with "Pay Now" button
- [ ] User pays → `paymentStatus = "paid"`
- [ ] Booking appears in merchant dashboard with "Mark Completed" button
- [ ] Merchant marks completed → `bookingStatus = "completed"`
- [ ] Booking appears in user dashboard with "Rate Event" button
- [ ] User rates event → `rating` and `review` saved
- [ ] Rating appears in all dashboards

### 2. Ticketed Event Workflow
- [ ] User books ticketed event → `bookingStatus = "confirmed"`, `paymentStatus = "pending"`
- [ ] Booking appears in user dashboard with "Pay Now" button immediately
- [ ] User pays → `paymentStatus = "paid"`, `ticketGenerated = true`
- [ ] "Download Ticket" button appears in user dashboard
- [ ] Booking appears in merchant dashboard with "Mark Completed" button
- [ ] Merchant marks completed → `bookingStatus = "completed"`
- [ ] Booking appears in user dashboard with "Rate Event" button
- [ ] User rates event → `rating` and `review` saved

### 3. Admin Dashboard
- [ ] All bookings visible with correct information
- [ ] Merchant name displays correctly
- [ ] Customer name and email display correctly
- [ ] Booking status badges show correct colors
- [ ] Payment status badges show correct colors
- [ ] Ratings display correctly
- [ ] Revenue calculation is accurate
- [ ] Stats summary shows correct counts

### 4. Payment Flow
- [ ] Payment modal opens with correct amount
- [ ] Payment method selection works
- [ ] Payment success updates `paymentStatus` to "paid"
- [ ] Payment failure shows error message
- [ ] Duplicate payment attempts are prevented

### 5. Rating Flow
- [ ] Rating modal opens for completed bookings only
- [ ] Star rating selection works with hover effects
- [ ] Review text is optional
- [ ] Rating submission saves to database
- [ ] Rating appears in all dashboards
- [ ] Duplicate ratings are prevented

## Creating Test Data

Run the test data creation script:
```bash
cd backend
node create-test-bookings.js
```

This creates test bookings with various statuses:
1. Pending full-service booking
2. Confirmed and paid full-service booking with rating
3. Completed ticketed booking with rating

## Verification Steps

1. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend Server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Login as Different Users**
   - User: user@test.com / User@123
   - Merchant: merchant@test.com / Merchant@123
   - Admin: admin@gmail.com / Admin@123

4. **Test Each Workflow**
   - Follow the testing checklist above
   - Verify all buttons appear/disappear correctly
   - Verify all status badges display correctly
   - Verify all data persists across page refreshes

## Field Name Reference

### Booking Schema Fields
```javascript
{
  bookingStatus: "pending" | "confirmed" | "completed" | "cancelled",
  paymentStatus: "pending" | "paid",
  rating: 1-5 (null if not rated),
  review: string (optional),
  eventType: "full-service" | "ticketed",
  // ... other fields
}
```

### Important: Case Sensitivity
- ✅ Correct: `bookingStatus`, `paymentStatus` (lowercase)
- ❌ Wrong: `status`, `booking_status`, `BookingStatus`
- ✅ Correct: `paymentStatus: "paid"` (lowercase)
- ❌ Wrong: `paymentStatus: "Paid"` (uppercase)

## Common Issues and Solutions

### Issue: Buttons not showing in merchant dashboard
**Solution**: Check that `bookingStatus` and `paymentStatus` are lowercase in the database

### Issue: "Pay Now" button not showing for user
**Solution**: Verify that:
- For ticketed: `eventType === "ticketed"` AND `paymentStatus === "pending"`
- For full-service: `bookingStatus === "confirmed"` AND `paymentStatus === "pending"`

### Issue: Rating not saving
**Solution**: Verify that:
- Booking `bookingStatus === "completed"`
- User is the booking owner
- Rating is between 1-5

### Issue: Admin dashboard not showing bookings
**Solution**: Check that:
- Bookings have `type: "event"`
- Merchant and user are properly populated
- No database connection issues

## Next Steps

1. Run the test data creation script
2. Follow the testing checklist
3. Verify all workflows work correctly
4. Check browser console for any errors
5. Check backend logs for any issues
6. Test with real user interactions
