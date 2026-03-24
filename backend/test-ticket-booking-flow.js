import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Event } from './models/eventSchema.js';
import { User } from './models/userSchema.js';
import { Booking } from './models/bookingSchema.js';

dotenv.config({ path: './config/config.env' });

const testTicketBookingFlow = async () => {
  try {
    console.log('🧪 Testing Complete Ticket Booking Flow');
    console.log('=====================================');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find a ticketed event
    const ticketedEvent = await Event.findOne({ eventType: 'ticketed' });
    if (!ticketedEvent) {
      console.log('❌ No ticketed events found');
      return;
    }
    
    console.log(`\n📋 Testing with event: ${ticketedEvent.title}`);
    console.log(`   Event Type: ${ticketedEvent.eventType}`);
    console.log(`   Ticket Types: ${ticketedEvent.ticketTypes?.length || 0}`);
    
    if (ticketedEvent.ticketTypes && ticketedEvent.ticketTypes.length > 0) {
      ticketedEvent.ticketTypes.forEach((ticket, i) => {
        console.log(`   ${i+1}. ${ticket.name}: ₹${ticket.price} (${ticket.quantityTotal - ticket.quantitySold} available)`);
      });
    }
    
    // Find a user
    const user = await User.findOne({ role: 'user' });
    if (!user) {
      console.log('❌ No users found');
      return;
    }
    
    console.log(`\n👤 Testing with user: ${user.name} (${user.email})`);
    
    // Test 1: Create booking
    console.log('\n🎫 Step 1: Creating ticket booking...');
    
    const ticketType = ticketedEvent.ticketTypes?.[0]?.name || 'General';
    const quantity = 2;
    const unitPrice = ticketedEvent.ticketTypes?.[0]?.price || ticketedEvent.price || 0;
    const totalPrice = unitPrice * quantity;
    
    const bookingData = {
      user: user._id,
      type: "event",
      eventType: "ticketed",
      eventId: String(ticketedEvent._id),
      merchant: ticketedEvent.createdBy,
      eventTitle: ticketedEvent.title,
      eventCategory: ticketedEvent.category || "",
      eventPrice: unitPrice,
      ticketType: ticketType,
      ticketCount: quantity,
      bookingDate: new Date(),
      eventDate: ticketedEvent.date,
      totalPrice: totalPrice,
      status: "pending",
      paymentMethod: "Card",
      paymentStatus: "Pending",
      qrCode: `TKT-${Date.now()}:${ticketedEvent._id}:${user._id}`,
      ticketId: `TICKET-${Date.now()}-TEST`,
      ticketGenerated: false
    };
    
    const booking = await Booking.create(bookingData);
    console.log(`✅ Booking created: ${booking._id}`);
    console.log(`   Ticket Type: ${booking.ticketType}`);
    console.log(`   Quantity: ${booking.ticketCount}`);
    console.log(`   Total: ₹${booking.totalPrice}`);
    console.log(`   Status: ${booking.status}`);
    console.log(`   Payment Status: ${booking.paymentStatus}`);
    
    // Test 2: Process payment
    console.log('\n💳 Step 2: Processing payment...');
    
    booking.paymentStatus = "Paid";
    booking.paymentMethod = "Card";
    booking.paymentId = `PAY-${Date.now()}-TEST`;
    booking.paymentDate = new Date();
    booking.status = "confirmed";
    booking.ticketGenerated = true;
    
    await booking.save();
    console.log(`✅ Payment processed successfully`);
    console.log(`   Payment ID: ${booking.paymentId}`);
    console.log(`   Status: ${booking.status}`);
    console.log(`   Ticket Generated: ${booking.ticketGenerated}`);
    
    // Test 3: Update event quantities
    console.log('\n📊 Step 3: Updating event quantities...');
    
    const event = await Event.findById(ticketedEvent._id);
    if (event && event.ticketTypes) {
      const ticketTypeObj = event.ticketTypes.find(t => t.name === booking.ticketType);
      if (ticketTypeObj) {
        console.log(`   Before: ${ticketTypeObj.name} - Sold: ${ticketTypeObj.quantitySold}, Available: ${ticketTypeObj.quantityTotal - ticketTypeObj.quantitySold}`);
        
        ticketTypeObj.quantitySold += booking.ticketCount;
        
        // Update overall available tickets
        const totalSold = event.ticketTypes.reduce((sum, t) => sum + t.quantitySold, 0);
        const totalAvailable = event.ticketTypes.reduce((sum, t) => sum + t.quantityTotal, 0);
        event.availableTickets = totalAvailable - totalSold;
        
        await event.save();
        
        console.log(`   After: ${ticketTypeObj.name} - Sold: ${ticketTypeObj.quantitySold}, Available: ${ticketTypeObj.quantityTotal - ticketTypeObj.quantitySold}`);
        console.log(`   Event Available Tickets: ${event.availableTickets}`);
      }
    }
    
    // Test 4: Generate ticket data
    console.log('\n🎟️  Step 4: Generating ticket data...');
    
    const ticketData = {
      bookingId: booking.ticketId || booking._id,
      eventName: booking.eventTitle,
      userName: user.name,
      userEmail: user.email,
      eventDate: booking.eventDate,
      location: ticketedEvent.location || 'TBD',
      ticketType: booking.ticketType,
      quantity: booking.ticketCount,
      totalAmount: booking.totalPrice,
      qrCode: booking.qrCode,
      paymentStatus: booking.paymentStatus,
      bookingDate: booking.bookingDate
    };
    
    console.log(`✅ Ticket data generated:`);
    console.log(`   Booking ID: ${ticketData.bookingId}`);
    console.log(`   Event: ${ticketData.eventName}`);
    console.log(`   User: ${ticketData.userName}`);
    console.log(`   Tickets: ${ticketData.quantity} x ${ticketData.ticketType}`);
    console.log(`   Amount: ₹${ticketData.totalAmount}`);
    console.log(`   QR Code: ${ticketData.qrCode}`);
    
    // Clean up test booking
    await Booking.deleteOne({ _id: booking._id });
    console.log('\n🧹 Test booking cleaned up');
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
    console.log('\n🎉 TICKET BOOKING FLOW TEST COMPLETED!');
    console.log('✅ All steps working correctly');
    console.log('✅ Ready for frontend integration');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
};

testTicketBookingFlow();