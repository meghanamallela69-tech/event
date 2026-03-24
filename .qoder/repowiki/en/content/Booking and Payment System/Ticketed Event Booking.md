# Ticketed Event Booking

<cite>
**Referenced Files in This Document**
- [eventBookingController.js](file://backend/controller/eventBookingController.js)
- [eventBookingRouter.js](file://backend/router/eventBookingRouter.js)
- [eventSchema.js](file://backend/models/eventSchema.js)
- [bookingSchema.js](file://backend/models/bookingSchema.js)
- [TicketSelectionModal.jsx](file://frontend/src/components/TicketSelectionModal.jsx)
- [TicketSuccessModal.jsx](file://frontend/src/components/TicketSuccessModal.jsx)
- [TicketSuccessModal.jsx](file://frontend/src/components/TicketSuccessModal.jsx)
- [ticketGenerator.js](file://frontend/src/utils/ticketGenerator.js)
- [create-test-ticketed-event-and-booking.js](file://backend/create-test-ticketed-event-and-booking.js)
- [test-ticket-booking-flow.js](file://backend/test-ticket-booking-flow.js)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document explains the ticketed event booking system, focusing on the end-to-end workflow for purchasing event tickets. It covers the event-specific booking flow, including ticket selection, quantity management, event date handling, validation logic, capacity restrictions, and the booking confirmation process. It also documents the backend controller implementation, API endpoints, frontend modal interfaces, and inventory management mechanics.

## Project Structure
The ticketed booking system spans both backend and frontend layers:
- Backend: Express routes and controllers manage booking creation, validation, and status updates; Mongoose models define data structures for events and bookings.
- Frontend: React components provide the ticket selection modal, coupon application, and success confirmation with downloadable tickets.

```mermaid
graph TB
subgraph "Backend"
Router["Event Booking Router<br/>routes"]
Controller["Event Booking Controller<br/>handlers"]
EventModel["Event Model<br/>schema"]
BookingModel["Booking Model<br/>schema"]
end
subgraph "Frontend"
TicketModal["TicketSelectionModal<br/>selection UI"]
SuccessModal["TicketSuccessModal<br/>confirmation UI"]
TicketGen["ticketGenerator<br/>PDF generation"]
end
TicketModal --> Router
Router --> Controller
Controller --> EventModel
Controller --> BookingModel
Controller --> TicketModal
TicketModal --> SuccessModal
SuccessModal --> TicketGen
```

**Diagram sources**
- [eventBookingRouter.js:1-47](file://backend/router/eventBookingRouter.js#L1-L47)
- [eventBookingController.js:1-1607](file://backend/controller/eventBookingController.js#L1-L1607)
- [eventSchema.js:1-23](file://backend/models/eventSchema.js#L1-L23)
- [bookingSchema.js:1-53](file://backend/models/bookingSchema.js#L1-L53)
- [TicketSelectionModal.jsx:1-448](file://frontend/src/components/TicketSelectionModal.jsx#L1-L448)
- [TicketSuccessModal.jsx:1-185](file://frontend/src/components/TicketSuccessModal.jsx#L1-L185)
- [ticketGenerator.js](file://frontend/src/utils/ticketGenerator.js)

**Section sources**
- [eventBookingRouter.js:1-47](file://backend/router/eventBookingRouter.js#L1-L47)
- [eventBookingController.js:1-1607](file://backend/controller/eventBookingController.js#L1-L1607)
- [TicketSelectionModal.jsx:1-448](file://frontend/src/components/TicketSelectionModal.jsx#L1-L448)
- [TicketSuccessModal.jsx:1-185](file://frontend/src/components/TicketSuccessModal.jsx#L1-L185)

## Core Components
- Backend Event Booking Controller: Implements ticketed booking creation, validation, capacity checks, coupon application, and booking confirmation.
- Backend Event and Booking Models: Define the data structures for events (including ticket types) and bookings.
- Frontend TicketSelectionModal: Handles ticket type selection, quantity input, coupon application, and submission to the backend.
- Frontend TicketSuccessModal: Displays booking confirmation, ticket details, and download functionality.

Key responsibilities:
- Ticket validation and capacity enforcement
- Coupon application and discount calculation
- Booking creation with payment linkage
- Inventory updates and availability tracking
- Frontend UX for selection and confirmation

**Section sources**
- [eventBookingController.js:321-589](file://backend/controller/eventBookingController.js#L321-L589)
- [eventSchema.js:1-23](file://backend/models/eventSchema.js#L1-L23)
- [bookingSchema.js:1-53](file://backend/models/bookingSchema.js#L1-L53)
- [TicketSelectionModal.jsx:150-222](file://frontend/src/components/TicketSelectionModal.jsx#L150-L222)

## Architecture Overview
The system follows a RESTful pattern with explicit endpoints for ticketed booking creation and payment processing. The frontend interacts with the backend via authenticated requests, and the backend enforces validation and capacity rules before persisting data.

```mermaid
sequenceDiagram
participant FE as "Frontend TicketSelectionModal"
participant API as "Event Booking Router"
participant CTRL as "Event Booking Controller"
participant EVT as "Event Model"
participant BK as "Booking Model"
FE->>API : POST /event-bookings/create
API->>CTRL : createBooking()
CTRL->>EVT : findById(eventId)
EVT-->>CTRL : event data
CTRL->>CTRL : validate ticketType and quantity
CTRL->>CTRL : calculate pricing and discounts
CTRL->>BK : create booking (confirmed, payment pending)
BK-->>CTRL : booking saved
CTRL-->>API : booking response
API-->>FE : booking confirmation
```

**Diagram sources**
- [eventBookingRouter.js:27-33](file://backend/router/eventBookingRouter.js#L27-L33)
- [eventBookingController.js:8-73](file://backend/controller/eventBookingController.js#L8-L73)
- [eventBookingController.js:321-589](file://backend/controller/eventBookingController.js#L321-L589)

## Detailed Component Analysis

### Backend Event Booking Controller
The controller orchestrates the ticketed booking flow:
- Routes generic create requests to ticketed handler
- Validates user, event existence, and ticket type
- Enforces quantity limits against available capacity
- Calculates pricing and applies coupons
- Updates inventory and persists booking with payment linkage

```mermaid
flowchart TD
Start([Create Ticketed Booking]) --> ValidateUser["Validate User and Event"]
ValidateUser --> FindEvent["Find Event by ID"]
FindEvent --> EventType{"Event Type == 'ticketed'?"}
EventType --> |No| ErrorType["Return Invalid Event Type"]
EventType --> |Yes| FindTicketType["Find Selected Ticket Type"]
FindTicketType --> Availability{"Available Quantity > 0?"}
Availability --> |No| ErrorSoldOut["Return Sold Out"]
Availability --> |Yes| CheckQuantity["Check Requested Quantity <= Available"]
CheckQuantity --> |Exceeds| ErrorQuantity["Return Insufficient Quantity"]
CheckQuantity --> |OK| CalcPricing["Calculate Base Price and Discounts"]
CalcPricing --> UpdateInventory["Increment quantitySold and recalc available"]
UpdateInventory --> CreateBooking["Create Confirmed Booking (Payment Pending)"]
CreateBooking --> Success([Return Booking and Ticket Details])
ErrorType --> End([End])
ErrorSoldOut --> End
ErrorQuantity --> End
```

**Diagram sources**
- [eventBookingController.js:321-589](file://backend/controller/eventBookingController.js#L321-L589)

Key implementation highlights:
- Ticket availability computed as quantityTotal minus quantitySold
- Event-level availableTickets recalculated after each booking
- Coupon validation performed with expiry, usage limits, and minimum spend checks
- Payment linkage via paymentId and paymentAmount stored on booking

**Section sources**
- [eventBookingController.js:321-589](file://backend/controller/eventBookingController.js#L321-L589)

### Backend Event and Booking Models
- Event Model: Stores event metadata and ticket types for ticketed events. Ticket types include name, price, total quantity, and sold count.
- Booking Model: Stores booking records with status, payment status, and event references.

```mermaid
erDiagram
EVENT {
ObjectId _id PK
string title
string description
string category
date date
string time
string location
jsonb ticketTypes
number availableTickets
ObjectId createdBy FK
}
BOOKING {
ObjectId _id PK
ObjectId user FK
string type
string eventType
ObjectId eventId FK
string eventTitle
string eventCategory
date eventDate
string ticketType
number ticketCount
number totalPrice
number finalAmount
string paymentStatus
string bookingStatus
string paymentMethod
string paymentId
date paymentDate
ObjectId merchant FK
}
USER ||--o{ BOOKING : "booked"
USER ||--o{ EVENT : "created"
EVENT ||--o{ BOOKING : "has_bookings"
```

**Diagram sources**
- [eventSchema.js:1-23](file://backend/models/eventSchema.js#L1-L23)
- [bookingSchema.js:1-53](file://backend/models/bookingSchema.js#L1-L53)

**Section sources**
- [eventSchema.js:1-23](file://backend/models/eventSchema.js#L1-L23)
- [bookingSchema.js:1-53](file://backend/models/bookingSchema.js#L1-L53)

### Frontend TicketSelectionModal
The modal provides:
- Ticket type selection dropdown populated from backend
- Quantity input constrained by available tickets
- Coupon application with validation feedback
- Booking submission with optional coupon data

```mermaid
sequenceDiagram
participant User as "User"
participant Modal as "TicketSelectionModal"
participant API as "Event Booking Router"
participant CTRL as "Event Booking Controller"
User->>Modal : Open Ticket Modal
Modal->>API : GET /event-bookings/event/{id}/tickets
API->>CTRL : getEventTicketTypes()
CTRL-->>API : ticketTypes with availability
API-->>Modal : ticketTypes
User->>Modal : Select ticketType and quantity
User->>Modal : Apply coupon (optional)
User->>Modal : Click Book Now
Modal->>API : POST /event-bookings/create
API->>CTRL : createBooking()
CTRL-->>API : booking response
API-->>Modal : booking response
Modal-->>User : Show success and ticket details
```

**Diagram sources**
- [TicketSelectionModal.jsx:37-57](file://frontend/src/components/TicketSelectionModal.jsx#L37-L57)
- [TicketSelectionModal.jsx:81-112](file://frontend/src/components/TicketSelectionModal.jsx#L81-L112)
- [TicketSelectionModal.jsx:150-210](file://frontend/src/components/TicketSelectionModal.jsx#L150-L210)
- [eventBookingRouter.js:30-33](file://backend/router/eventBookingRouter.js#L30-L33)
- [eventBookingController.js:8-73](file://backend/controller/eventBookingController.js#L8-L73)

**Section sources**
- [TicketSelectionModal.jsx:150-222](file://frontend/src/components/TicketSelectionModal.jsx#L150-L222)
- [TicketSelectionModal.jsx:271-289](file://frontend/src/components/TicketSelectionModal.jsx#L271-L289)
- [TicketSelectionModal.jsx:291-377](file://frontend/src/components/TicketSelectionModal.jsx#L291-L377)

### Frontend TicketSuccessModal and Ticket Generation
After successful booking, the success modal displays:
- Event details and ticket summary
- Booking and payment identifiers
- Download ticket functionality using the ticket generator utility

```mermaid
flowchart TD
Confirm([Booking Confirmed]) --> SuccessModal["Show TicketSuccessModal"]
SuccessModal --> Download["Download Ticket (PDF)"]
Download --> Generator["ticketGenerator Utility"]
Generator --> File["Generate PDF"]
SuccessModal --> ViewBookings["View My Bookings"]
```

**Diagram sources**
- [TicketSuccessModal.jsx:1-185](file://frontend/src/components/TicketSuccessModal.jsx#L1-L185)
- [ticketGenerator.js](file://frontend/src/utils/ticketGenerator.js)

**Section sources**
- [TicketSuccessModal.jsx:1-185](file://frontend/src/components/TicketSuccessModal.jsx#L1-L185)
- [ticketGenerator.js](file://frontend/src/utils/ticketGenerator.js)

### API Endpoints for Ticketed Booking
- POST /event-bookings/create: Generic booking creation routed to ticketed handler
- POST /event-bookings/ticketed: Direct ticketed booking endpoint
- GET /event-bookings/event/:eventId/tickets: Retrieve ticket types with availability
- PUT /event-bookings/:bookingId/pay: Process payment for a booking
- GET /event-bookings/my-bookings: Fetch user's bookings

```mermaid
graph LR
A["POST /event-bookings/create"] --> B["createBooking()"]
B --> C["createTicketedBooking()"]
D["GET /event-bookings/event/{id}/tickets"] --> E["getEventTicketTypes()"]
F["PUT /event-bookings/{id}/pay"] --> G["processPayment()"]
H["GET /event-bookings/my-bookings"] --> I["getBookingsByUserId()"]
```

**Diagram sources**
- [eventBookingRouter.js:27-34](file://backend/router/eventBookingRouter.js#L27-L34)

**Section sources**
- [eventBookingRouter.js:27-34](file://backend/router/eventBookingRouter.js#L27-L34)

## Dependency Analysis
- Controller depends on Event and Booking models for data persistence and validation.
- Frontend components depend on backend endpoints for ticket types and booking creation.
- Coupon validation is handled centrally in the controller with cross-cutting concerns for discount calculation and usage tracking.

```mermaid
graph TB
FE["Frontend Components"] --> API["Event Booking Router"]
API --> CTRL["Event Booking Controller"]
CTRL --> EVT["Event Model"]
CTRL --> BK["Booking Model"]
CTRL --> COUP["Coupon Logic"]
```

**Diagram sources**
- [eventBookingRouter.js:1-47](file://backend/router/eventBookingRouter.js#L1-L47)
- [eventBookingController.js:321-589](file://backend/controller/eventBookingController.js#L321-L589)

**Section sources**
- [eventBookingController.js:321-589](file://backend/controller/eventBookingController.js#L321-L589)

## Performance Considerations
- Inventory updates: The controller increments quantitySold and recalculates availableTickets per booking, ensuring immediate consistency.
- Coupon processing: Discount calculation occurs client-side in the modal and server-side during booking creation, minimizing redundant computations.
- API calls: Ticket availability is fetched once per modal open, reducing repeated network overhead.

## Troubleshooting Guide
Common issues and resolutions:
- Event not found: Ensure the eventId exists and belongs to a ticketed event.
- Ticket sold out: Verify available tickets and prevent booking attempts exceeding availability.
- Invalid coupon: Check coupon validity, expiry, usage limits, and minimum spend requirements.
- Payment processing errors: Confirm booking ownership and payment status before attempting to process payment.

**Section sources**
- [eventBookingController.js:354-391](file://backend/controller/eventBookingController.js#L354-L391)
- [eventBookingController.js:402-474](file://backend/controller/eventBookingController.js#L402-L474)
- [eventBookingController.js:1096-1159](file://backend/controller/eventBookingController.js#L1096-L1159)

## Conclusion
The ticketed event booking system integrates robust backend validation and inventory management with a user-friendly frontend modal. It supports flexible ticket types, dynamic quantity selection, coupon application, and seamless payment processing, culminating in a downloadable ticket confirmation.