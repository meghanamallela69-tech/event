# Event Type Workflows Implementation

## Overview
Successfully implemented different booking workflows based on event type:
- **Full Service Events**: Require merchant approval before payment
- **Ticketed Events**: Immediate booking with instant confirmation

## Backend Implementation

### 1. Updated Booking Schema (`backend/models/bookingSchema.js`)
- Added `eventType` field with enum values: `["full-service", "ticketed"]`
- Added `serviceDate` field for full-service events
- Cleaned up status enum values for consistency
- Changed default type from "service" to "event"

### 2. New Event Booking Controller (`backend/controller/eventBookingController.js`)
**Functions implemented:**
- `createFullServiceBooking` - Creates pending booking request
- `createTicketedBooking` - Creates confirmed booking with payment
- `getEventTicketTypes` - Returns available ticket types for an event
- `approveFullServiceBooking` - Merchant approves service request
- `rejectFullServiceBooking` - Merchant rejects service request
- `getMerchantServiceRequests` - Gets all service requests for merchant

### 3. New Event Booking Routes (`backend/router/eventBookingRouter.js`)
**User Routes:**
- `POST /api/v1/event-bookings/full-service` - Book full-service event
- `POST /api/v1/event-bookings/ticketed` - Book ticketed event
- `GET /api/v1/event-bookings/event/:eventId/tickets` - Get ticket types

**Merchant Routes:**
- `GET /api/v1/event-bookings/service-requests` - Get service requests
- `PUT /api/v1/event-bookings/:bookingId/approve` - Approve service request
- `PUT /api/v1/event-bookings/:bookingId/reject` - Reject service request

### 4. Updated Main App (`backend/app.js`)
- Added event booking router to the application
- Routes are now available at `/api/v1/event-bookings/*`

## Frontend Implementation

### 1. Service Booking Modal (`frontend/src/components/ServiceBookingModal.jsx`)
**Features:**
- Service date selection (required)
- Guest count input
- Special requirements notes
- Service price and features display
- Booking process explanation
- Form validation and error handling

### 2. Ticket Selection Modal (`frontend/src/components/TicketSelectionModal.jsx`)
**Features:**
- Displays available ticket types with prices
- Quantity selection with +/- buttons
- Real-time total calculation
- Ticket availability checking
- Immediate booking and payment processing
- Loading states and error handling

### 3. Updated User Browse Events (`frontend/src/pages/dashboards/UserBrowseEvents.jsx`)
**Changes:**
- Replaced generic BookingModal with event-type specific modals
- Dynamic button text: "Book Service" vs "Book Ticket"
- Conditional modal opening based on event type
- Separate success handlers for each booking type
- Navigation to user bookings after successful booking

### 4. Merchant Service Requests Page (`frontend/src/pages/dashboards/MerchantServiceRequests.jsx`)
**Features:**
- Lists all full-service booking requests
- Tabbed interface (All, Pending, Approved, Confirmed, Rejected)
- Stats cards showing request counts
- Approve/Reject actions with loading states
- Request details display (client, date, guests, price, notes)
- Status badges with icons
- Real-time updates after actions

## Workflow Implementation

### Full Service Events Workflow

#### 1. User Books Service
```
User clicks "Book Service" → ServiceBookingModal opens
User fills:
- Service Date (required)
- Guest Count
- Special Requirements
→ Creates booking with status: "pending"
```

#### 2. Merchant Reviews Request
```
Merchant Dashboard → Service Requests page
Merchant sees pending requests
Merchant can:
- Approve → status: "approved" + notification to user
- Reject → status: "rejected" + notification to user
```

#### 3. User Payment (After Approval)
```
User Dashboard → My Events page
User sees "Pay Now" button for approved bookings
User completes payment → status: "confirmed"
```

### Ticketed Events Workflow

#### 1. User Books Tickets
```
User clicks "Book Ticket" → TicketSelectionModal opens
User selects:
- Ticket Type (Regular/VIP/etc.)
- Quantity
→ Immediate payment processing
→ Creates booking with status: "confirmed"
```

#### 2. Instant Confirmation
```
No merchant approval needed
Booking confirmed immediately after payment
Ticket generated with:
- Booking ID
- Event details
- QR Code
- Download option
```

## Database Structure Examples

### Full Service Booking
```javascript
{
  user: ObjectId,
  merchant: ObjectId,
  type: "event",
  eventType: "full-service",
  eventId: "event123",
  eventTitle: "Wedding Planning Service",
  serviceDate: "2026-06-15",
  guestCount: 150,
  totalPrice: 250000,
  status: "pending", // → "approved" → "confirmed"
  paymentStatus: "Pending", // → "Paid"
  notes: "Outdoor ceremony preferred"
}
```

### Ticketed Booking
```javascript
{
  user: ObjectId,
  merchant: ObjectId,
  type: "event",
  eventType: "ticketed",
  eventId: "event456",
  eventTitle: "Music Concert",
  ticketType: "VIP",
  ticketCount: 2,
  totalPrice: 5000,
  status: "confirmed", // Immediate confirmation
  paymentStatus: "Paid", // Immediate payment
  ticketId: "TKT_ABC123",
  paymentId: "PAY_XYZ789"
}
```

## Status Flow

### Full Service Events
```
Pending → Approved → Confirmed
       ↘ Rejected
```

### Ticketed Events
```
Confirmed (immediate after payment)
```

## Frontend Rules Implementation

### Event Type Detection
```javascript
// In UserBrowseEvents.jsx
const handleBookNow = (event) => {
  if (event.eventType === "full-service") {
    // Open ServiceBookingModal
  } else if (event.eventType === "ticketed") {
    // Open TicketSelectionModal
  }
};
```

### Dynamic Button Labels
```javascript
// In EventCard component
bookNowLabel={event.eventType === "full-service" ? "Book Service" : "Book Ticket"}
```

## API Endpoints Summary

### User Endpoints
- `POST /api/v1/event-bookings/full-service` - Create service booking request
- `POST /api/v1/event-bookings/ticketed` - Create ticket booking (immediate)
- `GET /api/v1/event-bookings/event/:eventId/tickets` - Get available tickets

### Merchant Endpoints
- `GET /api/v1/event-bookings/service-requests` - Get all service requests
- `PUT /api/v1/event-bookings/:bookingId/approve` - Approve service request
- `PUT /api/v1/event-bookings/:bookingId/reject` - Reject service request

## Security & Authorization

### User Authorization
- Users can only create bookings for themselves
- Users can only view their own bookings

### Merchant Authorization
- Merchants can only approve/reject bookings for their own events
- Role middleware ensures only merchants can access merchant endpoints
- Event ownership verification before allowing actions

## Notification System

### Full Service Events
- **Booking Created**: Notification sent to merchant
- **Booking Approved**: Notification sent to user
- **Booking Rejected**: Notification sent to user with reason

### Ticketed Events
- **Booking Confirmed**: Notification sent to user with ticket details

## Error Handling

### Backend
- Proper HTTP status codes (400, 403, 404, 500)
- Descriptive error messages
- Input validation
- Database error handling

### Frontend
- Loading states during API calls
- Toast notifications for success/error
- Form validation
- Disabled states during processing

## Testing Checklist

### Full Service Events
- [ ] User can create service booking request
- [ ] Merchant receives notification
- [ ] Merchant can approve/reject requests
- [ ] User receives approval/rejection notification
- [ ] User can pay after approval
- [ ] Booking status updates correctly

### Ticketed Events
- [ ] User can view available ticket types
- [ ] User can select tickets and quantities
- [ ] Ticket availability is enforced
- [ ] Payment processes immediately
- [ ] Booking is confirmed instantly
- [ ] Ticket details are generated

### Security
- [ ] Users cannot approve their own bookings
- [ ] Merchants cannot approve other merchants' bookings
- [ ] Proper authentication on all endpoints
- [ ] Input validation prevents malicious data

## Files Created/Modified

### Backend
- `backend/models/bookingSchema.js` - Updated with eventType field
- `backend/controller/eventBookingController.js` - New controller
- `backend/router/eventBookingRouter.js` - New routes
- `backend/app.js` - Added new router

### Frontend
- `frontend/src/components/ServiceBookingModal.jsx` - New component
- `frontend/src/components/TicketSelectionModal.jsx` - New component
- `frontend/src/pages/dashboards/UserBrowseEvents.jsx` - Updated
- `frontend/src/pages/dashboards/MerchantServiceRequests.jsx` - New page

## Next Steps

1. **Add Service Requests to Merchant Navigation** - Update merchant sidebar
2. **Implement User Booking History** - Show different booking types
3. **Add Email Notifications** - Send emails for booking updates
4. **Implement Ticket Download** - PDF generation for tickets
5. **Add Booking Analytics** - Revenue tracking by event type
6. **Mobile Optimization** - Ensure modals work well on mobile

The implementation provides a complete, type-aware booking system that handles the different workflows required for full-service and ticketed events while maintaining security and user experience standards.