import mongoose from 'mongoose';
import { Event } from './models/eventSchema.js';
import { dbConnection } from './database/dbConnection.js';
import dotenv from 'dotenv';

dotenv.config({ path: './config/config.env' });

const createTicketedEvent = async () => {
  try {
    await dbConnection();
    console.log('Connected to database');

    // Create a ticketed event for testing with proper structure
    const ticketedEvent = new Event({
      title: "Summer Music Fest 2026",
      description: "Annual summer music festival with top artists",
      category: "concert",
      eventType: "ticketed",
      price: 500, // Base price
      location: "Gachibowli Stadium",
      date: new Date('2026-04-15T18:00:00.000Z'), // Proper date with time
      time: "06:00 PM", // Proper time format
      totalTickets: 15,
      availableTickets: 15,
      ticketTypes: [
        {
          name: "Regular",
          price: 500,
          quantity: 10, // Total regular tickets
          available: 10 // Available regular tickets
        },
        {
          name: "VIP",
          price: 1000,
          quantity: 5, // Total VIP tickets
          available: 5 // Available VIP tickets
        }
      ],
      createdBy: new mongoose.Types.ObjectId(), // Replace with actual merchant ID
      status: "active",
      images: [
        {
          public_id: "summer-music-fest",
          url: "/summer-music-fest.jpg"
        }
      ]
    });

    await ticketedEvent.save();
    console.log('✅ Ticketed event created successfully!');
    console.log('Event ID:', ticketedEvent._id);
    console.log('Title:', ticketedEvent.title);
    console.log('Event Type:', ticketedEvent.eventType);
    console.log('Total Tickets:', ticketedEvent.totalTickets);
    console.log('Available Tickets:', ticketedEvent.availableTickets);
    console.log('Ticket Types:');
    ticketedEvent.ticketTypes.forEach(ticket => {
      console.log(`  - ${ticket.name}: ₹${ticket.price}, ${ticket.available}/${ticket.quantity} available`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating ticketed event:', error);
    process.exit(1);
  }
};

createTicketedEvent();