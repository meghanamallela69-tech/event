import https from "https";
import { Booking } from "../models/bookingSchema.js";
import { v4 as uuidv4 } from "uuid";

const hasRazorpay = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

export const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt = "rcpt_event" } = req.body;
    const amt = Math.max(Number(amount) || 0, 0);
    if (amt <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }
    if (!hasRazorpay()) {
      return res.status(200).json({
        success: true,
        simulated: true,
        order: {
          id: "order_simulated_" + Date.now(),
          amount: amt,
          currency,
          receipt,
          status: "created",
        },
        key: "rzp_test_simulated",
      });
    }
    const auth = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");
    const postData = JSON.stringify({
      amount: amt,
      currency,
      receipt,
      payment_capture: 1,
    });
    const options = {
      hostname: "api.razorpay.com",
      path: "/v1/orders",
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };
    const order = await new Promise((resolve, reject) => {
      const reqHttps = https.request(options, (r) => {
        let data = "";
        r.on("data", (chunk) => (data += chunk));
        r.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      });
      reqHttps.on("error", reject);
      reqHttps.write(postData);
      reqHttps.end();
    });
    return res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch {
    // Fallback to simulated order to keep dev/test UX smooth
    const { amount = 0, currency = "INR" } = req.body || {};
    return res.status(200).json({
      success: true,
      simulated: true,
      order: {
        id: "order_simulated_fallback_" + Date.now(),
        amount: Math.max(Number(amount) || 0, 0),
        currency,
        receipt: "rcpt_event",
        status: "created",
      },
      key: "rzp_test_simulated",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { order_id, payment_id, signature } = req.body;
    if (!hasRazorpay()) {
      return res.status(200).json({ success: true, simulated: true });
    }
    // Minimal signature check using crypto without adding deps
    const crypto = await import("crypto");
    const hmac = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order_id}|${payment_id}`)
      .digest("hex");
    if (hmac !== signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
    return res.status(200).json({ success: true });
  } catch {
    return res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};

// Pay for service booking (full-service events)
export const payForService = async (req, res) => {
  try {
    const { bookingId, paymentMethod, paymentAmount } = req.body;
    const userId = req.user.userId;

    console.log(`=== PAY FOR SERVICE ===`);
    console.log(`Booking ID: ${bookingId}`);
    console.log(`User ID: ${userId}`);
    console.log(`Payment Amount: ${paymentAmount}`);

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Verify user owns this booking
    if (String(booking.user) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only pay for your own bookings"
      });
    }

    // Verify booking is confirmed and not already paid
    if (booking.bookingStatus !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Booking must be confirmed by merchant before payment"
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment already completed for this booking"
      });
    }

    // Verify payment amount matches booking final amount (after coupon discount)
    const expectedAmount = booking.finalAmount || booking.totalPrice;
    if (Number(paymentAmount) !== Number(expectedAmount)) {
      return res.status(400).json({
        success: false,
        message: `Payment amount does not match booking total. Expected: ₹${expectedAmount}`
      });
    }

    // Generate payment ID
    const paymentId = `PAY_SVC_${uuidv4().substring(0, 8).toUpperCase()}`;

    // Update booking with payment information
    booking.paymentStatus = "paid";
    booking.paymentId = paymentId;
    booking.paymentDate = new Date();
    booking.paymentAmount = paymentAmount;
    booking.paymentMethod = paymentMethod;

    await booking.save();

    console.log(`✅ Service payment completed: ${paymentId}`);

    return res.status(200).json({
      success: true,
      message: "Payment successful! Your service booking is confirmed.",
      paymentId: paymentId,
      booking: booking
    });

  } catch (error) {
    console.error("Service payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment processing failed"
    });
  }
};

// Pay for ticket booking (ticketed events)
export const payForTicket = async (req, res) => {
  try {
    const { bookingId } = req.params; // Get from URL parameters
    const { paymentMethod, paymentAmount } = req.body;
    const userId = req.user.userId || req.user._id;

    console.log(`=== PAY FOR TICKET ===`);
    console.log(`Booking ID: ${bookingId}`);
    console.log(`User ID: ${userId}`);
    console.log(`Payment Amount: ${paymentAmount}`);

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Verify user owns this booking
    if (String(booking.user) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only pay for your own bookings"
      });
    }

    // Verify it's a ticketed event
    if (booking.eventType !== "ticketed") {
      return res.status(400).json({
        success: false,
        message: "This endpoint is only for ticketed events"
      });
    }

    // Verify booking is confirmed and not already paid
    if (booking.bookingStatus !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Booking must be confirmed before payment"
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment already completed for this booking"
      });
    }

    // Verify payment amount matches booking final amount (after coupon discount)
    const expectedAmount = booking.finalAmount || booking.totalPrice;
    if (Number(paymentAmount) !== Number(expectedAmount)) {
      return res.status(400).json({
        success: false,
        message: `Payment amount does not match booking total. Expected: ₹${expectedAmount}`
      });
    }

    // Update booking with payment information
    booking.paymentStatus = "paid";
    booking.paymentDate = new Date();
    booking.paymentAmount = paymentAmount;
    booking.paymentMethod = paymentMethod;
    booking.ticketGenerated = true;
    
    // IMPORTANT: For ticketed events, auto-complete after payment (no merchant approval needed)
    booking.bookingStatus = "completed";
    booking.status = "completed";

    await booking.save();

    console.log(`✅ Ticket payment completed and booking auto-completed: ${booking.paymentId}`);

    return res.status(200).json({
      success: true,
      message: "Payment successful! Your tickets are confirmed.",
      paymentDetails: {
        paymentId: booking.paymentId,
        ticketId: booking.ticketId,
        eventTitle: booking.eventTitle,
        ticketCount: booking.ticketCount,
        totalAmount: booking.totalPrice
      },
      booking: booking
    });

  } catch (error) {
    console.error("Ticket payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment processing failed"
    });
  }
};
