// Debug script to check service data structure
// Add this temporarily to BookingModal.jsx to see what data we're getting

console.log('=== SERVICE DATA DEBUG ===');
console.log('service:', service);
console.log('service.ticketTypes:', service.ticketTypes);
console.log('service.availableTickets:', service.availableTickets);
console.log('service.totalTickets:', service.totalTickets);
console.log('service.price:', service.price);
console.log('isTicketed:', isTicketed);

if (service.ticketTypes) {
  service.ticketTypes.forEach((ticket, index) => {
    console.log(`Ticket ${index}:`, {
      name: ticket.name,
      price: ticket.price,
      quantityTotal: ticket.quantityTotal,
      quantitySold: ticket.quantitySold,
      quantityAvailable: ticket.quantityAvailable
    });
  });
}

console.log('=== END DEBUG ===');