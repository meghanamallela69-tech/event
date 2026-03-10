import { Booking } from "../models/bookingSchema.js";

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const { 
      serviceId, 
      serviceTitle, 
      serviceCategory, 
      servicePrice,
      eventDate,
      notes,
      guestCount 
    } = req.body;

    const userId = req.user.userId;

    // Validate required fields
    if (!serviceId || !serviceTitle || !serviceCategory || !servicePrice) {
      return res.status(400).json({ 
        success: false, 
        message: "Service details are required" 
      });
    }

    // Check if user already has a pending booking for this service
    const existingBooking = await Booking.findOne({ 
      user: userId, 
      serviceId: serviceId,
      status: { $in: ["pending", "confirmed"] }
    });

    if (existingBooking) {
      return res.status(409).json({ 
        success: false, 
        message: "You already have an active booking for this service" 
      });
    }

    // Calculate total price
    const totalPrice = guestCount ? servicePrice * guestCount : servicePrice;

    // Create booking
    const booking = await Booking.create({
      user: userId,
      serviceId,
      serviceTitle,
      serviceCategory,
      servicePrice,
      eventDate,
      notes,
      guestCount: guestCount || 1,
      totalPrice,
      bookingDate: new Date(),
      status: "pending"
    });

    return res.status(201).json({ 
      success: true, 
      message: "Booking created successfully",
      booking
    });
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to create booking" 
    });
  }
};

// Get all bookings for the logged-in user
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const bookings = await Booking.find({ user: userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({ 
      success: true, 
      bookings 
    });
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch bookings" 
    });
  }
};

// Get single booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const booking = await Booking.findOne({ 
      _id: id, 
      user: userId 
    });

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: "Booking not found" 
      });
    }

    return res.status(200).json({ 
      success: true, 
      booking 
    });
  } catch (error) {
    console.error("Fetch booking error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch booking" 
    });
  }
};

// Cancel a booking
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const booking = await Booking.findOne({ 
      _id: id, 
      user: userId 
    });

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: "Booking not found" 
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ 
        success: false, 
        message: "Booking is already cancelled" 
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot cancel a completed booking" 
      });
    }

    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json({ 
      success: true, 
      message: "Booking cancelled successfully",
      booking 
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to cancel booking" 
    });
  }
};

// Get all bookings (Admin only)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ 
      success: true, 
      bookings 
    });
  } catch (error) {
    console.error("Fetch all bookings error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch bookings" 
    });
  }
};

// Update booking status (Admin/Merchant only)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status" 
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: "Booking not found" 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Booking status updated",
      booking 
    });
  } catch (error) {
    console.error("Update booking error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to update booking" 
    });
  }
};
