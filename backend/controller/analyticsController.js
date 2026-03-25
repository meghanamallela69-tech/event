import { Booking } from "../models/bookingSchema.js";
import { Event } from "../models/eventSchema.js";
import mongoose from "mongoose";

// Get analytics for a specific event
export const getEventAnalytics = async (req, res) => {
  try {
    const { eventId } = req.params;
    const merchantId = req.user.userId;

    // Verify merchant owns the event
    const event = await Event.findOne({
      _id: eventId,
      createdBy: merchantId
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you don't own it"
      });
    }

    // Get all bookings for this event
    const bookings = await Booking.find({
      serviceId: eventId
    }).populate("user", "name email");

    // Calculate basic metrics
    const totalBookings = bookings.length;
    
    const totalRevenue = bookings.reduce((sum, booking) => {
      return sum + (booking.totalPrice || 0);
    }, 0);

    const ticketsSold = bookings.reduce((sum, booking) => {
      return sum + (booking.guestCount || 0);
    }, 0);

    // Calculate available tickets based on event type
    let availableTickets = 0;
    if (event.eventType === "ticketed") {
      // For ticketed events, calculate from ticket types
      if (event.ticketTypes && event.ticketTypes.length > 0) {
        const totalCapacity = event.ticketTypes.reduce((sum, ticket) => {
          return sum + (ticket.availableSlots || 0);
        }, 0);
        availableTickets = totalCapacity - ticketsSold;
      }
    } else {
      // For full service, use maxGuests
      availableTickets = (event.maxGuests || 0) - ticketsSold;
    }

    // Ticket type breakdown
    const ticketTypeStats = {};
    if (event.eventType === "ticketed" && event.ticketTypes) {
      event.ticketTypes.forEach(ticketType => {
        const sold = bookings.reduce((sum, booking) => {
          const selectedTickets = booking.selectedTickets || [];
          const typeSold = selectedTickets
            .filter(t => t.ticketTypeId === ticketType._id.toString())
            .reduce((typeSum, t) => typeSum + (t.quantity || 0), 0);
          return sum + typeSold;
        }, 0);

        ticketTypeStats[ticketType.name] = {
          sold: sold,
          available: (ticketType.availableSlots || 0) - sold,
          price: ticketType.price,
          totalCapacity: ticketType.availableSlots || 0
        };
      });
    }

    // Attendee stats
    const uniqueAttendees = new Set(bookings.map(b => b.user?._id.toString()));
    const totalAttendees = uniqueAttendees.size;
    
    // Count checked-in users (bookings with completed status and ticket used)
    const checkedInCount = bookings.filter(b => 
      b.status === "completed" && b.ticket?.isUsed
    ).length;

    // Booking trends over time (group by date)
    const bookingTrends = await Booking.aggregate([
      {
        $match: {
          serviceId: new mongoose.Types.ObjectId(eventId)
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 },
          revenue: { $sum: "$totalPrice" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      },
      {
        $limit: 30 // Last 30 days
      }
    ]);

    // Format trends for frontend
    const formattedTrends = bookingTrends.map(trend => ({
      date: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}-${String(trend._id.day).padStart(2, '0')}`,
      bookings: trend.count,
      revenue: trend.revenue
    }));

    // Revenue trends (cumulative)
    let cumulativeRevenue = 0;
    const revenueTrends = formattedTrends.map(trend => {
      cumulativeRevenue += trend.revenue;
      return {
        date: trend.date,
        revenue: cumulativeRevenue
      };
    });

    // Status breakdown
    const statusBreakdown = {
      pending: bookings.filter(b => b.status === "pending").length,
      confirmed: bookings.filter(b => b.status === "confirmed").length,
      processing: bookings.filter(b => b.status === "processing").length,
      completed: bookings.filter(b => b.status === "completed").length,
      cancelled: bookings.filter(b => b.status === "cancelled").length
    };

    // Recent bookings
    const recentBookings = bookings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(booking => ({
        id: booking._id,
        userName: booking.user?.name || "Guest",
        userEmail: booking.user?.email || "",
        totalPrice: booking.totalPrice,
        guestCount: booking.guestCount,
        status: booking.status,
        createdAt: booking.createdAt
      }));

    return res.status(200).json({
      success: true,
      analytics: {
        eventId: event._id,
        eventTitle: event.title,
        eventType: event.eventType,
        totalBookings,
        totalRevenue,
        ticketsSold,
        availableTickets: Math.max(0, availableTickets),
        ticketTypeStats,
        totalAttendees,
        checkedInCount,
        statusBreakdown,
        bookingTrends: formattedTrends,
        revenueTrends,
        recentBookings
      }
    });
  } catch (error) {
    console.error("Get event analytics error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch analytics"
    });
  }
};

// Get analytics for all merchant events (summary)
export const getMerchantAnalyticsSummary = async (req, res) => {
  try {
    const merchantId = req.user.userId;

    // Get all events by merchant
    const events = await Event.find({ createdBy: merchantId });

    const eventIds = events.map(e => e._id);

    // Get all bookings for these events
    const bookings = await Booking.find({
      serviceId: { $in: eventIds }
    });

    // Calculate overall metrics
    const totalEvents = events.length;
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const totalTicketsSold = bookings.reduce((sum, b) => sum + (b.guestCount || 0), 0);

    // Per-event summary
    const eventSummaries = events.map(event => {
      const eventBookings = bookings.filter(b => 
        b.serviceId.toString() === event._id.toString()
      );
      
      return {
        eventId: event._id,
        eventTitle: event.title,
        eventType: event.eventType,
        bookings: eventBookings.length,
        revenue: eventBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
        ticketsSold: eventBookings.reduce((sum, b) => sum + (b.guestCount || 0), 0),
        status: event.status
      };
    });

    return res.status(200).json({
      success: true,
      summary: {
        totalEvents,
        totalBookings,
        totalRevenue,
        totalTicketsSold,
        eventSummaries
      }
    });
  } catch (error) {
    console.error("Get merchant analytics summary error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch analytics summary"
    });
  }
};
