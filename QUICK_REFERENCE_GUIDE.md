# Quick Reference Guide - Booking System

## Booking Status Flow

### Full Service Events
```
pending → Accept → confirmed → Pay → paid → Complete → completed → Rate
pending → Reject → cancelled
```

### Ticketed Events
```
confirmed → Pay → paid → Auto-complete → completed → Rate
```

## Merchant Actions

| Action | Condition | Endpoint | Result |
|--------|-----------|----------|--------|
| Accept | bookingStatus = "pending" | PUT /:id/accept | bookingStatus = "confirmed" |
| Reject | bookingStatus = "pending" | PUT /:id/reject | bookingStatus = "cancelled" |
| Complete | bookingStatus = "confirmed" && paymentStatus = "paid" | PUT /:id/complete | bookingStatus = "completed" |

## User Actions

| Action | Condition | Endpoint | Result |
|--------|-----------|----------|--------|
| Pay | paymentStatus = "pending" | PUT /:bookingId/pay | paymentStatus = "paid" |
| Rate | bookingStatus = "completed" | POST /:bookingId/rating | rating added |

## Display Logic

### Merchant Dashboard Buttons
```javascript
// Pending bookings
if (bookingStatus === "pending") {
  Show: Accept, Reject
}

// Confirmed & Paid
if (bookingStatus === "confirmed" && paymentStatus === "paid") {
  Show: Mark Completed
}

// Completed
if (bookingStatus === "completed") {
  Show: Status badge
}

// Cancelled
if (bookingStatus === "cancelled") {
  Show: Cancelled badge
}

// Confirmed but not paid
if (bookingStatus === "confirmed" && paymentStatus === "pending") {
  Show: Awaiting payment
}
```

## Admin Dashboard

**View:** All bookings across all merchants
**Stats:** Total, Pending, Confirmed, Completed, Paid, Avg Rating
**Filter:** By status and payment

## Database Fields

```javascript
bookingStatus: "pending" | "confirmed" | "completed" | "cancelled"
paymentStatus: "pending" | "paid"
rating: 1-5 (null if not rated)
review: string (optional)
```

## API Endpoints Summary

```
POST   /api/v1/event-bookings/create
PUT    /api/v1/event-bookings/:id/accept
PUT    /api/v1/event-bookings/:id/reject
PUT    /api/v1/event-bookings/:id/complete
PUT    /api/v1/event-bookings/:bookingId/pay
POST   /api/v1/event-bookings/:bookingId/rating
GET    /api/v1/event-bookings/merchant/bookings
GET    /api/v1/admin/bookings
```

## Key Files

**Backend:**
- backend/models/bookingSchema.js
- backend/controller/eventBookingController.js
- backend/router/eventBookingRouter.js

**Frontend:**
- frontend/src/pages/dashboards/MerchantBookings.jsx
- frontend/src/pages/dashboards/AdminBookings.jsx